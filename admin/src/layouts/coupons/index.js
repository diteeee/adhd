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

function Coupons() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [payments, setPayments] = useState([]);
  const [dialogType, setDialogType] = useState("");
  const [couponData, setCouponData] = useState({
    couponID: "",
    kodi: "",
    type: "",
    shuma: "",
    couponPaymentID: "",
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    axios
      .get("http://localhost:3001/coupons", axiosConfig)
      .then((response) => {
        const coupons = response.data;
        const cols = [
          { Header: "Coupon ID", accessor: "couponID", align: "left" },
          { Header: "Code", accessor: "kodi", align: "center" },
          { Header: "Discount Type", accessor: "type", align: "center" },
          { Header: "Amount", accessor: "shuma", align: "center" },
          { Header: "Payment", accessor: "payment", align: "center" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = coupons.map((coupon) => ({
          couponID: coupon.couponID,
          kodi: coupon.kodi,
          type: coupon.type,
          shuma: coupon.shuma,
          payment: `${coupon.Payment?.paymentID || "Unknown"}`,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(coupon)}>
                Edit
              </Button>
              <Button color="info" onClick={() => handleDelete(coupon.couponID)}>
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
  }, []);

  useEffect(() => {
    axios
      .get("http://localhost:3001/payments", axiosConfig)
      .then((response) => {
        setPayments(response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch payments:", error);
      });
  }, []);

  const handleDelete = (couponID) => {
    axios
      .delete(`http://localhost:3001/coupons/${couponID}`, axiosConfig)
      .then(() => {
        alert("Coupon deleted successfully.");
        fetchCoupons();
      })
      .catch((error) => {
        console.error("Failed to delete coupon:", error);
      });
  };

  const handleEdit = (coupon) => {
    setCouponData({
      couponID: coupon.couponID,
      kodi: coupon.kodi,
      type: coupon.type,
      shuma: coupon.shuma,
      couponPaymentID: coupon.couponPaymentID,
    });
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setCouponData({ couponID: "", kodi: "", type: "", shuma: "", couponPaymentID: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleSave = () => {
    const { couponID, kodi, type, shuma, couponPaymentID } = couponData;

    if (dialogType === "edit") {
      axios
        .put(
          `http://localhost:3001/coupons/${couponID}`,
          { kodi, type, shuma, couponPaymentID },
          axiosConfig
        )
        .then(() => {
          alert("Coupon updated successfully.");
          fetchCoupons();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to update coupon:", error);
        });
    } else if (dialogType === "add") {
      axios
        .post("http://localhost:3001/coupons", { kodi, type, shuma, couponPaymentID }, axiosConfig)
        .then(() => {
          alert("Coupon created successfully.");
          fetchCoupons();
          setOpenDialog(false);
        })
        .catch((error) => {
          console.error("Failed to create coupon:", error);
        });
    }
  };

  const fetchCoupons = () => {
    axios
      .get("http://localhost:3001/coupons", axiosConfig)
      .then((response) => {
        const coupons = response.data;
        const formattedRows = coupons.map((coupon) => ({
          couponID: coupon.couponID,
          kodi: coupon.kodi,
          type: coupon.type,
          shuma: coupon.shuma,
          createdAt: new Date(coupon.createdAt).toLocaleDateString(),
          payment: `${coupon.Payment?.paymentID || "Unknown"}`,
          actions: (
            <div>
              <Button color="info" onClick={() => handleEdit(coupon)}>
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
                bcouponRadius="lg"
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
                  noEndBcoupon
                />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

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
            value={couponData.shuma}
            onChange={(e) => setCouponData({ ...couponData, shuma: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Select Payment"
            variant="outlined"
            value={couponData.couponPaymentID}
            onChange={(e) => setCouponData({ ...couponData, couponPaymentID: e.target.value })}
            margin="normal"
            SelectProps={{
              native: true,
            }}
          >
            <option value=""></option>
            {payments.map((payment) => (
              <option key={payment.paymentID} value={payment.paymentID}>
                {payment.paymentID}
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

export default Coupons;
