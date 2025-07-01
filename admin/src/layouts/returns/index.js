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

function Returns() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [orders, setOrders] = useState([]);
  const [dialogType, setDialogType] = useState("");
  const [returnData, setReturnData] = useState({
    returnID: "",
    arsyeja: "",
    status: "",
    returnOrderID: "",
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
    fetchReturns();
    fetchOrders();

    setColumns([
      { Header: "Reason", accessor: "arsyeja", align: "center" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "User", accessor: "order", align: "center" },
      { Header: "Actions", accessor: "actions", align: "center" },
    ]);
  }, []);

  const fetchReturns = () => {
    axios
      .get("http://localhost:3001/returns", axiosConfig)
      .then((res) => {
        const formatted = res.data.map((ret) => ({
          returnID: ret.returnID,
          arsyeja: ret.arsyeja,
          status: ret.status,
          order:
            `${ret.Order?.User?.emri || "Unknown"} ${ret.Order?.User?.mbiemri || ""}`.trim() ||
            "Unknown",
          actions: (
            <div>
              {/* Confirm button only shows if status is not confirmed */}
              {ret.status !== "confirmed" && (
                <Button
                  variant="contained"
                  onClick={() => handleConfirm(ret.returnID, ret.returnOrderID)}
                  style={{ marginRight: 8, color: "white" }}
                >
                  Confirm
                </Button>
              )}
              <Button color="error" onClick={() => handleDelete(ret.returnID)}>
                Delete
              </Button>
            </div>
          ),
        }));
        setRows(formatted);
      })
      .catch((err) => console.error("Failed to fetch returns:", err));
  };

  const fetchOrders = () => {
    axios
      .get("http://localhost:3001/orders", axiosConfig)
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  };

  const handleDelete = (returnID) => {
    axios
      .delete(`http://localhost:3001/returns/${returnID}`, axiosConfig)
      .then(() => {
        setSnackbarMessage(`Return request deleted successfully.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchReturns();
        fetchOrders(); // Refresh orders as well
      })
      .catch((err) => console.error("Failed to delete return:", err));
  };

  // New function to confirm return status
  const handleConfirm = (returnID, returnOrderID) => {
    axios
      .put(
        `http://localhost:3001/returns/${returnID}`,
        { status: "confirmed", returnOrderID },
        axiosConfig
      )
      .then(() => {
        setSnackbarMessage(`Return status updated to confirmed.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchReturns();
        fetchOrders(); // Refresh orders because order gets deleted on confirmation
      })
      .catch((err) => {
        console.error("Failed to confirm return:", err);
        setSnackbarMessage("Failed to confirm return.");
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
                  Returns
                </MDTypography>
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

export default Returns;
