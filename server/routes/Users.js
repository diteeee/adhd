const express = require("express");
const router = express.Router();
const { User } = require("../models");

// get all users
router.get("/", async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve users." });
    }
});

// get user by ID
router.get("/:userID", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve user." });
    }
});

// Create new user
router.post("/", async (req, res) => {
    try {
        const { emri, mbiemri, nrTel, email, password, role } = req.body;
        const newUser = await User.create({ emri, mbiemri, nrTel, email, password, role });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Failed to create user." });
    }
});

// Update user by ID
router.put("/:userID", async (req, res) => {
    try {
        const { emri, mbiemri, nrTel, email, password, role } = req.body;
        const user = await User.findByPk(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        await user.update({ emri, mbiemri, nrTel, email, password, role });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to update user." });
    }
});

// Delete user by ID
router.delete("/:userID", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        await user.destroy();
        res.json({ message: "User deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user." });
    }
});

module.exports = router;
