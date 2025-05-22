// PaymentPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Paper,
  Stack,
} from "@mui/material";
import axios from "axios";
import { useUser } from "context/UserContext";

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { cartItems, totalPrice } = state || {};
  const token = localStorage.getItem("token");
  const { user } = useUser();

  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:3001/orders/checkout",
        {
          userID: user.userID,
          paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Simulate redirect to payment gateway or confirmation
      alert("Order placed! Payment ID: " + res.data.paymentID);
      navigate("/order-confirmation", {
        state: { orderID: res.data.orderID, paymentID: res.data.paymentID },
      });
    } catch (err) {
      alert("Payment failed: " + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6">Items in your order:</Typography>
        <ul>
          {cartItems?.map((item) => (
            <li key={item.cartID}>
              {item.ProductVariant?.Product?.emri} × {item.sasia}
            </li>
          ))}
        </ul>

        <Typography variant="h4" gutterBottom>
          Choose Payment Method
        </Typography>

        <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <FormControlLabel value="credit_card" control={<Radio />} label="Credit Card" />
          <FormControlLabel value="paypal" control={<Radio />} label="PayPal" />
          <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
        </RadioGroup>

        <Stack spacing={2} mt={4}>
          <Typography>Total to pay: ${totalPrice?.toFixed(2)}</Typography>
          <Button variant="contained" color="primary" onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Confirm and Pay"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentPage;
