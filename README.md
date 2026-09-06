# Matty 🐶 – gangetabeller

En lille, privat træningsapp til gangetabellerne 1–10, bygget som en webapp til mobil.
Matty er en gul labrador der reagerer på hvert svar, og appen er gamificeret med
streaks, niveauer, medaljer og et hvalpealbum der låses op undervejs.

Appen er på dansk, kører offline, og gemmer alt lokalt på telefonen.

## Sådan bruges den

Åbn linket på telefonen og vælg **Føj til hjemmeskærm**. Så får den sit eget ikon
og åbner i fuld skærm uden browserlinje.

## Hvad kan den

| Funktion | Beskrivelse |
|---|---|
| Daglig træning | 15 adaptive spørgsmål. Motoren vælger det hun er svagest i. |
| Tabeltræning | Træn én tabel ad gangen. |
| Svære kort | Kun de stykker hun ofte tager fejl af. |
| Tidsløb | 60 sekunder – hvor mange når du? |
| Prøver | Én tabel eller alle 55 på tid. Rekorden gemmes som *tid + antal fejl*. |
| Fremgang | Varmekort over alle 55 stykker, 14-dages historik, fartkurve og rekorder. |
| Del med far | Laver en kort tekstopsummering hun selv kan sende. |

## Sådan er det bygget

Ingen byggetrin, ingen afhængigheder – almindelige ES-moduler der serveres direkte.
Rediger en fil, commit, og GitHub Actions udgiver den.

```
index.html            skal og opstart
css/style.css          hele designet
js/main.js             router + bundnavigation
js/store.js            localStorage, streak, niveauer, backup
js/facts.js            de 55 stykker, sværhedsgrad, huskeregler, svarmuligheder
js/engine.js           hvad skal spørges om nu (spaced repetition)
js/progress.js         medaljer, hvalpekort og tilbehør der låses op
js/mascot.js           Matty som SVG med humør og tilbehør
js/audio.js            lydeffekter genereret med WebAudio (ingen lydfiler)
js/screens/*.js        én fil pr. skærm
js/data/content.js     al dansk tekst, album, medaljer
tools/make-icons.mjs   genererer app-ikonerne som PNG
```

### Læringsmodellen

* `6×7` og `7×6` er **det samme faktum** – 55 stykker i alt, ikke 100.
* Hvert faktum har et niveau 0–5 (*Ny → Set → Øver → Sikker → Hurtig → Guld*).
  Guld kræver 8 rigtige i træk **og** et gennemsnit under 2,8 sekunder.
* Et forkert svar sænker niveauet med ét og lægger stykket tilbage i køen
  tre spørgsmål senere i samme runde.
* Jo højere niveau, jo længere hviler stykket (0 → 9 dage).
* Sværhedsgraden er vægtet, så `6×7` og `7×8` kommer oftere end `2×10`.
  1- og 10-tabellen sættes automatisk som kendt fra start.
* Multiple choice indtil niveau 3, derefter skal svaret tastes ind.
  Distraktorerne er rigtige typiske fejl (naboprodukter, cifferombytning),
  ikke tilfældige tal.

## Udvikling

```bash
python3 -m http.server 8000
# åbn http://localhost:8000
```

Efter ændringer: bump `CACHE` i `sw.js`, ellers henter telefoner den gamle version fra cachen.

Regenerér ikoner:

```bash
node tools/make-icons.mjs
```

## Privatliv

* Ingen konto, ingen server, ingen sporing, ingen cookies.
* Al fremgang ligger i `localStorage` på hendes telefon.
* Siden er markeret `noindex, nofollow` og står i `robots.txt`, så den ikke indekseres.

## Tilføj billeder

Læg firkantede fotos i `assets/puppies/` – se [vejledningen der](assets/puppies/README.md).
Mangler et billede, tegner appen selv en hvalp i stedet.
