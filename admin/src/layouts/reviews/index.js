import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

function Reviews() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: "",
    koment: "",
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    if (!token) {
      alert("Authentication required. Redirecting to login.");
      window.location.href = "/login";
    }
  }, [token]);

  // Fetch all products on mount
  useEffect(() => {
    axios
      .get("http://localhost:3001/products", axiosConfig)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products:", err));

    setColumns([
      { Header: "Comment", accessor: "koment" },
      { Header: "User Name", accessor: "userName" },
      { Header: "Rating", accessor: "rating" },
      { Header: "Actions", accessor: "actions" },
    ]);
  }, []);

  // Fetch reviews when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      fetchReviews();
    } else {
      setRows([]);
    }
  }, [selectedProduct]);

  const fetchReviews = () => {
    setRows([]);
    axios
      .get(`http://localhost:3001/reviews/product/${selectedProduct}`, axiosConfig)
      .then((res) => {
        const reviews = res.data;
        const formatted = reviews.map((review) => ({
          reviewID: review.reviewID,
          userName: review.userName,
          rating: `${review.rating}/5`,
          koment: review.koment,
          actions: (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button
                color="error"
                onClick={() => handleDelete(review.reviewID)}
                size="small"
                style={{ margin: 0 }}
              >
                Delete
              </Button>
            </div>
          ),
        }));
        setRows(formatted);
      })
      .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        setRows([]);
      });
  };

  const handleDelete = (reviewID) => {
    axios
      .delete(`http://localhost:3001/reviews/${reviewID}`, axiosConfig)
      .then(() => {
        alert("Review deleted successfully.");
        fetchReviews();
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  const handleAdd = () => {
    setReviewData({
      rating: "",
      koment: "",
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    // Assuming the userID is part of your auth token or available via context
    // If not, you might need to pass it or fetch it separately.
    // For now, I assume backend gets userID from token, so you don't send it here

    const payload = {
      reviewProductID: selectedProduct,
      rating: reviewData.rating,
      koment: reviewData.koment,
    };

    axios
      .post("http://localhost:3001/reviews", payload, axiosConfig)
      .then(() => {
        alert("Review added.");
        fetchReviews();
        setOpenDialog(false);
      })
      .catch((err) => console.error("Add failed:", err));
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
                  Reviews
                </MDTypography>
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{ marginTop: 20 }}
                  SelectProps={{ native: true }}
                  sx={{
                    "& .MuiSelect-root, & .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                    },
                  }}
                >
                  <option value="">Select Product</option>
                  {products.map((product) => (
                    <option key={product.productID} value={product.productID}>
                      {product.emri}
                    </option>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                  disabled={!selectedProduct}
                >
                  Add Review
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Review</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Rating"
            type="number"
            value={reviewData.rating}
            onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Comment"
            value={reviewData.koment}
            onChange={(e) => setReviewData({ ...reviewData, koment: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="info">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" disabled={!reviewData.rating}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Reviews;
