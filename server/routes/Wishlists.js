const express = require('express');
const Wishlist = require('../models/Wishlists');
const { User, Product } = require('../models');
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

        if (!wishlist || wishlist.length === 0) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        const user = await User.findByPk(req.params.userID);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const productPromises = wishlist.map((item) =>
            Product.findByPk(item.productID)
        );
        const products = await Promise.all(productPromises);

        const wishlistWithDetails = wishlist.map((item, index) => ({
            wishlistID: item._id,
            userID: item.userID,
            userEmri: user.emri,
            productID: item.productID,
            productEmri: products[index]?.emri,
        }));

        res.status(200).json(wishlistWithDetails);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});


//delete
router.delete('/:wishlistID', async (req, res) => {
    const { wishlistID } = req.params;
  
    try {
      const result = await Wishlist.deleteOne({ _id: wishlistID });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Wishlist item not found' });
      }
  
      res.status(200).json({ message: 'Item removed from wishlist' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove item from wishlist' });
    }
  });  


module.exports = router;
