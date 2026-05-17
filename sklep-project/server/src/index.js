const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const productRoutes = require("./routes/products");
const initDb = require("./scripts/initDbRuntime");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productRoutes);

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error.message);
    process.exit(1);
  });
