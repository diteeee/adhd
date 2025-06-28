import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "assets/theme";
import Presentation from "layouts/pages/presentation";
import { UserProvider, useUser } from "context/UserContext";
import { CartProvider } from "context/CartContext";
import routes from "routes";
import Notification from "./Notifications";
import PaymentPage from "./pages/Presentation/sections/Payment";
import Products from "./pages/Presentation/sections/Products";
import SuccessPage from "pages/Presentation/sections/SuccessPage";
import Cart from "pages/Presentation/sections/Cart";
import FloatingCart from "./components/FloatingCart";
import WishlistDrawer from "pages/Presentation/sections/Wishlist"; // Your wishlist drawer component
import DefaultNavbar from "examples/Navbars/DefaultNavbar";
import ProductDetails from "./pages/Presentation/sections/ProductDetails";

function AppContent() {
  const { user } = useUser();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [wishlistOpen, setWishlistOpen] = useState(false);

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

      if (
        (!user || user === null) &&
        route.route.includes("logout") &&
        route.route.includes("profile") &&
        route.route.includes("myorders")
      ) {
        console.log(`Filtering out route ${route.route} because user is not logged in.`);
        return;
      }

      if (user && (route.route.includes("sign-in") || route.route.includes("sign-up"))) {
        console.log(`Filtering out route ${route.route} because user is logged in.`);
        return;
      }

      // Exclude wishlist page route, since we're using drawer instead
      if (route.key === "wishlist") return;

      return route.route
        ? [<Route path={route.route} element={route.component} key={route.key} />]
        : [];
    });

  const handleNavigateToCart = () => {
    navigate("/cart");
  };

  // Open wishlist drawer
  const openWishlist = () => {
    setWishlistOpen(true);
  };

  // Close wishlist drawer
  const closeWishlist = () => {
    setWishlistOpen(false);
  };

  return (
    <>
      <Notification userId={user?.userID} />
      <FloatingCart navigateTo={handleNavigateToCart} />

      {/* Pass openWishlist to Navbar so you can open the drawer */}
      <DefaultNavbar routes={routes} sticky openWishlist={openWishlist} />

      {/* Wishlist Drawer controlled by state */}
      <WishlistDrawer open={wishlistOpen} onClose={closeWishlist} />

      <Routes>
        {getRoutes(routes)}
        <Route path="/presentation" element={<Presentation openWishlist={openWishlist} />} />
        <Route path="*" element={<Navigate to="/presentation" />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/product/:productID" element={<ProductDetails />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <UserProvider>
          <AppContent />
        </UserProvider>
      </CartProvider>
    </ThemeProvider>
  );
}
