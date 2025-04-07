const express = require("express");
const router = express.Router();
const { Wishlist, User, Product } = require("../models");

// Get all wishlist
router.get("/", async (req, res) => {
    try {
        const wishlist = await Wishlist.findAll({ include: User, Product });
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve wishlist." });
    }
});

// Get wishlist by ID
router.get("/:wishlistID", async (req, res) => {
    try {
        const wishlist = await Wishlist.findByPk(req.params.wishlistID, { include: User, Product });
        if (!wishlist) {
            return res.status(404).json({ error: "Wishlist not found." });
        }
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve wishlist." });
    }
});

// Create new wishlist
router.post("/", async (req, res) => {
    try {
        const { wishlistUserID, wishlistProductID } = req.body;
        const user = await User.findByPk(wishlistUserID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const product = await Product.findByPk(wishlistProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        const newWishlist = await Wishlist.create({ wishlistUserID, wishlistProductID });
        res.status(201).json(newWishlist);
    } catch (error) {
        res.status(500).json({ error: "Failed to create wishlist." });
    }
});

// Update wishlist by ID
router.put("/:wishlistID", async (req, res) => {
    try {
        const { wishlistUserID, wishlistProductID } = req.body;
        const wishlist = await Wishlist.findByPk(req.params.wishlistID);
        if (!wishlist) {
            return res.status(404).json({ error: "Wishlist not found." });
        }
        const product = await Product.findByPk(wishlistProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await wishlist.update({ wishlistUserID, wishlistProductID });
        res.json(wishlist);
    } catch (error) {
        res.status(500).json({ error: "Failed to update wishlist." });
    }
});

// Delete wishlist by ID
router.delete("/:wishlistID", async (req, res) => {
    try {
        const wishlist = await Wishlist.findByPk(req.params.wishlistID);
        if (!wishlist) {
            return res.status(404).json({ error: "Wishlist not found." });
        }
        await wishlist.destroy();
        res.json({ message: "Wishlist deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete wishlist." });
    }
});

module.exports = router;
