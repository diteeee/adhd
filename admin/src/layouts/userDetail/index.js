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

  const [address, setAddress] = useState(null);
  const [mapPosition, setMapPosition] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [loading, setLoading] = useState(false);

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

  if (!user || !userData) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
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
                    <MDButton variant="outlined" color="info" onClick={() => navigate("/users")}>
                      Back to Users
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
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default UserDetail;
