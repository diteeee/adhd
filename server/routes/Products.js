const express = require("express");
const router = express.Router();
const { Product, Category } = require("../models");

// Get all product
router.get("/", async (req, res) => {
    try {
        const product = await Product.findAll({ include: Category });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve product." });
    }
});

// Get product by ID
router.get("/:productID", async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.productID, { include: Category });
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve product." });
    }
});

// Create new product
router.post("/", async (req, res) => {
    try {
        const { emri, pershkrimi, firma, cmimi, imageURL, productCategoryID } = req.body;
        const category = await Category.findByPk(productCategoryID);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }
        const newProduct = await Product.create({ emri, pershkrimi, firma, cmimi, imageURL, productCategoryID });
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Failed to create product." });
    }
});

// Update product by ID
router.put("/:productID", async (req, res) => {
    try {
        const { emri, pershkrimi, firma, cmimi, imageURL, productCategoryID } = req.body;
        const product = await Product.findByPk(req.params.productID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await product.update({ emri, pershkrimi, firma, cmimi, imageURL, productCategoryID });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Failed to update product." });
    }
});

// Delete product by ID
router.delete("/:productID", async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.productID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await product.destroy();
        res.json({ message: "Product deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete product." });
    }
});

module.exports = router;
