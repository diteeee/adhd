import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Addresss() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [addressData, setAddressData] = useState({
    addressID: "",
    rruga: "",
    qyteti: "",
    zipCode: "",
    shteti: "",
    addressUserID: "",
  });
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchAddresss();
    fetchUsers();
  }, []);

  const fetchAddresss = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/addresss", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const addresss = res.data;
        const cols = [
          { Header: "Street", accessor: "rruga", align: "left" },
          { Header: "City", accessor: "qyteti", align: "left" },
          { Header: "Zip Code", accessor: "zipCode", align: "left" },
          { Header: "Country", accessor: "shteti", align: "left" },
          { Header: "User", accessor: "user", align: "left" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = addresss.map((address) => ({
          rruga: address.rruga,
          qyteti: address.qyteti,
          zipCode: address.zipCode,
          shteti: address.shteti,
          user: `${address.User?.emri || "Unknown"} ${address.User?.mbiemri || ""}`,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(address)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(address.addressID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => console.error("Failed to fetch addresss:", err));
  };

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err));
  };

  const handleEdit = (address) => {
    setAddressData(address);
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setAddressData({
      addressID: "",
      rruga: "",
      qyteti: "",
      zipCode: "",
      shteti: "",
      addressUserID: "",
    });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleDelete = (addressID) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:3001/addresss/${addressID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Address deleted.");
        fetchAddresss();
      })
      .catch((err) => console.error("Failed to delete address:", err));
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");
    const { addressID, ...payload } = addressData;
    const method = dialogType === "edit" ? "put" : "post";
    const url =
      dialogType === "edit"
        ? `http://localhost:3001/addresss/${addressID}`
        : "http://localhost:3001/addresss";

    axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert(dialogType === "edit" ? "Address updated." : "Address added.");
        setOpenDialog(false);
        fetchAddresss();
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
                  Addresses
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Address
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
        <DialogTitle>{dialogType === "edit" ? "Edit Address" : "Add Address"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Street"
            value={addressData.rruga}
            onChange={(e) => setAddressData({ ...addressData, rruga: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="City"
            value={addressData.qyteti}
            onChange={(e) => setAddressData({ ...addressData, qyteti: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Zip Code"
            value={addressData.zipCode}
            onChange={(e) => setAddressData({ ...addressData, zipCode: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Country"
            value={addressData.shteti}
            onChange={(e) => setAddressData({ ...addressData, shteti: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            select
            label="Select User"
            variant="outlined"
            value={addressData.addressUserID}
            onChange={(e) => setAddressData({ ...addressData, addressUserID: e.target.value })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            {users.map((user) => (
              <option key={user.userID} value={user.userID}>
                {user.emri} {user.mbiemri}
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

export default Addresss;
