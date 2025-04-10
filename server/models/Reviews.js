const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    reviewUserID: {
        type: Number,
        required: true
    },
    reviewProductID: {
        type: Number,
        required: true
    },
    rating: {
        type: String,
        required: true
    },
    koment: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
