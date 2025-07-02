module.exports = (io) => {
    const express = require("express");
    const router = express.Router();
    const { Cart, User, Product, ProductVariant, Brand } = require("../models");
    const auth = require('../middleware/auth');
    const checkRole = require('../middleware/permission'); 
    const Notification = require("../models/Notifications");

    // Get all cart
    router.get("/", async (req, res) => {
        try {
            const cart = await Cart.findAll({
                include: [
                    { model: User },
                    { 
                        model: ProductVariant,
                        include: [
                            {
                                model: Product,
                                include: [Brand],
                            },
                        ]
                    }
                ]
            });
            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve cart." });
        }
    });

    // Get cart items by userID
    router.get("/user/:userID", async (req, res) => {
    try {
        const userID = req.params.userID;
        const cartItems = await Cart.findAll({
        where: { cartUserID: userID },
        include: [
                {
                    model: ProductVariant,
                    include: [
                        {
                            model: Product,
                            include: [Brand], // Include Brand
                        },
                    ],
                }
            ]
        });
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve cart items." });
    }
    });

    // Get cart by ID
    router.get("/:cartID", async (req, res) => {
        try {
            const cart = await Cart.findByPk(req.params.cartID, {
                include: [
                    { model: User },
                    { 
                        model: ProductVariant,
                        include: [Product]
                    }
                ]
            });
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
            const { sasia, cartUserID, cartProductVariantID } = req.body;

            console.log("Request body:", req.body);

            const user = await User.findByPk(cartUserID);
            if (!user) {
                return res.status(404).json({ error: "User not found." });
            }

            const productVariant = await ProductVariant.findByPk(cartProductVariantID, {
                include: [Product]
            });

            if (!productVariant) {
                return res.status(404).json({ error: "ProductVariant not found." });
            }

            if (!productVariant.Product) {
                return res.status(404).json({ error: "Associated Product not found." });
            }

            const newCart = await Cart.create({ sasia, cartUserID, cartProductVariantID });

            const mesazhi = "Product added to cart!";

                const notification = await Notification.create({
                    notificationUserID: cartUserID,
                    mesazhi,
                });

            io.to(cartUserID).emit("newNotification", notification);
            res.status(201).json(newCart);
        } catch (error) {
            console.error("Create Cart Error:", error);
            res.status(500).json({ error: "Failed to create cart." });
        }
    });

    // Update cart by ID
    router.put("/:cartID", async (req, res) => {
        const { cartID } = req.params;
        const { sasia } = req.body;

        try {
            await Cart.update({ sasia }, { where: { cartID: cartID } });
            res.status(200).json({ message: 'Quantity updated successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update quantity' });
        }
    });

    // Delete cart by ID
    router.delete("/:cartID", async (req, res) => {
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
  return router;
};