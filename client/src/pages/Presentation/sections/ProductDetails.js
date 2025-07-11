import React, { useEffect, useState, useContext } from "react";
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
  TextField,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useUser } from "context/UserContext"; // Import useUser from your context
import { CartContext } from "context/CartContext";

const ProductDetails = () => {
  const { productID } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [variants, setVariants] = useState([]);
  const [newReview, setNewReview] = useState({ rating: "", koment: "" });
  const [loading, setLoading] = useState(true);
  const [loadingVariants, setLoadingVariants] = useState(true);
  const [selectedShade, setSelectedShade] = useState(null); // State for selected shade
  const [loadingReviews, setLoadingReviews] = useState(true);
  const { user } = useUser(); // Get the current user
  const token = localStorage.getItem("token");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const { triggerCartRefresh } = useContext(CartContext);

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/reviews/product/${productID}`);
      setReviews(res.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

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
    fetchReviews();
  }, [productID]);

  const handleShadeClick = (variant) => {
    setSelectedShade(variant); // Set the selected shade
  };

  const handleAddToCartClick = async () => {
    if (!user) {
      setSnackbarMessage("You need to be signed in to add items to the cart.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!selectedShade) {
      setSnackbarMessage("Please select a shade to add to cart.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await axios.post("http://localhost:3001/carts", {
        sasia: 1,
        cartUserID: user.userID, // Replace with the actual user ID
        cartProductVariantID: selectedShade.productVariantID,
      });
      triggerCartRefresh();
    } catch (error) {
      console.error("Error adding to cart:", error);
      setSnackbarMessage("Failed to add product to cart.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      setSnackbarMessage("You need to be signed in to leave a review.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!newReview.rating || !newReview.koment) {
      setSnackbarMessage("Please provide both a rating and a comment.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      const res = await axios.post("http://localhost:3001/reviews", {
        reviewUserID: user.userID, // Replace with the actual user ID
        reviewProductID: productID,
        rating: newReview.rating,
        koment: newReview.koment,
      });
      setReviews((prevReviews) => [...prevReviews, res.data]);
      setNewReview({ rating: "", koment: "" });
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      setSnackbarMessage("Failed to submit review.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleDeleteReviewClick = (reviewID) => {
    setReviewToDelete(reviewID);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;

    if (!token) {
      setSnackbarMessage("You need to be signed in to delete a review.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
      return;
    }

    try {
      await axios.delete(`http://localhost:3001/reviews/${reviewToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReviews((prevReviews) =>
        prevReviews.filter((review) => review.reviewID !== reviewToDelete)
      );
    } catch (error) {
      console.error("Error deleting review:", error);
      setSnackbarMessage("Failed to delete the review.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

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
              onClick={handleAddToCartClick}
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
                <Grid key={variant.productVariantID} item xs={12} sm={6} md={4}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      border:
                        selectedShade?.productVariantID === variant.productVariantID
                          ? "2px solid #f50057"
                          : "1px solid rgba(0, 0, 0, 0.12)",
                    }}
                    onClick={() => handleShadeClick(variant)}
                  >
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

        {/* Reviews Section */}
        <Box mt={6}>
          <Typography variant="h5" gutterBottom>
            Reviews
          </Typography>
          {loadingReviews ? (
            <CircularProgress />
          ) : reviews.length === 0 ? (
            <Typography>No reviews yet. Be the first to leave one!</Typography>
          ) : (
            reviews.map((review) => (
              <Box key={review.reviewID} mb={3} p={2} border="1px solid #ddd" borderRadius={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {review.userName || "Anonymous"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Rating: {review.rating}/5
                </Typography>
                <Typography variant="body1">{review.koment}</Typography>
                {user &&
                  user.userID === review.reviewUserID && ( // Show delete button for the review's author
                    <Button
                      variant="text"
                      color="error"
                      onClick={() => handleDeleteReviewClick(review.reviewID)}
                    >
                      Delete
                    </Button>
                  )}
              </Box>
            ))
          )}
          <Dialog
            open={deleteDialogOpen}
            onClose={handleCancelDelete}
            aria-labelledby="delete-confirmation-dialog"
          >
            <DialogTitle id="delete-confirmation-dialog">Confirm Delete</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this review? This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelDelete} color="primary" variant="">
                Cancel
              </Button>
              <Button onClick={handleConfirmDelete} color="secondary" variant="contained" autoFocus>
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <Divider sx={{ mt: 4, mb: 2 }} />
          <Typography variant="h6">Add a Review</Typography>
          <TextField
            fullWidth
            label="Rating (1-5)"
            type="number"
            inputProps={{ min: 1, max: 5 }}
            value={newReview.rating}
            onChange={(e) => setNewReview((prev) => ({ ...prev, rating: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={3}
            value={newReview.koment}
            onChange={(e) => setNewReview((prev) => ({ ...prev, koment: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={handleReviewSubmit}>
            Submit Review
          </Button>
        </Box>
      </Card>
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
    </Container>
  );
};

export default ProductDetails;
