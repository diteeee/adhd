import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { Card, CardMedia, CardContent, Snackbar, Alert, TextField, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom"; // <-- Import this

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import DefaultFooter from "examples/Footers/DefaultFooter";

import footerRoutes from "footer.routes";

import bgImage from "assets/images/bg-presentation.jpg";

function Presentation() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate(); // <-- Initialize navigate

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleProductClick = (productID) => {
    navigate(`/product/${productID}`); // <-- Navigate to product details page
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;

    try {
      const response = await fetch("http://localhost:3001/coupons/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setSnackbarMessage(data.message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error subscribing:", error);
      setSnackbarMessage("Something went wrong. Please try again.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Navigate to Products page with search term query param
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <>
      {/* Hero Section */}
      <MKBox
        minHeight="75vh"
        width="100%"
        sx={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Container>
          <Grid container item xs={12} lg={8} justifyContent="center" mx="auto">
            <MKTypography
              variant="h1"
              color="white"
              mt={-6}
              mb={1}
              textAlign="center"
              sx={({ breakpoints, typography: { size } }) => ({
                fontFamily: "'Playfair Display', serif",
                fontWeight: "bold",
                [breakpoints.down("md")]: {
                  fontSize: size["2xl"],
                },
              })}
            >
              Celestia Beauty
            </MKTypography>
            <MKTypography
              variant="body1"
              color="white"
              textAlign="center"
              px={{ xs: 6, lg: 12 }}
              mt={1}
              sx={{ fontSize: "1.2rem" }}
            >
              Unlock your beauty with our exclusive makeup collection. Indulge in luxury and
              elegance.
            </MKTypography>
            <form onSubmit={handleSearchSubmit} style={{ textAlign: "center", margin: "20px 0" }}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{ maxWidth: 400, margin: "0 auto" }}
              >
                <TextField
                  variant="outlined"
                  size="medium"
                  placeholder="Search for a product, brand, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    sx: {
                      borderRadius: "8px",
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  sx={{
                    borderRadius: "8px",
                    paddingX: 3,
                    height: "40px",
                    textTransform: "none",
                    fontWeight: "bold",
                    boxShadow: "none",
                    "&:hover": {
                      boxShadow: "0 0 8px rgba(25, 118, 210, 0.5)",
                    },
                  }}
                >
                  Search
                </Button>
              </Stack>
            </form>
            <Grid container spacing={2} justifyContent="center" mt={3}>
              <Grid item>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => navigate("/products")} // <-- Add this
                >
                  Explore Collections
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </MKBox>

      {/* Featured Products */}
      <MKBox pt={6}>
        <Container>
          <MKTypography variant="h3" mb={4} textAlign="center">
            Featured Products
          </MKTypography>
          <Grid container spacing={4}>
            {products.map((product) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={product.productID}
                onClick={() => handleProductClick(product.productID)} // <-- Add onClick
                style={{ cursor: "pointer" }} // <-- Optional: Add pointer cursor
              >
                <Card>
                  <CardMedia
                    component="img"
                    image={product.imageURL}
                    alt={product.emri}
                    sx={{
                      height: 300, // Matches the height used in the Products page
                      objectFit: "cover", // Ensures the image fills the card properly
                    }}
                  />
                  <CardContent>
                    <MKTypography variant="h5">{product.emri}</MKTypography>
                    <MKTypography variant="body2" color="text.secondary">
                      {product.pershkrimi}
                    </MKTypography>
                    <MKTypography variant="subtitle1" mt={1}>
                      ${product.cmimi}
                    </MKTypography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </MKBox>

      {/* Newsletter Signup */}
      <MKBox py={6}>
        <Container>
          <MKTypography variant="h4" mb={3} textAlign="center">
            Join Our Newsletter
          </MKTypography>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={8} md={6}>
              <form onSubmit={handleSubscribe}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                      }}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} textAlign="center">
                    <Button variant="contained" color="primary" type="submit">
                      Subscribe
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Container>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          sx={{
            transform: "scale(1)",
            animation: "popup 0.5s ease-in-out",
          }}
          PaperProps={{
            sx: {
              backgroundColor: "transparent", // make Snackbar background transparent
              boxShadow: "none", // remove shadow if needed
            },
          }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={snackbarSeverity}
            sx={{
              backgroundColor: "#fbfbf0", // beige
              color: "#5a4d00",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // optional subtle shadow
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </MKBox>

      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default Presentation;
