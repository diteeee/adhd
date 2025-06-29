import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDButton from "components/MDButton";

export default function ProductDetails() {
  const { productID } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productData, setProductData] = useState({
    emri: "",
    pershkrimi: "",
    cmimi: "",
    imageURL: "",
    brandID: "",
    variants: [],
  });

  // Function to fetch product + variants + brands data
  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const productRes = await axios.get(
        `http://localhost:3001/products/${productID}`,
        axiosConfig
      );
      setProduct(productRes.data);

      const variantsRes = await axios.get(
        `http://localhost:3001/productVariants/products/${productID}`,
        axiosConfig
      );
      setVariants(variantsRes.data);

      const brandsRes = await axios.get(`http://localhost:3001/brands`, axiosConfig);
      setBrands(brandsRes.data);
    } catch (error) {
      console.error("Failed to load product details:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productID]);

  const handleEdit = () => {
    setProductData({
      ...product,
      brandID: product.Brand?.brandID || "",
      variants: variants.map((v) => ({
        productVariantID: v.productVariantID,
        shade: v.shade,
        numri: v.numri,
        inStock: v.inStock,
      })),
    });
    setOpenDialog(true);
  };

  const handleVariantChange = (name, value, index) => {
    const updatedVariants = [...productData.variants];
    updatedVariants[index][name] = value;
    setProductData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setProductData((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { shade: "", numri: "", inStock: "" }],
    }));
  };

  const removeVariant = (index) => {
    const updatedVariants = [...productData.variants];
    updatedVariants.splice(index, 1);
    setProductData((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const handleSave = () => {
    const isEdit = productData.productID;

    const request = isEdit
      ? axios.put(
          `http://localhost:3001/products/${productData.productID}`,
          productData,
          axiosConfig
        )
      : axios.post("http://localhost:3001/products", productData, axiosConfig);

    request
      .then(() => {
        alert(`Product ${isEdit ? "updated" : "added"} successfully.`);
        setOpenDialog(false);
        fetchProductDetails();
      })
      .catch((err) => {
        console.error("Save failed:", err);
      });
  };

  if (loading)
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );

  if (!product)
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox p={3}>
          <MDTypography variant="h6" color="error" align="center">
            Product not found.
          </MDTypography>
        </MDBox>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card sx={{ maxWidth: 1100, margin: "auto", minHeight: 500 }}>
          <MDBox p={3}>
            <MDButton variant="outlined" color="info" onClick={() => navigate("/products")}>
              Back
            </MDButton>
            <Button variant="contained" color="primary" sx={{ ml: 2 }} onClick={handleEdit}>
              Edit
            </Button>

            <Grid container spacing={4} alignItems="flex-start">
              {/* Left side: Image */}
              <Grid item xs={12} md={5} mt={5}>
                <MDBox
                  component="img"
                  src={product.imageURL}
                  alt={product.emri}
                  sx={{
                    width: "100%",
                    maxHeight: 350,
                    borderRadius: 2,
                    objectFit: "cover",
                  }}
                />
              </Grid>

              {/* Right side: Details */}
              <Grid item xs={12} md={7}>
                <MDTypography variant="h4" fontWeight="medium" gutterBottom>
                  {product.emri}
                </MDTypography>

                <MDTypography variant="body1" mb={2}>
                  {product.pershkrimi}
                </MDTypography>

                <MDTypography variant="h6" mb={1}>
                  Price: ${product.cmimi}
                </MDTypography>

                <MDTypography variant="h6" mb={3}>
                  Brand: {product.Brand?.name || "No Brand"}
                </MDTypography>

                <MDTypography variant="h5" mb={2}>
                  Variants
                </MDTypography>

                {variants.length === 0 && <MDTypography>No variants available.</MDTypography>}

                {variants.map((v) => (
                  <Stack
                    key={v.productVariantID}
                    direction="row"
                    spacing={2}
                    mb={1}
                    alignItems="center"
                  >
                    <TextField
                      label="Shade"
                      value={v.shade}
                      InputProps={{ readOnly: true }}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="Numri"
                      value={v.numri}
                      InputProps={{ readOnly: true }}
                      size="small"
                      fullWidth
                    />
                    <TextField
                      label="In Stock"
                      value={v.inStock}
                      InputProps={{ readOnly: true }}
                      size="small"
                      fullWidth
                    />
                  </Stack>
                ))}
              </Grid>
            </Grid>
          </MDBox>
        </Card>
      </MDBox>

      {/* Dialog for editing product */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={productData.emri}
            onChange={(e) => setProductData({ ...productData, emri: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Description"
            value={productData.pershkrimi}
            onChange={(e) => setProductData({ ...productData, pershkrimi: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            type="number"
            label="Price"
            value={productData.cmimi}
            onChange={(e) => setProductData({ ...productData, cmimi: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            select
            label="Brand"
            value={productData.brandID}
            onChange={(e) => setProductData({ ...productData, brandID: e.target.value })}
            margin="dense"
          >
            {brands.map((brand) => (
              <MenuItem key={brand.brandID} value={brand.brandID}>
                {brand.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Image URL"
            value={productData.imageURL}
            onChange={(e) => setProductData({ ...productData, imageURL: e.target.value })}
            margin="dense"
          />
          <Typography variant="h6" mt={2}>
            Variants
          </Typography>
          {productData.variants.map((variant, index) => (
            <Stack key={index} direction="row" spacing={2} alignItems="center" mt={1}>
              <TextField
                label="Shade"
                name="shade"
                value={variant.shade}
                onChange={(e) => handleVariantChange(e.target.name, e.target.value, index)}
                size="small"
              />
              <TextField
                label="Numri"
                name="numri"
                type="number"
                value={variant.numri}
                onChange={(e) => handleVariantChange(e.target.name, e.target.value, index)}
                size="small"
              />
              <TextField
                label="In Stock"
                name="inStock"
                type="number"
                value={variant.inStock}
                onChange={(e) => handleVariantChange(e.target.name, e.target.value, index)}
                size="small"
              />
              <Button color="error" onClick={() => removeVariant(index)} size="small">
                Remove
              </Button>
            </Stack>
          ))}
          <Button onClick={addVariant} sx={{ mt: 1 }} variant="contained" color="primary">
            Add Variant
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="info" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
