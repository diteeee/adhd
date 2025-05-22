const express = require("express");
const router = express.Router();
const { Payment, Order } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

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

// POST /payment/confirm - To confirm the payment
router.post("/confirm", async (req, res) => {
    const { paymentID, status, transactionID } = req.body;  // Assuming status & paymentID are passed

    try {
        // 1. Find the payment by paymentID
        const payment = await Payment.findByPk(paymentID);
        if (!payment) {
            return res.status(404).json({ error: "Payment not found." });
        }

        // 2. Update the payment status based on the confirmation status
        const updatedStatus = status === "completed" ? "completed" : "failed";

        // Update the payment status and optionally store the transaction ID
        await payment.update({
            status: updatedStatus,
            data: { transactionID: transactionID || payment.data.transactionID }  // Update transactionID if provided
        });

        // 3. Update the order status based on payment success (optional, depending on your logic)
        const order = await Order.findByPk(payment.paymentOrderID);
        if (order) {
            await order.update({ status: updatedStatus === "completed" ? "paid" : "payment_failed" });
        }

        // 4. Return a response with the updated payment and order status
        res.status(200).json({
            message: "Payment confirmed.",
            paymentID: payment.paymentID,
            status: updatedStatus,
            transactionID: payment.data.transactionID
        });
    } catch (error) {
        console.error("Payment confirmation error:", error);
        res.status(500).json({ error: "Payment confirmation failed.", details: error });
    }
});

// Update payment by ID
router.put("/:paymentID", auth, checkRole(["admin"]), async (req, res) => {
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
router.delete("/:paymentID", auth, checkRole(["admin"]), async (req, res) => {
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
