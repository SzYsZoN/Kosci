# Gra w kości

Implementacja gry w kości dla 2–4 graczy w technologiach HTML, CSS i JavaScript.

## Instrukcja uruchomienia

### Opcja 1 — lokalnie (najprościej)

1. Pobierz lub sklonuj repozytorium
2. Otwórz folder w edytorze z rozszerzeniem Live Server (np. VS Code + Live Server)
3. Kliknij "Go Live" w prawym dolnym rogu VS Code
4. Gra otworzy się w przeglądarce pod adresem `http://127.0.0.1:5500`

Alternatywnie — otwórz `index.html` bezpośrednio w przeglądarce (kliknij prawym → "Otwórz za pomocą").

### Opcja 2 — GitHub Pages

Gra dostępna online pod adresem: `https://szyszon.github.io/Kosci/`

### Wymagania

Brak zależności zewnętrznych. Wystarczy dowolna nowoczesna przeglądarka (Chrome, Firefox, Edge).

---

## Decyzje projektowe

### Technologie

Gra napisana jest w czystym HTML, CSS i JavaScript — bez frameworków ani bibliotek. Wybór podyktowany był charakterem zadania (gra hot-seat, brak potrzeby backendu) oraz chęcią pokazania podejścia do organizacji kodu bez zewnętrznych narzędzi.

### Architektura — jeden obiekt stanu

Cały stan gry przechowywany jest w jednym obiekcie `stan`:

```javascript
let stan = {
  gracze: [],
  aktualnyGracz: 0,
  kosci: [1, 1, 1, 1, 1],
  trzymane: [false, false, false, false, false],
  rzutyLeft: 3,
  czyRzucono: false,
  wyniki: [],
};
```

Zamiast rozproszonych zmiennych globalnych mamy jedno źródło prawdy. Każda zmiana w grze modyfikuje `stan`, po czym wywoływana jest funkcja `renderuj()` która aktualizuje cały widok. 

### Renderowanie

Funkcja `renderuj()` jest wywoływana po każdej akcji gracza i przerysowuje interfejs od nowa. To podejście jest nieco mniej wydajne niż aktualizowanie tylko zmienionej części DOM, ale przy grze tej skali jest w pełni wystarczające i znacznie prostsze w utrzymaniu.

### Obliczanie punktów

Funkcja `obliczPunkty(kategoriaId, kosci)` jest czysta — nie czyta ani nie modyfikuje stanu gry, tylko przyjmuje dane i zwraca wynik. Dzięki temu łatwo ją testować w izolacji.

Podgląd możliwych punktów w tabeli wyników generowany jest na żywo po każdym rzucie — gracz od razu widzi ile dostanie za każdą kategorię.

### Animacje

Animacja rzutu kości zrealizowana przez CSS `@keyframes` — JS tylko dodaje i usuwa klasę `.animacja`. Odświeżenie widoku następuje po 520ms (nieznacznie dłużej niż czas trwania animacji 500ms) żeby uniknąć migotania.

---

## Założenia funkcjonalne

- Gra działa w trybie hot-seat — gracze przekazują sobie urządzenie po każdej turze
- Gracz musi wybrać kategorię po każdym rzucie, nawet jeśli oznacza to 0 punktów (zgodnie z zasadami)
- Podgląd punktów w tabeli pokazuje potencjalny wynik dla każdej niewypełnionej kategorii
- Na ekranie końcowym pokazane są sumaryczne wyniki graczy
- Bonus 35 punktów przyznawany jest automatycznie gdy suma górnej sekcji wynosi co najmniej 63 punkty
