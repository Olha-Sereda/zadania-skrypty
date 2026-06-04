# Lviv Croissants — Flask API

Lekkie REST API w Flasku, które zwraca dane o daniach (skład, alergeny, cena).
Używane przez czatbota w `python-llm/chatbot.py` od zakresu **4.0**.

## Endpointy

| Metoda | Ścieżka            | Opis                                               |
| ------ | ------------------ | -------------------------------------------------- |
| `GET`  | `/api/dishes`      | Lista wszystkich dań                               |
| `GET`  | `/api/dishes/<id>` | Pojedyncze danie po ID                             |
| `GET`  | `/api/allergens`   | Lista wszystkich alergenów (posortowana, unikalna) |
| `POST` | `/api/estimate`    | Szacowany czas odbioru zamówienia (zakres 4.5)     |
| `GET`  | `/api/health`      | `{"status": "ok"}` — szybki test, że serwer żyje   |

## Uruchomienie

Zakładamy, że masz już aktywne `venv` z folderu `python-llm/`:

```bash
# z folderu python-llm/
source venv/bin/activate
pip install -r flask-api/requirements.txt

# w drugim oknie terminala (też z aktywnym venv) odpalasz Flaska:
cd flask-api
python app.py
```

Serwer wystartuje na `http://127.0.0.1:5000`.

## Szybki test (curl)

```bash
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/api/dishes | head
curl http://127.0.0.1:5000/api/dishes/1
curl http://127.0.0.1:5000/api/allergens

# Estymacja czasu odbioru (POST z listą ID dań):
curl -X POST http://127.0.0.1:5000/api/estimate \
     -H "Content-Type: application/json" \
     -d '{"item_ids":[6,11]}'
# → {"minutes": 13, "breakdown": "...", "item_count": 2}
```

### Formuła estymacji (`/api/estimate`)

```
minutes = max(prep_time_minutes wszystkich pozycji)
        + 2 * (liczba_pozycji - 1)
        + 5     # bufor kolejki
```

Stałe `QUEUE_BUFFER_MIN` i `PER_EXTRA_ITEM_MIN` siedzą na górze `app.py`,
jeśli chcesz dostroić model.

### Przykład odpowiedzi (`POST /api/estimate`)

```json
{
  "item_count": 2,
  "minutes": 13,
  "breakdown": "max prep (6 min) + extras for 1 item(s) (2 min) + queue buffer (5 min)"
}
```

## Edycja menu

Wszystkie dania trzymamy w `data.json` (lista obiektów). Pola każdego dania:

- `id` — liczba całkowita, unikalna
- `name` — nazwa wyświetlana
- `category` — kategoria (np. `"Drinks"`)
- `price` — cena (liczba, w PLN)
- `prep_time_minutes` — ile minut trwa przygotowanie pojedynczej sztuki
- `ingredients` — lista składników (string)
- `allergens` — lista alergenów (string, np. `"gluten"`, `"dairy"`)

Po edycji `data.json` Flask w trybie `debug=True` automatycznie się przeładuje.
