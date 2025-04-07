const express = require("express");
const router = express.Router();
const { Order, User } = require("../models");

// Get all order
router.get("/", async (req, res) => {
    try {
        const order = await Order.findAll({ include: User });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve order." });
    }
});

// Get order by ID
router.get("/:orderID", async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.orderID, { include: User });
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve order." });
    }
});

// Create new order
router.post("/", async (req, res) => {
    try {
        const { totalPrice, status, orderUserID } = req.body;
        const user = await User.findByPk(orderUserID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const newOrder = await Order.create({ totalPrice, status, orderUserID });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: "Failed to create order." });
    }
});

// Update order by ID
router.put("/:orderID", async (req, res) => {
    try {
        const { totalPrice, status, orderUserID } = req.body;
        const order = await Order.findByPk(req.params.orderID);
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }
        await order.update({ totalPrice, status, orderUserID });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: "Failed to update order." });
    }
});

// Delete order by ID
router.delete("/:orderID", async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.orderID);
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }
        await order.destroy();
        res.json({ message: "Order deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order." });
    }
});

module.exports = router;
