const express = require("express");
const router = express.Router();
const { ProductVariant, Product } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

// Get all productVariant
router.get("/", async (req, res) => {
    try {
        const productVariant = await ProductVariant.findAll({
            include: { model: Product }
        });
        console.log(productVariant);
        res.json(productVariant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to retrieve productVariant." });
    }
});

// Get productVariant by ID
router.get("/:productVariantID", async (req, res) => {
    try {
        const productVariant = await ProductVariant.findByPk(req.params.productVariantID, { include: Product });
        if (!productVariant) {
            return res.status(404).json({ error: "ProductVariant not found." });
        }
        res.json(productVariant);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve productVariant." });
    }
});

router.post("/", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { shade, numri, inStock, productVariantProductID } = req.body;

        const product = await Product.findByPk(productVariantProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        const newProductVariant = await ProductVariant.create({ shade, numri, inStock, productVariantProductID });
        res.status(201).json(newProductVariant);
    } catch (error) {
        res.status(500).json({ error: "Failed to create productVariant." });
    }
});

// Update productVariant by ID
router.put("/:productVariantID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { shade, numri, inStock, productVariantProductID } = req.body;
        const productVariant = await ProductVariant.findByPk(req.params.productVariantID);
        if (!productVariant) {
            return res.status(404).json({ error: "ProductVariant not found." });
        }
        const product = await Product.findByPk(productVariantProductID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await productVariant.update({ shade, numri, inStock, productVariantProductID });
        res.json(productVariant);
    } catch (error) {
        res.status(500).json({ error: "Failed to update productVariant." });
    }
});

// Delete productVariant by ID
router.delete("/:productVariantID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const productVariant = await ProductVariant.findByPk(req.params.productVariantID);
        if (!productVariant) {
            return res.status(404).json({ error: "ProductVariant not found." });
        }
        await productVariant.destroy();
        res.json({ message: "ProductVariant deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete productVariant." });
    }
});

module.exports = router;
