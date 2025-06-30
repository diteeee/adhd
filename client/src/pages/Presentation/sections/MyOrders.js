import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { jsPDF } from "jspdf";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    axios
      .get("http://localhost:3001/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load orders.");
        setLoading(false);
      });
  }, [token]);

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get("http://localhost:3001/orders/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load orders.");
        setLoading(false);
      });
  };

  // Reusable function to generate PDF receipt for any order
  const generatePdfReceipt = (order) => {
    const doc = new jsPDF();

    doc.setFont("courier");
    doc.setFontSize(12);

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 10;

    // Store info (centered)
    doc.setFontSize(14);
    doc.text("Celestia", pageWidth / 2, yPos, { align: "center" });
    yPos += 7;
    doc.setFontSize(10);
    doc.text("123 Beauty Ave, Glam City", pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    doc.text("Phone: (555) 123-4567", pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // User info (left aligned)
    if (order.User) {
      doc.setFontSize(11);
      doc.text(`Customer: ${order.User.emri} ${order.User.mbiemri}`, 10, yPos);
      yPos += 6;
      doc.text(`Email: ${order.User.email}`, 10, yPos);
      yPos += 6;
      doc.text(`Phone: ${order.User.nrTel}`, 10, yPos);
      yPos += 10;
    }

    // Receipt title and order info (left aligned)
    doc.setFontSize(12);
    doc.text("RECEIPT", 10, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.text(`Order: ${order.orderID}`, 10, yPos);
    yPos += 7;

    const now = new Date();
    doc.text(`Date: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 10, yPos);
    yPos += 10;

    // Dashed line separator
    const lineWidth = pageWidth - 20;
    for (let i = 0; i < lineWidth; i += 4) {
      doc.text("-", 10 + i, yPos);
    }
    yPos += 7;

    // Table headers
    doc.setFontSize(10);
    doc.text("QTY", 10, yPos);
    doc.text("ITEM", 30, yPos);
    doc.text("PRICE", pageWidth - 40, yPos, { align: "right" });
    yPos += 6;

    // Another dashed line
    for (let i = 0; i < lineWidth; i += 4) {
      doc.text("-", 10 + i, yPos);
    }
    yPos += 6;

    // Items
    if (order.OrderItems && order.OrderItems.length > 0) {
      order.OrderItems.forEach((item) => {
        const qty = item.sasia.toString();
        const name = item.ProductVariant?.Product?.emri || "Product";
        const price = Number(item.cmimi).toFixed(2);

        doc.text(qty, 10, yPos);
        doc.text(name, 30, yPos);
        doc.text(`$${price}`, pageWidth - 10, yPos, { align: "right" });
        yPos += 6;
      });
    }

    yPos += 5;

    if (order.discount && order.discount > 0) {
      doc.text(`Discount: -$${Number(order.discount).toFixed(2)}`, pageWidth - 10, yPos, {
        align: "right",
      });
      yPos += 10;
    }

    // Total price with a line above it
    for (let i = 0; i < lineWidth; i += 4) {
      doc.text("-", 10 + i, yPos);
    }
    yPos += 7;

    doc.setFontSize(12);
    doc.text(`TOTAL: $${Number(order.totalPrice).toFixed(2)}`, pageWidth - 10, yPos, {
      align: "right",
    });
    yPos += 15;

    // Footer message centered
    doc.setFontSize(10);
    doc.text("Thank you for shopping with us!", pageWidth / 2, yPos, { align: "center" });

    doc.save(`YourReceipt.pdf`);
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setReturnReason("");
    setSuccessMessage("");
  };

  const handleReturnOrder = () => {
    if (!returnReason.trim()) {
      setError("Please provide a reason for the return.");
      return;
    }

    axios
      .post(
        "http://localhost:3001/returns",
        {
          arsyeja: returnReason,
          status: "requested",
          returnOrderID: selectedOrder.orderID,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        setSuccessMessage("Return request submitted successfully.");
        fetchOrders();
        setError("");
        setTimeout(handleCloseDialog, 1000); // Auto-close after 3 seconds
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to submit return request.");
      });
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ textAlign: "center", paddingTop: "70px" }}>
        <Typography color="error" mt={6}>
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ pt: 6 }} style={{ fontWeight: "bold" }}>
      <Typography variant="h4" gutterBottom sx={{ mt: 8 }} style={{ fontWeight: "bold" }}>
        My Orders
      </Typography>
      {orders.map((order) => (
        <Card key={order.orderID} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" style={{ fontWeight: "bold" }}>
              Order #{order.orderID} - {order.status}
            </Typography>
            <Typography variant="body2" color="text.secondary" style={{ fontWeight: "bold" }}>
              Total Price: $
              {order.totalPrice && !isNaN(order.totalPrice)
                ? Number(order.totalPrice).toFixed(2)
                : "N/A"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} style={{ fontWeight: "bold" }}>
              {order.OrderItems.map((item) => (
                <Grid item xs={12} md={6} key={item.orderItemID}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        style={{ fontWeight: "bold" }}
                      >
                        {item.ProductVariant?.Product?.emri || "Unknown Product"}
                      </Typography>
                      <Typography variant="body2" style={{ fontWeight: "bold" }}>
                        Quantity: {item.sasia}
                      </Typography>
                      <Typography variant="body2" style={{ fontWeight: "bold" }}>
                        Price: $
                        {item.cmimi && !isNaN(item.cmimi) ? Number(item.cmimi).toFixed(2) : "N/A"}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Display associated returns */}
            {order.Returns && order.Returns.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <Typography variant="body1" fontWeight="bold" style={{ fontWeight: "bold" }}>
                  Return Requests:
                </Typography>
                {order.Returns.map((ret) => (
                  <div key={ret.returnID} style={{ marginTop: "0.5rem" }}>
                    <Typography variant="body2" style={{ fontWeight: "bold" }}>
                      <strong>Reason:</strong> {ret.arsyeja}
                    </Typography>
                    <Typography variant="body2" style={{ fontWeight: "bold" }}>
                      <strong>Status:</strong> {ret.status}
                    </Typography>
                    <Typography variant="body2" style={{ fontWeight: "bold" }}>
                      <strong>Requested At:</strong> {new Date(ret.createdAt).toLocaleString()}
                    </Typography>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="contained"
              sx={{ mt: 2, mr: 2 }}
              onClick={() => handleOpenDialog(order)}
              disabled={!!order.Returns.length} // Disable if there are any returns
            >
              Return Order
            </Button>

            <Button color="error" sx={{ mt: 2 }} onClick={() => generatePdfReceipt(order)}>
              Print Receipt
            </Button>
          </CardContent>
        </Card>
      ))}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Return Order</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Please provide a reason for returning Order #{selectedOrder?.orderID}.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Reason for return..."
            margin="normal"
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          {successMessage && (
            <Typography style={{ color: "#88d498", fontWeight: "bold" }} variant="body2">
              {successMessage}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleReturnOrder}>
            Submit Return
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyOrders;
