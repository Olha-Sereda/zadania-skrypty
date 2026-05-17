const express = require('express');

const router = express.Router();

let products = [
  { id: 1, name: 'Sluchawki Pro', description: 'Bezprzewodowe sluchawki z ANC', price: 299.99, stock: 20, category_id: 1, image_url: '' },
  { id: 2, name: 'Node.js dla kazdego', description: 'Praktyczny przewodnik po Node.js', price: 89.99, stock: 50, category_id: 2, image_url: '' },
  { id: 3, name: 'Lampa biurkowa', description: 'Nowoczesna lampa LED', price: 129.00, stock: 35, category_id: 3, image_url: '' },
];
let nextId = 4;

router.get('/', (req, res) => {
  const { categoryId } = req.query;
  const result = categoryId
    ? products.filter((p) => p.category_id === Number(categoryId))
    : products;
  return res.json(result);
});

router.get('/:id', (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id));
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  return res.json(product);
});

router.post('/', (req, res) => {
  const { name, description, price, stock, categoryId, imageUrl } = req.body;
  if (!name || price == null || stock == null) {
    return res.status(400).json({ message: 'name, price and stock are required' });
  }
  const product = {
    id: nextId++,
    name,
    description: description || '',
    price,
    stock,
    category_id: categoryId || null,
    image_url: imageUrl || '',
  };
  products.push(product);
  return res.status(201).json(product);
});

router.put('/:id', (req, res) => {
  const idx = products.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  const { name, description, price, stock, categoryId, imageUrl } = req.body;
  products[idx] = {
    ...products[idx],
    name,
    description: description || '',
    price,
    stock,
    category_id: categoryId || null,
    image_url: imageUrl || '',
  };
  return res.json(products[idx]);
});

router.delete('/:id', (req, res) => {
  const idx = products.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  products.splice(idx, 1);
  return res.json({ message: 'Product deleted' });
});

module.exports = router;
