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

function Wishlists() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [wishlistData, setWishlistData] = useState({
    wishlistUserID: "",
    wishlistProductID: "",
  });

  // Fetch users & products
  useEffect(() => {
    axios.get("http://localhost:3001/users").then((res) => {
      setUsers(res.data);
    });

    axios.get("http://localhost:3001/products").then((res) => {
      setProducts(res.data);
    });

    setColumns([
      { Header: "Wishlist ID", accessor: "wishlistID" },
      { Header: "User Name", accessor: "userEmri" },
      { Header: "Product Name", accessor: "productEmri" },
      { Header: "Actions", accessor: "actions" },
    ]);
  }, []);

  // Fetch wishlist when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchWishlist();
    }
  }, [selectedUser]);

  const fetchWishlist = () => {
    axios
      .get(`http://localhost:3001/wishlists/${selectedUser}`)
      .then((res) => {
        const wishlists = res.data;
        const formatted = wishlists.map((wishlist) => ({
          wishlistID: wishlist.wishlistID,
          userEmri: wishlist.userEmri,
          productEmri: wishlist.productEmri,
          actions: (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                color="error"
                onClick={() => handleDelete(wishlist.wishlistID)}
                size="small"
                style={{ margin: 0 }}
              >
                Delete
              </Button>
            </div>
          ),
        }));
        setRows(formatted);
      })
      .catch((err) => console.error("Failed to fetch wishlist:", err));
  };

  const handleDelete = (wishlistID) => {
    axios
      .delete(`http://localhost:3001/wishlists/${wishlistID}`)
      .then(() => {
        alert("Item removed from wishlist.");
        fetchWishlist();
      })
      .catch((err) => console.error("Delete failed:", err));
  };

  const handleAdd = () => {
    setWishlistData({
      wishlistUserID: selectedUser,
      wishlistProductID: "",
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    const { wishlistProductID } = wishlistData;

    const payload = {
      userID: selectedUser,
      productID: wishlistProductID,
    };

    axios
      .post("http://localhost:3001/wishlists", payload)
      .then(() => {
        alert("Item added to wishlist.");
        fetchWishlist();
        setOpenDialog(false);
      })
      .catch((err) => console.error("Add failed:", err));
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
                  Wishlists
                </MDTypography>

                {/* Select User */}
                <TextField
                  fullWidth
                  select
                  variant="outlined"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  style={{ marginTop: 20 }}
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    "& .MuiSelect-root": {
                      backgroundColor: "white",
                    },
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                    },
                  }}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.userID} value={user.userID}>
                      {user.emri} {user.mbiemri}
                    </option>
                  ))}
                </TextField>

                <Button
                  variant="contained"
                  color="info"
                  onClick={handleAdd}
                  style={{ marginTop: 20 }}
                  disabled={!selectedUser}
                >
                  Add to Wishlist
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add to Wishlist</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Select Product"
            variant="outlined"
            value={wishlistData.wishlistProductID}
            onChange={(e) =>
              setWishlistData({ ...wishlistData, wishlistProductID: e.target.value })
            }
            margin="normal"
            SelectProps={{
              native: true,
            }}
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

export default Wishlists;
