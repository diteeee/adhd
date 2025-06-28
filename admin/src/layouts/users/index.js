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
import { useNavigate } from "react-router-dom";

function Users() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [userData, setUserData] = useState({
    userID: "",
    emri: "",
    mbiemri: "",
    nrTel: "",
    email: "",
    password: "",
    role: "User",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Helper to show snackbar
  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:3001/users", axiosConfig)
      .then((res) => {
        const users = res.data;
        const cols = [
          { Header: "First Name", accessor: "emri", align: "left" },
          { Header: "Last Name", accessor: "mbiemri", align: "left" },
          { Header: "Phone", accessor: "nrTel", align: "left" },
          { Header: "Email", accessor: "email", align: "left" },
          { Header: "Role", accessor: "role", align: "left" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = users.map((user) => ({
          emri: (
            <Button
              variant="text"
              color="info"
              onClick={() => navigate(`/users/${user.userID}`)}
              style={{ textTransform: "none", padding: 0, minWidth: 0 }}
            >
              {user.emri}
            </Button>
          ),
          mbiemri: user.mbiemri,
          nrTel: user.nrTel,
          email: user.email,
          role: user.role,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(user)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(user.userID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
        showSnackbar("Authentication failed. Please log in again.", "error");
        window.location.href = "/login";
      });
  };

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
        // Simple email regex
        if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value))
          return "Invalid email address.";
        return "";
      case "password":
        if (dialogType === "edit" && !value) return ""; // Allow empty password on edit (no change)
        if (!value) return "Password is required.";
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
    // Validate this field on change
    setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleEdit = (user) => {
    setUserData(user);
    setDialogType("edit");
    setErrors({});
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setUserData({
      userID: "",
      emri: "",
      mbiemri: "",
      nrTel: "",
      email: "",
      password: "",
      role: "User",
    });
    setErrors({});
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleDelete = (userID) => {
    axios
      .delete(`http://localhost:3001/users/${userID}`, axiosConfig)
      .then(() => {
        showSnackbar("User deleted successfully.", "success");
        fetchUsers();
      })
      .catch((err) => {
        console.error("Failed to delete user:", err);
        showSnackbar("Failed to delete user.", "error");
      });
  };

  const handleSave = () => {
    if (!validateForm()) {
      showSnackbar("Please fix the errors in the form before saving.", "warning");
      return;
    }
    const { userID, ...payload } = userData;
    const method = dialogType === "edit" ? "put" : "post";
    const url =
      dialogType === "edit"
        ? `http://localhost:3001/users/${userID}`
        : "http://localhost:3001/users";

    axios[method](url, payload, axiosConfig)
      .then(() => {
        showSnackbar(
          dialogType === "edit" ? "User updated successfully." : "User added successfully.",
          "success"
        );
        setOpenDialog(false);
        fetchUsers();
      })
      .catch((err) => {
        console.error("Save failed:", err);
        showSnackbar("Save failed. Please try again.", "error");
      });
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
                  Users
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add User
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
        <DialogTitle>{dialogType === "edit" ? "Edit User" : "Add User"}</DialogTitle>
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
            value={userData.password}
            error={!!errors.password}
            helperText={
              errors.password ||
              (dialogType === "edit" ? "Leave blank to keep current password" : "")
            }
            onChange={(e) => handleChange("password", e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Role"
            variant="outlined"
            value={userData.role}
            error={!!errors.role}
            helperText={errors.role}
            onChange={(e) => handleChange("role", e.target.value)}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
          </TextField>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default Users;
