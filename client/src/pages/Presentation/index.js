import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";

import MKBox from "components/MKBox";
import MKTypography from "components/MKTypography";

import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import DefaultFooter from "examples/Footers/DefaultFooter";

import routes from "routes";
import footerRoutes from "footer.routes";

import bgImage from "assets/images/makeup-bg.jpeg";
import lipstickImg from "assets/images/Lipstick.jpg";
import foundationImg from "assets/images/Foundation.png";

function Presentation() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((response) => response.json())
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  return (
    <>
      <DefaultNavbar routes={routes} />
      {/* Hero Section */}
      <MKBox
        minHeight="75vh"
        width="100%"
        sx={{
          backgroundImage: `linear-gradient(rgba(255, 192, 203, 0.7), rgba(255, 105, 180, 0.7)), url(${bgImage})`,
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
              sx={{ fontFamily: "'Roboto', sans-serif", fontSize: "1.2rem" }}
            >
              Unlock your beauty with our exclusive makeup collection. Indulge in luxury and
              elegance.
            </MKTypography>
            <Grid container spacing={2} justifyContent="center" mt={3}>
              <Grid item>
                <Button variant="contained" color="primary" size="large">
                  Shop Now
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" color="secondary" size="large">
                  Explore Collections
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </MKBox>

      {/* Categories Section */}
      <MKBox pt={6} pb={4}>
        <Container>
          <MKTypography variant="h3" mb={4} textAlign="center">
            Explore by Categories
          </MKTypography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <MKBox
                  component="img"
                  src={lipstickImg}
                  alt="Lipsticks"
                  width="100%"
                  height="200px"
                />
                <MKBox p={2}>
                  <MKTypography variant="h5" textAlign="center">
                    Lipsticks
                  </MKTypography>
                </MKBox>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <MKBox
                  component="img"
                  src={foundationImg}
                  alt="Foundations"
                  width="100%"
                  height="200px"
                />
                <MKBox p={2}>
                  <MKTypography variant="h5" textAlign="center">
                    Foundations
                  </MKTypography>
                </MKBox>
              </Card>
            </Grid>
            {/* Add more categories as needed */}
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
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card>
                  <MKBox
                    component="img"
                    src={`http://localhost:3001/${product.imageURL}`}
                    alt={product.emri}
                    width="100%"
                    height="250px"
                    sx={{ objectFit: "cover" }}
                  />
                  <MKBox p={2}>
                    <MKTypography variant="h5">{product.emri}</MKTypography>
                    <MKTypography variant="body2" color="text.secondary">
                      {product.pershkrimi}
                    </MKTypography>
                    <MKTypography variant="subtitle1" mt={1}>
                      ${product.cmimi}
                    </MKTypography>
                  </MKBox>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </MKBox>

      {/* Newsletter Signup */}
      <MKBox py={6} sx={{ backgroundColor: "#f8f9fa" }}>
        <Container>
          <MKTypography variant="h4" mb={3} textAlign="center">
            Join Our Newsletter
          </MKTypography>
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={8} md={6}>
              <form>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} textAlign="center">
                    <Button variant="contained" color="primary">
                      Subscribe
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>
        </Container>
      </MKBox>

      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default Presentation;
