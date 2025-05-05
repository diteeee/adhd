const express = require('express');
const { User, Product } = require('../models'); // Sequelize models for User and Product
const Review = require('../models/Reviews'); // MongoDB Review model
const router = express.Router();
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

//create
router.post('/', async (req, res) => {
    const { reviewUserID, reviewProductID, rating, koment } = req.body;

    try {
        const user = await User.findByPk(reviewUserID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const product = await Product.findByPk(reviewProductID);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const review = new Review({
            reviewUserID,
            reviewProductID,
            rating,
            koment
        });

        await review.save();
        res.status(201).json(review);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create review' });
    }
});

//get all reviews for a specific product
router.get('/product/:productID', async (req, res) => {
    const { productID } = req.params;

    try {
        const reviews = await Review.find({ reviewProductID: productID });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this product' });
        }

        const product = await Product.findByPk(productID);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const userPromises = reviews.map((review) =>
            User.findByPk(review.reviewUserID)
        );
        const users = await Promise.all(userPromises);

        const reviewsWithDetails = reviews.map((review, index) => ({
            reviewID: review._id,
            reviewUserID: review.reviewUserID,
            userName: users[index]?.emri,
            reviewProductID: review.reviewProductID,
            productName: product.emri,
            rating: review.rating,
            koment: review.koment
        }));

        res.status(200).json(reviewsWithDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

//get all reviews by a specific user
router.get('/user/:userID', auth, checkRole(["admin"]), async (req, res) => {
    const { userID } = req.params;

    try {
        const reviews = await Review.find({ reviewUserID: userID });

        if (!reviews || reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this user' });
        }

        const user = await User.findByPk(userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const productPromises = reviews.map((review) =>
            Product.findByPk(review.reviewProductID)
        );
        const products = await Promise.all(productPromises);

        const reviewsWithDetails = reviews.map((review, index) => ({
            reviewID: review._id,
            reviewUserID: review.reviewUserID,
            userName: user.emri,
            reviewProductID: review.reviewProductID,
            productName: products[index]?.emri,
            rating: review.rating,
            koment: review.koment
        }));

        res.status(200).json(reviewsWithDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user reviews' });
    }
});

//delete
router.delete('/:reviewID', auth, checkRole(["admin"]), async (req, res) => {
    const { reviewID } = req.params;

    try {
        const review = await Review.findByIdAndDelete(reviewID);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.status(200).json({ message: 'Review deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

module.exports = router;
