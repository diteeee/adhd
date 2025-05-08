const express = require("express");
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { Product, Category } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
});

// Get all product
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
router.post("/", upload.single('img'), auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { emri, pershkrimi, firma, cmimi, productCategoryID } = req.body;
        const imageURL = req.file ? req.file.path : '';

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
router.put("/:productID", upload.single('img'), auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { emri, pershkrimi, firma, cmimi, productCategoryID } = req.body;
        const product = await Product.findByPk(req.params.productID);
        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }

        const imageURL = req.file ? req.file.path : product.imageUrl;

        await product.update({ emri, pershkrimi, firma, cmimi, imageURL, productCategoryID });
        res.json(product);
    } catch (error) {
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
