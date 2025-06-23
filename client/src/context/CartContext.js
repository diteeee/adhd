import React, { createContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [refreshCart, setRefreshCart] = useState(0);

  const triggerCartRefresh = useCallback(() => {
    setRefreshCart((prev) => prev + 1);
  }, []);

  return (
    <CartContext.Provider value={{ refreshCart, triggerCartRefresh }}>
      {children}
    </CartContext.Provider>
  );
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
