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

function Carts() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [cartData, setCartData] = useState({
    cartID: "",
    sasia: "",
    cartUserID: "",
    cartProductID: "",
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchCarts();
    fetchUsers();
    fetchProducts();
  }, []);

  const fetchCarts = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/carts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const carts = res.data;
        const cols = [
          { Header: "Quantity", accessor: "sasia", align: "left" },
          { Header: "User", accessor: "user", align: "left" },
          { Header: "Product", accessor: "product", align: "left" },
          { Header: "Actions", accessor: "actions", align: "center" },
        ];
        setColumns(cols);

        const formattedRows = carts.map((cart) => ({
          sasia: cart.sasia,
          user: `${cart.User?.emri || "Unknown"} ${cart.User?.mbiemri || ""}`,
          product: cart.Product?.emri || "Unknown",
          actions: (
            <div>
              <Button color="primary" onClick={() => handleEdit(cart)}>
                Edit
              </Button>
              <Button color="error" onClick={() => handleDelete(cart.cartID)}>
                Delete
              </Button>
            </div>
          ),
        }));

        setRows(formattedRows);
      })
      .catch((err) => console.error("Failed to fetch carts:", err));
  };

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Failed to fetch users:", err));
  };

  const fetchProducts = () => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:3001/products", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Failed to fetch products:", err));
  };

  const handleEdit = (cart) => {
    setCartData(cart);
    setDialogType("edit");
    setOpenDialog(true);
  };

  const handleAdd = () => {
    setCartData({
      cartID: "",
      sasia: "",
      cartUserID: "",
      cartProductID: "",
    });
    setDialogType("add");
    setOpenDialog(true);
  };

  const handleDelete = (cartID) => {
    const token = localStorage.getItem("token");
    axios
      .delete(`http://localhost:3001/carts/${cartID}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Cart deleted.");
        fetchCarts();
      })
      .catch((err) => console.error("Failed to delete cart:", err));
  };

  const handleSave = () => {
    const token = localStorage.getItem("token");
    const { cartID, ...payload } = cartData;
    const method = dialogType === "edit" ? "put" : "post";
    const url =
      dialogType === "edit"
        ? `http://localhost:3001/carts/${cartID}`
        : "http://localhost:3001/carts";

    axios[method](url, payload, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        alert(dialogType === "edit" ? "Cart updated." : "Cart added.");
        setOpenDialog(false);
        fetchCarts();
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
                  Carts
                </MDTypography>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                >
                  Add Cart
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
        <DialogTitle>{dialogType === "edit" ? "Edit Cart" : "Add Cart"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Quantity"
            value={cartData.sasia}
            onChange={(e) => setCartData({ ...cartData, sasia: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Select User"
            value={cartData.cartUserID}
            onChange={(e) => setCartData({ ...cartData, cartUserID: e.target.value })}
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
          <TextField
            fullWidth
            select
            label="Select Product"
            value={cartData.cartProductID}
            onChange={(e) => setCartData({ ...cartData, cartProductID: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value=""></option>
            {products.map((product) => (
              <option key={product.productID} value={product.productID}>
                {product.emri}
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

export default Carts;
