const express = require("express");
const router = express.Router();
const { Category } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission'); 

// Get all categorys
router.get("/", async (req, res) => {
    try {
        const categorys = await Category.findAll();
        res.json(categorys);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve categorys." });
    }
});

// Get category by ID
router.get("/:categoryID", async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.categoryID);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve category." });
    }
});

// Create new category
router.post("/", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { emri } = req.body;
        const newCategory = await Category.create({ emri });
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(500).json({ error: "Failed to create category." });
    }
});

// Update category by ID
router.put("/:categoryID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const { emri } = req.body;
        const category = await Category.findByPk(req.params.categoryID);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }
        await category.update({ emri });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: "Failed to update category." });
    }
});

// Delete category by ID
router.delete("/:categoryID", auth, checkRole(["admin"]), async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.categoryID);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }
        await category.destroy();
        res.json({ message: "Category deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete category." });
    }
});

module.exports = router;
