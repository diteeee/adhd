import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { Snackbar, Alert } from "@mui/material";

function Wishlist() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3001/wishlists/${userID}`, axiosConfig);
      setWishlistItems(res.data);
      setError(null);
    } catch (err) {
      setSnackbarMessage("Failed to fetch wishlist.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error("Failed to fetch wishlist:", err);
      setError("Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [userID]);

  const handleRemove = async (productID) => {
    if (!window.confirm("Remove this item from wishlist?")) return;

    try {
      setRemoving(true);
      await axios.delete(`http://localhost:3001/wishlists`, {
        data: { userID, productID },
        ...axiosConfig,
      });
      setSnackbarMessage("Item removed successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      // Refresh wishlist
      fetchWishlist();
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
      setSnackbarMessage("Failed to remove item.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDTypography variant="h4" gutterBottom>
          Wishlist
        </MDTypography>

        <MDButton
          variant="outlined"
          color="info"
          onClick={() => navigate(`/users/${userID}`)}
          style={{ marginBottom: "20px" }}
        >
          Back to User Details
        </MDButton>

        {loading ? (
          <p>Loading wishlist...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : wishlistItems.length === 0 ? (
          <p>No items in wishlist.</p>
        ) : (
          <Grid container spacing={3}>
            {wishlistItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.wishlistID}>
                <Card>
                  <MDBox p={2} display="flex" flexDirection="column" alignItems="center" gap={1}>
                    {item.productImageURL && (
                      <img
                        src={item.productImageURL}
                        alt={item.productEmri}
                        style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 4 }}
                      />
                    )}
                    <MDTypography variant="h6">{item.productEmri}</MDTypography>

                    <MDButton
                      variant="outlined"
                      color="error"
                      onClick={() => handleRemove(item.productID)}
                      disabled={removing}
                      style={{ marginTop: 10 }}
                    >
                      Remove
                    </MDButton>
                  </MDBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>
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

export default Wishlist;
