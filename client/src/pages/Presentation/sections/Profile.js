import React, { useState } from "react";
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

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";
import MKButton from "components/MKButton";
import { useUser } from "context/UserContext"; // Adjust the import path as necessary
import axios from "axios";

function ProfilePage() {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user || {});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await axios.put(`http://localhost:3001/users/${user.userID}`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setUser(response.data); // Update the user in context
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <MKTypography variant="h6">User not logged in.</MKTypography>;

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
                <Typography
                  variant="h4"
                  style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                >
                  {user.emri} {user.mbiemri}
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  style={{ fontFamily: "Times New Roman, serif" }}
                >
                  {user.email}
                </Typography>
              </MKBox>
            </Card>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography
                  variant="h5"
                  mb={2}
                  style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                >
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
                          inputProps={{
                            style: { fontFamily: "Times New Roman, serif" },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Last Name"
                          name="mbiemri"
                          value={formData.mbiemri || ""}
                          onChange={handleChange}
                          inputProps={{
                            style: { fontFamily: "Times New Roman, serif" },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          name="nrTel"
                          value={formData.nrTel || ""}
                          onChange={handleChange}
                          inputProps={{
                            style: { fontFamily: "Times New Roman, serif" },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleChange}
                          inputProps={{
                            style: { fontFamily: "Times New Roman, serif" },
                          }}
                        />
                      </Grid>
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
                      <Typography variant="h6" style={{ fontFamily: "Times New Roman, serif" }}>
                        First Name: {user.emri || "N/A"}
                      </Typography>
                      <Typography variant="h6" style={{ fontFamily: "Times New Roman, serif" }}>
                        Last Name: {user.mbiemri || "N/A"}
                      </Typography>
                      <Typography variant="h6" style={{ fontFamily: "Times New Roman, serif" }}>
                        Phone Number: {user.nrTel || "N/A"}
                      </Typography>
                      <Typography variant="h6" style={{ fontFamily: "Times New Roman, serif" }}>
                        Email: {user.email || "N/A"}
                      </Typography>
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
