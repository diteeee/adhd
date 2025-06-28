import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  TextField,
  CircularProgress,
} from "@mui/material";

import { useNavigate } from "react-router-dom"; // For navigation
import MKBox from "components/MKBox";
import MKButton from "components/MKButton";
import { useUser } from "context/UserContext"; // Adjust the import path as necessary
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import PropTypes from "prop-types";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function LocationPicker({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Selected location</Popup>
    </Marker>
  );
}

LocationPicker.propTypes = {
  position: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

// --- ADD THIS FUNCTION ---

function ProfilePage() {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigation
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [mapPosition, setMapPosition] = useState(null); // latitude & longitude

  const reverseGeocode = async (latlng) => {
    try {
      const response = await axios.get("http://localhost:3001/addresss/reverse-geocode", {
        params: {
          lat: latlng.lat,
          lon: latlng.lng,
        },
      });

      const address = response.data.address;

      setFormData((prev) => ({
        ...prev,
        rruga: address.road || "",
        qyteti: address.city || address.town || address.village || "",
        zipCode: address.postcode || "",
        shteti: address.country || "",
      }));
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
    }
  };

  useEffect(() => {
    // Redirect to login if not signed in
    if (!user) {
      navigate("/pages/authentication/sign-in");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setAddressLoading(true);
      axios
        .get(`http://localhost:3001/addresss/user/${user.userID}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => {
          setAddress(res.data);
          // Optionally, set initial map position based on saved address coordinates if you have them
          // For example, if you store lat/lng in your address, do:
          // setMapPosition([res.data.latitude, res.data.longitude]);
        })
        .catch((err) => {
          if (err.response?.status !== 404) {
            console.error("Failed to fetch address:", err);
          }
          setAddress(null);
        })
        .finally(() => {
          setAddressLoading(false);
        });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Save user profile data
      const userResponse = await axios.put(`http://localhost:3001/users/${user.userID}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(userResponse.data);

      // Prepare address data
      const addressPayload = {
        rruga: formData.rruga || "",
        qyteti: formData.qyteti || "",
        zipCode: formData.zipCode || "",
        shteti: formData.shteti || "",
        addressUserID: user.userID,
      };
      console.log("Address data to save:", addressPayload);

      // Validation to prevent empty address fields
      if (
        !addressPayload.rruga.trim() ||
        !addressPayload.qyteti.trim() ||
        !addressPayload.zipCode.trim() ||
        !addressPayload.shteti.trim()
      ) {
        alert("Please select a valid address on the map.");
        setLoading(false);
        return;
      }

      if (address && address.addressID) {
        // Update existing address
        await axios.put(`http://localhost:3001/addresss/${address.addressID}`, addressPayload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      } else {
        // Create new address
        await axios.post(`http://localhost:3001/addresss`, addressPayload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
      }

      // Refresh address after save
      const addressResponse = await axios.get(
        `http://localhost:3001/addresss/user/${user.userID}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setAddress(addressResponse.data);

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data or address:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Return null while redirecting to avoid rendering the page

  return (
    <Container>
      <MKBox mt={4}>
        <Grid container spacing={4} justifyContent="center">
          {/* Profile Header */}
          <Grid item xs={12} md={8} mt={8}>
            <Card>
              <MKBox display="flex" flexDirection="column" alignItems="center" p={4}>
                <Avatar
                  src="/default-profile.jpg" // Replace with user's profile picture URL if available
                  alt={user.emri}
                  sx={{ width: 100, height: 100, mb: 2 }}
                />
                <Typography variant="h4" style={{ fontWeight: "bold" }}>
                  {user.emri} {user.mbiemri}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {user.email}
                </Typography>
              </MKBox>
            </Card>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" mb={2} style={{ fontWeight: "bold" }}>
                  {isEditing ? "Edit Profile" : "Profile Details"}
                </Typography>
                {isEditing ? (
                  <form>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="First Name"
                          name="emri"
                          value={formData.emri || ""}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="mbiemri"
                          value={formData.mbiemri || ""}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="nrTel"
                          value={formData.nrTel || ""}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                        />
                      </Grid>
                      <MKBox mt={4} height="300px">
                        <Typography>Select your address on the map:</Typography>
                        <MapContainer
                          center={mapPosition || [41.3275, 19.8189]} // default to Tirana, Albania
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
                      </MKBox>
                    </Grid>
                    <MKBox mt={3} display="flex" justifyContent="space-between">
                      <MKButton
                        variant="contained"
                        color="primary"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
                      </MKButton>
                      <MKButton
                        variant="outlined"
                        color="secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </MKButton>
                    </MKBox>
                  </form>
                ) : (
                  <>
                    <MKBox mb={2}>
                      <Typography variant="h6">First Name: {user.emri || "N/A"}</Typography>
                      <Typography variant="h6">Last Name: {user.mbiemri || "N/A"}</Typography>
                      <Typography variant="h6">Phone Number: {user.nrTel || "N/A"}</Typography>
                      <Typography variant="h6">Email: {user.email || "N/A"}</Typography>
                    </MKBox>
                    <MKBox mb={2}>
                      <Typography variant="h6" gutterBottom>
                        Address:
                      </Typography>
                      {addressLoading ? (
                        <CircularProgress size={24} />
                      ) : address ? (
                        <>
                          <Typography>
                            {address.rruga}, {address.qyteti}
                          </Typography>
                          <Typography>
                            {address.zipCode}, {address.shteti}
                          </Typography>
                        </>
                      ) : (
                        <Typography>No address saved.</Typography>
                      )}
                    </MKBox>
                    <MKBox mt={3}>
                      <MKButton
                        variant="contained"
                        color="primary"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Profile
                      </MKButton>
                    </MKBox>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MKBox>
    </Container>
  );
}

export default ProfilePage;
