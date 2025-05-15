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

  useEffect(() => {
    fetchReturns();
    fetchOrders();

    setColumns([
      { Header: "Return ID", accessor: "returnID", align: "left" },
      { Header: "Reason", accessor: "arsyeja", align: "center" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Order", accessor: "order", align: "center" },
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
          order: `#${ret.Order?.orderID || "Unknown"}`,
          actions: (
            <div>
              <Button color="info" onClick={() => handleEdit(ret)}>
                Edit
              </Button>
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

  const handleAdd = () => {
    setReturnData({ returnID: "", arsyeja: "", status: "", returnOrderID: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleEdit = (ret) => {
    setReturnData({
      returnID: ret.returnID,
      arsyeja: ret.arsyeja,
      status: ret.status,
      returnOrderID: ret.returnOrderID || ret.Order?.orderID || "",
    });
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleDelete = (returnID) => {
    axios
      .delete(`http://localhost:3001/returns/${returnID}`, axiosConfig)
      .then(() => {
        alert("Return deleted successfully.");
        fetchReturns();
      })
      .catch((err) => console.error("Failed to delete return:", err));
  };

  const handleSave = () => {
    const { returnID, arsyeja, status, returnOrderID } = returnData;

    if (dialogType === "edit") {
      axios
        .put(
          `http://localhost:3001/returns/${returnID}`,
          { arsyeja, status, returnOrderID },
          axiosConfig
        )
        .then(() => {
          alert("Return updated.");
          fetchReturns();
          setOpenDialog(false);
        })
        .catch((err) => console.error("Failed to update return:", err));
    } else {
      axios
        .post("http://localhost:3001/returns", { arsyeja, status, returnOrderID }, axiosConfig)
        .then(() => {
          alert("Return added.");
          fetchReturns();
          setOpenDialog(false);
        })
        .catch((err) => console.error("Failed to add return:", err));
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
                  Returns
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Return
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
        <DialogTitle>{dialogType === "edit" ? "Edit Return" : "Add Return"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Reason"
            variant="outlined"
            value={returnData.arsyeja}
            onChange={(e) => setReturnData({ ...returnData, arsyeja: e.target.value })}
            margin="normal"
          ></TextField>

          <TextField
            fullWidth
            label="Status"
            variant="outlined"
            value={returnData.status}
            onChange={(e) => setReturnData({ ...returnData, status: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Select Order"
            variant="outlined"
            value={returnData.returnOrderID}
            onChange={(e) => setReturnData({ ...returnData, returnOrderID: e.target.value })}
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

export default Returns;
