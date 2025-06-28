import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  Card,
  CardMedia,
  Grid,
  Button,
  Divider,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const ProductDetails = () => {
  const { productID } = useParams();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/products/${productID}`);
        setProduct(res.data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchVariants = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/productVariants/products/${productID}`);
        setVariants(res.data);
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setLoadingVariants(false);
      }
    };

    fetchProduct();
    fetchVariants();
  }, [productID]);

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", marginTop: 10 }}>
        <CircularProgress />
        <Typography variant="h6" mt={2}>
          Loading product...
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ textAlign: "center", marginTop: 10 }}>
        <Typography variant="h6" color="error">
          Product not found.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ maxWidth: "md", pt: "90px" }}>
      <Card sx={{ p: 3, boxShadow: 6, borderRadius: 3 }}>
        <Grid container spacing={3}>
          {/* Product Image */}
          <Grid item xs={12} md={6} mt={8}>
            <CardMedia
              component="img"
              image={product.imageURL}
              alt={product.emri}
              sx={{
                borderRadius: 3,
                maxHeight: 400,
                width: "90%",
                objectFit: "contain",
                boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
              }}
            />
          </Grid>

          {/* Product Info */}
          <Grid item xs={12} md={6} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {product.emri}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
              <Chip label={product.Brand?.name || "No Brand"} color="primary" size="small" />
              <Chip label="In Stock" color="success" size="small" />
              <Chip label="Category:" size="small" />
              <Chip
                label={product.Category?.emri || "Uncategorized"}
                size="small"
                variant="outlined"
              />
            </Stack>

            <Divider sx={{ mb: 2 }} />

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ flexGrow: 1, whiteSpace: "pre-line" }}
            >
              {product.pershkrimi}
            </Typography>

            <Divider sx={{ mt: 2, mb: 2 }} />

            <Typography
              variant="h5"
              color="secondary.main"
              fontWeight="bold"
              sx={{
                backgroundColor: "#fce4ec",
                p: 1,
                borderRadius: 1,
                width: "fit-content",
              }}
            >
              ${Number(product.cmimi).toFixed(2)}
            </Typography>

            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<ShoppingCartIcon />}
              sx={{ mt: 3, borderRadius: 2, fontWeight: "bold" }}
              fullWidth
            >
              Add to Cart
            </Button>
          </Grid>
        </Grid>

        {/* Variants Section */}
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Product Variants
          </Typography>

          {loadingVariants ? (
            <CircularProgress />
          ) : variants.length === 0 ? (
            <Typography color="text.secondary">No variants available for this product.</Typography>
          ) : (
            <Grid container spacing={2}>
              {variants.map((variant) => (
                <Grid key={variant.id} item xs={12} sm={6} md={4}>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Shade: {variant.shade}
                    </Typography>
                    <Typography variant="body2">Number: {variant.numri}</Typography>
                    <Typography
                      variant="body2"
                      color={variant.inStock ? "success.main" : "error.main"}
                      fontWeight="bold"
                      mt={1}
                    >
                      {variant.inStock ? "In Stock" : "Out of Stock"}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Card>
    </Container>
  );
};

export default ProductDetails;
