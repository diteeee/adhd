import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import { IconButton, Badge } from "@mui/material";
import { useUser } from "context/UserContext"; // Import the UserContext
import axios from "axios"; // Import axios for making API requests

const FloatingCart = ({ navigateTo }) => {
  const { user } = useUser(); // Access the user context
  const [cartCount, setCartCount] = useState(0); // State for cart count

  useEffect(() => {
    const fetchCartData = async () => {
      if (!user) return; // If no user is logged in, skip fetching

      try {
        // Make a request to the backend to get the cart items for the user
        const response = await axios.get(`http://localhost:3001/carts/user/${user.userID}`);
        const cartItems = response.data;

        // Update the cart count based on the number of items
        setCartCount(cartItems.length);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    fetchCartData();
  }, [user]);

  // Render nothing if no user is logged in
  if (!user) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "#fff",
        borderRadius: "50%",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        padding: "10px",
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

// Add PropTypes for props validation
FloatingCart.propTypes = {
  navigateTo: PropTypes.func.isRequired, // Ensure navigateTo is a function and required
};

export default FloatingCart;
