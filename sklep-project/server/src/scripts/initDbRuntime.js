const pool = require('../config/db');

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        price NUMERIC(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        category_id INTEGER REFERENCES categories(id),
        image_url TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL DEFAULT 1,
        UNIQUE(user_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        total NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'paid',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        product_id INTEGER NOT NULL REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL
      );
    `);

    const catCount = await client.query('SELECT count(*) FROM categories');
    if (Number(catCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO categories (name) VALUES ('Elektronika'), ('Ksiazki'), ('Dom');
      `);
    }

    const prodCount = await client.query('SELECT count(*) FROM products');
    if (Number(prodCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO products (name, description, price, stock, category_id) VALUES
          ('Sluchawki Pro', 'Bezprzewodowe sluchawki z ANC', 299.99, 20, 1),
          ('Node.js dla kazdego', 'Praktyczny przewodnik po Node.js', 89.99, 50, 2),
          ('Lampa biurkowa', 'Nowoczesna lampa LED', 129.00, 35, 3);
      `);
    }

    console.log('Database tables ready');
  } finally {
    client.release();
  }
}

module.exports = initDb;
