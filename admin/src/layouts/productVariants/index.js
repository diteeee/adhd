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

function ProductVariants() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [productVariantData, setProductVariantData] = useState({
    shade: "",
    numri: "",
    inStock: "",
    productVariantProductID: "",
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    if (!token) {
      alert("Unauthorized access. Please log in.");
      return;
    }
    fetchProducts();
    setColumns([
      { Header: "Product Variant ID", accessor: "productVariantID" },
      { Header: "Shade", accessor: "shade" },
      { Header: "Number", accessor: "numri" },
      { Header: "In Stock", accessor: "inStock" },
      { Header: "Product", accessor: "productName" },
      { Header: "Actions", accessor: "actions" },
    ]);
  }, [token]);

  useEffect(() => {
    if (selectedProduct) fetchProductVariants();
  }, [selectedProduct]);

  const fetchProducts = () => {
    axios
      .get("http://localhost:3001/products", axiosConfig)
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        handleAuthError(err);
      });
  };

  const fetchProductVariants = () => {
    axios
      .get("http://localhost:3001/productVariants", axiosConfig)
      .then((res) => {
        const filtered = res.data.filter(
          (productVariant) => productVariant.productVariantProductID == selectedProduct
        );

        const formatted = filtered.map((p) => ({
          productVariantID: p.productVariantID,
          shade: p.shade,
          numri: p.numri,
          inStock: p.inStock,
          productName: p.Product?.emri || "",
          actions: (
            <div style={{ display: "flex", gap: 10 }}>
              <Button color="primary" onClick={() => handleEdit(p)} size="small">
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(p.productVariantID)} size="small">
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formatted);
      })
      .catch((err) => {
        handleAuthError(err);
      });
  };

  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      alert("Unauthorized. Please log in again.");
    } else {
      console.error("An error occurred:", error);
    }
  };

  const handleDelete = (productVariantID) => {
    axios
      .delete(`http://localhost:3001/productVariants/${productVariantID}`, axiosConfig)
      .then(() => {
        alert("Product Variant deleted.");
        fetchProductVariants();
      })
      .catch((err) => {
        handleAuthError(err);
      });
  };

  const handleEdit = (productVariant) => {
    setProductVariantData({
      ...productVariant,
      productVariantProductID: productVariant.productVariantProductID,
    });
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setProductVariantData({
      shade: "",
      numri: "",
      inStock: "",
      productVariantProductID: selectedProduct,
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    const isEdit = productVariantData.productVariantID;

    const request = isEdit
      ? axios.put(
          `http://localhost:3001/productVariants/${productVariantData.productVariantID}`,
          productVariantData,
          axiosConfig
        )
      : axios.post("http://localhost:3001/productVariants", productVariantData, axiosConfig);

    request
      .then(() => {
        alert(`Product Variant ${isEdit ? "updated" : "added"} successfully.`);
        setOpenDialog(false);
        fetchProductVariants();
      })
      .catch((err) => {
        handleAuthError(err);
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
                  Product Variants
                </MDTypography>

                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  style={{ marginTop: 20 }}
                  SelectProps={{ native: true }}
                >
                  <option value="">Select Product</option>
                  {products.map((prod) => (
                    <option key={prod.productID} value={prod.productID}>
                      {prod.emri}
                    </option>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                  disabled={!selectedProduct}
                >
                  Add Product Variant
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>
          {productVariantData.productVariantID ? "Edit Product Variant" : "Add Product Variant"}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Shade"
            value={productVariantData.shade}
            onChange={(e) =>
              setProductVariantData({ ...productVariantData, shade: e.target.value })
            }
            margin="dense"
          />
          <TextField
            fullWidth
            label="Number"
            value={productVariantData.numri}
            onChange={(e) =>
              setProductVariantData({ ...productVariantData, numri: e.target.value })
            }
            margin="dense"
          />
          <TextField
            fullWidth
            label="In Stock"
            value={productVariantData.inStock}
            onChange={(e) =>
              setProductVariantData({ ...productVariantData, inStock: e.target.value })
            }
            margin="dense"
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

export default ProductVariants;
