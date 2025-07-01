import React, { useEffect, useState, useContext } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Grid,
  Card,
  CardMedia,
  Button,
  CircularProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useUser } from "context/UserContext";
import { CartContext } from "context/CartContext";
import axios from "axios";
import PropTypes from "prop-types";

const drawerWidth = 400;

const WishlistDrawer = ({ open, onClose }) => {
  const { user } = useUser();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProductForShade, setCurrentProductForShade] = useState(null);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedProductVariants, setSelectedProductVariants] = useState([]);
  const [selectedShade, setSelectedShade] = useState("");
  const { triggerCartRefresh } = useContext(CartContext);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3001/wishlists/${user.userID}`);
      setWishlistItems(res.data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setWishlistItems([]);
    }
    setLoading(false);
  };

  const fetchWishlistProducts = async (wishlist) => {
    if (!wishlist.length) {
      setProducts([]);
      return;
    }
    try {
      const productIDs = wishlist.map((item) => item.productID);
      const promises = productIDs.map((id) => axios.get(`http://localhost:3001/products/${id}`));
      const results = await Promise.all(promises);
      const productsData = results.map((res) => res.data);
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching wishlist products:", err);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchWishlist();
    }
  }, [user, open]);

  useEffect(() => {
    fetchWishlistProducts(wishlistItems);
  }, [wishlistItems]);

  const isProductInWishlist = (productID) =>
    wishlistItems.some((item) => item.productID === productID);

  const handleWishlistClick = async (productID) => {
    if (!user) {
      setSnackbarMessage("Please log in to manage your wishlist.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      await axios.delete(`http://localhost:3001/wishlists`, {
        data: { productID, userID: user.userID },
      });
      setWishlistItems((prev) => prev.filter((item) => item.productID !== productID));
    } catch (error) {
      console.error("Error updating wishlist:", error);
      setSnackbarMessage("Failed to update wishlist.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAddToCartClick = async (product) => {
    if (!user) {
      setSnackbarMessage("Please log in to add products to your cart.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setCurrentProductForShade(product);
    setLoadingVariants(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/productVariants/products/${product.productID}`
      );
      setSelectedProductVariants(res.data);
      setSelectedShade(""); // Reset selected shade on new product
    } catch (err) {
      console.error("Error fetching product variants:", err);
      setSnackbarMessage("Failed to load product variants.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingVariants(false);
    }
  };

  const handleConfirmShade = async () => {
    if (!selectedShade) {
      setSnackbarMessage("Please select a shade.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    try {
      const response = await axios.post("http://localhost:3001/carts", {
        sasia: 1,
        cartUserID: user.userID,
        cartProductVariantID: selectedShade,
      });
      setSnackbarMessage("Product added to cart!", response);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Reset after adding to cart
      setCurrentProductForShade(null);
      setSelectedProductVariants([]);
      setSelectedShade("");
      triggerCartRefresh();
    } catch (error) {
      console.error("Error adding variant to cart:", error);
      setSnackbarMessage("Failed to add product variant to cart.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleShadeSelectChange = (e) => {
    setSelectedShade(e.target.value);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { width: drawerWidth, p: 2 },
        }}
      >
        <Typography variant="h5" mb={2} fontWeight="bold" textAlign="center">
          Your Wishlist
        </Typography>
        {loading ? (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <CircularProgress />
            <Typography mt={2}>Loading wishlist...</Typography>
          </Box>
        ) : products.length === 0 ? (
          <Typography mt={4} align="center">
            Your wishlist is empty.
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid item xs={12} key={product.productID}>
                <Card
                  sx={{
                    display: "flex",
                    borderRadius: 2,
                    boxShadow: 3,
                    height: "auto",
                    minHeight: 180,
                    p: 1,
                  }}
                >
                  <CardMedia
                    component="img"
                    image={product.imageURL}
                    alt={product.emri}
                    sx={{
                      width: 160,
                      objectFit: "cover",
                      borderRadius: "8px 0 0 8px",
                      userSelect: "none",
                    }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {product.emri}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, whiteSpace: "normal", wordBreak: "break-word" }}
                      >
                        {product.pershkrimi || "No description available."}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Brand: {product.Brand?.name || "No brand"}
                      </Typography>
                      <Typography variant="subtitle1" color="primary" fontWeight="bold">
                        ${product.cmimi}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                      alignItems="center"
                      sx={{ mt: 2 }}
                    >
                      {/* If this product is the current one for shade selection, show the dropdown + confirm button */}
                      {currentProductForShade?.productID === product.productID ? (
                        loadingVariants ? (
                          <CircularProgress size={24} />
                        ) : selectedProductVariants.length === 0 ? (
                          <Typography>No shades available.</Typography>
                        ) : (
                          <>
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <InputLabel id={`shade-select-label-${product.productID}`}>
                                Shade
                              </InputLabel>
                              <Select
                                labelId={`shade-select-label-${product.productID}`}
                                value={selectedShade}
                                label="Shade"
                                onChange={handleShadeSelectChange}
                                sx={{ height: 40, fontSize: "0.9rem" }}
                              >
                                {selectedProductVariants.map((variant) => (
                                  <MenuItem
                                    key={variant.productVariantID}
                                    value={variant.productVariantID}
                                  >
                                    {variant.shade}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={handleConfirmShade}
                              disabled={!selectedShade}
                            >
                              Add
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => {
                                setCurrentProductForShade(null);
                                setSelectedProductVariants([]);
                                setSelectedShade("");
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )
                      ) : (
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleAddToCartClick(product)}
                        >
                          Add to Cart
                        </Button>
                      )}

                      <IconButton onClick={() => handleWishlistClick(product.productID)}>
                        {isProductInWishlist(product.productID) ? (
                          <FavoriteIcon color="error" />
                        ) : (
                          <FavoriteBorderIcon />
                        )}
                      </IconButton>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          sx={{
            transform: "scale(1)",
            animation: "popup 0.5s ease-in-out",
          }}
          PaperProps={{
            sx: {
              backgroundColor: "transparent", // make Snackbar background transparent
              boxShadow: "none", // remove shadow if needed
            },
          }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{
              backgroundColor: "#fbfbf0", // beige
              color: "#5a4d00",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // optional subtle shadow
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Drawer>
    </>
  );
};

export default WishlistDrawer;

WishlistDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
