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
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

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

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
          emri: user.emri,
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
        alert("Authentication failed. Please log in again.");
        window.location.href = "/login";
      });
  };

  const handleEdit = (user) => {
    setUserData(user);
    setDialogType("edit");
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
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleDelete = (userID) => {
    axios
      .delete(`http://localhost:3001/users/${userID}`, axiosConfig)
      .then(() => {
        alert("User deleted.");
        fetchUsers();
      })
      .catch((err) => console.error("Failed to delete user:", err));
  };

  const handleSave = () => {
    const { userID, ...payload } = userData;
    const method = dialogType === "edit" ? "put" : "post";
    const url =
      dialogType === "edit"
        ? `http://localhost:3001/users/${userID}`
        : "http://localhost:3001/users";

    axios[method](url, payload, axiosConfig)
      .then(() => {
        alert(dialogType === "edit" ? "User updated." : "User added.");
        setOpenDialog(false);
        fetchUsers();
      })
      .catch((err) => console.error("Save failed:", err));
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
      <Footer />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogType === "edit" ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="First Name"
            value={userData.emri}
            onChange={(e) => setUserData({ ...userData, emri: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Last Name"
            value={userData.mbiemri}
            onChange={(e) => setUserData({ ...userData, mbiemri: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={userData.nrTel}
            onChange={(e) => setUserData({ ...userData, nrTel: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={userData.password}
            onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Role"
            variant="outlined"
            value={userData.role}
            onChange={(e) => setUserData({ ...userData, role: e.target.value })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            <option value="User">user</option>
            <option value="Admin">admin</option>
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

export default Users;
