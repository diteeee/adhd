import React, { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode"; // Import jwt-decode correctly

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const { role, email, emri, mbiemri, nrTel } = decodedToken;

        // Check if the token is expired
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          localStorage.removeItem("token");
          setUser(null);
        } else {
          // Combine emri and mbiemri to form the full name
          setUser({ role, email, emri, mbiemri, nrTel });
        }
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
      }
    }
  }, []);

  const isAuthenticated = !!user;

  return (
    <UserContext.Provider value={{ user, setUser, isAuthenticated }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
