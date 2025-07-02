import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";
import { jwtDecode } from "jwt-decode";

function Notifications() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  useEffect(() => {
    axios
      .get("http://localhost:3001/users", axiosConfig)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const role = decoded.role || "guest";
        if (role !== "admin") {
          window.location.href = "http://localhost:3000/presentation";
        }
      } catch (e) {
        console.error("Token decode failed:", e);
        window.location.href = "http://localhost:3000/presentation";
      }
    } else {
      window.location.href = "http://localhost:3000/presentation";
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();

    setColumns([
      { Header: "Notification ID", accessor: "notificationID", align: "left" },
      { Header: "Message", accessor: "mesazhi", align: "center" },
      { Header: "User", accessor: "user", align: "center" },
    ]);
  }, []);

  const fetchNotifications = () => {
    axios
      .get("http://localhost:3001/notifications", axiosConfig)
      .then((res) => {
        const formatted = res.data.map((n) => ({
          notificationID: n.notificationID,
          mesazhi: n.mesazhi,
          user: `${n.User?.emri || "Unknown"} ${n.User?.mbiemri || ""}`,
        }));
        setRows(formatted);
      })
      .catch((err) => console.error("Failed to load notifications:", err));
  };

  const handleSendNotification = () => {
    if (!selectedUser || !message) {
      setSnackbarMessage("Please select a user and type a message.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    axios
      .post(
        "http://localhost:3001/notifications",
        { notificationUserID: Number(selectedUser), mesazhi: message },
        axiosConfig
      )
      .then((res) => {
        setSnackbarMessage("Notification sent successfully!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchNotifications();
        setOpenDialog(false);
        setMessage("");
        setSelectedUser("");
      })
      .catch((err) => {
        console.error("Failed to send notification:", err);
        setSnackbarMessage("Failed to send notification.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
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
                    Send Notification
                  </MDTypography>
                </MDBox>
                <MDBox p={3}>
                  <form>
                    <TextField
                      select
                      fullWidth
                      label="Select User"
                      variant="outlined"
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      margin="normal"
                      SelectProps={{ native: true }}
                    >
                      <option value=""></option>
                      {users.map((user) => (
                        <option key={user.userID} value={user.userID}>
                          {user.emri} {user.mbiemri}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      label="Message"
                      variant="outlined"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      margin="normal"
                      multiline
                      rows={4}
                    />

                    <MDBox mt={2}>
                      <Button variant="contained" color="white" onClick={handleSendNotification}>
                        Send Notification
                      </Button>
                    </MDBox>
                  </form>
                </MDBox>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>

      {/* Snackbar */}
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

export default Notifications;
