import { useEffect, useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

function Products() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [productData, setProductData] = useState({
    emri: "",
    pershkrimi: "",
    firma: "",
    cmimi: "",
    productCategoryID: "",
    img: null,
  });

  useEffect(() => {
    fetchCategories();

    setColumns([
      { Header: "Product ID", accessor: "productID" },
      { Header: "Image", accessor: "image" }, // 👈 Add this
      { Header: "Name", accessor: "emri" },
      { Header: "Description", accessor: "pershkrimi" },
      { Header: "Brand", accessor: "firma" },
      { Header: "Price", accessor: "cmimi" },
      { Header: "Category", accessor: "categoryName" },
      { Header: "Actions", accessor: "actions" },
    ]);
  }, []);

  useEffect(() => {
    if (selectedCategory) fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = () => {
    axios.get("http://localhost:3001/categorys").then((res) => {
      setCategories(res.data);
    });
  };

  const fetchProducts = () => {
    axios.get("http://localhost:3001/products").then((res) => {
      const filtered = res.data.filter((product) => product.productCategoryID == selectedCategory);

      const formatted = filtered.map((p) => ({
        productID: p.productID,
        image: (
          <img
            src={`http://localhost:3001/${p.imageURL.replace(/\\/g, "/")}`}
            alt={p.emri}
            style={{ width: "70px", height: "auto", borderRadius: "6px", objectFit: "cover" }}
          />
        ),
        emri: p.emri,
        pershkrimi: p.pershkrimi,
        firma: p.firma,
        cmimi: p.cmimi,
        categoryName: p.Category?.emri || "",
        actions: (
          <div style={{ display: "flex", gap: 10 }}>
            <Button color="primary" onClick={() => handleEdit(p)} size="small">
              Edit
            </Button>
            <Button color="error" onClick={() => handleDelete(p.productID)} size="small">
              Delete
            </Button>
          </div>
        ),
      }));

      setRows(formatted);
    });
  };

  const handleDelete = (productID) => {
    axios
      .delete(`http://localhost:3001/products/${productID}`)
      .then(() => {
        alert("Product deleted.");
        fetchProducts();
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  const handleEdit = (product) => {
    setProductData({
      ...product,
      img: null, // Don't preload image
      productCategoryID: product.productCategoryID,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setProductData({
      emri: "",
      pershkrimi: "",
      firma: "",
      cmimi: "",
      productCategoryID: selectedCategory,
      img: null,
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const isEdit = productData.productID;

    const request = isEdit
      ? axios.put(`http://localhost:3001/products/${productData.productID}`, formData)
      : axios.post("http://localhost:3001/products", formData);

    request
      .then(() => {
        alert(`Product ${isEdit ? "updated" : "added"} successfully.`);
        setOpenDialog(false);
        fetchProducts();
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
                  Products
                </MDTypography>

                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ marginTop: 20 }}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryID} value={cat.categoryID}>
                      {cat.emri}
                    </option>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                  disabled={!selectedCategory}
                >
                  Add Product
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

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{productData.productID ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={productData.emri}
            onChange={(e) => setProductData({ ...productData, emri: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Description"
            value={productData.pershkrimi}
            onChange={(e) => setProductData({ ...productData, pershkrimi: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="Brand"
            value={productData.firma}
            onChange={(e) => setProductData({ ...productData, firma: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            type="number"
            label="Price"
            value={productData.cmimi}
            onChange={(e) => setProductData({ ...productData, cmimi: e.target.value })}
            margin="dense"
          />
          <InputLabel sx={{ mt: 2 }}>Product Image</InputLabel>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setProductData({ ...productData, img: e.target.files[0] })}
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

export default Products;
