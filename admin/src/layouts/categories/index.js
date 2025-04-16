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
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get("http://localhost:3001/categorys")
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
    axios
      .delete(`http://localhost:3001/categorys/${categoryID}`)
      .then(() => {
        alert("Category deleted.");
        fetchCategories();
      })
      .catch((err) => console.error("Failed to delete category:", err));
  };

  const handleSave = () => {
    const { categoryID, ...payload } = categoryData;
    const method = dialogType === "edit" ? "put" : "post";
    const url =
      dialogType === "edit"
        ? `http://localhost:3001/categorys/${categoryID}`
        : "http://localhost:3001/categorys";

    axios[method](url, payload)
      .then(() => {
        alert(dialogType === "edit" ? "Category updated." : "Category added.");
        setOpenDialog(false);
        fetchCategories();
      })
      .catch((err) => console.error("Save failed:", err));
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
      <Footer />

      {/* Dialog for Add/Edit */}
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
    </DashboardLayout>
  );
}

export default Categories;
