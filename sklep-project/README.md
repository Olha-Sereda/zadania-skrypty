# Sklep React + Node

Prosty sklep internetowy z REST API.

## Technologie

- **Frontend:** React 19, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Node.js, Express 5, PostgreSQL, JWT, bcrypt
- **Baza danych:** PostgreSQL 16 (Docker)
- **Platnosci:** Stripe (sandbox)

## Uruchomienie

### 1. Baza danych

```bash
docker compose up -d
```

### 2. Serwer (port 4000)

```bash
cd server
cp .env.example .env
npm install
npm run db:init
npm run dev
```

### 3. Klient (port 5173)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Aplikacja dostepna pod: http://localhost:5173

## API Endpoints

| Method | Path                           | Description                 |
| ------ | ------------------------------ | --------------------------- |
| GET    | `/api/health`                  | Health check                |
| POST   | `/api/auth/register`           | Register                    |
| POST   | `/api/auth/login`              | Login (returns JWT)         |
| GET    | `/api/categories`              | List categories             |
| GET    | `/api/categories/:id/products` | Products by category        |
| GET    | `/api/products`                | List products               |
| GET    | `/api/products/:id`            | Product by ID               |
| POST   | `/api/products`                | Create product (admin)      |
| PUT    | `/api/products/:id`            | Update product (admin)      |
| DELETE | `/api/products/:id`            | Delete product (admin)      |
| GET    | `/api/cart`                    | User cart                   |
| POST   | `/api/cart`                    | Add to cart                 |
| PUT    | `/api/cart/:id`                | Update quantity             |
| DELETE | `/api/cart/:id`                | Remove from cart            |
| DELETE | `/api/cart`                    | Clear cart                  |
| GET    | `/api/orders`                  | User orders                 |
| GET    | `/api/orders/:id`              | Order details               |
| POST   | `/api/orders`                  | Place order                 |
| POST   | `/api/payments/create-intent`  | Create Stripe PaymentIntent |

## Features

- **3.0** Basic Express endpoints (products, categories)
- **3.5** PostgreSQL database persistence
- **4.0** Axios for API calls in React
- **4.5** Cart & payment via React Hooks
- **5.0** CORS configuration (server + client proxy)

## CORS

- **Server:** `cors` middleware with allowed origin from `CLIENT_URL` env var
- **Client:** Vite proxy `/api` → `http://localhost:4000` (dev), Axios `withCredentials`

## Stripe (sandbox)

> **Note:** The `.env.example` files contain real Stripe **test/sandbox** keys so the reviewer can test payments without creating a Stripe account. These keys only work in test mode and cannot process real payments. Just copy `.env.example` to `.env` in both `server/` and `client/`.

1. Test card: `4242 4242 4242 4242`, any future date, any CVC, any Zip code (5 numbers)
