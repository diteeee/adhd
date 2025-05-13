const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    notificationUserID: {
        type: Number,
        required: true
    },
    mesazhi: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
