const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'change_me';

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'email, password and fullName are required' });
    }

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, is_admin',
      [email, hash, fullName]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const result = await pool.query('SELECT id, email, password_hash, full_name, is_admin FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name, is_admin: user.is_admin },
      SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, is_admin: user.is_admin },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
