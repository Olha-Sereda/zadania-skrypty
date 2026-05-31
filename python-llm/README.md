# Zadanie 3 — Python LLM Chatbot

Czatbot kawiarni "Lviv Croissants" oparty o **lokalny** model językowy
(Ollama + `llama3.2`) i klienta Pythona `ollama`.

## Status zakresów

- ✅ **3.0** — Czatbot rozpoznaje 3 intencje (powitanie, menu, zamówienie),
  każdą w co najmniej 3 sformułowaniach. Cała "wiedza" pochodzi z promptu
  systemowego — bez sztywnych regułek.
- ✅ **3.5** — menu i godziny otwarcia ładowane z `config.yaml` i wstrzykiwane
  do promptu systemowego przy starcie.
- ⏳ 4.0 — dane (alergie, składniki) z API Flaska.
- ⏳ 4.5 — estymacja czasu odbioru.
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

---

## Uruchomienie czatbota

Upewnij się, że `ollama serve` działa w tle, potem:

```bash
python chatbot.py
```

Przykładowa rozmowa (bot odpowiada po angielsku — `llama3.2` ma słaby polski):

```
You: Hello
Bot: Hi! Welcome to Lviv Croissants. Would you like to see the menu or place an order?

You: What's on the menu?
Bot: Here is our menu:
Sweet croissants:
- Chocolate croissant — 15 PLN
- Nutella & banana croissant — 17 PLN
...

You: When are you open on Sunday?
Bot: On Sunday we are open from 09:00 to 21:00.

You: I'd like a chocolate croissant and a latte
Bot: Order confirmed: Chocolate croissant (15 PLN) + Latte (15 PLN). Total: 30 PLN.
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

Dane biznesowe (nazwa kawiarni, godziny otwarcia, menu, waluta) trzymamy
w pliku `config.yaml`. Możesz je edytować bez dotykania kodu Pythona.

Struktura pliku:

```yaml
restaurant:
  name: "Lviv Croissants"

currency: "PLN"

opening_hours:
  monday: "08:00 - 22:00"
  ...

menu:
  - category: "Sweet croissants"
    items:
      - name: "Chocolate croissant"
        price: 15
  ...
```

Przy starcie programu funkcja `load_config()` czyta plik, a `build_system_prompt()`
wypisuje menu i godziny otwarcia do szablonu promptu. Dodanie nowego dania
to teraz **3 linijki w YAML-u**, bez restartu Ollamy ani zmiany kodu.

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
