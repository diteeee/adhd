require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;
  console.log("Request received:", req.body);

  try {
    console.log("Sign-in attempt with email:", email);

    let user = await User.findOne({ where: { email } });

    if (!user) {
      console.warn("No user found for email:", email);
      return res
        .status(400)
        .json({ success: false, message: "No user found with this email" });
    }

    if (user.password !== password) {
      console.warn("Password does not match for email:", email);
      return res
        .status(400)
        .json({ success: false, message: "Password does not match" });
    }

    const token = jwt.sign(
      {
        role: user.role,
        email: user.email,
        emri: user.emri,
        mbiemri: user.mbiemri,
        nrTel: user.nrTel,
        userID: user.userID
      },
      process.env.JWT_SECRET || "fallbackSecret",
      { expiresIn: "30d" },
    );

    console.log("Sign-in successful for email:", email);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Sign-in error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during sign-in. Please try again later.",
    });
  }
});

module.exports = router;
