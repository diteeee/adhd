const express = require("express");
const router = express.Router();
const { Coupon } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

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

module.exports = router;
