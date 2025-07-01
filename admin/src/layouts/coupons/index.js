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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

function Coupons() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [couponData, setCouponData] = useState({
    couponID: "",
    kodi: "",
    type: "",
    shuma: "",
  });

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

  useEffect(() => {
    fetchCoupons();

    setColumns([
      { Header: "Coupon ID", accessor: "couponID", align: "left" },
      { Header: "Code", accessor: "kodi", align: "center" },
      { Header: "Discount Type", accessor: "type", align: "center" },
      { Header: "Amount", accessor: "shuma", align: "center" },
      { Header: "Actions", accessor: "actions", align: "center" },
    ]);
  }, []);

  const fetchCoupons = () => {
    axios
      .get("http://localhost:3001/coupons", axiosConfig)
      .then((response) => {
        const coupons = response.data;
        const formattedRows = coupons.map((coupon) => ({
          couponID: coupon.couponID,
          kodi: coupon.kodi,
          type: coupon.type,
          // Add dollar sign in amount display
          shuma: `$${coupon.shuma}`,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(coupon)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(coupon.couponID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((error) => {
        console.error("Failed to fetch coupons:", error);
      });
  };

  const handleDelete = (couponID) => {
    axios
      .delete(`http://localhost:3001/coupons/${couponID}`, axiosConfig)
      .then(() => {
        setSnackbarMessage(`Coupon deleted successfully.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchCoupons();
      })
      .catch((error) => {
        console.error("Failed to delete coupon:", error);
        setSnackbarMessage("Failed to delete coupon.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleEdit = (coupon) => {
    setCouponData({
      couponID: coupon.couponID,
      kodi: coupon.kodi,
      type: coupon.type,
      shuma: coupon.shuma, // Keep raw number here for editing
    });
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setCouponData({ couponID: "", kodi: "", type: "", shuma: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleSave = () => {
    const { couponID, kodi, type, shuma } = couponData;

    if (dialogType === "edit") {
      axios
        .put(`http://localhost:3001/coupons/${couponID}`, { kodi, type, shuma }, axiosConfig)
        .then(() => {
          setSnackbarMessage("Coupon updated successfully.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          fetchCoupons();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to update coupon:", error);
          setSnackbarMessage("Failed to update coupon.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    } else if (dialogType === "add") {
      axios
        .post("http://localhost:3001/coupons", { kodi, type, shuma }, axiosConfig)
        .then(() => {
          setSnackbarMessage("Coupon created successfully.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          fetchCoupons();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to create coupon:", error);
          setSnackbarMessage("Failed to create coupon.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
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
                  Coupons
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Coupon
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
        <DialogTitle>{dialogType === "edit" ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Code"
            variant="outlined"
            value={couponData.kodi}
            onChange={(e) => setCouponData({ ...couponData, kodi: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Discount Type"
            variant="outlined"
            value={couponData.type}
            onChange={(e) => setCouponData({ ...couponData, type: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Amount"
            variant="outlined"
            type="number" // <-- restrict input to numbers only
            inputProps={{ min: 0 }} // optional: minimum value 0
            value={couponData.shuma}
            onChange={(e) => setCouponData({ ...couponData, shuma: e.target.value })}
            margin="normal"
          />
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

export default Coupons;
