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
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

function Brands() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [brandData, setBrandData] = useState({
    brandID: "",
    name: "",
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = () => {
    axios
      .get("http://localhost:3001/brands", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const brands = res.data;
        const cols = [
          { Header: "Brand Name", accessor: "name", align: "left" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = brands.map((brand) => ({
          name: brand.name,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(brand)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(brand.brandID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => console.error("Failed to fetch brands:", err));
  };

  const handleEdit = (brand) => {
    setBrandData(brand);
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setBrandData({ brandID: "", name: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleDelete = (brandID) => {
    axios
      .delete(`http://localhost:3001/brands/${brandID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setSnackbar({
          open: true,
          message: "Brand deleted successfully.",
          severity: "success",
        });
        fetchBrands();
      })
      .catch((err) => console.error("Failed to delete brand:", err));
  };

  const handleSave = () => {
    const { brandID, ...payload } = brandData;
    const method = dialogType === "edit" ? "put" : "post";
    const url =
      dialogType === "edit"
        ? `http://localhost:3001/brands/${brandID}`
        : "http://localhost:3001/brands";

    axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setSnackbar({
          open: true,
          message: dialogType === "edit" ? "Brand updated." : "Brand added.",
          severity: "success",
        });
        setOpenDialog(false);
        fetchBrands();
      })
      .catch((err) => console.error("Save failed:", err));
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
                  Brands
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Brand
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
        <DialogTitle>{dialogType === "edit" ? "Edit Brand" : "Add Brand"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Brand Name"
            value={brandData.name}
            onChange={(e) => setBrandData({ ...brandData, name: e.target.value })}
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
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}

export default Brands;
