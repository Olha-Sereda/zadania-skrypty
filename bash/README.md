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
- `p` — zapisz grę (save)
- `l` — wczytaj grę (load)
- `q` — wyjście z gry

## Zasady / tryb gry (3.0)

- Gra jest turowa (2 graczy na jednej klawiaturze): X oraz O.
- Po wygranej lub remisie pojawia się pytanie o ponowną grę (`y/n`).

## Zapis i odtwarzanie gry (4.0)

- Zapis gry: naciśnij `p` w trakcie rozgrywki.
- Wczytanie gry: naciśnij `l` w trakcie rozgrywki.
- Przy starcie gry, jeśli zapis istnieje, skrypt zapyta czy go wczytać.

Domyślnie zapis jest trzymany obok skryptu jako plik `.tictactoe.save`.

Możesz zmienić lokalizację pliku zapisu przez zmienną środowiskową `SAVE_FILE`, np.:

```bash
cd bash
SAVE_FILE="$PWD/my-save.txt" ./game.sh
```
