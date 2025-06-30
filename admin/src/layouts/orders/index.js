import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
import { useNavigate } from "react-router-dom";

function Orders() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [dialogType, setDialogType] = useState("");
  const [orderData, setOrderData] = useState({
    orderID: "",
    paymentMethod: "",
    couponCode: "",
    status: "",
    orderUserID: "",
  });
  const [productVariants, setProductVariants] = useState([]);
  const [orderItems, setOrderItems] = useState([{ productVariantID: "", quantity: 1 }]);
  const [tempCouponCode, setTempCouponCode] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

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

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  useEffect(() => {
    fetchOrders();
    fetchUsers();
    fetchProductVariants();
  }, []);

  const fetchOrders = () => {
    axios
      .get("http://localhost:3001/orders", axiosConfig)
      .then((response) => {
        const orders = response.data;
        console.log("Orders fetched:", orders); // <-- Add this
        const cols = [
          { Header: "User", accessor: "user", align: "center" },
          { Header: "Order ID", accessor: "orderID", align: "left" },
          { Header: "Total Price", accessor: "totalPrice", align: "center" },
          { Header: "Discount", accessor: "discount", align: "center" },
          { Header: "Status", accessor: "status", align: "center" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = orders.map((order) => {
          // Check if payment is completed in Payments array
          const paymentCompleted = order.Payments?.some((p) => p.status === "completed");

          return {
            orderID: order.orderID,
            totalPrice: Number(order.totalPrice || 0).toFixed(2),
            discount: Number(order.discount || 0).toFixed(2),
            status: order.status,
            user: (
              <Button
                color="info"
                variant="text"
                style={{ textTransform: "none", padding: 0, minWidth: 0 }}
                onClick={() => navigate(`/orders/${order.orderID}`)}
              >
                {`${order.User?.emri || "Unknown"} ${order.User?.mbiemri || ""}`}
              </Button>
            ),
            actions: (
              <div>
                {!paymentCompleted && (
                  <Button color="primary" onClick={() => handleEdit(order)}>
                    Edit
                  </Button>
                )}
                <Button color="secondary" onClick={() => handleDelete(order.orderID)}>
                  Delete
                </Button>
              </div>
            ),
          };
        });

        setRows(formattedRows);
      })
      .catch((error) => console.error("Failed to fetch orders:", error));
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:3001/users", axiosConfig)
      .then((response) => setUsers(response.data))
      .catch((error) => console.error("Failed to fetch users:", error));
  };

  const fetchProductVariants = () => {
    axios
      .get("http://localhost:3001/productVariants", axiosConfig)
      .then((res) => setProductVariants(res.data))
      .catch((err) => console.error("Failed to fetch product variants:", err));
  };

  const handleDelete = (orderID) => {
    axios
      .delete(`http://localhost:3001/orders/${orderID}`, axiosConfig)
      .then(() => {
        setSnackbarMessage(`Order deleted successfully.`);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        fetchOrders();
      })
      .catch((error) => console.error("Failed to delete order:", error));
  };

  const handleEdit = (order) => {
    // Fetch order with items from backend
    axios
      .get(`http://localhost:3001/orders/${order.orderID}`, axiosConfig)
      .then((response) => {
        const fullOrder = response.data;
        setOrderData({
          orderID: fullOrder.orderID,
          paymentMethod: fullOrder.paymentMethod || "",
          couponCode: fullOrder.couponCode || "",
          status: fullOrder.status,
          orderUserID: fullOrder.orderUserID || "",
        });
        // Map OrderItems to your state format
        const items = (fullOrder.OrderItems || []).map((item) => ({
          productVariantID: item.orderItemProductVariantID,
          quantity: item.sasia,
        }));
        setOrderItems(items.length ? items : [{ productVariantID: "", quantity: 1 }]);
        setDialogType("edit");
        setOpenDialog(true);
      })
      .catch((error) => {
        console.error("Failed to fetch order details:", error);
        setSnackbarMessage("Unable to load details for the order.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      });
  };

  const handleAdd = () => {
    setOrderData({ orderID: "", paymentMethod: "", couponCode: "", status: "", orderUserID: "" });
    setOrderItems([{ productVariantID: "", quantity: 1 }]); // reset items here
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleSave = () => {
    const { orderID, paymentMethod, couponCode, orderUserID } = {
      ...orderData,
      couponCode: tempCouponCode, // Explicitly include the updated coupon code
    };

    if (
      !orderItems.length ||
      orderItems.some((item) => !item.productVariantID || item.quantity < 1)
    ) {
      setSnackbarMessage("Please add valid order items.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (dialogType === "edit") {
      axios
        .put(
          `http://localhost:3001/orders/${orderID}`,
          { paymentMethod, couponCode, status: orderData.status, orderUserID, orderItems },
          axiosConfig
        )
        .then(() => {
          setSnackbarMessage("Order updated successfully.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          fetchOrders();
          setOpenDialog(false);
          navigate(`/orders/${orderID}`);
        })
        .catch((error) => {
          console.error("Failed to update order:", error);
          setSnackbarMessage("Failed to update order.");
          setSnackbarSeverity("error");
        });
    } else if (dialogType === "add") {
      axios
        .post(
          "http://localhost:3001/orders",
          { paymentMethod, couponCode, status: "pending", orderUserID, orderItems }, // Status is always "pending"
          axiosConfig
        )
        .then((response) => {
          setSnackbarMessage("Order created successfully.");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
          fetchOrders();
          setOpenDialog(false);

          // Navigate to the order details page
          const newOrderID = response.data.order.orderID; // Assuming backend returns created order ID
          navigate(`/orders/${newOrderID}`);
        })
        .catch((error) => {
          console.error("Failed to create order:", error);
          setSnackbarMessage("Failed to create order.");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  };

  useEffect(() => {
    setTempCouponCode(orderData.couponCode || "");
  }, [orderData.couponCode]);

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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogType === "edit" ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Payment Method"
            variant="outlined"
            value={orderData.paymentMethod}
            onChange={(e) => setOrderData({ ...orderData, paymentMethod: e.target.value })}
            margin="normal"
          />
          {dialogType === "add" || !orderData.couponCode ? (
            <TextField
              fullWidth
              label="Coupon Code"
              variant="outlined"
              value={tempCouponCode}
              onChange={(e) => setTempCouponCode(e.target.value)}
              margin="normal"
            />
          ) : (
            <Typography variant="body1" color="textSecondary">
              Applied Coupon: {orderData.couponCode}
            </Typography>
          )}
          <TextField
            fullWidth
            select
            label="Select User"
            variant="outlined"
            value={orderData.orderUserID}
            onChange={(e) => setOrderData({ ...orderData, orderUserID: e.target.value })}
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
          <Typography variant="h6" mt={2}>
            Order Items
          </Typography>
          {orderItems.map((item, index) => (
            <Grid container spacing={1} key={index} alignItems="center" mb={1}>
              <Grid item xs={7}>
                <TextField
                  select
                  label="Product Variant"
                  value={item.productVariantID}
                  onChange={(e) => {
                    const newItems = [...orderItems];
                    newItems[index].productVariantID = e.target.value;
                    setOrderItems(newItems);
                  }}
                  SelectProps={{ native: true }}
                  fullWidth
                  variant="outlined"
                >
                  <option value=""></option>
                  {productVariants.map((pv) => (
                    <option key={pv.productVariantID} value={pv.productVariantID}>
                      {pv.Product?.emri || "Unnamed Product"} - {pv.shade || "Variant"}
                    </option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Quantity"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...orderItems];
                    newItems[index].quantity = Number(e.target.value);
                    setOrderItems(newItems);
                  }}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={2}>
                <Button
                  color="error"
                  onClick={() => {
                    const newItems = orderItems.filter((_, i) => i !== index);
                    setOrderItems(
                      newItems.length ? newItems : [{ productVariantID: "", quantity: 1 }]
                    );
                  }}
                >
                  Remove
                </Button>
              </Grid>
            </Grid>
          ))}
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOrderItems([...orderItems, { productVariantID: "", quantity: 1 }])}
          >
            Add Item
          </Button>
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default Orders;
