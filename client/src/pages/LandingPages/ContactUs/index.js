// @mui material components
import Grid from "@mui/material/Grid";

// Material Kit 2 React components
import MKBox from "components/MKBox";
import MKInput from "components/MKInput";
import MKButton from "components/MKButton";
import MKTypography from "components/MKTypography";

// Material Kit 2 React examples
import DefaultFooter from "examples/Footers/DefaultFooter";

// Routes
import footerRoutes from "footer.routes";
import React, { useRef, useState } from "react";
import emailjs from "emailjs-com";
import WishlistDrawer from "pages/Presentation/sections/Wishlist";

function ContactUs() {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [wishlistOpen, setWishlistOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    const serviceID = "service_erwa8rf"; // replace with your EmailJS service ID
    const templateID = "template_oofqnxj"; // replace with your EmailJS template ID
    const publicKey = "2idW1OYVOZZjTPYZw"; // replace with your EmailJS public key (optional but recommended)

    emailjs.sendForm(serviceID, templateID, formRef.current, publicKey).then(
      (result) => {
        setLoading(false);
        setSuccessMessage("Message sent successfully!", result);
        formRef.current.reset();
      },
      (error) => {
        setLoading(false);
        setErrorMessage("Failed to send the message, please try again.");
        console.error(error.text);
      }
    );
  };

  // Close wishlist drawer
  const closeWishlist = () => {
    setWishlistOpen(false);
  };

  console.log(wishlistOpen, closeWishlist);

  return (
    <>
      <WishlistDrawer open={wishlistOpen} onClose={closeWishlist} />

      <Grid
        container
        spacing={3}
        alignItems="flex-start"
        justifyContent="center"
        sx={{ pt: "100px" }}
      >
        {/* Contact Form Card */}
        <Grid item xs={12} md={6} lg={5}>
          <MKBox
            bgColor="white"
            borderRadius="xl"
            shadow="lg"
            p={3}
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <MKBox
              variant="gradient"
              bgColor="info"
              coloredShadow="info"
              borderRadius="lg"
              p={2}
              mb={2}
            >
              <MKTypography variant="h3" color="white">
                Contact us
              </MKTypography>
            </MKBox>
            <MKTypography variant="body2" color="text" mb={3}>
              For further questions, including partnership opportunities, please email
              hello@makeupstore.com or contact using our contact form.
            </MKTypography>

            <MKBox
              component="form"
              ref={formRef}
              onSubmit={handleSubmit}
              method="post"
              autoComplete="off"
              width="100%"
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MKInput
                    name="user_name"
                    variant="standard"
                    label="Full Name"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MKInput
                    name="user_email"
                    type="email"
                    variant="standard"
                    label="Email"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <MKInput
                    name="message"
                    variant="standard"
                    label="What can we help you?"
                    placeholder="Describe your problem in at least 250 characters"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    fullWidth
                    rows={6}
                    required
                  />
                </Grid>
              </Grid>

              {successMessage && (
                <MKTypography color="success" mt={2} mb={1}>
                  {successMessage}
                </MKTypography>
              )}
              {errorMessage && (
                <MKTypography color="error" mt={2} mb={1}>
                  {errorMessage}
                </MKTypography>
              )}

              <Grid container justifyContent="center" mt={5}>
                <MKButton type="submit" variant="gradient" color="info" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </MKButton>
              </Grid>
            </MKBox>
          </MKBox>
        </Grid>

        {/* Info Card remains the same */}
        <Grid item xs={12} md={6} lg={5}>
          <MKBox
            bgColor="white"
            borderRadius="xl"
            shadow="lg"
            p={6}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            height="100%"
          >
            <MKTypography variant="h4" fontWeight="bold" color="dark" mb={3}>
              Visit or Call Us
            </MKTypography>

            <MKTypography variant="body1" color="text" mb={2}>
              <strong>Address:</strong> 123 Makeup Blvd, Beauty City, 45678
            </MKTypography>
            <MKTypography variant="body1" color="text" mb={2}>
              <strong>Phone:</strong> +1 (234) 567-890
            </MKTypography>
            <MKTypography variant="body1" color="text" mb={2}>
              <strong>Email:</strong> contact@makeupstore.com
            </MKTypography>
            <MKTypography variant="body1" color="text">
              Open Monday to Friday. We’re happy to welcome you!
            </MKTypography>
          </MKBox>
        </Grid>
      </Grid>
      <MKBox pt={6} px={1} mt={6}>
        <DefaultFooter content={footerRoutes} />
      </MKBox>
    </>
  );
}

export default ContactUs;
