const express = require("express");
const router = express.Router();
const { Review, User, Product } = require("../models");

// Get all review
router.get("/", async (req, res) => {
    try {
        const review = await Review.findAll({ include: User, Product });
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve review." });
    }
});

// Get review by ID
router.get("/:reviewID", async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewID, { include: User, Product });
        if (!review) {
            return res.status(404).json({ error: "Review not found." });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve review." });
    }
});

// Create new review
router.post("/", async (req, res) => {
    try {
        const { rating, koment, reviewUserID, reviewProductID } = req.body;
        const user = await User.findByPk(reviewUserID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const product = await Product.findByPk(reviewProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        const newReview = await Review.create({ rating, koment, reviewUserID, reviewProductID });
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ error: "Failed to create review." });
    }
});

// Update review by ID
router.put("/:reviewID", async (req, res) => {
    try {
        const { rating, koment, reviewUserID, reviewProductID } = req.body;
        const review = await Review.findByPk(req.params.reviewID);
        if (!review) {
            return res.status(404).json({ error: "Review not found." });
        }
        const product = await Product.findByPk(reviewProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await review.update({ rating, koment, reviewUserID, reviewProductID });
        res.json(review);
    } catch (error) {
        res.status(500).json({ error: "Failed to update review." });
    }
});

// Delete review by ID
router.delete("/:reviewID", async (req, res) => {
    try {
        const review = await Review.findByPk(req.params.reviewID);
        if (!review) {
            return res.status(404).json({ error: "Review not found." });
        }
        await review.destroy();
        res.json({ message: "Review deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete review." });
    }
});

module.exports = router;
