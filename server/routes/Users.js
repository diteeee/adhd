module.exports = (io) => {
    const express = require("express");
    const router = express.Router();
    const { User } = require("../models");
    const auth = require('../middleware/auth');
    const checkRole = require('../middleware/permission'); 
    const Notification = require("../models/Notifications");

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

        // Check if user with the email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
        return res.status(400).json({ error: "Email already in use." });
        }

        const newUser = await User.create({ emri, mbiemri, nrTel, email, password, role });
        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
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
            
            // Create notification message
            const mesazhi = "Your profile has been successfully updated.";

            // Save notification in DB (optional)
            const notification = await Notification.create({
                notificationUserID: user.userID,
                mesazhi,
            });

            // Emit real-time notification to user room
            io.to(user.userID).emit("newNotification", notification);

            return res.json(user);
        } catch (error) {
            res.status(500).json({ error: "Failed to update user." });
        }
    });

    // Delete user by ID
    router.delete("/:userID", auth, checkRole(["admin"]), async (req, res) => {
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
  return router;
};
