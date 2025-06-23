const express = require("express");
const router = express.Router();
const { Product, Category, ProductVariant, Brand } = require("../models"); // added Brand import
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission');

// Get all products (include Category and Brand)
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({ include: [Category, Brand] });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products." });
  }
});

// Get products by category ID (include Category and Brand)
router.get("/category/:categoryID", async (req, res) => {
  try {
    const { categoryID } = req.params;
    const products = await Product.findAll({
      where: { productCategoryID: categoryID },
      include: [Category, Brand],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products by category." });
  }
});

// Get product by ID (include Category and Brand)
router.get("/:productID", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.productID, { include: [Category, Brand] });
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
  const { emri, pershkrimi, brandID, cmimi, productCategoryID, imageURL, variants } = req.body;

  try {
    // Verify category exists
    const category = await Category.findByPk(productCategoryID);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Verify brand exists
    const brand = await Brand.findByPk(brandID);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found." });
    }

    const newProduct = await Product.create({
      emri,
      pershkrimi,
      brandID,
      cmimi,
      imageURL,
      productCategoryID,
    });

    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        await ProductVariant.create({
          ...variant,
          productVariantProductID: newProduct.productID,
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
    const { emri, pershkrimi, brandID, cmimi, productCategoryID, imageURL, variants } = req.body;

    const product = await Product.findByPk(req.params.productID);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Verify category exists
    const category = await Category.findByPk(productCategoryID);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Verify brand exists
    const brand = await Brand.findByPk(brandID);
    if (!brand) {
      return res.status(404).json({ error: "Brand not found." });
    }

    // Update main product fields
    await product.update({
      emri,
      pershkrimi,
      brandID,
      cmimi,
      imageURL,
      productCategoryID,
    });

    // Add new variants if provided
    if (variants && Array.isArray(variants)) {
      const newVariants = variants.filter(variant => !variant.productVariantID);
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
