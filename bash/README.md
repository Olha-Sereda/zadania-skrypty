# Zadanie 1 — Kółko i krzyżyk (Bash)

Gra w kółko i krzyżyk uruchamiana w terminalu.

## Wymagania

- Bash (zalecane: 4+; na macOS może być potrzebny Bash z Homebrew, jeśli masz bardzo stary systemowy Bash)
- Terminal obsługujący sekwencje ANSI (większość obsługuje)

## Uruchomienie

Z poziomu katalogu repozytorium:

```bash
cd bash
chmod +x game.sh
./game.sh
```

Alternatywnie (bez nadawania uprawnień wykonywania):

```bash
cd bash
bash game.sh
```

## Sterowanie

- `w` — góra
- `s` — dół
- `a` — lewo
- `d` — prawo
- `spacja` — postaw znak
- `q` — wyjście z gry

## Zasady / tryb gry (3.0)

- Gra jest turowa (2 graczy na jednej klawiaturze): X oraz O.
- Po wygranej lub remisie pojawia się pytanie o ponowną grę (`y/n`).
