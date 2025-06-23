/**
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Kit 2 React Button Styles
import root from "assets/theme/components/button/root";
import contained from "assets/theme/components/button/contained";
import outlined from "assets/theme/components/button/outlined";
import text from "assets/theme/components/button/text";

export default {
  defaultProps: {
    disableRipple: false,
  },
  styleOverrides: {
    root: { ...root },
    contained: {
      ...contained.base,
      color: "#ffffff", // Ensures white text for all contained buttons
    },
    containedSizeSmall: { ...contained.small },
    containedSizeLarge: { ...contained.large },
    containedPrimary: {
      ...contained.primary,
      color: "#ffffff", // White text for primary contained buttons
    },
    containedSecondary: {
      ...contained.secondary,
      color: "#ffffff", // White text for secondary contained buttons
    },
    outlined: { ...outlined.base },
    outlinedSizeSmall: { ...outlined.small },
    outlinedSizeLarge: { ...outlined.large },
    outlinedPrimary: {
      ...outlined.primary,
      color: "#ffffff", // White text for primary outlined buttons
    },
    outlinedSecondary: {
      ...outlined.secondary,
      color: "#ffffff", // White text for secondary outlined buttons
    },
    text: { ...text.base },
    textSizeSmall: { ...text.small },
    textSizeLarge: { ...text.large },
    textPrimary: {
      ...text.primary,
      color: "#ffffff", // White text for primary text buttons
    },
    textSecondary: {
      ...text.secondary,
      color: "#ffffff", // White text for secondary text buttons
    },
  },
};
