const express = require("express");
const router = express.Router();
const { Product, Category, ProductVariant, Brand } = require("../models"); // added Brand import
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission');
const { Op } = require("sequelize");
const sequelize = require("../models").sequelize; // Ensure sequelize is imported

// Get all products (include Category and Brand)
router.get("/", async (req, res) => {
  const { category, brand, search } = req.query;

  // Base filter
  const where = {};

  if (category) {
    where.productCategoryID = category;
  }
  if (brand) {
    where.brandID = brand;
  }

  if (search) {
    where[Op.or] = [
      { emri: { [Op.like]: `%${search}%` } },           // product name
      { '$Brand.name$': { [Op.like]: `%${search}%` } }, // brand name
      { '$Category.emri$': { [Op.like]: `%${search}%` } }, // category name
    ];
  }

  try {
    const products = await Product.findAll({
      where,
      include: [
        { model: Category, attributes: ["categoryID", "emri"] },
        { model: Brand, attributes: ["brandID", "name"] },
      ],
    });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
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

// Get products by brand ID
router.get("/brand/:brandID", async (req, res) => {
  try {
    const { brandID } = req.params;
    const products = await Product.findAll({
      where: { brandID: brandID },
      include: [Category, Brand],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products by brand." });
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

//update
router.put("/:productID", auth, checkRole(["admin"]), async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { emri, pershkrimi, brandID, cmimi, productCategoryID, imageURL, variants } = req.body;

    // Find the product
    const product = await Product.findByPk(req.params.productID, { transaction });
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Update product details
    await product.update(
      { emri, pershkrimi, brandID, cmimi, imageURL, productCategoryID },
      { transaction }
    );

    // Handle product variants
    if (Array.isArray(variants)) {
      const existingVariantIDs = variants.map((v) => v.productVariantID).filter(Boolean);

      // Remove variants that are not in the request
      await ProductVariant.destroy({
        where: {
          productVariantProductID: product.productID,
          productVariantID: { [Op.notIn]: existingVariantIDs },
        },
        transaction,
      });

      // Add or update variants
      for (const variant of variants) {
        if (variant.productVariantID) {
          // Update existing variant
          await ProductVariant.update(
            {
              shade: variant.shade,
              numri: variant.numri,
              inStock: variant.inStock,
            },
            {
              where: { productVariantID: variant.productVariantID },
              transaction,
            }
          );
        } else {
          // Create new variant
          await ProductVariant.create(
            {
              ...variant,
              productVariantProductID: product.productID,
            },
            { transaction }
          );
        }
      }
    }

    await transaction.commit();
    res.json({ message: "Product and variants updated successfully." });
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating product:", error);
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
