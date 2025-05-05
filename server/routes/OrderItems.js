const express = require("express");
const router = express.Router();
const { OrderItem, Order, Product } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

// Get all orderItem
router.get("/", async (req, res) => {
    try {
        const orderItem = await OrderItem.findAll({ include: Order, Product });
        res.json(orderItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve orderItem." });
    }
});

// Get orderItem by ID
router.get("/:orderItemID", async (req, res) => {
    try {
        const orderItem = await OrderItem.findByPk(req.params.orderItemID, { include: Order, Product });
        if (!orderItem) {
            return res.status(404).json({ error: "OrderItem not found." });
        }
        res.json(orderItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve orderItem." });
    }
});

// Create new orderItem
router.post("/", async (req, res) => {
    try {
        const { sasia, cmimi, orderItemOrderID, orderItemProductID } = req.body;
        const order = await Order.findByPk(orderItemOrderID);
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }
        const product = await Product.findByPk(orderItemProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        const newOrderItem = await OrderItem.create({ sasia, cmimi, orderItemOrderID, orderItemProductID });
        res.status(201).json(newOrderItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to create orderItem." });
    }
});

// Update orderItem by ID
router.put("/:orderItemID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { sasia, cmimi, orderItemOrderID, orderItemProductID } = req.body;
        const orderItem = await OrderItem.findByPk(req.params.orderItemID);
        if (!orderItem) {
            return res.status(404).json({ error: "OrderItem not found." });
        }
        const product = await Product.findByPk(orderItemProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await orderItem.update({ sasia, cmimi, orderItemOrderID, orderItemProductID });
        res.json(orderItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to update orderItem." });
    }
});

// Delete orderItem by ID
router.delete("/:orderItemID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const orderItem = await OrderItem.findByPk(req.params.orderItemID);
        if (!orderItem) {
            return res.status(404).json({ error: "OrderItem not found." });
        }
        await orderItem.destroy();
        res.json({ message: "OrderItem deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete orderItem." });
    }
});

module.exports = router;
