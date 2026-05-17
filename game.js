// === KATEGORIE WYNIKÓW ===
// Każda kategoria ma id (do identyfikacji), label (wyświetlana nazwa) i opis

const KATEGORIE_GORNE = [
  { id: 'jedynki',  label: 'Jedynki',  opis: 'Suma wyrzuconych jedynek' },
  { id: 'dwojki',   label: 'Dwójki',   opis: 'Suma wyrzuconych dwójek' },
  { id: 'trojki',   label: 'Trójki',   opis: 'Suma wyrzuconych trójek' },
  { id: 'czworki',  label: 'Czwórki',  opis: 'Suma wyrzuconych czwórek' },
  { id: 'piatki',   label: 'Piątki',   opis: 'Suma wyrzuconych piątek' },
  { id: 'szostki',  label: 'Szóstki',  opis: 'Suma wyrzuconych szóstek' },
];

const KATEGORIE_DOLNE = [
  { id: 'trzy_jednakowe', label: '3 jednakowe', opis: 'Suma wszystkich kości' },
  { id: 'cztery_jednakowe', label: '4 jednakowe', opis: 'Suma wszystkich kości' },
  { id: 'full',           label: 'Full',         opis: '25 punktów' },
  { id: 'maly_strit',     label: 'Mały strit',   opis: '30 punktów' },
  { id: 'duzy_strit',     label: 'Duży strit',   opis: '40 punktów' },
  { id: 'krol',           label: 'Król',         opis: '50 punktów' },
  { id: 'szansa',         label: 'Szansa',       opis: 'Suma wszystkich kości' },
];

const WSZYSTKIE_KATEGORIE = [...KATEGORIE_GORNE, ...KATEGORIE_DOLNE];

// === STAN GRY ===
// Jeden obiekt który przechowuje WSZYSTKO co dzieje się w grze.
// Zamiast trzymać dziesiątki osobnych zmiennych, mamy jedno miejsce.

let stan = {
  gracze: [],           // tablica imion graczy, np. ['Ania', 'Bartek']
  aktualnyGracz: 0,     // indeks gracza który teraz gra (0, 1, 2 lub 3)
  kosci: [1, 1, 1, 1, 1],   // aktualne wartości 5 kości
  trzymane: [false, false, false, false, false],  // które kości są zablokowane
  rzutyLeft: 3,         // ile rzutów zostało w tej turze
  czyRzucono: false,    // czy gracz już rzucił choć raz w tej turze
  wyniki: [],           // tablica obiektów z wynikami każdego gracza
};

// === OBLICZANIE PUNKTÓW ===
// Ta funkcja przyjmuje nazwę kategorii i tablicę 5 kości,
// i zwraca ile punktów gracz by dostał.

function obliczPunkty(kategoriaId, kosci) {
  // Liczymy ile razy wystąpiła każda wartość (1-6)
  // counts[0] = ile jedynek, counts[1] = ile dwójek, itd.
  const counts = [0, 0, 0, 0, 0, 0];
  kosci.forEach(k => counts[k - 1]++);

  // Suma wszystkich kości — przyda się w kilku kategoriach
  const suma = kosci.reduce((a, b) => a + b, 0);

  // Sortujemy ile mamy danej wartości (od największej)
  // np. [3, 2] znaczy że mamy trójkę i parę = full
  const posortowane = counts.filter(c => c > 0).sort((a, b) => b - a);

  switch (kategoriaId) {
    case 'jedynki': return counts[0] * 1;
    case 'dwojki':  return counts[1] * 2;
    case 'trojki':  return counts[2] * 3;
    case 'czworki': return counts[3] * 4;
    case 'piatki':  return counts[4] * 5;
    case 'szostki': return counts[5] * 6;

    case 'trzy_jednakowe':
      return posortowane[0] >= 3 ? suma : 0;

    case 'cztery_jednakowe':
      return posortowane[0] >= 4 ? suma : 0;

    case 'full':
      return (posortowane[0] === 3 && posortowane[1] === 2) ? 25 : 0;

    case 'maly_strit': {
      const unikalne = [...new Set(kosci)].sort().join('');
      return (unikalne.includes('1234') ||
              unikalne.includes('2345') ||
              unikalne.includes('3456')) ? 30 : 0;
    }

    case 'duzy_strit': {
      const unikalne = [...new Set(kosci)].sort().join('');
      return (unikalne === '12345' || unikalne === '23456') ? 40 : 0;
    }

    case 'krol':
      return posortowane[0] === 5 ? 50 : 0;

    case 'szansa':
      return suma;

    default:
      return 0;
  }
}

// === INICJALIZACJA WYNIKÓW ===
// Tworzy pusty obiekt wyników dla jednego gracza
// null znaczy "jeszcze nie wypełnione"

function stworzPusteWyniki() {
  const wyniki = {};
  WSZYSTKIE_KATEGORIE.forEach(kat => {
    wyniki[kat.id] = null;
  });
  return wyniki;
}

