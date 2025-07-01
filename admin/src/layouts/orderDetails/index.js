import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Divider,
  Button,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Import your dashboard layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import MDBox from "components/MDBox"; // Material Dashboard Box for padding/margin
import MDButton from "components/MDButton";
import { jsPDF } from "jspdf";

const OrderDetails = () => {
  const { orderID } = useParams();
  const [order, setOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newPaymentStatus, setNewPaymentStatus] = useState(order?.Payments[0]?.status || "");
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const handleSnackbarClose = () => setSnackbarOpen(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      console.log("Token saved to localStorage:", token);

      try {
        const decodedToken = jwtDecode(token);
        console.log("Decoded Token:", decodedToken);

        const userRoleFromToken = decodedToken.role || "guest";
        console.log("User Role from Token:", userRoleFromToken);

        localStorage.setItem("role", userRoleFromToken);

        if (userRoleFromToken !== "admin") {
          console.warn("Unauthorized access. Redirecting to presentation page.");
          window.location.href = "http://localhost:3000/presentation";
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    } else {
      localStorage.removeItem("token");
      console.warn("Unauthorized access. Redirecting to presentation page.");
      window.location.href = "http://localhost:3000/presentation";
    }
  }, [token]);

  useEffect(() => {
    axios
      .get(`http://localhost:3001/orders/${orderID}`)
      .then((response) => setOrder(response.data))
      .catch((error) => console.error("Failed to fetch order details:", error));
  }, [orderID]);

  const handleProceedToPayment = async () => {
    if (!order || !order.Payments || order.Payments.length === 0) {
      setSnackbarMessage("Payment ID is missing or order is not loaded.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    const paymentMethod = order.paymentMethod?.toLowerCase();
    if (paymentMethod === "cash") {
      setSnackbarMessage("Cash payment does not require Stripe payment.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    const paymentID = order.Payments[0].paymentID;
    try {
      const response = await axios.post("http://localhost:3001/orders/create-checkout-session", {
        orderID,
        paymentID,
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      setSnackbarMessage("Failed to proceed with payment.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const generatePdfReceipt = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 10;

    doc.setFont("courier");
    doc.setFontSize(14);
    doc.text("Celestia", pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
    doc.setFontSize(10);
    doc.text("123 Beauty Ave, Glam City", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 5;
    doc.text("Phone: (555) 123-4567", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    if (order.User) {
      doc.setFontSize(11);
      doc.text(`Customer: ${order.User.emri} ${order.User.mbiemri}`, 10, yPos);
      yPos += 6;
      doc.text(`Email: ${order.User.email}`, 10, yPos);
      yPos += 6;
      doc.text(`Phone: ${order.User.nrTel}`, 10, yPos);
      yPos += 10;
    }

    doc.setFontSize(12);
    doc.text("RECEIPT", 10, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Order: ${orderID}`, 10, yPos);
    yPos += 7;

    const now = new Date();
    doc.text(`Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 10, yPos);
    yPos += 10;

    const lineWidth = pageWidth - 20;
    for (let i = 0; i < lineWidth; i += 4) {
      doc.text("-", 10 + i, yPos);
    }
    yPos += 7;

    doc.text("QTY", 10, yPos);
    doc.text("ITEM", 30, yPos);
    doc.text("PRICE", pageWidth - 40, yPos, { align: "right" });
    yPos += 6;

    for (let i = 0; i < lineWidth; i += 4) {
      doc.text("-", 10 + i, yPos);
    }
    yPos += 6;

    order.OrderItems.forEach((item) => {
      const qty = item.sasia.toString();
      const name = item.ProductVariant?.Product?.emri || "Product";
      const price = Number(item.cmimi).toFixed(2);

      doc.text(qty, 10, yPos);
      doc.text(name, 30, yPos);
      doc.text(`$${price}`, pageWidth - 10, yPos, { align: "right" });
      yPos += 6;
    });

    yPos += 5;

    if (order.discount && order.discount > 0) {
      doc.text(`Discount: -$${Number(order.discount).toFixed(2)}`, pageWidth - 10, yPos, {
        align: "right",
      });
      yPos += 10;
    }

    for (let i = 0; i < lineWidth; i += 4) {
      doc.text("-", 10 + i, yPos);
    }
    yPos += 7;

    doc.setFontSize(12);
    doc.text(`TOTAL: $${Number(order.totalPrice).toFixed(2)}`, pageWidth - 10, yPos, {
      align: "right",
    });
    yPos += 15;

    doc.setFontSize(10);
    doc.text("Thank you for shopping with us!", pageWidth / 2, yPos, { align: "center" });

    doc.save(`OrderReceipt.pdf`);
  };

  const handleUpdatePaymentStatus = async () => {
    if (!order || !order.Payments || order.Payments.length === 0) return;

    setLoadingUpdate(true);
    try {
      const paymentID = order.Payments[0].paymentID;
      const token = localStorage.getItem("token"); // or wherever you store it

      const response = await axios.put(
        `http://localhost:3001/payments/${paymentID}/status`,
        { status: newPaymentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrder((prevOrder) => ({
        ...prevOrder,
        Payments: [response.data.payment],
        status: newPaymentStatus === "completed" ? "paid" : prevOrder.status,
      }));
      setEditingStatus(false);
    } catch (error) {
      setSnackbarMessage("Failed to update payment status.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      console.error(error);
    } finally {
      setLoadingUpdate(false);
    }
  };

  if (!order) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <Typography>Loading order details...</Typography>
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6} justifyContent="center">
          {/* Order details card */}
          <Grid item xs={12} md={7} lg={7}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
              >
                <Typography variant="h5" style={{ color: "white" }}>
                  Order Details for #{orderID}
                </Typography>
              </MDBox>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">User:</Typography>
                    <Typography>{`${order.User?.emri || "Unknown"} ${
                      order.User?.mbiemri || ""
                    }`}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Payment Method:</Typography>
                    <Typography>{order.paymentMethod || "N/A"}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Status:</Typography>
                    <Typography>{order.status}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1">Payment Status:</Typography>
                    {order.Payments[0]?.status === "completed" ? (
                      <Typography color="green" fontWeight="bold">
                        {order.Payments[0]?.status || "N/A"}
                      </Typography>
                    ) : editingStatus ? (
                      <>
                        <select
                          value={newPaymentStatus}
                          onChange={(e) => setNewPaymentStatus(e.target.value)}
                          disabled={loadingUpdate}
                          style={{ padding: "4px", fontSize: "14px" }}
                        >
                          <option value="pending">pending</option>
                          <option value="completed">completed</option>
                        </select>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={handleUpdatePaymentStatus}
                          disabled={loadingUpdate}
                          style={{ marginLeft: 8 }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => {
                            setEditingStatus(false);
                            setNewPaymentStatus(order.Payments[0]?.status);
                          }}
                          style={{ marginLeft: 4 }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Typography component="span">
                          {order.Payments[0]?.status || "N/A"}
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => setEditingStatus(true)}
                          style={{ marginLeft: 8 }}
                          disabled={order.Payments[0]?.status === "completed"} // Disable edit button if completed
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Order Items:</Typography>
                {order.OrderItems.map((item, index) => {
                  const product = item.ProductVariant?.Product;

                  return (
                    <Grid
                      container
                      spacing={2}
                      key={index}
                      alignItems="center"
                      style={{ marginBottom: "10px" }}
                    >
                      <Grid item xs={12} sm={2}>
                        {product?.imageURL ? (
                          <CardMedia
                            component="img"
                            image={product.imageURL}
                            alt={product.emri}
                            sx={{
                              width: 80,
                              height: 80,
                              objectFit: "contain",
                              borderRadius: 1,
                            }}
                          />
                        ) : (
                          <Typography>No image</Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="subtitle1">
                          {product?.emri || "Unknown Product"} -{" "}
                          {item.ProductVariant?.shade || "Unknown Variant"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {product?.pershkrimi}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography>Quantity: {item.sasia}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <Typography>
                          Unit Price: ${Number(product?.cmimi || 0).toFixed(2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Typography fontWeight="bold">
                          Total: ${Number(item.cmimi || 0).toFixed(2)}
                        </Typography>
                      </Grid>
                    </Grid>
                  );
                })}
                <MDButton
                  variant="outlined"
                  color="info"
                  onClick={() => navigate("/orders")}
                  style={{ marginBottom: "10px" }}
                >
                  Back to Orders
                </MDButton>
                {order.paymentMethod?.toLowerCase() !== "cash" &&
                  order.Payments[0]?.status !== "completed" && (
                    <Button
                      variant="contained"
                      color="success"
                      style={{ marginTop: "20px", marginLeft: "10px" }}
                      onClick={handleProceedToPayment}
                    >
                      Proceed to Payment
                    </Button>
                  )}
              </CardContent>
            </Card>
          </Grid>

          {/* Receipt summary outside the card */}
          {order.Payments[0]?.status === "completed" && (
            <Grid
              item
              xs={12}
              md={4}
              lg={3}
              sx={{
                paddingLeft: { md: 3, xs: 0 },
                marginTop: { xs: 4, md: 0 },
                height: "fit-content",
                maxWidth: 320, // slightly wider
              }}
            >
              <Box
                sx={{
                  fontFamily: "'Courier New', Courier, monospace",
                  backgroundColor: "#fff",
                  padding: 2,
                  boxShadow: "0 0 8px rgba(0,0,0,0.15)",
                  borderRadius: 1.5,
                  fontSize: 13, // bigger font size for better readability
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                  letterSpacing: 0.5,
                  userSelect: "none",
                  margin: "0 auto",
                }}
              >
                <Box sx={{ textAlign: "center", mb: 1.5, fontWeight: "bold", fontSize: 16 }}>
                  Celestia
                  <br />
                  123 Beauty Ave, Glam City
                  <br />
                  Phone: (555) 123-4567
                  <br />
                  {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
                </Box>

                <Box
                  sx={{
                    borderBottom: "1px dashed #888",
                    my: 1,
                    mx: "auto",
                    width: "80%",
                  }}
                />

                <Box sx={{ mb: 1.5 }}>
                  Customer: {order.User?.emri} {order.User?.mbiemri}
                  <br />
                  Email: {order.User?.email}
                  <br />
                  Phone: {order.User?.nrTel}
                </Box>

                <Box
                  sx={{
                    borderBottom: "1px dashed #888",
                    my: 1,
                    mx: "auto",
                    width: "80%",
                  }}
                />

                <Box sx={{ mb: 1.5, fontWeight: "bold", textAlign: "center" }}>
                  Order ID: {orderID}
                </Box>

                <Box
                  sx={{
                    borderBottom: "1px dashed #888",
                    my: 1,
                    mx: "auto",
                    width: "80%",
                  }}
                />

                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ fontWeight: "bold", mb: 1.0 }}>Items:</Box>
                  {order.OrderItems.map((item) => {
                    const qty = item.sasia;
                    const name = item.ProductVariant?.Product?.emri || "Product";
                    const price = Number(item.cmimi).toFixed(2);
                    return (
                      <Box
                        key={item.orderItemID}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 0.5,
                        }}
                      >
                        <span>
                          {qty} × {name}
                        </span>
                        <span>${price}</span>
                      </Box>
                    );
                  })}
                </Box>

                {order.discount > 0 && (
                  <>
                    <Box
                      sx={{
                        borderBottom: "1px dashed #888",
                        my: 1,
                        mx: "auto",
                        width: "80%",
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "red",
                        fontWeight: "bold",
                        mb: 1.5,
                        fontSize: 14,
                      }}
                    >
                      <span>Discount:</span>
                      <span>-${Number(order.discount).toFixed(2)}</span>
                    </Box>
                  </>
                )}

                <Box
                  sx={{
                    borderBottom: "2px solid #000",
                    my: 1,
                    mx: "auto",
                    width: "80%",
                  }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontWeight: "bold",
                    fontSize: 15,
                    mb: 1.5,
                  }}
                >
                  <span>Total:</span>
                  <span>${Number(order.totalPrice).toFixed(2)}</span>
                </Box>

                <Box sx={{ textAlign: "center", fontStyle: "italic", fontSize: 12 }}>
                  Thank you for shopping with us!
                </Box>
              </Box>

              <Button
                variant="contained"
                color="primary"
                sx={{ mt: 3, width: "100%" }}
                onClick={generatePdfReceipt}
              >
                Print Receipt
              </Button>
            </Grid>
          )}
        </Grid>
      </MDBox>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default OrderDetails;
