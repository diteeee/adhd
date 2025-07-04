import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { useNavigate } from "react-router-dom";

function Products() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]); // Added for brands
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [productData, setProductData] = useState({
    emri: "",
    pershkrimi: "",
    cmimi: "",
    productCategoryID: "",
    imageURL: "",
    brandID: "", // Added brandID
    variants: [], // Initialize as an empty array
  });
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage:", token);

      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        const userRoleFromToken = decodedToken.role || "guest";
        console.log("User Role from Token:", userRoleFromToken);

        localStorage.setItem("role", userRoleFromToken);

        if (userRoleFromToken !== "admin") {
          console.warn("Unauthorized access. Redirecting to presentation page.");
          window.location.href = "http://localhost:3000/presentation";
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      localStorage.removeItem("token");
      console.warn("Unauthorized access. Redirecting to presentation page.");
      window.location.href = "http://localhost:3000/presentation";
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
    fetchBrands(); // Fetch brands
    setColumns([
      { Header: "Product ID", accessor: "productID" },
      { Header: "Image", accessor: "image" },
      { Header: "Name", accessor: "emri" },
      { Header: "Description", accessor: "pershkrimi" },
      { Header: "Brand", accessor: "brandName" }, // Updated column
      { Header: "Price", accessor: "cmimi" },
      { Header: "Category", accessor: "categoryName" },
      { Header: "Actions", accessor: "actions" },
    ]);
  }, []);

  useEffect(() => {
    if (selectedCategory) fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = () => {
    axios
      .get("http://localhost:3001/categorys", axiosConfig)
      .then((res) => {
        setCategories(res.data);
      })
      .catch((err) => {
        setSnackbarMessage("Failed to fetch categories.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error(err);
      });
  };

  const fetchBrands = () => {
    axios
      .get("http://localhost:3001/brands", axiosConfig)
      .then((res) => {
        setBrands(res.data);
      })
      .catch((err) => {
        setSnackbarMessage("Failed to fetch brands.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error(err);
      });
  };

  const fetchProducts = () => {
    axios
      .get("http://localhost:3001/products", axiosConfig)
      .then((res) => {
        // Filter products only if a category is selected
        const filtered = selectedCategory
          ? res.data.filter((product) => product.productCategoryID == selectedCategory)
          : res.data;

        const formatted = filtered.map((p) => ({
          productID: p.productID,
          image: (
            <img
              src={p.imageURL}
              alt={p.emri}
              style={{ width: "70px", height: "auto", borderRadius: "6px", objectFit: "cover" }}
            />
          ),
          emri: p.emri,
          pershkrimi: p.pershkrimi,
          brandName: p.Brand?.name || "No Brand",
          cmimi: p.cmimi,
          categoryName: p.Category?.emri || "",
          actions: (
            <div style={{ display: "flex", gap: 10 }}>
              <Button
                color="info"
                variant="contained"
                size="small"
                onClick={() => navigate(`/products/${p.productID}`)}
                style={{ marginRight: "8px" }}
              >
                See Details
              </Button>
              <Button color="primary" onClick={() => handleEdit(p)} size="small">
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(p.productID)} size="small">
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formatted);
      })
      .catch((err) => {
        setSnackbarMessage("Failed to fetch products.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error(err);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleEdit = async (product) => {
    try {
      // Fetch variants for the selected product
      const { data: variants = [] } = await axios.get(
        `http://localhost:3001/productVariants/products/${product.productID}`,
        axiosConfig
      );

      // Map the variants to the expected format
      const formattedVariants = variants.map((variant) => ({
        productVariantID: variant.productVariantID,
        shade: variant.shade,
        numri: variant.numri,
        inStock: variant.inStock,
      }));

      // Set product data with fetched variants
      setProductData({
        ...product,
        productCategoryID: product.productCategoryID,
        brandID: product.brandID || "",
        variants: formattedVariants,
      });
      setOpenDialog(true);
    } catch (error) {
      console.error("Failed to fetch product variants:", error);
      setSnackbarMessage("Unable to load variants for the selected product.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleAdd = () => {
    setProductData({
      emri: "",
      pershkrimi: "",
      firma: "",
      cmimi: "",
      productCategoryID: selectedCategory,
      imageURL: "",
      brandID: "", // Reset brandID
      variants: [], // Initialize as an empty array
    });
    setOpenDialog(true);
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
        setSnackbarMessage(`Product ${isEdit ? "updated" : "added"} successfully.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setOpenDialog(false);
        fetchProducts();
      })
      .catch((err) => {
        console.error("Save failed:", err);
        setSnackbarMessage("Failed to edit product.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
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

  const removeVariant = async (variantID, index) => {
    try {
      if (!variantID) {
        const updatedVariants = [...productData.variants];
        updatedVariants.splice(index, 1); // Remove locally
        setProductData((prev) => ({ ...prev, variants: updatedVariants }));
        return; // Skip API call for unsaved variants
      }

      if (window.confirm("Are you sure you want to delete this variant?")) {
        await axios.delete(`http://localhost:3001/productVariants/${variantID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedVariants = [...productData.variants];
        updatedVariants.splice(index, 1); // Remove locally
        setProductData((prev) => ({ ...prev, variants: updatedVariants }));
        setSnackbarMessage("Product Variant deleted successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      setSnackbarMessage("Failed to delete product variant.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDelete = (productID) => {
    axios
      .delete(`http://localhost:3001/products/${productID}`, axiosConfig)
      .then(() => {
        setSnackbarMessage("Product deleted successfully.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchProducts();
      })
      .catch((err) => {
        setSnackbarMessage("Failed to delete product.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        console.error("Delete failed:", err);
      });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <MDTypography variant="h6" color="white">
                  Products
                </MDTypography>

                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryID} value={cat.categoryID}>
                      {cat.emri}
                    </option>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                  disabled={!selectedCategory}
                >
                  Add Product
                </Button>
              </MDBox>

              <MDBox pt={3}>
                <DataTable
                  table={{ columns, rows }}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={false}
                  noEndBorder
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{productData.productID ? "Edit Product" : "Add Product"}</DialogTitle>
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
            label="Select Brand"
            value={productData.brandID}
            onChange={(e) => setProductData({ ...productData, brandID: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {brands.map((brand) => (
              <option key={brand.brandID} value={brand.brandID}>
                {brand.name}
              </option>
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
          {Array.isArray(productData.variants) &&
            productData.variants.map((variant, index) => (
              <Stack
                key={variant.productVariantID || index}
                direction="row"
                spacing={2}
                alignItems="center"
                mt={1}
              >
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
                <Button
                  color="error"
                  onClick={() => {
                    console.log("Deleting Variant ID:", variant.productVariantID);
                    removeVariant(variant.productVariantID, index);
                  }}
                  size="small"
                >
                  Remove
                </Button>
              </Stack>
            ))}
          <Button onClick={addVariant} sx={{ mt: 1, color: "#fff" }} variant="contained">
            Add Variant
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="info">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default Products;
