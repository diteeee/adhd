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

function Orders() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [dialogType, setDialogType] = useState("");
  const [orderData, setOrderData] = useState({
    orderID: "",
    totalPrice: "",
    status: "",
    orderUserID: "",
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/orders", axiosConfig)
      .then((response) => {
        const orders = response.data;
        const cols = [
          { Header: "Order ID", accessor: "orderID", align: "left" },
          { Header: "Total Price", accessor: "totalPrice", align: "center" },
          { Header: "Status", accessor: "status", align: "center" },
          { Header: "User", accessor: "user", align: "center" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = orders.map((order) => ({
          orderID: order.orderID,
          totalPrice: order.totalPrice,
          status: order.status,
          user: `${order.User?.emri || "Unknown"} ${order.User?.mbiemri || ""}`,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(order)}>
                Edit
              </Button>
              <Button color="info" onClick={() => handleDelete(order.orderID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((error) => {
        console.error("Failed to fetch orders:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3001/users", axiosConfig)
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch users:", error);
      });
  }, []);

  const handleDelete = (orderID) => {
    axios
      .delete(`http://localhost:3001/orders/${orderID}`, axiosConfig)
      .then(() => {
        alert("Order deleted successfully.");
        fetchOrders();
      })
      .catch((error) => {
        console.error("Failed to delete order:", error);
      });
  };

  const handleEdit = (order) => {
    setOrderData({
      orderID: order.orderID,
      totalPrice: order.totalPrice,
      status: order.status,
      orderUserID: order.orderUserID,
    });
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setOrderData({ orderID: "", totalPrice: "", status: "", orderUserID: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleSave = () => {
    const { orderID, totalPrice, status, orderUserID } = orderData;

    if (dialogType === "edit") {
      axios
        .put(
          `http://localhost:3001/orders/${orderID}`,
          { totalPrice, status, orderUserID },
          axiosConfig
        )
        .then(() => {
          alert("Order updated successfully.");
          fetchOrders();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to update order:", error);
        });
    } else if (dialogType === "add") {
      axios
        .post("http://localhost:3001/orders", { totalPrice, status, orderUserID }, axiosConfig)
        .then(() => {
          alert("Order created successfully.");
          fetchOrders();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to create order:", error);
        });
    }
  };

  const fetchOrders = () => {
    axios
      .get("http://localhost:3001/orders", axiosConfig)
      .then((response) => {
        const orders = response.data;
        const formattedRows = orders.map((order) => ({
          orderID: order.orderID,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: new Date(order.createdAt).toLocaleDateString(),
          user: `${order.User?.emri || "Unknown"} ${order.User?.mbiemri || ""}`,
          actions: (
            <div>
              <Button color="info" onClick={() => handleEdit(order)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(order.orderID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((error) => {
        console.error("Failed to fetch orders:", error);
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
                  Orders
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Order
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
        <DialogTitle>{dialogType === "edit" ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Total Price"
            variant="outlined"
            value={orderData.totalPrice}
            onChange={(e) => setOrderData({ ...orderData, totalPrice: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Status"
            variant="outlined"
            value={orderData.status}
            onChange={(e) => setOrderData({ ...orderData, status: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Select User"
            variant="outlined"
            value={orderData.orderUserID}
            onChange={(e) => setOrderData({ ...orderData, orderUserID: e.target.value })}
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

export default Orders;
