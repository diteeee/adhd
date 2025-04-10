const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userID: {
        type: Number,
        required: true
    },
    productID: {
        type: Number,
        required: true
    }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
