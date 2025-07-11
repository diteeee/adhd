import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { Snackbar, Alert } from "@mui/material";

function UserCart() {
  const { userID } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingQuantities, setEditingQuantities] = useState({}); // Track quantity edits per cartID

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

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

  // Fetch cart items on mount or userID change
  const fetchCartItems = () => {
    setLoading(true);
    axios
      .get(`http://localhost:3001/carts/user/${userID}`, axiosConfig)
      .then((res) => {
        setCartItems(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch cart items:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCartItems();
  }, [userID]);

  // Handle quantity input change
  const handleQuantityChange = (cartID, value) => {
    // Ensure only numbers >= 1
    if (value === "" || (/^\d+$/.test(value) && Number(value) >= 1)) {
      setEditingQuantities((prev) => ({ ...prev, [cartID]: value }));
    }
  };

  // Save updated quantity
  const handleSaveQuantity = (cartID) => {
    const newQuantity = editingQuantities[cartID];
    if (!newQuantity) return; // Do nothing if empty

    axios
      .put(`http://localhost:3001/carts/${cartID}`, { sasia: newQuantity }, axiosConfig)
      .then(() => {
        fetchCartItems();
        setEditingQuantities((prev) => {
          const copy = { ...prev };
          delete copy[cartID];
          return copy;
        });
      })
      .catch((err) => {
        console.error("Failed to update quantity:", err);
        setSnackbarMessage("Failed to update quantity.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  // Delete cart item
  const handleDelete = (cartID) => {
    if (window.confirm("Are you sure you want to remove this item from the cart?")) {
      axios
        .delete(`http://localhost:3001/carts/${cartID}`, axiosConfig)
        .then(() => {
          fetchCartItems();
        })
        .catch((err) => {
          console.error("Failed to delete cart item:", err);
          setSnackbarMessage("Failed to delete cart item.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3} px={3}>
        <MDTypography variant="h4" gutterBottom>
          User Cart
        </MDTypography>

        {loading ? (
          <MDTypography>Loading cart items...</MDTypography>
        ) : cartItems.length === 0 ? (
          <MDTypography>No items in cart.</MDTypography>
        ) : (
          <Grid container spacing={3}>
            {cartItems.map((item) => {
              const product = item.ProductVariant?.Product;
              const brand = product?.Brand;
              const quantityEditingValue = editingQuantities[item.cartID] ?? item.sasia;

              return (
                <Grid item xs={12} md={6} lg={4} key={item.cartID}>
                  <Card>
                    <MDBox display="flex" gap={2} p={2} alignItems="center">
                      <img
                        src={product?.imageURL || ""}
                        alt={product?.emri || "Product"}
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 4 }}
                      />
                      <MDBox flexGrow={1}>
                        <MDTypography variant="h6">{product?.emri}</MDTypography>
                        <MDTypography variant="body2" color="textSecondary">
                          Brand: {product.Brand?.name || "N/A"}
                        </MDTypography>
                        <MDTypography variant="body2" color="textSecondary">
                          Variant: {item.ProductVariant?.shade || "N/A"}
                        </MDTypography>
                        <MDTypography variant="body2" color="textSecondary">
                          Price: ${Number(product?.cmimi || 0).toFixed(2)}
                        </MDTypography>
                      </MDBox>

                      <MDBox display="flex" flexDirection="column" alignItems="center" gap={1}>
                        <TextField
                          type="number"
                          label="Quantity"
                          size="small"
                          inputProps={{ min: 1 }}
                          value={quantityEditingValue}
                          onChange={(e) => handleQuantityChange(item.cartID, e.target.value)}
                          style={{ width: 80 }}
                        />
                        <MDButton
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleSaveQuantity(item.cartID)}
                          disabled={quantityEditingValue === item.sasia || !quantityEditingValue}
                        >
                          Save
                        </MDButton>

                        <MDButton
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(item.cartID)}
                        >
                          Remove
                        </MDButton>
                      </MDBox>
                    </MDBox>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <MDBox mt={4}>
          <MDButton variant="outlined" color="info" onClick={() => navigate(`/users/${userID}`)}>
            Back to User Detail
          </MDButton>
        </MDBox>
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

export default UserCart;
