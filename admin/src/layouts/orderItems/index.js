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

function OrderItems() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "edit" or "add"
  const [orderItemData, setOrderItemData] = useState({
    orderItemID: "",
    sasia: "",
    cmimi: "",
    orderItemOrderID: "",
    orderItemProductID: "",
  });

  useEffect(() => {
    axios
      .get("http://localhost:3001/orderitems")
      .then((response) => {
        const orderItems = response.data;
        const cols = [
          { Header: "Order Item ID", accessor: "orderItemID", align: "left" },
          { Header: "Quantity", accessor: "sasia", align: "center" },
          { Header: "Price", accessor: "cmimi", align: "center" },
          { Header: "Order ID", accessor: "orderItemOrderID", align: "center" },
          { Header: "Product ID", accessor: "orderItemProductID", align: "center" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = orderItems.map((orderItem) => ({
          orderItemID: orderItem.orderItemID,
          sasia: orderItem.sasia,
          cmimi: orderItem.cmimi,
          orderItemOrderID: orderItem.orderItemOrderID,
          orderItemProductID: orderItem.orderItemProductID,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(orderItem)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(orderItem.orderItemID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((error) => {
        console.error("Failed to fetch order items:", error);
      });
  }, []);

  // Handle Delete
  const handleDelete = (orderItemID) => {
    axios
      .delete(`http://localhost:3001/orderitems/${orderItemID}`)
      .then(() => {
        alert("Order item deleted successfully.");
        // Re-fetch the order items after deletion
        fetchOrderItems();
      })
      .catch((error) => {
        console.error("Failed to delete order item:", error);
      });
  };

  // Handle Edit
  const handleEdit = (orderItem) => {
    setOrderItemData({
      orderItemID: orderItem.orderItemID,
      sasia: orderItem.sasia,
      cmimi: orderItem.cmimi,
      orderItemOrderID: orderItem.orderItemOrderID,
      orderItemProductID: orderItem.orderItemProductID,
    });
    setDialogType("edit");
    setOpenDialog(true);
  };

  // Handle Add
  const handleAdd = () => {
    setOrderItemData({
      orderItemID: "",
      sasia: "",
      cmimi: "",
      orderItemOrderID: "",
      orderItemProductID: "",
    });
    setDialogType("add");
    setOpenDialog(true);
  };

  // Handle Dialog Save
  const handleSave = () => {
    const { orderItemID, sasia, cmimi, orderItemOrderID, orderItemProductID } = orderItemData;

    if (dialogType === "edit") {
      axios
        .put(`http://localhost:3001/orderitems/${orderItemID}`, {
          sasia,
          cmimi,
          orderItemOrderID,
          orderItemProductID,
        })
        .then(() => {
          alert("Order item updated successfully.");
          fetchOrderItems();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to update order item:", error);
        });
    } else if (dialogType === "add") {
      axios
        .post("http://localhost:3001/orderitems", {
          sasia,
          cmimi,
          orderItemOrderID,
          orderItemProductID,
        })
        .then(() => {
          alert("Order item created successfully.");
          fetchOrderItems();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to create order item:", error);
        });
    }
  };

  // Fetch Order Items
  const fetchOrderItems = () => {
    axios
      .get("http://localhost:3001/orderitems")
      .then((response) => {
        const orderItems = response.data;
        const formattedRows = orderItems.map((orderItem) => ({
          orderItemID: orderItem.orderItemID,
          sasia: orderItem.sasia,
          cmimi: orderItem.cmimi,
          orderItemOrderID: orderItem.orderItemOrderID,
          orderItemProductID: orderItem.orderItemProductID,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(orderItem)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(orderItem.orderItemID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((error) => {
        console.error("Failed to fetch order items:", error);
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
                  Order Items
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Order Item
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

      {/* Edit / Add Order Item Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogType === "edit" ? "Edit Order Item" : "Add Order Item"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Quantity"
            variant="outlined"
            value={orderItemData.sasia}
            onChange={(e) => setOrderItemData({ ...orderItemData, sasia: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Price"
            variant="outlined"
            value={orderItemData.cmimi}
            onChange={(e) => setOrderItemData({ ...orderItemData, cmimi: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Order ID"
            variant="outlined"
            value={orderItemData.orderItemOrderID}
            onChange={(e) =>
              setOrderItemData({ ...orderItemData, orderItemOrderID: e.target.value })
            }
            margin="normal"
          />
          <TextField
            fullWidth
            label="Product ID"
            variant="outlined"
            value={orderItemData.orderItemProductID}
            onChange={(e) =>
              setOrderItemData({ ...orderItemData, orderItemProductID: e.target.value })
            }
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
    </DashboardLayout>
  );
}

export default OrderItems;
