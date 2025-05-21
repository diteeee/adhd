import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Stack,
  Divider,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import MKBox from "components/MKBox";
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import DefaultFooter from "examples/Footers/DefaultFooter";
import routes from "routes";
import footerRoutes from "footer.routes";
import { useUser } from "context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    navigate("/Payment");
  };
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (user?.userID) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/carts/user/${user.userID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems(res.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleRemoveFromCart = async (cartID) => {
    try {
      await axios.delete(`http://localhost:3001/carts/${cartID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const handleQuantityChange = async (cartID, newQuantity) => {
    newQuantity = parseInt(newQuantity, 10);
    if (isNaN(newQuantity) || newQuantity < 1) return; // Validate input
    try {
      await axios.put(
        `http://localhost:3001/carts/${cartID}`,
        { sasia: newQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error.response || error.message);
    }
  };

  // Calculate total price of cart
  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.sasia * item.Product.cmimi;
  }, 0);

  return (
    <>
      <DefaultNavbar routes={routes} sticky />
      <MKBox sx={{ paddingTop: "100px", minHeight: "70vh", backgroundColor: "#f9f5f7" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: "700", color: "#7b1fa2", fontFamily: "'Playfair Display', serif" }}
          >
            Your Cart
          </Typography>
          {/* Main flex container for list + summary sidebar */}
          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Left: List of products */}
            <Box flex={3}>
              {cartItems.length === 0 && (
                <Typography variant="body1" sx={{ mt: 4 }}>
                  Your cart is empty.
                </Typography>
              )}
              {cartItems.map(({ cartID, sasia, Product }) => (
                <Box
                  key={cartID}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    backgroundColor: "#fff0f6",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    boxShadow: "0 2px 6px rgba(123,31,162,0.1)",
                  }}
                >
                  {/* Image */}
                  <Box
                    component="img"
                    src={`http://localhost:3001/${Product.imageURL}`}
                    alt={Product.emri}
                    sx={{ width: 100, height: 80, objectFit: "cover", borderRadius: 1, mr: 2 }}
                  />
                  {/* Details */}
                  <Box flex={1}>
                    <Typography variant="h6" sx={{ color: "#6a1b9a", fontWeight: "600" }}>
                      {Product.emri}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: "italic", color: "#555", mb: 0.5 }}
                      noWrap
                    >
                      {Product.pershkrimi}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "#7b1fa2" }}>
                      Price: ${Number(Product.cmimi).toFixed(2)}
                    </Typography>
                  </Box>

                  {/* Quantity controls */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 3 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(cartID, Number(sasia) - 1)}
                      sx={{
                        color: "#7b1fa2",
                        border: "1px solid #7b1fa2",
                        borderRadius: 1,
                      }}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      size="small"
                      value={sasia}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setCartItems((items) =>
                            items.map((item) =>
                              item.cartID === cartID ? { ...item, sasia: "" } : item
                            )
                          );
                          return;
                        }
                        const intVal = parseInt(val, 10);
                        if (!isNaN(intVal) && intVal > 0) {
                          handleQuantityChange(cartID, intVal);
                        }
                      }}
                      inputProps={{ min: 1, style: { textAlign: "center", width: 40 } }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(cartID, Number(sasia) + 1)}
                      sx={{
                        color: "#7b1fa2",
                        border: "1px solid #7b1fa2",
                        borderRadius: 1,
                      }}
                    >
                      <Add />
                    </IconButton>
                  </Stack>

                  {/* Subtotal */}
                  <Typography
                    variant="subtitle1"
                    sx={{ width: 100, fontWeight: "700", color: "#7b1fa2", mr: 2 }}
                  >
                    ${(sasia * Product.cmimi).toFixed(2)}
                  </Typography>

                  {/* Remove button */}
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleRemoveFromCart(cartID)}
                    sx={{
                      color: "#ff1744",
                      borderColor: "#ff1744",
                      "&:hover": { backgroundColor: "#ff1744", color: "#fff" },
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>

            {/* Right: Summary sidebar */}
            <Box
              flex={1}
              sx={{
                backgroundColor: "#fff",
                borderRadius: 3,
                boxShadow: "0 4px 12px rgba(123,31,162,0.15)",
                p: 3,
                height: "fit-content",
                position: { md: "sticky" },
                top: { md: 100 },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#7b1fa2",
                  mb: 2,
                  fontFamily: "'Playfair Display', serif",
                  userSelect: "none",
                }}
              >
                Order Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {cartItems.map(({ cartID, sasia, Product }) => (
                  <Box key={cartID} sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body1" noWrap sx={{ flex: 1 }}>
                      {Product.emri} x {sasia}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: "600", color: "#7b1fa2" }}>
                      ${(sasia * Product.cmimi).toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "700", color: "#7b1fa2", userSelect: "none" }}
              >
                Total: ${totalPrice.toFixed(2)}
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                sx={{ mt: 3, backgroundColor: "#7b1fa2", color: "#ffffff" }}
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>
        </Container>
      </MKBox>
      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
};

export default CartPage;
