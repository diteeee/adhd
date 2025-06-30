const express = require('express');
const { User, Product } = require('../models');
const Review = require('../models/Reviews');
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

//get all
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find();

    if (!reviews.length) {
      return res.status(404).json({ message: "No reviews found." });
    }

    // Filter out reviews missing userID or productID to be safe
    const filteredReviews = reviews.filter(r => r.reviewUserID && r.reviewProductID);

    const userIDs = [...new Set(filteredReviews.map(r => r.reviewUserID.toString()))];
    const productIDs = [...new Set(filteredReviews.map(r => r.reviewProductID.toString()))];

    const users = await User.findAll({
      where: { userID: userIDs },
      attributes: ['userID', 'emri', 'mbiemri'],
    });

    const products = await Product.findAll({
      where: { productID: productIDs },
      attributes: ['productID', 'emri'],
    });

    const userMap = new Map(users.map(u => [u.userID.toString(), u]));
    const productMap = new Map(products.map(p => [p.productID.toString(), p]));

    const enrichedReviews = reviews.map(review => {
      const userId = review.reviewUserID ? review.reviewUserID.toString() : null;
      const productId = review.reviewProductID ? review.reviewProductID.toString() : null;

      return {
        ...review.toObject(),
        user: userId ? userMap.get(userId) || null : null,
        product: productId ? productMap.get(productId) || null : null,
      };
    });

    const ratingDistribution = [0, 0, 0, 0, 0];
    enrichedReviews.forEach(({ rating }) => {
      const r = Number(rating);
      if (r >= 1 && r <= 5) ratingDistribution[r - 1]++;
    });

    const validRatings = enrichedReviews
      .map(r => Number(r.rating))
      .filter(r => !isNaN(r) && r >= 1 && r <= 5);

    const totalReviews = validRatings.length;
    const averageRating = totalReviews
      ? validRatings.reduce((sum, r) => sum + r, 0) / totalReviews
      : 0;

    res.status(200).json({
      reviews: enrichedReviews,
      totalReviews,
      averageRating: averageRating.toFixed(2),
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
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
            reviewProductID: review.reviewProductID,
            userName: users[index]?.emri,
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
router.delete('/:reviewID', auth, async (req, res) => {
  const { reviewID } = req.params;

  try {
    const review = await Review.findById(reviewID);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Allow if user owns the review or is admin
    if (review.reviewUserID !== req.user.userID && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this review.' });
    }

    await Review.findByIdAndDelete(reviewID);
    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
});

module.exports = router;
