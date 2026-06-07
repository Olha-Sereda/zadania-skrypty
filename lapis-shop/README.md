# Zadanie 4 — REST API w Lua/Lapis (`lapis-shop`)

REST API małego sklepu (kategorie + produkty) zbudowane na frameworku
[Lapis](https://leafo.net/lapis/) (OpenResty + LuaJIT).

## Status realizacji progów

- ✅ **3.0** — Endpointy CRUD dla `categories` i `products` na listach
  (in‑memory w `ngx.shared.dict`), odpowiedzi w JSON.
- ✅ **3.5** — Modele oparte o `lapis.db.model` + migracje PostgreSQL,
  FK z `ON DELETE SET NULL`.
- ✅ **4.0** — Przepisane na MoonScript (`app.moon`, `migrations.moon`,
  `models/*.moon`); skompilowane do `.lua` przez `moonc` przy starcie kontenera.
- ⏳ **4.5** — Upload obrazów produktów (`POST /api/products/:id/image`),
  zapis w `static/uploads/`, zwrot URL w JSON.
- ⏳ **5.0** — 20 testów w [Busted](https://github.com/lunarmodules/busted).

## Uruchomienie — Docker (rekomendowane)

Wymagany tylko **Docker Desktop**. Wszystko inne (OpenResty, LuaJIT, LuaRocks,
Lapis, MoonScript, Busted, PostgreSQL) jedzie w kontenerach.

```bash
cd lapis-shop
docker compose up --build
```

- API: `http://127.0.0.1:8080`
- PostgreSQL: `127.0.0.1:5433` (`lapis_shop` / `lapis_shop` / db `lapis_shop`)

Po pierwszym `up` trzeba odpalić migracje:

```bash
docker compose exec app lapis migrate
```

Kod jest bind-mountowany do kontenera, więc edycja plików `.lua`/`.moon`
przeładowuje się automatycznie (`code_cache = "off"`).

Zatrzymanie i czyszczenie:

```bash
docker compose down          # zatrzymaj
docker compose down -v       # zatrzymaj + skasuj wolumeny (baza, uploady)
```

## Uruchomienie — lokalnie (alternatywa)

Jeśli wolisz bez Dockera:

```bash
brew install openresty/brew/openresty luarocks postgresql@16
luarocks install lapis lapis-console lua-cjson pgmoon moonscript busted
lapis server development
```

> **Uwaga:** na macOS Tahoe (arm64) instalacja OpenResty z brew wymaga
> aktualnego Xcode / Command Line Tools — stąd ścieżka z Dockerem jest
> wygodniejsza.

## Endpointy

| Metoda | URL                   | Opis                                           |
| ------ | --------------------- | ---------------------------------------------- |
| GET    | `/`                   | health‑check + lista endpointów                |
| GET    | `/api/categories`     | lista kategorii                                |
| POST   | `/api/categories`     | utwórz kategorię (body JSON: `{name}`)         |
| GET    | `/api/categories/:id` | pobierz kategorię                              |
| PUT    | `/api/categories/:id` | aktualizuj kategorię                           |
| DELETE | `/api/categories/:id` | usuń kategorię                                 |
| GET    | `/api/products`       | lista produktów (opcj. `?category_id=`)        |
| POST   | `/api/products`       | utwórz produkt (`{name, price, category_id?}`) |
| GET    | `/api/products/:id`   | pobierz produkt                                |
| PUT    | `/api/products/:id`   | aktualizuj produkt                             |
| DELETE | `/api/products/:id`   | usuń produkt                                   |

### Przykładowe wywołania

```bash
# utwórz kategorię → {"id":1,"name":"Napoje"}
curl -s -X POST http://127.0.0.1:8080/api/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Napoje"}'

# lista kategorii → [{"id":1,"name":"Napoje"}]
curl -s http://127.0.0.1:8080/api/categories

# utwórz produkt w tej kategorii
curl -s -X POST http://127.0.0.1:8080/api/products \
  -H 'Content-Type: application/json' \
  -d '{"name":"Cola","price":7.99,"category_id":1}'

# filtrowanie produktów po kategorii
curl -s 'http://127.0.0.1:8080/api/products?category_id=1'

# aktualizuj produkt
curl -s -X PUT http://127.0.0.1:8080/api/products/1 \
  -H 'Content-Type: application/json' \
  -d '{"price":8.49}'

# usuń produkt (HTTP 204)
curl -s -X DELETE http://127.0.0.1:8080/api/products/1
```

> **Uwaga (3.0):** stan jest trzymany w `ngx.shared.dict` (pamięć
> dzielona OpenResty), więc `docker compose restart app` resetuje listę.
> Od etapu 3.5 dane przechodzą do PostgreSQL (przez `lapis.db.model`).

## Struktura projektu

```
lapis-shop/
├── app.moon                      # router + handlery (MoonScript, od 4.0)
├── migrations.moon               # migracje DB (MoonScript, od 4.0)
├── models/
│   ├── Category.moon             # model kategorii (lapis.db.model)
│   └── Product.moon              # model produktu
├── config.lua                    # konfiguracja środowisk Lapis (env-aware)
├── nginx.conf                    # konfiguracja OpenResty
├── mime.types
├── lapis-shop-dev-1.rockspec
├── Dockerfile                    # OpenResty + lapis + busted + moonscript
├── docker-compose.yml            # app + postgres
├── logs/                         # nginx.pid, error.log (ignorowane)
└── static/uploads/               # docelowe miejsce zapisu obrazów (4.5)
```

> **Uwaga (4.0):** Pliki `*.lua` generowane przez `moonc` są w `.gitignore`.
> Kompilacja odbywa się automatycznie przy starcie kontenera Docker.
