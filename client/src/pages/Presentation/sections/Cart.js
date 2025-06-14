import React, { useEffect, useState } from "react";
import { Container, Box, Typography, IconButton, TextField, Button, Stack } from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import MKBox from "components/MKBox";
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import routes from "routes";
import { useUser } from "context/UserContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { user } = useUser();
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty. Please add products before proceeding to checkout.");
      return;
    }
    navigate("/Payment", {
      state: {
        cartItems,
        totalPrice,
      },
    });
  };

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
    if (isNaN(newQuantity) || newQuantity < 1) return;
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

  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.sasia * item.ProductVariant?.Product?.cmimi;
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
          <Box
            sx={{
              display: "flex",
              gap: 4,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box flex={3}>
              {cartItems.length === 0 && (
                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Typography variant="body1" mb={2}>
                    Your cart is empty.
                  </Typography>
                  <Button variant="contained" color="white" onClick={() => navigate("/products")}>
                    Browse Products
                  </Button>
                </Box>
              )}

              {cartItems.map(({ cartID, sasia, ProductVariant }) => {
                const product = ProductVariant?.Product;
                return (
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
                    <Box
                      component="img"
                      src={`http://localhost:3001/${product?.imageURL}`}
                      alt={product?.emri}
                      sx={{ width: 100, height: 80, objectFit: "cover", borderRadius: 1, mr: 2 }}
                    />
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ color: "#6a1b9a", fontWeight: "600" }}>
                        {product?.emri}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontStyle: "italic", color: "#555", mb: 0.5 }}
                        noWrap
                      >
                        {product?.pershkrimi}
                      </Typography>

                      {/* SHADE DISPLAY HERE */}
                      <Typography
                        variant="body2"
                        sx={{ fontStyle: "italic", color: "#8e24aa", mb: 0.5 }}
                      >
                        Shade: {ProductVariant?.shade || "N/A"}
                      </Typography>

                      <Typography variant="subtitle2" sx={{ color: "#7b1fa2" }}>
                        Price: ${Number(product?.cmimi || 0).toFixed(2)}
                      </Typography>
                    </Box>

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

                    <Typography
                      variant="subtitle1"
                      sx={{ width: 100, fontWeight: "700", color: "#7b1fa2", mr: 2 }}
                    >
                      ${(sasia * (product?.cmimi || 0)).toFixed(2)}
                    </Typography>

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
                );
              })}
            </Box>

            {/* Right: Order Summary */}
            <Box
              flex={1}
              sx={{
                backgroundColor: "#fce4ec",
                p: 3,
                borderRadius: 2,
                height: 250, // fixed height (adjust as needed)
                overflowY: "auto", // scroll if content too tall
                position: "sticky", // optional: keeps it visible on scroll
                top: 100, // offset from top for sticky
              }}
            >
              {" "}
              <Typography variant="h6" sx={{ fontWeight: "600", mb: 2 }}>
                Order Summary
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Total Items: {cartItems.length}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                Total Price: ${totalPrice.toFixed(2)}
              </Typography>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleProceedToCheckout}
                disabled={cartItems.length === 0}
                sx={{
                  mt: 2,
                  backgroundColor: cartItems.length === 0 ? "#ccc" : "#7b1fa2",
                  color: cartItems.length === 0 ? "#666" : "#ffffff",
                  "&:hover": {
                    backgroundColor: cartItems.length === 0 ? "#ccc" : "#6a1b9a",
                  },
                }}
              >
                Proceed to Checkout
              </Button>
            </Box>
          </Box>
        </Container>
      </MKBox>
    </>
  );
};

export default CartPage;
