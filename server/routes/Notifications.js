module.exports = (io) => {
  const express = require('express');
  const { User } = require('../models');
  const Notification = require('../models/Notifications');
  const router = express.Router();
  const auth = require('../middleware/auth');
  const checkRole = require('../middleware/permission'); 

router.post('/', auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { notificationUserID, mesazhi } = req.body;
        const user = await User.findByPk(notificationUserID);

        if (!user) {
            console.error(`User with ID ${notificationUserID} not found`);
            return res.status(404).json({ error: 'User not found' });
        }

        const notification = new Notification({ notificationUserID, mesazhi });
        await notification.save();

        io.to(notificationUserID).emit("newNotification", notification);
        console.log("Emitting notification to user room:", notificationUserID, notification);
        res.status(201).json(notification);
    } catch (error) {
        console.error("Error creating notification:", error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
  });
  return router;
};