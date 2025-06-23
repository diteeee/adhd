const express = require("express");
const router = express.Router();
const { Brand } = require("../models");
const auth = require('../middleware/auth');
const checkRole = require('../middleware/permission');

// Get all brands
router.get("/", async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve brands." });
  }
});

// Get brand by ID
router.get("/:brandID", async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.brandID);
    if (!brand) return res.status(404).json({ error: "Brand not found." });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve brand." });
  }
});

// Create new brand (admin only)
router.post("/", auth, checkRole(["admin"]), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Brand name is required." });

  try {
    const [brand, created] = await Brand.findOrCreate({ where: { name } });
    if (!created) return res.status(409).json({ error: "Brand already exists." });
    res.status(201).json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to create brand." });
  }
});

// Update brand by ID (admin only)
router.put("/:brandID", auth, checkRole(["admin"]), async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Brand name is required." });

  try {
    const brand = await Brand.findByPk(req.params.brandID);
    if (!brand) return res.status(404).json({ error: "Brand not found." });

    await brand.update({ name });
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: "Failed to update brand." });
  }
});

// Delete brand by ID (admin only)
router.delete("/:brandID", auth, checkRole(["admin"]), async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.brandID);
    if (!brand) return res.status(404).json({ error: "Brand not found." });

    await brand.destroy();
    res.json({ message: "Brand deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete brand." });
  }
});

module.exports = router;
