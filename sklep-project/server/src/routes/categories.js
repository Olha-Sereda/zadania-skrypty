const express = require('express');

const router = express.Router();

const categories = [
  { id: 1, name: 'Elektronika' },
  { id: 2, name: 'Ksiazki' },
  { id: 3, name: 'Dom' },
];

const products = [
  { id: 1, name: 'Sluchawki Pro', description: 'Bezprzewodowe sluchawki z ANC', price: 299.99, stock: 20, category_id: 1, image_url: '' },
  { id: 2, name: 'Node.js dla kazdego', description: 'Praktyczny przewodnik po Node.js', price: 89.99, stock: 50, category_id: 2, image_url: '' },
  { id: 3, name: 'Lampa biurkowa', description: 'Nowoczesna lampa LED', price: 129.00, stock: 35, category_id: 3, image_url: '' },
];

router.get('/', (req, res) => {
  return res.json(categories);
});

router.get('/:id/products', (req, res) => {
  const categoryId = Number(req.params.id);
  const result = products.filter((p) => p.category_id === categoryId);
  return res.json(result);
});

module.exports = router;
