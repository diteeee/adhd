module.exports = (io) => {
    const express = require("express");
    const router = express.Router();
    const { Coupon, User } = require("../models");
    const auth = require('../middleware/auth');
    const checkRole = require('../middleware/permission'); 
    const Notification = require("../models/Notifications");

    // Get all coupon
    router.get("/", async (req, res) => {
        try {
            const coupon = await Coupon.findAll();
            res.json(coupon);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve coupon." });
        }
    });

    // Get coupon by ID
    router.get("/:couponID", async (req, res) => {
        try {
            const coupon = await Coupon.findByPk(req.params.couponID);
            if (!coupon) {
                return res.status(404).json({ error: "Coupon not found." });
            }
            res.json(coupon);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve coupon." });
        }
    });

    // Validate and apply coupon
    router.post("/apply-coupon", auth, async (req, res) => {
        try {
            const { couponCode } = req.body;
            const coupon = await Coupon.findOne({ where: { kodi: couponCode } });

            if (!coupon) {
                return res.status(404).json({ error: "Invalid coupon code." });
            }

            // Logic to check coupon validity (e.g., expiration, usage limits)
            const now = new Date();
            if (coupon.expiryDate && new Date(coupon.expiryDate) < now) {
                return res.status(400).json({ error: "Coupon has expired." });
            }

            res.json({
                discount: coupon.shuma, // Discount amount
                message: "Coupon applied successfully!",
            });
        } catch (error) {
            res.status(500).json({ error: "Failed to apply coupon." });
        }
    });

    router.post("/newsletter", async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({ error: "Email is required." });
            }

            // Simulate randomness with a 20% chance to get a coupon
            const isWinner = Math.random() < 0.2;

            if (isWinner) {
                // Fetch a random coupon from the database
                const coupons = await Coupon.findAll();
                if (coupons.length === 0) {
                    return res.status(404).json({ error: "No coupons available." });
                }

                const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)];

                return res.json({
                    message: `You won a coupon: "${randomCoupon.kodi}"!`,
                    discount: randomCoupon.shuma,
                });
            } else {
                return res.json({
                    message: "Thank you for joining our newsletter!",
                });
            }
        } catch (error) {
            res.status(500).json({ error: "Failed to process your request." });
        }
    });

    // Create new coupon
    router.post("/", auth, checkRole(["admin"]), async (req, res) => {
        try {
            const { kodi, type, shuma } = req.body;
            const newCoupon = await Coupon.create({ kodi, type, shuma });
            res.status(201).json(newCoupon);
        } catch (error) {
            res.status(500).json({ error: "Failed to create coupon." });
        }
    });

    // Send a coupon to a specific user
    router.post("/send-coupon", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { userID, couponID } = req.body;
        // Validate user
        const user = await User.findByPk(userID);
        if (!user) {
        return res.status(404).json({ error: "User not found." });
        }
        // Validate coupon
        const coupon = await Coupon.findByPk(couponID);
        if (!coupon) {
        return res.status(404).json({ error: "Coupon not found." });
        }
        // Create a notification for the user
        const message = `Congratulations! You received a coupon: "${coupon.kodi}" worth ${coupon.shuma}.`;
        const notification = await Notification.create({
        notificationUserID: userID,
        mesazhi: message,
        });
        // Emit real-time notification to the user
        io.to(userID).emit("newNotification", notification);
        res.status(200).json({
        message: "Coupon sent successfully.",
        notification,
        });
    } catch (error) {
        console.error("Error sending coupon:", error);
        res.status(500).json({ error: "Failed to send coupon." });
    }
    });

    // Update coupon by ID
    router.put("/:couponID", auth, checkRole(["admin"]), async (req, res) => {
        try {
            const { kodi, type, shuma } = req.body;
            const coupon = await Coupon.findByPk(req.params.couponID);
            if (!coupon) {
                return res.status(404).json({ error: "Coupon not found." });
            }
            await coupon.update({ kodi, type, shuma });
            res.json(coupon);
        } catch (error) {
            res.status(500).json({ error: "Failed to update coupon." });
        }
    });

    // Delete coupon by ID
    router.delete("/:couponID", auth, checkRole(["admin"]), async (req, res) => {
        try {
            const coupon = await Coupon.findByPk(req.params.couponID);
            if (!coupon) {
                return res.status(404).json({ error: "Coupon not found." });
            }
            await coupon.destroy();
            res.json({ message: "Coupon deleted successfully." });
        } catch (error) {
            res.status(500).json({ error: "Failed to delete coupon." });
        }
    });
  return router;
};