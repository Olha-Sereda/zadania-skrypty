# Lviv Croissants — Flask API

Lekkie REST API w Flasku, które zwraca dane o daniach (skład, alergeny, cena).
Używane przez czatbota w `python-llm/chatbot.py` od zakresu **4.0**.

## Endpointy

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/api/dishes` | Lista wszystkich dań |
| `GET` | `/api/dishes/<id>` | Pojedyncze danie po ID |
| `GET` | `/api/allergens` | Lista wszystkich alergenów (posortowana, unikalna) |
| `GET` | `/api/health` | `{"status": "ok"}` — szybki test, że serwer żyje |

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
```

## Edycja menu

Wszystkie dania trzymamy w `data.json` (lista obiektów). Pola każdego dania:

- `id` — liczba całkowita, unikalna
- `name` — nazwa wyświetlana
- `category` — kategoria (np. `"Drinks"`)
- `price` — cena (liczba, w PLN)
- `ingredients` — lista składników (string)
- `allergens` — lista alergenów (string, np. `"gluten"`, `"dairy"`)

Po edycji `data.json` Flask w trybie `debug=True` automatycznie się przeładuje.
