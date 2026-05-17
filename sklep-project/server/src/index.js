const express = require('express');
const dotenv = require('dotenv');
const productRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/products', productRoutes);
app.use('/api/categories', categoriesRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
