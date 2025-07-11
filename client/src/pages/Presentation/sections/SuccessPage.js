import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Typography, CircularProgress, Button, Box } from "@mui/material";
import { jsPDF } from "jspdf";
import { useUser } from "context/UserContext";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SuccessPage = () => {
  const query = useQuery();
  const orderID = query.get("orderID");
  const sessionID = query.get("session_id");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { user } = useUser();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderID) {
      setError("No order ID found.");
      setLoading(false);
      return;
    }

    const confirmPayment = async () => {
      if (!sessionID) return; // no payment confirmation needed (e.g., cash payment)

      try {
        await axios.post(
          "http://localhost:3001/payments/confirm",
          { sessionId: sessionID },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Payment confirmed on backend
      } catch (err) {
        setError("Payment confirmation failed.");
        setLoading(false);
        return;
      }
    };

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/orders/${orderID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrder(res.data);
        setLoading(false);
      } catch {
        setError("Failed to load order details.");
        setLoading(false);
      }
    };

    confirmPayment().then(fetchOrder);
  }, [orderID, sessionID, token]);

  const generatePdfReceipt = () => {
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

  if (loading) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
        <Typography
          sx={{ mt: 2, cursor: "pointer", color: "blue" }}
          onClick={() => navigate("/products")}
        >
          Go back to products
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ textAlign: "center", pt: 6 }} style={{ fontWeight: "bold" }}>
      <Typography variant="body1" sx={{ mb: 2, mt: 10 }} style={{ fontWeight: "bold" }}>
        Thank you for your purchase. Your order has been received.
      </Typography>

      {/* Order Summary */}
      {order.OrderItems && order.OrderItems.length > 0 && (
        <div>
          <Typography variant="h6" gutterBottom style={{ fontWeight: "bold" }}>
            Order Summary
          </Typography>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {order.OrderItems.map((item) => (
              <li key={item.orderItemID} style={{ marginBottom: 8 }}>
                {item.sasia} × {item.ProductVariant?.Product?.emri} — $
                {Number(item.cmimi).toFixed(2)}
              </li>
            ))}
          </ul>
          {order.discount && order.discount > 0 && (
            <Typography variant="subtitle1" color="secondary" fontWeight="bold" sx={{ mt: 1 }}>
              Discount: -${Number(order.discount).toFixed(2)}
            </Typography>
          )}
          <Typography variant="h4" fontWeight="bold" style={{ fontWeight: "bold" }}>
            Total: ${Number(order.totalPrice).toFixed(2)}
          </Typography>
        </div>
      )}

      <Box mt={4}>
        <Button variant="contained" color="primary" onClick={generatePdfReceipt}>
          Print Receipt
        </Button>
      </Box>
      {user.role === "admin" && orderID && (
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => (window.location.href = `http://localhost:3006/orders/${orderID}`)}
          >
            Go to Admin Order Details
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default SuccessPage;
