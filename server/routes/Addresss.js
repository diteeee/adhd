const express = require("express");
const router = express.Router();
const { Address, User } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission');
const Joi = require("joi");
const axios = require('axios');

// Validation schema
const addressSchema = Joi.object({
  rruga: Joi.string().required(),
  qyteti: Joi.string().required(),
  zipCode: Joi.string().required(),
  shteti: Joi.string().required(),
  addressUserID: Joi.number().required(),
});

router.get('/reverse-geocode', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon query parameters are required' });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'jsonv2',
        lat,
        lon,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'YourAppName/1.0 (your.email@example.com)', // Required by Nominatim usage policy
        'Accept-Language': 'en',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Reverse geocode error:', error.message);
    res.status(500).json({ error: 'Failed to reverse geocode' });
  }
});

// Get all addresses with pagination
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        const addresses = await Address.findAndCountAll({
            include: User,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({
            data: addresses.rows,
            total: addresses.count,
            page: parseInt(page),
            totalPages: Math.ceil(addresses.count / limit),
        });
    } catch (error) {
        console.error("Error retrieving addresses:", error);
        res.status(500).json({ error: "Failed to retrieve addresses." });
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
        console.error("Error retrieving address:", error);
        res.status(500).json({ error: "Failed to retrieve address." });
    }
});

// Get address by user ID
router.get("/user/:userID", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.userID !== parseInt(req.params.userID)) {
      return res.status(403).json({ error: "Unauthorized action." });
    }
    const address = await Address.findOne({ where: { addressUserID: req.params.userID } });
    if (!address) {
      return res.status(404).json({ error: "Address not found." });
    }
    res.json(address);
  } catch (error) {
    console.error("Error retrieving address:", error);
    res.status(500).json({ error: "Failed to retrieve address." });
  }
});

// Create a new address (allow users to create their own address)
router.post("/", auth, async (req, res) => {
  try {
    const { error } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { rruga, qyteti, zipCode, shteti, addressUserID } = req.body;

    // Only allow user to create address for self, or admins can create for anyone
    if (req.user.role !== "admin" && req.user.userID !== addressUserID) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    const user = await User.findByPk(addressUserID);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Optional: check if address already exists for user and reject or update instead?

    const newAddress = await Address.create({ rruga, qyteti, zipCode, shteti, addressUserID });
    res.status(201).json(newAddress);
  } catch (error) {
    console.error("Error creating address:", error);
    res.status(500).json({ error: "Failed to create address." });
  }
});

// Update an address by ID (allow user to update own address)
router.put("/:addressID", auth, async (req, res) => {
  try {
    const { error } = addressSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { rruga, qyteti, zipCode, shteti, addressUserID } = req.body;
    const address = await Address.findByPk(req.params.addressID);

    if (!address) {
      return res.status(404).json({ error: "Address not found." });
    }

    if (req.user.role !== "admin" && req.user.userID !== address.addressUserID) {
      return res.status(403).json({ error: "Unauthorized action." });
    }
    console.log("PUT /addresss/:id payload:", req.body);

    await address.update({ rruga, qyteti, zipCode, shteti, addressUserID });
    res.json(address);
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ error: "Failed to update address." });
  }
});

// Delete an address by ID
router.delete("/:addressID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const address = await Address.findByPk(req.params.addressID);
        if (!address) {
            return res.status(404).json({ error: "Address not found." });
        }

        if (req.user.role !== "admin" && req.user.userID !== address.addressUserID) {
            return res.status(403).json({ error: "Unauthorized action." });
        }

        await address.destroy();
        res.json({ message: "Address deleted successfully." });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ error: "Failed to delete address." });
    }
});

module.exports = router;
