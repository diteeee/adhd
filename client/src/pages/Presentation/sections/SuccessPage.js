import React from "react";
import { Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SuccessPage = () => {
  const navigate = useNavigate();
  return (
    <Container sx={{ mt: 10, textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>
        🎉 Payment Successful!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Thank you for your purchase. Your order has been received.
      </Typography>
      <Button variant="contained" color="white" onClick={() => navigate("/products")}>
        Browse More Products
      </Button>
    </Container>
  );
};

export default SuccessPage;
