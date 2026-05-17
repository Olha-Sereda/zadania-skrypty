const express = require("express");
const pool = require("../config/db");
const { authRequired, adminRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { categoryId } = req.query;

    const query = categoryId
      ? {
          text: `SELECT p.id, p.name, p.description, p.price, p.stock, p.category_id, c.name AS category_name, p.image_url
                 FROM products p
                 LEFT JOIN categories c ON c.id = p.category_id
                 WHERE p.category_id = $1
                 ORDER BY p.id`,
          values: [Number(categoryId)],
        }
      : {
          text: `SELECT p.id, p.name, p.description, p.price, p.stock, p.category_id, c.name AS category_name, p.image_url
                 FROM products p
                 LEFT JOIN categories c ON c.id = p.category_id
                 ORDER BY p.id`,
          values: [],
        };

    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.price, p.stock, p.category_id, c.name AS category_name, p.image_url
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1`,
      [productId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/", authRequired, adminRequired, async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    if (!name || price == null || stock == null) {
      return res
        .status(400)
        .json({ message: "name, price and stock are required" });
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, category_id, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, price, stock, category_id, image_url`,
      [
        name,
        description || "",
        price,
        stock,
        categoryId || null,
        imageUrl || "",
      ],
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:id", authRequired, adminRequired, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock = $4, category_id = $5, image_url = $6
       WHERE id = $7
       RETURNING id, name, description, price, stock, category_id, image_url`,
      [
        name,
        description || "",
        price,
        stock,
        categoryId || null,
        imageUrl || "",
        productId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", authRequired, adminRequired, async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING id",
      [productId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
