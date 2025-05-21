import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import MKBox from "components/MKBox";
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import DefaultFooter from "examples/Footers/DefaultFooter";
import routes from "routes";
import footerRoutes from "footer.routes";
import { useUser } from "context/UserContext";
import axios from "axios";

const initialProductState = {
  emri: "",
  pershkrimi: "",
  firma: "",
  cmimi: "",
  productCategoryID: "",
  img: null,
};

const Products = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false); // Add/Edit product dialog
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(initialProductState);

  // New for shade/variant dialog
  const [shadeDialogOpen, setShadeDialogOpen] = useState(false);
  const [selectedProductVariants, setSelectedProductVariants] = useState([]);
  const [selectedShade, setSelectedShade] = useState("");
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [currentProductForShade, setCurrentProductForShade] = useState(null);

  console.log(currentProductForShade);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = () => {
    axios
      .get("http://localhost:3001/categorys")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  };

  const fetchProducts = () => {
    setLoading(true);
    axios
      .get("http://localhost:3001/products")
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  };

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);

    const url = categoryId
      ? `http://localhost:3001/products/category/${categoryId}`
      : "http://localhost:3001/products";

    axios
      .get(url)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error filtering products:", err));
  };

  const handleDelete = async (productID) => {
    try {
      await axios.delete(`http://localhost:3001/products/${productID}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setProductForm({
      emri: product.emri,
      pershkrimi: product.pershkrimi,
      firma: product.firma,
      cmimi: product.cmimi,
      productCategoryID: product.productCategoryID,
      img: null,
    });
    setOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm(initialProductState);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setProductForm(initialProductState);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProductForm((prev) => ({ ...prev, img: e.target.files[0] }));
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value);
    });

    try {
      if (editingProduct) {
        await axios.put(`http://localhost:3001/products/${editingProduct.productID}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(`http://localhost:3001/products`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      handleClose();
      fetchProducts();
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  // New: open shade selection dialog when Add to Cart is clicked
  const handleAddToCartClick = async (product) => {
    if (!user) {
      alert("Please log in to add products to your cart.");
      return;
    }
    setCurrentProductForShade(product);
    setLoadingVariants(true);
    try {
      const res = await axios.get(
        `http://localhost:3001/productVariants/products/${product.productID}`
      );
      setSelectedProductVariants(res.data);
      setSelectedShade("");
      setShadeDialogOpen(true);
    } catch (err) {
      console.error("Error fetching product variants:", err);
      alert("Failed to load product variants.");
    } finally {
      setLoadingVariants(false);
    }
  };

  // Confirm shade and add variant to cart
  const handleConfirmShade = async () => {
    if (!selectedShade) {
      alert("Please select a shade.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3001/carts", {
        sasia: 1,
        cartUserID: user.userID,
        cartProductVariantID: selectedShade,
      });
      alert("Product variant added to cart!");
      setShadeDialogOpen(false);
      console.log(response);
    } catch (error) {
      console.error("Error adding variant to cart:", error);
      alert("Failed to add product variant to cart.");
    }
  };

  const handleShadeDialogClose = () => {
    setShadeDialogOpen(false);
    setSelectedProductVariants([]);
    setSelectedShade("");
  };

  return (
    <>
      <DefaultNavbar routes={routes} sticky />
      <MKBox sx={{ paddingTop: "100px" }}>
        <Container>
          {user?.role === "admin" && (
            <Button
              variant="contained"
              onClick={handleAddProduct}
              sx={{
                mt: 2,
                backgroundColor: "#7b1fa2",
                color: "#ffffff",
                "&:hover": { backgroundColor: "#6a1b9a" },
              }}
            >
              Add Product
            </Button>
          )}

          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              label="Category"
              sx={{ height: 45, fontSize: "1rem" }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.categoryID} value={category.categoryID}>
                  {category.emri}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12} textAlign="center">
                <CircularProgress />
                <Typography variant="h6" align="center" mt={2}>
                  Loading products...
                </Typography>
              </Grid>
            ) : products.length > 0 ? (
              products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.productID}>
                  <Card sx={{ maxWidth: 345 }}>
                    <CardMedia
                      component="img"
                      alt={product.emri}
                      height="140"
                      image={`http://localhost:3001/${product.imageURL}`}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {product.emri}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.pershkrimi}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.firma}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${product.cmimi}
                      </Typography>

                      {user?.role === "admin" && (
                        <Stack direction="row" spacing={1} mt={2}>
                          <Button
                            size="small"
                            onClick={() => handleEdit(product)}
                            sx={{
                              mt: 2,
                              backgroundColor: "#7b1fa2",
                              color: "#ffffff",
                              "&:hover": { backgroundColor: "#6a1b9a", color: "#ffffff" },
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(product.productID)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      )}
                      {user && (
                        <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: "#7b1fa2",
                              color: "#ffffff",
                              "&:hover": { backgroundColor: "#6a1b9a" },
                            }}
                            onClick={() => handleAddToCartClick(product)}
                          >
                            Add to Cart
                          </Button>
                        </Stack>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant="h6" align="center">
                  No products found.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>
      </MKBox>

      {/* Add/Edit Product Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Emri"
            name="emri"
            fullWidth
            value={productForm.emri}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Pershkrimi"
            name="pershkrimi"
            fullWidth
            value={productForm.pershkrimi}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Firma"
            name="firma"
            fullWidth
            value={productForm.firma}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Cmimi"
            name="cmimi"
            type="number"
            fullWidth
            value={productForm.cmimi}
            onChange={handleFormChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="productCategoryID"
              value={productForm.productCategoryID}
              onChange={handleFormChange}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.categoryID} value={cat.categoryID}>
                  {cat.emri}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            component="label"
            sx={{
              mt: 2,
              color: "#7b1fa2",
              borderColor: "#7b1fa2",
              "&:hover": { borderColor: "#6a1b9a", color: "#6a1b9a" },
            }}
          >
            Upload Image
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            sx={{
              color: "#7b1fa2",
              "&:hover": { color: "#CBC3E1" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#7b1fa2",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#6a1b9a" },
            }}
          >
            {editingProduct ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shade Selection Dialog */}
      <Dialog open={shadeDialogOpen} onClose={handleShadeDialogClose} maxWidth="xs" fullWidth>
        <DialogTitle>Select a Shade</DialogTitle>
        <DialogContent>
          {loadingVariants ? (
            <CircularProgress />
          ) : selectedProductVariants.length === 0 ? (
            <Typography>No shades available for this product.</Typography>
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel>Shade</InputLabel>
              <Select
                value={selectedShade}
                onChange={(e) => setSelectedShade(e.target.value)}
                label="Shade"
              >
                {selectedProductVariants.map((variant) => (
                  <MenuItem key={variant.productVariantID} value={variant.productVariantID}>
                    {variant.shade}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleShadeDialogClose}
            sx={{
              color: "#7b1fa2",
              "&:hover": { color: "#CBC3E1" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmShade}
            variant="contained"
            disabled={!selectedShade}
            sx={{
              backgroundColor: "#7b1fa2",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#6a1b9a" },
            }}
          >
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>

      <DefaultFooter content={footerRoutes} />
    </>
  );
};

export default Products;
