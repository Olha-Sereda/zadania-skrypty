const express = require("express");
const pool = require("../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM categories ORDER BY id",
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id/products", async (req, res) => {
  try {
    const categoryId = Number(req.params.id);
    const result = await pool.query(
      `SELECT id, name, description, price, stock, category_id, image_url
       FROM products WHERE category_id = $1 ORDER BY id`,
      [categoryId],
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
