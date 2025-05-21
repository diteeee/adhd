import React, { useState } from "react";
import PropTypes from "prop-types";
import { Container, Box, Typography, Button, TextField, Divider } from "@mui/material";
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import DefaultFooter from "examples/Footers/DefaultFooter";
import routes from "routes";
import footerRoutes from "footer.routes";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PaymentPage = ({ cartItems = [], totalPrice }) => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const handlePaymentSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/payments",
        {
          metoda: paymentMethod,
          status: paymentStatus,
          data: new Date(),
          paymentOrderID: cartItems.map((item) => item.cartID),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Payment submitted:", response.data);
      navigate("/OrderConfirmation");
    } catch (error) {
      console.error("Error submitting payment:", error);
    }
  };

  return (
    <>
      <DefaultNavbar routes={routes} sticky />
      <Container maxWidth="lg">
        <Box sx={{ paddingTop: "100px", minHeight: "70vh", backgroundColor: "#f9f5f7" }}>
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: "700", color: "#7b1fa2", fontFamily: "'Playfair Display', serif" }}
          >
            Payment Details
          </Typography>

          {/* Payment form */}
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(123,31,162,0.15)",
              p: 3,
              mb: 4,
            }}
          >
            <TextField
              fullWidth
              label="Payment Method"
              variant="outlined"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Payment Status"
              variant="outlined"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handlePaymentSubmit}
              fullWidth
              sx={{ backgroundColor: "#7b1fa2", mt: 2, color: "#ffffff" }}
            >
              Submit Payment
            </Button>
          </Box>

          {/* Order summary */}
          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 3,
              boxShadow: "0 4px 12px rgba(123,31,162,0.15)",
              p: 3,
              mb: 4,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1fa2", mb: 2 }}>
              Order Summary
            </Typography>
            <Divider sx={{ mb: 2 }} />
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
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: "700", color: "#7b1fa2" }}>
              Total: ${totalPrice}
            </Typography>
          </Box>
        </Box>
      </Container>
      <Box pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </Box>
    </>
  );
};

// ✅ PropTypes validation
PaymentPage.propTypes = {
  cartItems: PropTypes.arrayOf(
    PropTypes.shape({
      cartID: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      sasia: PropTypes.number.isRequired,
      Product: PropTypes.shape({
        emri: PropTypes.string.isRequired,
        cmimi: PropTypes.number.isRequired,
      }).isRequired,
    })
  ).isRequired,
  totalPrice: PropTypes.string.isRequired,
};

export default PaymentPage;
