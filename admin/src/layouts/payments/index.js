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

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Payments() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [orders, setOrders] = useState([]);
  const [dialogType, setDialogType] = useState(""); // "edit" or "add"
  const [paymentData, setPaymentData] = useState({
    paymentID: "",
    metoda: "",
    status: "",
    data: "",
    paymentOrderID: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchOrders();

    setColumns([
      { Header: "Payment ID", accessor: "paymentID", align: "left" },
      { Header: "Method", accessor: "metoda", align: "center" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Date", accessor: "data", align: "center" },
      { Header: "Order", accessor: "order", align: "center" },
      { Header: "Actions", accessor: "actions", align: "center" },
    ]);
  }, []);

  const fetchPayments = () => {
    axios
      .get("http://localhost:3001/payments")
      .then((res) => {
        const formatted = res.data.map((payment) => ({
          paymentID: payment.paymentID,
          metoda: payment.metoda,
          status: payment.status,
          data: new Date(payment.data).toLocaleDateString(),
          order: `#${payment.Order?.orderID || "Unknown"}`,
          actions: (
            <div>
              <Button color="info" onClick={() => handleEdit(payment)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(payment.paymentID)}>
                Delete
              </Button>
            </div>
          ),
        }));
        setRows(formatted);
      })
      .catch((err) => console.error("Failed to fetch payments:", err));
  };

  const fetchOrders = () => {
    axios
      .get("http://localhost:3001/orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => console.error("Failed to fetch orders:", err));
  };

  const handleAdd = () => {
    setPaymentData({ paymentID: "", metoda: "", status: "", data: "", paymentOrderID: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleEdit = (payment) => {
    setPaymentData({
      paymentID: payment.paymentID,
      metoda: payment.metoda,
      status: payment.status,
      data: payment.data,
      paymentOrderID: payment.paymentOrderID || payment.Order?.orderID || "",
    });
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleDelete = (paymentID) => {
    axios
      .delete(`http://localhost:3001/payments/${paymentID}`)
      .then(() => {
        alert("Payment deleted successfully.");
        fetchPayments();
      })
      .catch((err) => console.error("Failed to delete payment:", err));
  };

  const handleSave = () => {
    const { paymentID, metoda, status, data, paymentOrderID } = paymentData;

    if (dialogType === "edit") {
      axios
        .put(`http://localhost:3001/payments/${paymentID}`, {
          metoda,
          status,
          data,
          paymentOrderID,
        })
        .then(() => {
          alert("Payment updated.");
          fetchPayments();
          setOpenDialog(false);
        })
        .catch((err) => console.error("Failed to update payment:", err));
    } else {
      axios
        .post("http://localhost:3001/payments", {
          metoda,
          status,
          data,
          paymentOrderID,
        })
        .then(() => {
          alert("Payment added.");
          fetchPayments();
          setOpenDialog(false);
        })
        .catch((err) => console.error("Failed to add payment:", err));
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
                  Payments
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Payment
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

      {/* Payment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogType === "edit" ? "Edit Payment" : "Add Payment"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Method"
            variant="outlined"
            value={paymentData.metoda}
            onChange={(e) => setPaymentData({ ...paymentData, metoda: e.target.value })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </TextField>

          <TextField
            fullWidth
            label="Status"
            variant="outlined"
            value={paymentData.status}
            onChange={(e) => setPaymentData({ ...paymentData, status: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Date"
            variant="outlined"
            type="date"
            value={paymentData.data}
            onChange={(e) => setPaymentData({ ...paymentData, data: e.target.value })}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            select
            label="Select Order"
            variant="outlined"
            value={paymentData.paymentOrderID}
            onChange={(e) => setPaymentData({ ...paymentData, paymentOrderID: e.target.value })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            {orders.map((order) => (
              <option key={order.orderID} value={order.orderID}>
                #{order.orderID}
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

export default Payments;
