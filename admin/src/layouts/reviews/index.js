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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Reviews() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    reviewUserID: "",
    reviewProductID: "",
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

  useEffect(() => {
    axios
      .get("http://localhost:3001/users", axiosConfig)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err));

    axios
      .get("http://localhost:3001/products", axiosConfig)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products:", err));

    setColumns([
      { Header: "Review ID", accessor: "reviewID" },
      { Header: "User Name", accessor: "userName" },
      { Header: "Product Name", accessor: "productName" },
      { Header: "Rating", accessor: "rating" },
      { Header: "Comment", accessor: "koment" },
      { Header: "Actions", accessor: "actions" },
    ]);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchReviews();
    } else {
      setRows([]);
    }
  }, [selectedUser]);

  const fetchReviews = () => {
    setRows([]);
    axios
      .get(`http://localhost:3001/reviews/user/${selectedUser}`, axiosConfig)
      .then((res) => {
        const reviews = res.data;
        const formatted = reviews.map((review) => ({
          reviewID: review.reviewID,
          userName: review.userName,
          productName: review.productName,
          rating: review.rating,
          koment: review.koment,
          actions: (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
      .catch((err) => console.error("Failed to fetch reviews:", err));
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
      reviewUserID: selectedUser,
      reviewProductID: "",
      rating: "",
      koment: "",
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    const { reviewProductID, rating, koment } = reviewData;

    const payload = {
      reviewUserID: selectedUser,
      reviewProductID,
      rating,
      koment,
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
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  style={{ marginTop: 20 }}
                  SelectProps={{ native: true }}
                  sx={{
                    "& .MuiSelect-root, & .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                    },
                  }}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.userID} value={user.userID}>
                      {user.emri} {user.mbiemri}
                    </option>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                  disabled={!selectedUser}
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
      <Footer />
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
          <TextField
            fullWidth
            select
            label="Select Product"
            variant="outlined"
            value={reviewData.reviewProductID}
            onChange={(e) => setReviewData({ ...reviewData, reviewProductID: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {products.map((product) => (
              <option key={product.productID} value={product.productID}>
                {product.emri}
              </option>
            ))}
          </TextField>
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
    </DashboardLayout>
  );
}

export default Reviews;
