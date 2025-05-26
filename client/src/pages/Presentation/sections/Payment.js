import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Paper,
  Stack,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useUser } from "context/UserContext";

const PaymentPage = () => {
  const { state } = useLocation();
  const { cartItems, totalPrice } = state || {};
  const token = localStorage.getItem("token");
  const { user } = useUser();

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handlePayment = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      // 1. Create Order and Payment in DB
      const checkoutRes = await axios.post(
        "http://localhost:3001/orders/checkout",
        {
          userID: user.userID,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { orderID, paymentID } = checkoutRes.data;

      if (paymentMethod === "cash") {
        // For Cash on Delivery, no Stripe session needed
        setSuccessMsg("Order placed successfully! Payment will be collected on delivery.");
      } else {
        // For card payments, create Stripe session and redirect
        const stripeRes = await axios.post(
          "http://localhost:3001/orders/create-checkout-session",
          {
            orderID,
            paymentID,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        window.location.href = stripeRes.data.url;
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setErrorMsg(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4, boxShadow: 3 }}>
        <Typography variant="h5" mb={2}>
          Review your order
        </Typography>

        {cartItems?.length > 0 ? (
          <ul>
            {cartItems.map((item) => (
              <li key={item.cartID} style={{ marginBottom: 6 }}>
                <strong>{item.ProductVariant?.Product?.emri}</strong> × {item.sasia}
              </li>
            ))}
          </ul>
        ) : (
          <Typography>No items in cart</Typography>
        )}

        <Typography variant="h6" mt={3} gutterBottom>
          Total: <strong>${totalPrice?.toFixed(2)}</strong>
        </Typography>

        <Typography variant="h6" mt={4} gutterBottom>
          Select Payment Method
        </Typography>

        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          row
          sx={{ mb: 3 }}
        >
          <FormControlLabel value="credit_card" control={<Radio />} label="Credit Card" />
          <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
        </RadioGroup>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMsg}
          </Alert>
        )}

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            color="primary"
            onClick={handlePayment}
            disabled={loading || cartItems?.length === 0}
          >
            {loading ? "Processing..." : paymentMethod === "cash" ? "Place Order" : "Pay Now"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentPage;
