const express = require("express");
const router = express.Router();
const { Product, Category, ProductVariant } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission');

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({ include: Category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products." });
  }
});

// Get products by category ID
router.get("/category/:categoryID", async (req, res) => {
  try {
    const { categoryID } = req.params;

    const products = await Product.findAll({
      where: { productCategoryID: categoryID },
      include: Category,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products by category." });
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
router.post("/", auth, checkRole(["admin"]), async (req, res) => {
  const { emri, pershkrimi, firma, cmimi, productCategoryID, imageURL, variants } = req.body;

  try {
    const category = await Category.findByPk(productCategoryID);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    const newProduct = await Product.create({ emri, pershkrimi, firma, cmimi, imageURL, productCategoryID });

    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await ProductVariant.create({
          ...variant,
          productVariantProductID: newProduct.productID, // Link variant to product
        });
      }
    }

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create product with variants." });
  }
});

// Update product by ID
router.put("/:productID", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const { emri, pershkrimi, firma, cmimi, productCategoryID, imageURL, variants } = req.body;

    const product = await Product.findByPk(req.params.productID);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    const category = await Category.findByPk(productCategoryID);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Update main product fields
    await product.update({ emri, pershkrimi, firma, cmimi, imageURL, productCategoryID });

    // Add new variants if provided
    if (variants && Array.isArray(variants)) {
      // Filter variants without an ID (assuming new variants have no productVariantID)
      const newVariants = variants.filter(variant => !variant.productVariantID);

      // Create new variants
      for (const variant of newVariants) {
        await ProductVariant.create({
          ...variant,
          productVariantProductID: product.productID,
        });
      }
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update product." });
  }
});

// Delete product by ID
router.delete("/:productID", auth, checkRole(["admin"]), async (req, res) => {
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
