const express = require('express');
const Wishlist = require('../models/Wishlists');
const { User, Product, ProductVariant } = require('../models');
const router = express.Router();

//create
router.post("/", async (req, res) => {
    try {
        const { userID, productID } = req.body;

        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const product = await Product.findByPk(productID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        const wishlist = new Wishlist({
            userID,
            productID
        });

        await wishlist.save();
        res.status(201).json(wishlist);
    } catch (error) {
        res.status(500).json({ error: "Failed to create wishlist." });
    }
});

//get wishlist by userID
router.get('/:userID', async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ userID: req.params.userID });
    if (!wishlist) return res.status(200).json([]);

    const user = await User.findByPk(req.params.userID);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const wishlistWithDetails = await Promise.all(
        wishlist.map(async (item) => {
            const product = await Product.findByPk(item.productID);

            return {
            wishlistID: item._id,
            userID: item.userID,
            userEmri: user.emri,
            productID: product.productID,
            productEmri: product.emri,
            productImageURL: product.imageURL,  // <-- add this
            };
        })
        );

    res.status(200).json(wishlistWithDetails);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

//delete
router.delete("/", async (req, res) => {
    const { userID, productID } = req.body;

    if (!userID || !productID) {
    return res.status(400).json({ error: "Missing userID or productID" });
    }

    try {
    const result = await Wishlist.deleteOne({ userID, productID });

    if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Wishlist item not found" });
    }

    res.status(200).json({ message: "Wishlist item removed successfully" });
    } catch (error) {
    console.error("Error removing wishlist item:", error);
    res.status(500).json({ error: "Failed to remove wishlist item" });
    }
});

module.exports = router;
