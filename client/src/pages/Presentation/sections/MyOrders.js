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
        setError("");
        setTimeout(handleCloseDialog, 3000); // Auto-close after 3 seconds
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to submit return request.");
      });
  };

  if (loading) {
    return (
      <Container sx={{ mt: 5, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ pt: 6 }} style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ mt: 8 }}
        style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
      >
        My Orders
      </Typography>
      {orders.map((order) => (
        <Card key={order.orderID} sx={{ mb: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight="bold"
              style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
            >
              Order #{order.orderID} - {order.status}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
            >
              Total Price: $
              {order.totalPrice && !isNaN(order.totalPrice)
                ? Number(order.totalPrice).toFixed(2)
                : "N/A"}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid
              container
              spacing={2}
              style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
            >
              {order.OrderItems.map((item) => (
                <Grid item xs={12} md={6} key={item.orderItemID}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                      >
                        {item.ProductVariant?.Product?.emri || "Unknown Product"}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                      >
                        Quantity: {item.sasia}
                      </Typography>
                      <Typography
                        variant="body2"
                        style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                      >
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
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                >
                  Return Requests:
                </Typography>
                {order.Returns.map((ret) => (
                  <div key={ret.returnID} style={{ marginTop: "0.5rem" }}>
                    <Typography
                      variant="body2"
                      style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                    >
                      <strong>Reason:</strong> {ret.arsyeja}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                    >
                      <strong>Status:</strong> {ret.status}
                    </Typography>
                    <Typography
                      variant="body2"
                      style={{ fontFamily: "Times New Roman, serif", fontWeight: "bold" }}
                    >
                      <strong>Requested At:</strong> {new Date(ret.createdAt).toLocaleString()}
                    </Typography>
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => handleOpenDialog(order)}
              disabled={!!order.Returns.length} // Disable if there are any returns
            >
              Return Order
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
            <Typography
              style={{ color: "#88d498", fontWeight: "bold" }} // Directly set the color
              variant="body2"
            >
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
