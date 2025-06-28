import React, { useEffect, useState, useContext } from "react";
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
import IconButton from "@mui/material/IconButton";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useUser } from "context/UserContext";
import { CartContext } from "context/CartContext";
import axios from "axios";
import WishlistDrawer from "pages/Presentation/sections/Wishlist";
import { useNavigate } from "react-router-dom";

const initialProductState = {
  emri: "",
  pershkrimi: "",
  brandID: "",
  cmimi: "",
  productCategoryID: "",
  imageURL: "",
  variants: [], // Array to hold variants
};

const Products = () => {
  const { user } = useUser();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [wishlist, setWishlist] = useState([]); // Store wishlist items
  const [loading, setLoading] = useState(true);
  const { triggerCartRefresh } = useContext(CartContext);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false); // Add/Edit product dialog
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState(initialProductState);

  // New for shade/variant dialog
  const [shadeDialogOpen, setShadeDialogOpen] = useState(false);
  const [selectedProductVariants, setSelectedProductVariants] = useState([]);
  const [selectedShade, setSelectedShade] = useState("");
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [currentProductForShade, setCurrentProductForShade] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
    fetchWishlist();
  }, []);

  const fetchCategories = () => {
    axios
      .get("http://localhost:3001/categorys")
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  };

  const fetchBrands = () => {
    axios
      .get("http://localhost:3001/brands")
      .then((res) => setBrands(res.data))
      .catch((err) => console.error("Error fetching brands:", err));
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

  const fetchWishlist = () => {
    if (user) {
      axios
        .get(`http://localhost:3001/wishlists/${user.userID}`)
        .then((res) => setWishlist(res.data))
        .catch((err) => console.error("Error fetching wishlist:", err));
    }
  };

  const isProductInWishlist = (productID) => {
    return wishlist.some((item) => item.productID === productID);
  };

  const handleWishlistClick = async (productID) => {
    if (!user) {
      alert("Please log in to add products to your wishlist.");
      return;
    }

    try {
      if (isProductInWishlist(productID)) {
        // Remove from wishlist
        await axios.delete(`http://localhost:3001/wishlists`, {
          data: { productID, userID: user.userID }, // Send data in request body
        });
        setWishlist((prev) => prev.filter((item) => item.productID !== productID));
      } else {
        // Add to wishlist
        const response = await axios.post("http://localhost:3001/wishlists", {
          userID: user.userID,
          productID,
        });
        setWishlist((prev) => [...prev, { productID }]);
        console.log("Wishlist response:", response.data);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Failed to update wishlist.");
    }
  };

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
      alert("Product added to cart!");
      setShadeDialogOpen(false);
      triggerCartRefresh(); // <--- trigger cart update here!
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

  const handleCategoryChange = (event) => {
    const categoryId = event.target.value;
    setSelectedCategory(categoryId);

    fetchFilteredProducts(categoryId, selectedBrand);
  };

  const handleBrandChange = (event) => {
    const brandId = event.target.value;
    setSelectedBrand(brandId);

    fetchFilteredProducts(selectedCategory, brandId);
  };

  const fetchFilteredProducts = (category, brand) => {
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (brand) params.append("brand", brand);

    axios
      .get(`http://localhost:3001/products?${params.toString()}`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching filtered products:", err));
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

  const handleEdit = async (product) => {
    try {
      const { data: variants = [] } = await axios.get(
        `http://localhost:3001/productVariants/products/${product.productID}`
      );
      setEditingProduct(product);
      setProductForm({
        ...product,
        variants: variants.map((variant) => ({
          productVariantID: variant.productVariantID, // Include the ID
          shade: variant.shade,
          numri: variant.numri,
          inStock: variant.inStock,
        })),
      });
      setOpen(true);
    } catch (err) {
      console.error("Error fetching variants:", err);
      setProductForm({
        ...product,
        variants: [], // Fallback to an empty array if variants fetch fails
      });
      setOpen(true);
    }
  };

  const handleVariantChange = (name, value, index) => {
    const updatedVariants = [...productForm.variants];
    updatedVariants[index][name] = value;
    setProductForm((prev) => ({ ...prev, variants: updatedVariants }));
  };

  const addVariant = () => {
    setProductForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { shade: "", numri: "", inStock: "" }],
    }));
  };

  const removeVariant = async (variantID, index) => {
    try {
      if (!variantID) {
        const updatedVariants = [...productForm.variants];
        updatedVariants.splice(index, 1); // Remove locally
        setProductForm((prev) => ({ ...prev, variants: updatedVariants }));
        return; // Skip API call for unsaved variants
      }

      if (window.confirm("Are you sure you want to delete this variant?")) {
        await axios.delete(`http://localhost:3001/productVariants/${variantID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedVariants = [...productForm.variants];
        updatedVariants.splice(index, 1); // Remove locally
        setProductForm((prev) => ({ ...prev, variants: updatedVariants }));
        alert("Variant deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting variant:", error);
      alert("Failed to delete variant.");
    }
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

  const handleSubmit = async () => {
    try {
      const payload = { ...productForm };
      if (editingProduct) {
        await axios.put(`http://localhost:3001/products/${editingProduct.productID}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`http://localhost:3001/products`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleClose();
      fetchProducts();
    } catch (err) {
      console.error("Error submitting product:", err);
    }
  };

  // Close wishlist drawer
  const closeWishlist = () => {
    setWishlistOpen(false);
  };

  const handleProductClick = (productID) => {
    navigate(`/product/${productID}`);
  };

  console.log(currentProductForShade, wishlistOpen, closeWishlist);

  return (
    <>
      <WishlistDrawer open={wishlistOpen} onClose={closeWishlist} />
      <MKBox sx={{ paddingTop: "100px" }}>
        <Container>
          {user?.role === "admin" && (
            <Button variant="contained" onClick={handleAddProduct}>
              Add Product
            </Button>
          )}

          {/* Filter Navbar */}
          <Stack
            direction="row"
            spacing={2}
            sx={{
              background: "#f4f4f4",
              padding: "10px 20px",
              borderRadius: "8px",
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
              marginBottom: "20px",
              marginTop: "20px",
              alignItems: "center",
            }}
          >
            <FormControl fullWidth sx={{ maxWidth: 200 }}>
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

            <FormControl fullWidth sx={{ maxWidth: 200 }}>
              <InputLabel>Brand</InputLabel>
              <Select
                value={selectedBrand}
                onChange={handleBrandChange}
                label="Brand"
                sx={{ height: 45, fontSize: "1rem" }}
              >
                <MenuItem value="">All Brands</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.brandID} value={brand.brandID}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Product Grid */}
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
                  <Card
                    sx={{ maxWidth: 345, position: "relative", cursor: "pointer" }}
                    onClick={() => handleProductClick(product.productID)}
                  >
                    {/* Heart Icon for Wishlist */}
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        "&:hover": { backgroundColor: "rgba(255, 255, 255, 1)" },
                        // zIndex: 10,
                      }}
                      onClick={(event) => {
                        event.stopPropagation(); // Prevent card click event
                        handleWishlistClick(product.productID);
                      }}
                    >
                      {isProductInWishlist(product.productID) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon color="error" />
                      )}
                    </IconButton>

                    <CardMedia
                      component="img"
                      alt={product.emri}
                      image={product.imageURL}
                      sx={{
                        height: 300,
                        objectFit: "cover",
                      }}
                    />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {product.emri}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.pershkrimi}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.Brand?.name || "No brand"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${product.cmimi}
                      </Typography>
                      {user?.role === "admin" && (
                        <Stack direction="row" spacing={1} mt={2}>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleEdit(product)}
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
                            onClick={(event) => {
                              event.stopPropagation(); // Prevent the card click event
                              handleAddToCartClick(product);
                            }}
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
            label="Cmimi"
            name="cmimi"
            type="number"
            fullWidth
            value={productForm.cmimi}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Image URL"
            name="imageURL"
            fullWidth
            value={productForm.imageURL}
            onChange={handleFormChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Brand</InputLabel>
            <Select
              name="brandID"
              value={productForm.brandID}
              onChange={handleFormChange}
              label="Brand"
              sx={{ height: 45 }}
            >
              <MenuItem value="">Select Brand</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.brandID} value={brand.brandID}>
                  {brand.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Category</InputLabel>
            <Select
              name="productCategoryID"
              value={productForm.productCategoryID}
              onChange={handleFormChange}
              label="Category"
              sx={{ height: 45 }}
            >
              <MenuItem value="">Select Category</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.categoryID} value={cat.categoryID}>
                  {cat.emri}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="h6" mt={2}>
            Variants
          </Typography>
          {Array.isArray(productForm.variants) &&
            productForm.variants.map((variant, index) => (
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
          <Button onClick={addVariant} sx={{ mt: 1 }} variant="contained">
            Add Variant
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
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
                sx={{ height: 45, fontSize: "1rem" }}
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
          <Button onClick={handleShadeDialogClose} color="error">
            Cancel
          </Button>
          <Button onClick={handleConfirmShade} variant="contained" disabled={!selectedShade}>
            Add to Cart
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Products;