// === EKRAN STARTOWY ===
// Gdy gracz zmienia liczbę graczy, aktualizujemy pola z imionami

document.getElementById('liczba-graczy').addEventListener('change', function() {
  aktualizujPolaImion(parseInt(this.value));
});

function aktualizujPolaImion(liczba) {
  const kontener = document.getElementById('pola-imion');
  kontener.innerHTML = '';
  for (let i = 0; i < liczba; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Gracz ${i + 1}`;
    input.value = `Gracz ${i + 1}`;
    input.id = `imie-${i}`;
    kontener.appendChild(input);
  }
}

// Domyślne uruchomienie dla 2 graczy 
aktualizujPolaImion(2);

// === PRZYCISK START ===
document.getElementById('btn-start').addEventListener('click', function() {
  const liczba = parseInt(document.getElementById('liczba-graczy').value);

  stan.gracze = [];
  for (let i = 0; i < liczba; i++) {
    const imie = document.getElementById(`imie-${i}`).value.trim();
    stan.gracze.push(imie || `Gracz ${i + 1}`);
  }
  stan.wyniki = stan.gracze.map(() => stworzPusteWyniki());
  stan.aktualnyGracz = 0;
  stan.kosci = [1, 1, 1, 1, 1];
  stan.trzymane = [false, false, false, false, false];
  stan.rzutyLeft = 3;
  stan.czyRzucono = false;

  document.getElementById('ekran-start').classList.add('ukryty');
  document.getElementById('ekran-gry').classList.remove('ukryty');

  renderuj();
});


// === GŁÓWNA FUNKCJA RENDERUJĄCA ===
// Wywołujemy ją za każdym razem gdy coś się zmienia w stanie gry.

function renderuj() {
  renderujInfoTury();
  renderujKosci();
  renderujPrzyciskRzutu();
  renderujKarteWynikow();
}

// === INFO O TURZE ===
function renderujInfoTury() {
  const gracz = stan.gracze[stan.aktualnyGracz];
  document.getElementById('nazwa-gracza').textContent = `Tura: ${gracz}`;
  document.getElementById('rzuty-info').textContent = `Rzuty pozostałe: ${stan.rzutyLeft}`;
}

// === KOŚCI ===
function renderujKosci() {
  const kontener = document.getElementById('kontener-kosci');
  kontener.innerHTML = '';

  const SYMBOLE = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

  stan.kosci.forEach((wartosc, index) => {
    const div = document.createElement('div');
    div.classList.add('kosc');

    // Jeśli kość jest trzymana, dodajemy klasę CSS
    if (stan.trzymane[index]) {
      div.classList.add('trzymana');
    }

    div.textContent = SYMBOLE[wartosc];

    // Kliknięcie blokuje/odblokowuje kość
    div.addEventListener('click', () => {
      if (!stan.czyRzucono) return; // nie można blokować przed pierwszym rzutem
      stan.trzymane[index] = !stan.trzymane[index];
      renderujKosci();
    });

    kontener.appendChild(div);
  });
}

// === PRZYCISK RZUTU ===
function renderujPrzyciskRzutu() {
  const btn = document.getElementById('btn-rzut');

  if (stan.rzutyLeft === 0) {
    btn.disabled = true;
    btn.textContent = 'Wybierz kategorię';
  } else if (stan.rzutyLeft === 3) {
    btn.disabled = false;
    btn.textContent = 'Rzuć kośćmi';
  } else {
    btn.disabled = false;
    btn.textContent = `Rzuć ponownie (${stan.rzutyLeft})`;
  }
}

// === KARTA WYNIKÓW ===
function renderujKarteWynikow() {
  const tabela = document.getElementById('karta-wynikow');
  const gracze = stan.gracze;
  const p = stan.aktualnyGracz;

  // Nagłówek tabeli z imionami graczy
  let html = `<thead><tr>
    <th>Kategoria</th>
    ${gracze.map(g => `<th>${g}</th>`).join('')}
  </tr></thead><tbody>`;

  // Sekcja górna
  html += `<tr class="wiersz-sekcja"><td colspan="${gracze.length + 1}">GÓRNA SEKCJA</td></tr>`;
  KATEGORIE_GORNE.forEach(kat => {
    html += budujWierszKategorii(kat, p);
  });

  // Bonus górnej sekcji
  const sumaGorna = getSumaGorna(p);
  html += `<tr class="wiersz-suma">
    <td>Bonus (≥63 → +35)</td>
    ${gracze.map((_, i) => `<td style="text-align:center">${getSumaGorna(i)}/63${getSumaGorna(i) >= 63 ? ' ✓' : ''}</td>`).join('')}
  </tr>`;

  // Sekcja dolna
  html += `<tr class="wiersz-sekcja"><td colspan="${gracze.length + 1}">DOLNA SEKCJA</td></tr>`;
  KATEGORIE_DOLNE.forEach(kat => {
    html += budujWierszKategorii(kat, p);
  });

  // Suma końcowa
  html += `<tr class="wiersz-suma">
    <td>Łącznie</td>
    ${gracze.map((_, i) => `<td style="text-align:center">${getSumaCalkowita(i)}</td>`).join('')}
  </tr>`;

  html += '</tbody>';
  tabela.innerHTML = html;
}

// === BUDOWANIE WIERSZA KATEGORII ===
function budujWierszKategorii(kat, aktualnyGracz) {
  const gracze = stan.gracze;
  let html = `<tr><td title="${kat.opis}">${kat.label}</td>`;

  gracze.forEach((_, i) => {
    const wynik = stan.wyniki[i][kat.id];

    if (wynik !== null) {
      // Już wypełniona
      html += `<td class="wynik-komorka wypelniona">${wynik}</td>`;
    } else if (i === aktualnyGracz && stan.czyRzucono) {
      // Podgląd możliwego wyniku dla aktualnego gracza
      const podglad = obliczPunkty(kat.id, stan.kosci);
      if (podglad > 0) {
        html += `<td class="wynik-komorka podglad" onclick="przypiszWynik('${kat.id}')">${podglad}</td>`;
      } else {
        html += `<td class="wynik-komorka podglad-zero" onclick="przypiszWynik('${kat.id}')">0</td>`;
      }
    } else {
      // Puste — inny gracz lub jeszcze nie rzucono
      html += `<td class="wynik-komorka"></td>`;
    }
  });

  html += '</tr>';
  return html;
}

// === LICZENIE SUMY GÓRNEJ ===
function getSumaGorna(graczIndex) {
  return KATEGORIE_GORNE.reduce((suma, kat) => {
    return suma + (stan.wyniki[graczIndex][kat.id] || 0);
  }, 0);
}

// === LICZENIE SUMY CAŁKOWITEJ ===
function getSumaCalkowita(graczIndex) {
  const sumaKategorii = WSZYSTKIE_KATEGORIE.reduce((suma, kat) => {
    return suma + (stan.wyniki[graczIndex][kat.id] || 0);
  }, 0);
  const bonus = getSumaGorna(graczIndex) >= 63 ? 35 : 0;
  return sumaKategorii + bonus;
}

// === RZUT KOŚĆMI ===
document.getElementById('btn-rzut').addEventListener('click', function() {
  if (stan.rzutyLeft <= 0) return;

  stan.rzutyLeft--;
  stan.czyRzucono = true;

  const kosciEl = document.querySelectorAll('.kosc');

  stan.kosci.forEach((_, index) => {
    if (!stan.trzymane[index]) {

      stan.kosci[index] = Math.ceil(Math.random() * 6);
      kosciEl[index].classList.add('animacja');

      setTimeout(() => {
        kosciEl[index].classList.remove('animacja');
      }, 500);
    }
  });

  
  setTimeout(() => {
    renderuj();
  }, 520);
});

// === PRZYPISYWANIE WYNIKU ===
function przypiszWynik(kategoriaId) {
  const p = stan.aktualnyGracz;

  if (!stan.czyRzucono) return;

  stan.wyniki[p][kategoriaId] = obliczPunkty(kategoriaId, stan.kosci);

  const czyKoniec = stan.wyniki.every(wyniki =>
    WSZYSTKIE_KATEGORIE.every(kat => wyniki[kat.id] !== null)
  );

  if (czyKoniec) {
    zakonczGre();
    return;
  }

  // Przejście do następnego gracza
  stan.aktualnyGracz = (stan.aktualnyGracz + 1) % stan.gracze.length;
  stan.kosci = [1, 1, 1, 1, 1];
  stan.trzymane = [false, false, false, false, false];
  stan.rzutyLeft = 3;
  stan.czyRzucono = false;

  renderuj();
}

// === KONIEC GRY ===
function zakonczGre() {
  document.getElementById('ekran-gry').classList.add('ukryty');
  const ekranKoniec = document.getElementById('ekran-koniec');
  ekranKoniec.classList.remove('ukryty');

  // Sortowanie graczy po wyniku 
  const wyniki = stan.gracze.map((gracz, i) => ({
    gracz,
    wynik: getSumaCalkowita(i)
  }));
  wyniki.sort((a, b) => b.wynik - a.wynik);

  const kontener = document.getElementById('wyniki-finalne');
  kontener.innerHTML = wyniki.map((w, i) =>
    `<div class="wynik-wiersz">
      <span>${i + 1}. ${w.gracz}</span>
      <span>${w.wynik} pkt</span>
    </div>`
  ).join('');
}

// === RESTART ===
document.getElementById('btn-restart').addEventListener('click', function() {
  document.getElementById('ekran-koniec').classList.add('ukryty');
  document.getElementById('ekran-start').classList.remove('ukryty');
});