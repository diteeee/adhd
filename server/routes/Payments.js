const express = require("express");
const router = express.Router();
const { Payment, Order } = require("../models");

// Get all payment
router.get("/", async (req, res) => {
    try {
        const payment = await Payment.findAll({ include: Order });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve payment." });
    }
});

// Get payment by ID
router.get("/:paymentID", async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.paymentID, { include: Order });
        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve payment." });
    }
});

// Create new payment
router.post("/", async (req, res) => {
    try {
        const { metoda, status, data, paymentOrderID } = req.body;
        const order = await Order.findByPk(paymentOrderID);
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }
        const newPayment = await Payment.create({ metoda, status, data, paymentOrderID });
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(500).json({ error: "Failed to create payment." });
    }
});

// Update payment by ID
router.put("/:paymentID", async (req, res) => {
    try {
        const { metoda, status, data, paymentOrderID } = req.body;
        const payment = await Payment.findByPk(req.params.paymentID);
        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }
        await payment.update({ metoda, status, data, paymentOrderID });
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: "Failed to update payment." });
    }
});

// Delete payment by ID
router.delete("/:paymentID", async (req, res) => {
    try {
        const payment = await Payment.findByPk(req.params.paymentID);
        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }
        await payment.destroy();
        res.json({ message: "Payment deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete payment." });
    }
});

module.exports = router;
