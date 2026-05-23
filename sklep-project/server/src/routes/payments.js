const express = require('express');
const Stripe = require('stripe');
const { authRequired } = require('../middleware/auth');
const pool = require('../config/db');

const router = express.Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

router.post('/create-intent', authRequired, async (req, res) => {
  try {
    const cartResult = await pool.query(
      `SELECT ci.product_id, ci.quantity, p.price
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const total = cartResult.rows.reduce(
      (sum, r) => sum + Number(r.price) * r.quantity,
      0
    );

    const amountInCents = Math.round(total * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'pln',
      metadata: { userId: String(req.user.id) },
    });

    return res.json({
      clientSecret: paymentIntent.client_secret,
      amount: total,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
