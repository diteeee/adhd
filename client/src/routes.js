import AboutUs from "layouts/pages/landing-pages/about-us";
import ContactUs from "layouts/pages/landing-pages/contact-us";
import Author from "layouts/pages/landing-pages/author";
import SignIn from "layouts/pages/authentication/sign-in";
import SignUp from "layouts/pages/authentication/sign-in/sign-up";
import SignOutPage from "pages/LandingPages/SignOut";
import Products from "pages/Presentation/sections/Products";

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
        name: "landing pages",
        collapse: [
          {
            name: "about us",
            route: "/pages/landing-pages/about-us",
            component: <AboutUs />,
          },
          {
            name: "contact us",
            route: "/pages/landing-pages/contact-us",
            component: <ContactUs />,
          },
          {
            name: "author",
            route: "/pages/landing-pages/author",
            component: <Author />,
          },
        ],
      },
      {
        name: "account",
        collapse: [
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
