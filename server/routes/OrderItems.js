const express = require("express");
const router = express.Router();
const { OrderItem, Order, Product, ProductVariant } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission');

// Get all OrderItems
router.get("/", async (req, res) => {
    try {
        const orderItems = await OrderItem.findAll({
            include: [
                { model: Order },
                { 
                    model: ProductVariant,
                    include: [Product] 
                }
            ]
        });
        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve order items." });
    }
});

// Get single OrderItem by ID
router.get("/:orderItemID", async (req, res) => {
    try {
        const orderItem = await OrderItem.findByPk(req.params.orderItemID, {
            include: [
                { model: Order },
                { 
                    model: ProductVariant,
                    include: [Product]
                }
            ]
        });

        if (!orderItem) {
            return res.status(404).json({ error: "OrderItem not found." });
        }

        res.json(orderItem);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve order item." });
    }
});

// Get all OrderItems for a specific Order
router.get("/order/:orderID", async (req, res) => {
    try {
        const orderItems = await OrderItem.findAll({
            where: { orderItemOrderID: req.params.orderID },
            include: [
                {
                    model: ProductVariant,
                    include: [Product]
                }
            ]
        });
        res.json(orderItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve order items." });
    }
});

// Create a new OrderItem
router.post("/", async (req, res) => {
    try {
        const { sasia, orderItemOrderID, orderItemProductVariantID } = req.body;

        const order = await Order.findByPk(orderItemOrderID);
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }

        const productVariant = await ProductVariant.findByPk(orderItemProductVariantID, {
            include: [Product]
        });

        if (!productVariant || !productVariant.Product) {
            return res.status(404).json({ error: "ProductVariant or its Product not found." });
        }

        const basePrice = Number(productVariant.Product.cmimi);
        const calculatedCmimi = basePrice * Number(sasia);

        const newOrderItem = await OrderItem.create({
            sasia,
            cmimi: calculatedCmimi,
            orderItemOrderID,
            orderItemProductVariantID,
        });

        const newTotal = await calculateOrderTotal(orderItemOrderID);
        await Order.update({ totalPrice: newTotal }, { where: { orderID: orderItemOrderID } });

        res.status(201).json(newOrderItem);
    } catch (error) {
        console.error("Error creating orderItem:", error);
        res.status(500).json({ error: "Failed to create order item." });
    }
});

// Update an OrderItem
router.put("/:orderItemID", async (req, res) => {
    try {
        const { sasia, orderItemOrderID, orderItemProductVariantID } = req.body;

        const orderItem = await OrderItem.findByPk(req.params.orderItemID);
        if (!orderItem) {
            return res.status(404).json({ error: "OrderItem not found." });
        }

        const productVariant = await ProductVariant.findByPk(orderItemProductVariantID, {
            include: [Product]
        });

        if (!productVariant || !productVariant.Product) {
            return res.status(404).json({ error: "ProductVariant or its Product not found." });
        }

        const basePrice = Number(productVariant.Product.cmimi);
        const calculatedCmimi = basePrice * Number(sasia);

        await orderItem.update({
            sasia,
            cmimi: calculatedCmimi,
            orderItemOrderID,
            orderItemProductVariantID,
        });

        const newTotal = await calculateOrderTotal(orderItemOrderID);
        await Order.update({ totalPrice: newTotal }, { where: { orderID: orderItemOrderID } });

        res.json(orderItem);
    } catch (error) {
        console.error("Error updating orderItem:", error);
        res.status(500).json({ error: "Failed to update order item." });
    }
});

// Delete an OrderItem
router.delete("/:orderItemID", async (req, res) => {
    try {
        const orderItem = await OrderItem.findByPk(req.params.orderItemID);
        if (!orderItem) {
            return res.status(404).json({ error: "OrderItem not found." });
        }

        const orderID = orderItem.orderItemOrderID;

        await orderItem.destroy();

        const newTotal = await calculateOrderTotal(orderID);
        await Order.update({ totalPrice: newTotal }, { where: { orderID } });

        res.json({ message: "OrderItem deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order item." });
    }
});

// Helper function to calculate order total
const calculateOrderTotal = async (orderID) => {
    const orderItems = await OrderItem.findAll({
        where: { orderItemOrderID: orderID },
    });

    return orderItems.reduce((sum, item) => sum + Number(item.cmimi), 0);
};

module.exports = router;
