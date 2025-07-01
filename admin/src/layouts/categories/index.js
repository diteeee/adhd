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

function Categories() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [categoryData, setCategoryData] = useState({
    categoryID: "",
    emri: "",
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const token = localStorage.getItem("token");

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
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/categorys", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const cats = res.data;
        const cols = [
          { Header: "Category Name", accessor: "emri", align: "left" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = cats.map((cat) => ({
          emri: cat.emri,
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(cat)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(cat.categoryID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  };

  const handleEdit = (category) => {
    setCategoryData(category);
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setCategoryData({ categoryID: "", emri: "" });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleDelete = (categoryID) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:3001/categorys/${categoryID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setSnackbar({
          open: true,
          message: "Category deleted.",
          severity: "success",
        });
        fetchCategories();
      })
      .catch((err) => console.error("Failed to delete category:", err));
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");
    const { categoryID, ...payload } = categoryData;
    const method = dialogType === "edit" ? "put" : "post";
    const url =
      dialogType === "edit"
        ? `http://localhost:3001/categorys/${categoryID}`
        : "http://localhost:3001/categorys";

    axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setSnackbar({
          open: true,
          message: dialogType === "edit" ? "Category updated." : "Category added.",
          severity: "success",
        });
        setOpenDialog(false);
        fetchCategories();
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
                  Categories
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Category
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
        <DialogTitle>{dialogType === "edit" ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryData.emri}
            onChange={(e) => setCategoryData({ ...categoryData, emri: e.target.value })}
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

export default Categories;
