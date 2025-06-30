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

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardActionArea from "@mui/material/CardActionArea";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import PropTypes from "prop-types";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Helper component for location picking
function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected location</Popup>
    </Marker>
  ) : null;
}

LocationPicker.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  }),
  onChange: PropTypes.func.isRequired,
};

function UserDetail() {
  const { userID } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [userData, setUserData] = useState(null);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [address, setAddress] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [returnsByOrder, setReturnsByOrder] = useState({});
  const [loadingReturns, setLoadingReturns] = useState({});

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

  // Reverse geocoding to fetch address details
  const reverseGeocode = async (latlng) => {
    try {
      const response = await axios.get("http://localhost:3001/addresss/reverse-geocode", {
        params: { lat: latlng.lat, lon: latlng.lng },
      });
      const addr = response.data.address;

      setUserData((prev) => ({
        ...prev,
        rruga: addr.road || "",
        qyteti: addr.city || addr.town || addr.village || "",
        zipCode: addr.postcode || "",
        shteti: addr.country || "",
      }));
    } catch (error) {
      console.error("Reverse geocode failed:", error);
    }
  };

  // Fetch user detail
  useEffect(() => {
    axios
      .get(`http://localhost:3001/users/${userID}`, axiosConfig)
      .then((res) => {
        setUser(res.data);
        setUserData(res.data);
      })
      .catch((err) => console.error("Failed to fetch user:", err));
  }, [userID]);

  useEffect(() => {
    setLoadingOrders(true);
    axios
      .get(`http://localhost:3001/orders/user/${userID}`, axiosConfig)
      .then((res) => {
        console.log("Orders response:", res.data); // Log the response to check its structure
        setOrders(res.data.Orders || []); // Extract the Orders array, fallback to empty array if undefined
      })
      .catch((err) => console.error("Failed to fetch orders:", err))
      .finally(() => setLoadingOrders(false));
  }, [userID]);

  // Fetch address
  useEffect(() => {
    setAddressLoading(true);
    axios
      .get(`http://localhost:3001/addresss/user/${userID}`, axiosConfig)
      .then((res) => {
        setAddress(res.data);
        if (res.data.latitude && res.data.longitude) {
          setMapPosition({ lat: res.data.latitude, lng: res.data.longitude });
        }
      })
      .catch((err) => {
        if (err.response?.status !== 404) {
          console.error("Failed to fetch address:", err);
        }
      })
      .finally(() => setAddressLoading(false));
  }, [userID]);

  const validateField = (name, value) => {
    switch (name) {
      case "emri":
      case "mbiemri":
        if (!value) return "This field is required.";
        if (!/^[A-Z][a-zA-Z]*$/.test(value))
          return "Must start with a capital letter and contain only letters.";
        return "";
      case "nrTel":
        if (!value) return "Phone number is required.";
        if (!/^\d{5,15}$/.test(value)) return "Phone number must be 5-15 digits.";
        return "";
      case "email":
        if (!value) return "Email is required.";
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
          return "Invalid email address.";
        return "";
      case "password":
        // On edit, allow empty password (means no change)
        if (!value) return "";
        if (value.length < 8) return "Password must be at least 8 characters long.";
        return "";
      case "role":
        if (!value) return "Role is required.";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(userData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleEditOpen = () => {
    setUserData(user);
    setErrors({});
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert("Please fix errors before saving.");
      return;
    }

    try {
      setLoading(true);

      // Save user details
      const userPayload = { ...userData };
      if (!userPayload.password) delete userPayload.password;

      const userResponse = await axios.put(
        `http://localhost:3001/users/${userID}`,
        userPayload,
        axiosConfig
      );
      setUser(userResponse.data);

      // Prepare address data
      const addressPayload = {
        rruga: userData.rruga || "",
        qyteti: userData.qyteti || "",
        zipCode: userData.zipCode || "",
        shteti: userData.shteti || "",
        addressUserID: userID, // Ensure this matches your backend requirements
      };

      if (
        !addressPayload.rruga.trim() ||
        !addressPayload.qyteti.trim() ||
        !addressPayload.zipCode.trim() ||
        !addressPayload.shteti.trim()
      ) {
        alert("Please fill in all address fields.");
        setLoading(false);
        return;
      }

      if (address && address.addressID) {
        // Update existing address
        await axios.put(
          `http://localhost:3001/addresss/${address.addressID}`,
          addressPayload,
          axiosConfig
        );
      } else {
        // Create new address
        await axios.post(`http://localhost:3001/addresss`, addressPayload, axiosConfig);
      }

      // Refresh address
      const addressResponse = await axios.get(
        `http://localhost:3001/addresss/user/${userID}`,
        axiosConfig
      );
      setAddress(addressResponse.data);

      setSnackbar({
        open: true,
        message: "User and address updated successfully.",
        severity: "success",
      });
      setOpenDialog(false);
    } catch (error) {
      console.error("Error updating user or address:", error);
      setSnackbar({
        open: true,
        message: "Failed to update user or address.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`http://localhost:3001/users/${userID}`, axiosConfig)
        .then(() => {
          alert("User deleted.");
          navigate("/users");
        })
        .catch((err) => {
          console.error("Delete failed:", err);
          alert("Failed to delete user.");
        });
    }
  };

  const fetchReturnsForOrder = async (orderID) => {
    setLoadingReturns((prev) => ({ ...prev, [orderID]: true }));

    try {
      const res = await axios.get(`http://localhost:3001/returns/orders/${orderID}`, axiosConfig);
      // returns are inside res.data.Returns or similar — check backend response
      setReturnsByOrder((prev) => ({ ...prev, [orderID]: res.data.Returns || [] }));
    } catch (error) {
      console.error(`Failed to fetch returns for order ${orderID}:`, error);
      setReturnsByOrder((prev) => ({ ...prev, [orderID]: [] }));
    } finally {
      setLoadingReturns((prev) => ({ ...prev, [orderID]: false }));
    }
  };

  useEffect(() => {
    if (orders && orders.length) {
      orders.forEach((order) => {
        fetchReturnsForOrder(order.orderID);
      });
    }
  }, [orders]);

  const updateReturnStatus = async (returnID, returnOrderID) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:3001/returns/${returnID}`,
        { status: "confirmed", returnOrderID },
        axiosConfig
      );

      // Refetch all orders for the user (userID must be in your component's scope)
      const ordersRes = await axios.get(`http://localhost:3001/orders/user/${userID}`, axiosConfig);
      const updatedOrders = ordersRes.data.Orders || [];
      setOrders(updatedOrders);

      // Clear the returnsByOrder for safety (since one order was deleted)
      setReturnsByOrder({});

      // Optionally, refetch returns for all remaining orders:
      for (const order of updatedOrders) {
        fetchReturnsForOrder(order.orderID);
      }

      setSnackbar({
        open: true,
        message: "Return status updated and orders refreshed.",
        severity: "success",
      });
    } catch (error) {
      console.error("Failed to update return status:", error);
      setSnackbar({
        open: true,
        message: "Failed to update return status.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !userData) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pb={3}>
        <MDButton
          variant="outlined"
          color="info"
          onClick={() => navigate("/users")}
          style={{ marginBottom: "10px" }}
        >
          Back to Users
        </MDButton>
        <Grid container spacing={4} justifyContent="center">
          {/* User Details Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox
                mx={2}
                mt={2}
                mb={1}
                py={2}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                textAlign="center"
              >
                <MDTypography variant="h5" color="white" fontWeight="medium">
                  User Detail
                </MDTypography>
              </MDBox>

              <MDBox p={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <MDTypography variant="body1">
                      <strong>First Name:</strong> {user.emri}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="body1">
                      <strong>Last Name:</strong> {user.mbiemri}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="body1">
                      <strong>Phone:</strong> {user.nrTel}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="body1">
                      <strong>Email:</strong> {user.email}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="body1">
                      <strong>Role:</strong> {user.role}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12}>
                    <MDTypography variant="body1">
                      <strong>Address:</strong>
                    </MDTypography>
                    {addressLoading ? (
                      <p>Loading address...</p>
                    ) : address ? (
                      <>
                        <MDTypography variant="body1">
                          {address.rruga}, {address.qyteti}
                        </MDTypography>
                        <MDTypography variant="body1">
                          {address.zipCode}, {address.shteti}
                        </MDTypography>
                      </>
                    ) : (
                      <p>No address saved.</p>
                    )}
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    display="flex"
                    justifyContent="space-around"
                    mt={3}
                    flexWrap="wrap"
                    gap={2}
                  >
                    <MDButton variant="contained" color="primary" onClick={handleEditOpen}>
                      Edit
                    </MDButton>
                    <MDButton variant="outlined" color="error" onClick={handleDelete}>
                      Delete
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate(`/cart/${userID}`)}
                    >
                      View Cart
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      color="secondary"
                      onClick={() => navigate(`/wishlist/${userID}`)}
                    >
                      View Wishlist
                    </MDButton>
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Edit User</DialogTitle>
            <DialogContent>
              <TextField
                fullWidth
                label="First Name"
                value={userData.emri}
                error={!!errors.emri}
                helperText={errors.emri}
                onChange={(e) => handleChange("emri", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Last Name"
                value={userData.mbiemri}
                error={!!errors.mbiemri}
                helperText={errors.mbiemri}
                onChange={(e) => handleChange("mbiemri", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={userData.nrTel}
                error={!!errors.nrTel}
                helperText={errors.nrTel}
                onChange={(e) => handleChange("nrTel", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                value={userData.email}
                error={!!errors.email}
                helperText={errors.email}
                onChange={(e) => handleChange("email", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={userData.password || ""}
                error={!!errors.password}
                helperText={errors.password || "Leave blank to keep current password"}
                onChange={(e) => handleChange("password", e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                select
                label="Role"
                value={userData.role}
                error={!!errors.role}
                helperText={errors.role}
                onChange={(e) => handleChange("role", e.target.value)}
                margin="normal"
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </TextField>

              <MDBox mt={4} height="300px">
                <MapContainer
                  center={mapPosition || [41.3275, 19.8189]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    position={mapPosition}
                    onChange={(latlng) => {
                      setMapPosition(latlng);
                      reverseGeocode(latlng);
                    }}
                  />
                </MapContainer>
              </MDBox>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="info">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                color="primary"
                disabled={Object.values(errors).some((e) => e)}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
          {/* Map Container */}
          <Grid item xs={12} md={6}>
            <Card>
              <MDBox p={3}>
                <MapContainer
                  center={mapPosition || [41.3275, 19.8189]}
                  zoom={13}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapPosition && (
                    <Marker position={mapPosition}>
                      <Popup>Selected location</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </MDBox>
            </Card>
          </Grid>
          {/* Order History */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Order History</MDTypography>
                <Grid item xs={12}>
                  <MDBox p={3}>
                    {loadingOrders ? (
                      <p>Loading orders...</p>
                    ) : Array.isArray(orders) && orders.length > 0 ? (
                      <Grid container spacing={3}>
                        {orders.map((order) => (
                          <Grid item xs={12} key={order.orderID}>
                            <Card variant="outlined">
                              <CardActionArea onClick={() => navigate(`/orders/${order.orderID}`)}>
                                <MDBox p={3}>
                                  <MDTypography variant="h6">
                                    <strong>Order ID:</strong> {order.orderID}
                                  </MDTypography>
                                  <MDTypography variant="body2" mb={2}>
                                    <strong>Date:</strong>{" "}
                                    {new Date(order.createdAt).toLocaleDateString()}
                                  </MDTypography>
                                  <MDTypography variant="body1" mb={2}>
                                    <strong>Status:</strong> {order.status}
                                  </MDTypography>
                                  <MDTypography variant="body1" mb={2}>
                                    <strong>Total:</strong> $
                                    {parseFloat(order.totalPrice).toFixed(2)}
                                  </MDTypography>

                                  {/* Order Items */}
                                  <MDTypography variant="h6" mb={2}>
                                    Order Items
                                  </MDTypography>
                                  <Grid container spacing={2}>
                                    {Array.isArray(order.OrderItems) &&
                                    order.OrderItems.length > 0 ? (
                                      order.OrderItems.map((item) => (
                                        <Grid item xs={12} sm={6} md={4} key={item.orderItemID}>
                                          <Card>
                                            <MDBox display="flex" alignItems="center" gap={2} p={2}>
                                              <img
                                                src={item.ProductVariant.Product.imageURL}
                                                alt={item.ProductVariant.Product.emri}
                                                style={{
                                                  width: "60px",
                                                  height: "60px",
                                                  objectFit: "cover",
                                                  borderRadius: "4px",
                                                }}
                                              />
                                              <MDBox>
                                                <MDTypography variant="body2">
                                                  <strong>Product:</strong>{" "}
                                                  {item.ProductVariant.Product.emri}
                                                </MDTypography>
                                                <MDTypography variant="body2">
                                                  <strong>Shade:</strong>{" "}
                                                  {item.ProductVariant.shade}
                                                </MDTypography>
                                                <MDTypography variant="body2">
                                                  <strong>Qty:</strong> {item.sasia}
                                                </MDTypography>
                                                <MDTypography variant="body2">
                                                  <strong>Price:</strong> $
                                                  {parseFloat(item.cmimi).toFixed(2)}
                                                </MDTypography>
                                              </MDBox>
                                            </MDBox>
                                          </Card>
                                        </Grid>
                                      ))
                                    ) : (
                                      <Grid item xs={12}>
                                        <p>No items found for this order.</p>
                                      </Grid>
                                    )}
                                  </Grid>
                                </MDBox>
                              </CardActionArea>

                              <Accordion>
                                <AccordionSummary
                                  expandIcon={<ExpandMoreIcon />}
                                  aria-controls={`returns-content-${order.orderID}`}
                                  id={`returns-header-${order.orderID}`}
                                >
                                  <MDTypography variant="h6">
                                    Return Requests ({returnsByOrder[order.orderID]?.length || 0})
                                  </MDTypography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  {loadingReturns[order.orderID] ? (
                                    <p>Loading returns...</p>
                                  ) : returnsByOrder[order.orderID] &&
                                    returnsByOrder[order.orderID].length > 0 ? (
                                    returnsByOrder[order.orderID].map((ret) => (
                                      <Card
                                        key={ret.returnID}
                                        variant="outlined"
                                        style={{ marginBottom: "10px", padding: "10px" }}
                                      >
                                        <MDTypography>
                                          <strong>Reason:</strong> {ret.arsyeja}
                                        </MDTypography>
                                        <MDTypography>
                                          <strong>Status:</strong> {ret.status}
                                        </MDTypography>
                                        {ret.status !== "confirmed" && (
                                          <MDButton
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() =>
                                              updateReturnStatus(ret.returnID, ret.returnOrderID)
                                            }
                                            disabled={loading}
                                            style={{ marginTop: "8px" }}
                                          >
                                            Confirm Return
                                          </MDButton>
                                        )}
                                      </Card>
                                    ))
                                  ) : (
                                    <p>No return requests for this order.</p>
                                  )}
                                </AccordionDetails>
                              </Accordion>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <p>No orders found.</p>
                    )}
                  </MDBox>
                </Grid>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default UserDetail;
