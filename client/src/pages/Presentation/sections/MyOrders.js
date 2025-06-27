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
} from "@mui/material";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default MyOrders;
