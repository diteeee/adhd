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
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Orders() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openOrderItemsDialog, setOpenOrderItemsDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [dialogType, setDialogType] = useState("");
  const [orderData, setOrderData] = useState({
    orderID: "",
    totalPrice: "",
    status: "",
    orderUserID: "",
  });
  const [orderItems, setOrderItems] = useState([]);
  const [editableOrderItems, setEditableOrderItems] = useState([]);

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
              <Button color="secondary" onClick={() => handleViewOrderItems(order.orderID)}>
                View Items
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
    setOrderData({ orderID: "", status: "", orderUserID: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleSave = () => {
    const { orderID, status, orderUserID } = orderData;

    if (dialogType === "edit") {
      axios
        .put(`http://localhost:3001/orders/${orderID}`, { status, orderUserID }, axiosConfig)
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
        .post("http://localhost:3001/orders", { status, orderUserID }, axiosConfig)
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

  const handleViewOrderItems = (orderID) => {
    axios
      .get(`http://localhost:3001/orderitems/order/${orderID}`, axiosConfig)
      .then((response) => {
        setOrderItems(response.data);
        setEditableOrderItems(response.data.map((item) => ({ ...item })));
        setOpenOrderItemsDialog(true);
      })
      .catch((error) => {
        console.error("Failed to fetch order items:", error);
      });
  };

  const handleDeleteOrderItem = (orderItemID) => {
    axios
      .delete(`http://localhost:3001/orderitems/${orderItemID}`, axiosConfig)
      .then(() => {
        setEditableOrderItems((prev) => prev.filter((item) => item.orderItemID !== orderItemID));
      })
      .catch((error) => {
        console.error("Failed to delete order item:", error);
      });
  };

  const handleSaveOrderItems = () => {
    const updateRequests = editableOrderItems.map((item) =>
      axios.put(
        `http://localhost:3001/orderitems/${item.orderItemID}`,
        {
          sasia: item.sasia,
          orderItemOrderID: item.orderItemOrderID,
          orderItemProductVariantID: item.orderItemProductVariantID,
        },
        axiosConfig
      )
    );

    Promise.all(updateRequests)
      .then(() => {
        alert("Order items updated successfully.");
        setOpenOrderItemsDialog(false);
        fetchOrders();
      })
      .catch((error) => {
        console.error("Failed to update order items:", error);
        alert("Failed to update order items. See console for details.");
      });
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
          user: `${order.User?.emri || "Unknown"} ${order.User?.mbiemri || ""}`,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(order)}>
                Edit
              </Button>
              <Button color="info" onClick={() => handleDelete(order.orderID)}>
                Delete
              </Button>
              <Button color="secondary" onClick={() => handleViewOrderItems(order.orderID)}>
                View Items
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
            SelectProps={{ native: true }}
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

      <Dialog
        open={openOrderItemsDialog}
        onClose={() => setOpenOrderItemsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Order Items</DialogTitle>
        <DialogContent>
          {editableOrderItems.length === 0 ? (
            <Typography>No items found for this order.</Typography>
          ) : (
            <>
              {editableOrderItems.map((item) => (
                <Accordion key={item.orderItemID} disableGutters>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1">{item.ProductVariant.Product.emri}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TextField
                      type="number"
                      label="Quantity"
                      value={item.sasia}
                      onChange={(e) => {
                        const newQuantity = Number(e.target.value);
                        const updatedItems = editableOrderItems.map((i) =>
                          i.orderItemID === item.orderItemID ? { ...i, sasia: newQuantity } : i
                        );
                        setEditableOrderItems(updatedItems);
                      }}
                      fullWidth
                      margin="dense"
                    />

                    <Typography>
                      Unit Price: ${Number(item.ProductVariant?.Product?.cmimi || 0).toFixed(2)}
                    </Typography>

                    <Typography>
                      Total Price: $
                      {(
                        Number(item.ProductVariant?.Product?.cmimi || 0) * Number(item.sasia)
                      ).toFixed(2)}
                    </Typography>

                    <Button
                      color="error"
                      onClick={() => handleDeleteOrderItem(item.orderItemID)}
                      style={{ marginTop: "0.5rem" }}
                    >
                      Delete Item
                    </Button>
                  </AccordionDetails>
                </Accordion>
              ))}

              <Divider sx={{ marginY: 2 }} />
              <Typography variant="h6" align="right">
                Total Price: $
                {editableOrderItems
                  .reduce(
                    (acc, item) =>
                      acc +
                      Number(item.ProductVariant?.Product?.cmimi || 0) * Number(item.sasia || 0),
                    0
                  )
                  .toFixed(2)}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderItemsDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveOrderItems} color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Orders;
