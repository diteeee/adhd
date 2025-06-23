import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "assets/theme";
import Presentation from "layouts/pages/presentation";
import { UserProvider, useUser } from "context/UserContext";
import routes from "routes";
import Notification from "./Notifications";
import PaymentPage from "./pages/Presentation/sections/Payment";
import Products from "./pages/Presentation/sections/Products";
import SuccessPage from "pages/Presentation/sections/SuccessPage";
import Cart from "pages/Presentation/sections/Cart";
import FloatingCart from "./components/FloatingCart";

function AppContent() {
  const { user } = useUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  console.log("user from context: ", user);
  // Scroll to top on route change
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.flatMap((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }

      if ((!user || user === null) && route.route.includes("logout")) {
        console.log(`Filtering out route ${route.route} because user is not logged in.`);
        return;
      }

      if (user && (route.route.includes("sign-in") || route.route.includes("sign-up"))) {
        console.log(`Filtering out route ${route.route} because user is logged in.`);
        return;
      }

      return route.route
        ? [<Route path={route.route} element={route.component} key={route.key} />]
        : [];
    });

  const handleNavigateToCart = () => {
    navigate("/cart"); // Ensure this matches your cart route
  };

  return (
    <>
      <Notification userId={user?.userID} />
      <FloatingCart navigateTo={handleNavigateToCart} />
      <Routes>
        {getRoutes(routes)}
        <Route path="/presentation" element={<Presentation />} />
        <Route path="*" element={<Navigate to="/presentation" />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProvider>
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}
