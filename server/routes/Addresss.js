const express = require("express");
const router = express.Router();
const { Address, User } = require("../models");

// Get all address
router.get("/", async (req, res) => {
    try {
        const address = await Address.findAll({ include: User });
        res.json(address);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve address." });
    }
});

// Get address by ID
router.get("/:addressID", async (req, res) => {
    try {
        const address = await Address.findByPk(req.params.addressID, { include: User });
        if (!address) {
            return res.status(404).json({ error: "Address not found." });
        }
        res.json(address);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve address." });
    }
});

// Create new address
router.post("/", async (req, res) => {
    try {
        const { addressID, rruga, qyteti, zipCode, shteti, addressUserID } = req.body;
        const user = await User.findByPk(addressUserID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const newAddress = await Address.create({ addressID, rruga, qyteti, zipCode, shteti, addressUserID });
        res.status(201).json(newAddress);
    } catch (error) {
        res.status(500).json({ error: "Failed to create address." });
    }
});

// Update address by ID
router.put("/:addressID", async (req, res) => {
    try {
        const { addressID, rruga, qyteti, zipCode, shteti, addressUserID } = req.body;
        const address = await Address.findByPk(req.params.addressID);
        if (!address) {
            return res.status(404).json({ error: "Address not found." });
        }
        await address.update({ addressID, rruga, qyteti, zipCode, shteti, addressUserID });
        res.json(address);
    } catch (error) {
        res.status(500).json({ error: "Failed to update address." });
    }
});

// Delete address by ID
router.delete("/:addressID", async (req, res) => {
    try {
        const address = await Address.findByPk(req.params.addressID);
        if (!address) {
            return res.status(404).json({ error: "Address not found." });
        }
        await address.destroy();
        res.json({ message: "Address deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete address." });
    }
});

module.exports = router;
