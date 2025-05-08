const express = require("express");
const router = express.Router();
const { Cart, User, Product } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

// Get all cart
router.get("/", async (req, res) => {
    try {
        const cart = await Cart.findAll({
            include: [
                { model: User },
                { model: Product }
            ]
        });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve cart." });
    }
});

// Get cart by ID
router.get("/:cartID", async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.cartID, { include: User, Product });
        if (!cart) {
            return res.status(404).json({ error: "Cart not found." });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve cart." });
    }
});

// Create new cart
router.post("/", async (req, res) => {
    try {
        const { sasia, cartUserID, cartProductID } = req.body;
        const user = await User.findByPk(cartUserID);
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        const product = await Product.findByPk(cartProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        const newCart = await Cart.create({ sasia, cartUserID, cartProductID });
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: "Failed to create cart." });
    }
});

// Update cart by ID
router.put("/:cartID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { sasia, cartUserID, cartProductID } = req.body;
        const cart = await Cart.findByPk(req.params.cartID);
        if (!cart) {
            return res.status(404).json({ error: "Cart not found." });
        }
        const product = await Product.findByPk(cartProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await cart.update({ sasia, cartUserID, cartProductID });
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: "Failed to update cart." });
    }
});

// Delete cart by ID
router.delete("/:cartID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const cart = await Cart.findByPk(req.params.cartID);
        if (!cart) {
            return res.status(404).json({ error: "Cart not found." });
        }
        await cart.destroy();
        res.json({ message: "Cart deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete cart." });
    }
});

module.exports = router;
