const express = require("express");
const router = express.Router();
const { Return, Order } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

// Get all return
router.get("/", async (req, res) => {
    try {
        const ret = await Return.findAll({ include: Order });
        res.json(ret);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve return." });
    }
});

// Get return by ID
router.get("/:returnID", async (req, res) => {
    try {
        const ret = await Return.findByPk(req.params.returnID, { include: Order });
        if (!ret) {
            return res.status(404).json({ error: "Return not found." });
        }
        res.json(ret);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve return." });
    }
});

// Create new return
router.post("/", async (req, res) => {
    try {
        const { arsyeja, status, returnOrderID } = req.body;
        const order = await Order.findByPk(returnOrderID);
        if (!order) {
            return res.status(404).json({ error: "Order not found." });
        }
        const newReturn = await Return.create({ arsyeja, status, returnOrderID });
        res.status(201).json(newReturn);
    } catch (error) {
        res.status(500).json({ error: "Failed to create return." });
    }
});

// Update return by ID
router.put("/:returnID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { arsyeja, status, returnOrderID } = req.body;

        // Find the return record
        const ret = await Return.findByPk(req.params.returnID);
        if (!ret) {
            return res.status(404).json({ error: "Return not found." });
        }

        // Update the return record
        await ret.update({ arsyeja, status, returnOrderID });

        // If status is 'confirmed', delete the associated order
        if (status === "confirmed") {
            const order = await Order.findByPk(returnOrderID);
            if (!order) {
                return res.status(404).json({ error: "Associated order not found." });
            }

            await order.destroy();
        }

        res.json({ message: "Return updated successfully.", return: ret });
    } catch (error) {
        console.error("Failed to update return:", error);
        res.status(500).json({ error: "Failed to update return." });
    }
});

// Delete return by ID
router.delete("/:returnID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const ret = await Return.findByPk(req.params.returnID);
        if (!ret) {
            return res.status(404).json({ error: "Return not found." });
        }
        await ret.destroy();
        res.json({ message: "Return deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete return." });
    }
});

module.exports = router;
