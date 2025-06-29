const express = require("express");
const router = express.Router();
const { Payment, Order } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
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

//confirm payment
router.post("/confirm", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "sessionId is required." });
  }

  try {
    // Retrieve the Stripe checkout session by ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Extract metadata (ensure these were set when creating session)
      const { orderID, paymentID, userID } = session.metadata;

      if (!orderID || !paymentID) {
        return res.status(400).json({ error: "Missing orderID or paymentID in session metadata." });
      }

      // Find payment record in DB
      const payment = await Payment.findByPk(paymentID);
      if (!payment) return res.status(404).json({ error: "Payment not found." });

      // Update payment status and transaction data (payment_intent is the Stripe payment id)
      await payment.update({
        status: "completed",
        data: { transactionID: session.payment_intent },
      });

      // Update order status (mark as paid/completed)
      const order = await Order.findByPk(orderID);
      if (order) {
        await order.update({ status: "paid" });
      }

      // Clear user's cart if userID exists
      if (userID) {
        const { Cart } = require("../models"); // require here to avoid circular import if needed
        await Cart.destroy({ where: { cartUserID: userID } });
      }

      return res.json({
        message: "Payment confirmed successfully. Order paid and cart cleared.",
        orderID,
        paymentID,
      });
    } else {
      return res.status(400).json({ error: "Payment not completed." });
    }
  } catch (error) {
    console.error("Payment confirmation error:", error);
    return res.status(500).json({ error: "Failed to confirm payment.", details: error.message });
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

// Update payment status and order status accordingly
router.put("/:paymentID/status", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const { status } = req.body;
    const payment = await Payment.findByPk(req.params.paymentID);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found." });
    }

    // Update payment status
    await payment.update({ status });

    // If payment status is completed, update related order status to 'paid'
    if (status === "completed") {
      const order = await Order.findByPk(payment.paymentOrderID);
      if (order) {
        await order.update({ status: "paid" });
      }
    }

    res.json({ payment, message: "Payment and order status updated." });
  } catch (error) {
    res.status(500).json({ error: "Failed to update payment and order status." });
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
