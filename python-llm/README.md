# Zadanie 3 — Python LLM Chatbot

Czatbot kawiarni "Lviv Croissants" oparty o **lokalny** model językowy
(Ollama + `llama3.2`) i klienta Pythona `ollama`.

## Status zakresów

- ✅ **3.0** — Czatbot rozpoznaje 3 intencje (powitanie, menu, zamówienie),
  każdą w co najmniej 3 sformułowaniach. Cała "wiedza" pochodzi z promptu
  systemowego — bez sztywnych regułek.
- ✅ **3.5** — godziny otwarcia ładowane z `config.yaml` i wstrzykiwane do
  promptu systemowego przy starcie. (Menu było w YAML-u; w 4.0 przeniesione do API.)
- ✅ **4.0** — dane o daniach (skład, alergeny, ceny) ciągnięte z lokalnego
  API Flaska. Czatbot odpowiada na pytania o alergeny i akceptuje modyfikacje
  zamówienia ("bez sera", "z mlekiem owsianym").
- ✅ **4.5** — czatbot szacuje i informuje o czasie odbioru zamówienia.
  Każde danie ma `prep_time_minutes`; nowy endpoint `POST /api/estimate`
  zwraca minuty wg wzoru `max(prep) + 2*(n-1) + 5`.
- ⏳ 5.0 — adres dostawy + zapis zamówienia w bazie przez Flask.

---

## Wymagania (jednorazowo)

### 1. Python 3.10+

Na macOS najprościej:

```bash
brew install python@3.12
```

Sprawdź:

```bash
python3 --version
```

### 2. Ollama (lokalny serwer modelu)

Ollama to mała aplikacja, która "trzyma" model językowy na Twoim komputerze
i wystawia go pod lokalnym API. Bez tego czatbot nie zadziała.

```bash
brew install ollama
```

Uruchom serwer Ollamy (zostawiasz w tle, w osobnym oknie terminala lub jako
serwis systemowy):

```bash
ollama serve
```

Pobierz model `llama3.2` (~2 GB, jednorazowo):

```bash
ollama pull llama3.2
```

Szybki test, czy Ollama gada:

```bash
ollama run llama3.2 "Powiedz cześć po polsku"
```

---

## Instalacja projektu

> Wszystkie polecenia wykonujemy z folderu `python-llm/`.

### 1. Utwórz wirtualne środowisko (`venv`)

`venv` to izolowane środowisko Pythona dla tego projektu — pakiety
nie wyciekają do globalnego Pythona w systemie.

```bash
python3 -m venv venv
```

### 2. Aktywuj `venv`

```bash
source venv/bin/activate
```

Po aktywacji w terminalu pojawi się prefix `(venv)`. Aby wyjść: `deactivate`.

### 3. Zainstaluj zależności

```bash
pip install -r requirements.txt
```

W `requirements.txt` są wszystkie pakiety potrzebne **zarówno czatbotowi, jak
i Flaskowi** (jedno wspólne `venv`).

---

## Uruchomienie (potrzebujesz **dwóch** terminałi)

Od zakresu 4.0 czatbot ciągnie dane o daniach z lokalnego API Flaska, więc
oba serwery muszą działać jednocześnie.

### Terminal 1 — Ollama

```bash
ollama serve
```

### Terminal 2 — Flask API

```bash
cd python-llm
source venv/bin/activate
cd flask-api
python app.py            # http://127.0.0.1:5000
```

### Terminal 3 — Czatbot

```bash
cd python-llm
source venv/bin/activate
python chatbot.py
```

Przykładowa rozmowa (zakres 4.0):

```
You: Hello
Bot: Hi! Welcome to Lviv Croissants. Would you like to see the menu or place an order?

You: Does the chicken Caesar croissant contain gluten?
Bot: Yes, it contains gluten. Listed allergens: gluten, dairy, eggs, fish.

You: I'll take it without sauce, plus a latte with oat milk
Bot: Order confirmed:
  - Chicken Caesar croissant (no Caesar dressing) — 23 PLN
  - Latte (oat milk) — 15 PLN
  Total: 38 PLN.
  Your order will be ready for pickup in about 13 minutes.

You: How long for just a lemonade?
Bot: A lemonade takes about 2 minutes to prepare.
```

