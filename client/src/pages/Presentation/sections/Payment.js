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
  Alert,
  Divider,
  Box,
  TextField,
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
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const checkoutRes = await axios.post(
        "http://localhost:3001/orders/checkout",
        {
          userID: user.userID,
          paymentMethod,
          couponCode,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { orderID, paymentID } = checkoutRes.data;

      if (paymentMethod === "cash") {
        setSuccessMsg("Order placed successfully! Payment will be collected on delivery.");
        setTimeout(() => {
          navigate(`/success?orderID=${orderID}`);
        }, 1000);
      } else {
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

  const handleApplyCoupon = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await axios.post(
        "http://localhost:3001/coupons/apply-coupon",
        { couponCode },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setDiscount(Number(response.data.discount || 0)); // Ensure discount is a number
      setSuccessMsg(response.data.message);
    } catch (error) {
      console.error("Coupon Error:", error);
      setErrorMsg(error.response?.data?.error || "Failed to apply coupon.");
    }
  };

  const finalPrice = Math.max(totalPrice - discount, 0);

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, boxShadow: 4, borderRadius: 2 }}>
        <Typography variant="h4" fontWeight="bold" textAlign="center" mb={4} mt={10}>
          Secure Checkout
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="h6" fontWeight="medium" mb={2}>
          Order Summary
        </Typography>

        {cartItems?.length > 0 ? (
          <Box sx={{ mb: 3 }}>
            {cartItems.map((item) => (
              <Stack
                key={item.cartID}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="body1">{item.ProductVariant?.Product?.emri}</Typography>
                <Typography variant="body2" color="text.secondary">
                  × {item.sasia}
                </Typography>
              </Stack>
            ))}
          </Box>
        ) : (
          <Typography>No items in cart</Typography>
        )}

        <Typography
          variant="body1"
          fontWeight="medium"
          textAlign="right"
          sx={{ mt: 1, color: "green" }}
        >
          Discount: -${(typeof discount === "number" ? discount : 0).toFixed(2)}
        </Typography>

        <Typography
          variant="h6"
          fontWeight="bold"
          textAlign="right"
          sx={{ borderTop: "1px solid #ddd", pt: 2, mt: 2 }}
        >
          Final Total: ${finalPrice.toFixed(2)}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            label="Coupon Code"
            variant="outlined"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={handleApplyCoupon}
            disabled={!couponCode}
          >
            Apply
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" fontWeight="medium" mb={2}>
          Payment Method
        </Typography>

        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          row
          sx={{
            display: "flex",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <FormControlLabel
            value="credit_card"
            control={<Radio />}
            label={
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body1" fontWeight="medium">
                  Credit Card
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Visa, MasterCard, AmEx
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="cash"
            control={<Radio />}
            label={
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body1" fontWeight="medium">
                  Cash on Delivery
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Pay at your doorstep
                </Typography>
              </Box>
            }
          />
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

        <Stack direction="row" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handlePayment}
            disabled={loading || cartItems?.length === 0}
            sx={{
              borderRadius: 20,
              px: 5,
              py: 1.5,
              fontSize: "1rem",
              textTransform: "capitalize",
            }}
          >
            {loading ? "Processing..." : paymentMethod === "cash" ? "Place Order" : "Pay Now"}
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default PaymentPage;
