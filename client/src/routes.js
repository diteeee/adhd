import ContactUs from "layouts/pages/landing-pages/contact-us";
import SignIn from "layouts/pages/authentication/sign-in";
import SignUp from "layouts/pages/authentication/sign-in/sign-up";
import SignOutPage from "pages/LandingPages/SignOut";
import Products from "pages/Presentation/sections/Products";
import Profile from "pages/Presentation/sections/Profile";
import Orders from "pages/Presentation/sections/MyOrders";

const routes = [
  {
    name: "products",
    route: "/sections/products",
    component: <Products />,
    key: "products",
  },
  {
    name: "More",
    columns: 1,
    rowsPerColumn: 2,
    collapse: [
      {
        name: "reach out",
        collapse: [
          {
            name: "contact us",
            route: "/pages/landing-pages/contact-us",
            component: <ContactUs />,
          },
        ],
      },
      {
        name: "account",
        collapse: [
          {
            name: "profile",
            route: "/sections/profile",
            component: <Profile />,
            key: "profile",
          },
          {
            name: "my order history",
            route: "/sections/myorders",
            component: <Orders />,
            key: "myorders",
          },
          {
            name: "log out",
            route: "/logout",
            component: <SignOutPage />,
            key: "logout",
          },
          {
            name: "sign in",
            route: "/pages/authentication/sign-in",
            component: <SignIn />,
            key: "signin",
          },
          {
            name: "sign up",
            route: "/pages/authentication/sign-in/sign-up",
            component: <SignUp />,
            key: "signup",
          },
        ],
      },
    ],
  },
];

export default routes;