Zakończenie rozmowy: `exit` lub `Ctrl+C`.

---

## Jak to działa

### Zakres 3.0 — prompt systemowy

Cała "inteligencja" rozpoznawania intencji siedzi w stałej `PROMPT_TEMPLATE`
w pliku `chatbot.py`. Tam:

1. mówimy modelowi, **kim jest** (asystent kawiarni),
2. wymieniamy **3 intencje** wraz z przykładami sformułowań,
3. wstrzykujemy **menu i godziny otwarcia** z pliku konfiguracyjnego.

Każda wiadomość użytkownika trafia do listy `history`, którą wysyłamy w całości
do modelu — dzięki temu rozmowa "pamięta" wcześniejsze wypowiedzi.

### Zakres 3.5 — konfiguracja w `config.yaml`

Dane statyczne kawiarni (nazwa, godziny otwarcia, waluta, URL API) trzymamy
w `config.yaml`. Funkcja `load_config()` czyta plik, a `build_system_prompt()`
wstrzykuje godziny otwarcia do szablonu promptu.

### Zakres 4.0 — dania z API Flaska

Dane dynamiczne (dania, składniki, alergeny, ceny) dostały własny serwis:
**Flask API** w `flask-api/`. Plik `flask-api/data.json` to baza danych
(jeszcze plikowa — w 5.0 podmienimy na prawdziwą bazę).

Przepływ przy starcie czatbota:

1. `chatbot.py` czyta `config.yaml` (URL API + godziny otwarcia).
2. Wykonuje `GET http://127.0.0.1:5000/api/dishes` (przez `requests`).
3. Buduje prompt systemowy ze szczegółami każdego dania:

   ```
   - Chicken Caesar croissant — 23 PLN
       ingredients: croissant dough, grilled chicken, romaine lettuce, parmesan, Caesar dressing
       allergens: gluten, dairy, eggs, fish
   ```

4. Dzięki temu model potrafi odpowiedzieć na pytania typu
   _"Czy ten croissant zawiera gluten?"_ oraz przyjąć modyfikacje
   typu _"bez sosu, z mlekiem owsianym"_ w zamówieniu.

Więcej o samym API: zobacz `flask-api/README.md`.

### Zakres 4.5 — estymacja czasu odbioru

Każde danie w `data.json` ma teraz pole `prep_time_minutes`. Czas odbioru
całego zamówienia liczymy ze wzoru:

```
minutes = max(prep_time wszystkich pozycji) + 2 * (n_pozycji - 1) + 5
```

- `max(prep_time)` — najdłuższa pojedyncza pozycja (zakładamy równoległe
  przygotowywanie)
- `2 * (n - 1)` — 2 minuty dodatkowo na każdą następną pozycję
- `+ 5` — stały bufor kolejki

W kodzie:

- **Źródło prawdy:** Flask, endpoint `POST /api/estimate` (można wołać
  zewnętrznie, zwraca minuty + breakdown).
- **W rozmowie:** prep_time każdego dania jest wstrzykiwany do promptu;
  sam model liczy formułę i podaje wynik w potwierdzeniu zamówienia
  (LLM radzi sobie z prostą arytmetyką dla typowych zamówień).

Dokładniejszy opis endpointu i przykłady curl: `flask-api/README.md`.

## Najczęstsze problemy

- **`Connection refused`** — nie uruchomiłaś `ollama serve`.
- **`model 'llama3.2' not found`** — zapomniany `ollama pull llama3.2`.
- **`command not found: python`** — używaj `python3` na macOS.
- **Model odpowiada po polsku zamiast po angielsku** — prompt jasno mówi
  "reply in English". Jeśli błąd powraca, sprawdź czy plik `chatbot.py`
  został zapisany.
- **`FileNotFoundError: config.yaml`** — plik `config.yaml` musi leżeć obok
  `chatbot.py` (ścieżka jest wyliczana przez `Path(__file__).parent`, więc
  CWD nie ma znaczenia — liczy się tylko lokalizacja samego skryptu).
- **`Cannot reach Flask API at http://127.0.0.1:5000`** — nie odpaliony
  serwer Flask. Zobacz `flask-api/README.md` lub po prostu uruchom
  `cd flask-api && python app.py` w drugim terminalu.
