const express = require("express");
const router = express.Router();
const { Coupon, Payment } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

// Get all coupon
router.get("/", async (req, res) => {
    try {
        const coupon = await Coupon.findAll({ include: Payment });
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve coupon." });
    }
});

// Get coupon by ID
router.get("/:couponID", async (req, res) => {
    try {
        const coupon = await Coupon.findByPk(req.params.couponID, { include: Payment });
        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found." });
        }
        res.json(coupon);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve coupon." });
    }
});

// Create new coupon
router.post("/", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { kodi, type, shuma, couponPaymentID } = req.body;
        const payment = await Payment.findByPk(couponPaymentID);
        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }
        const newCoupon = await Coupon.create({ kodi, type, shuma, couponPaymentID });
        res.status(201).json(newCoupon);
    } catch (error) {
        res.status(500).json({ error: "Failed to create coupon." });
    }
});

// Update coupon by ID
router.put("/:couponID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { kodi, type, shuma, couponPaymentID } = req.body;
        const coupon = await Coupon.findByPk(req.params.couponID);
        if (!coupon) {
            return res.status(404).json({ error: "Coupon not found." });
        }
        await coupon.update({ kodi, type, shuma, couponPaymentID });
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
