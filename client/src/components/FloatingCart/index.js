import React, { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import { IconButton, Badge } from "@mui/material";
import { useUser } from "context/UserContext";
import { CartContext } from "context/CartContext"; // Import CartContext
import axios from "axios";

const FloatingCart = ({ navigateTo }) => {
  const { user } = useUser();
  const { refreshCart } = useContext(CartContext); // Get refresh signal
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartData = async () => {
      if (!user) return;

      try {
        const response = await axios.get(`http://localhost:3001/carts/user/${user.userID}`);
        setCartCount(response.data.length);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    fetchCartData();
  }, [user, refreshCart]); // <-- re-fetch on refreshCart changes

  if (!user) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 1000,
        backgroundColor: "#fff",
        borderRadius: "50%",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        padding: 10,
      }}
    >
      <IconButton onClick={navigateTo}>
        <Badge badgeContent={cartCount} color="primary">
          <LocalMallIcon style={{ fontSize: "2rem" }} />
        </Badge>
      </IconButton>
    </div>
  );
};

FloatingCart.propTypes = {
  navigateTo: PropTypes.func.isRequired,
};

export default FloatingCart;
