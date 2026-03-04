# Skedsmo Gutter 2013 – Treningsoversikt

Statisk nettside for trenere i Skedsmo Fotball (én fil: `index.html`).

## AI assistant context files

For å bevare samme prosjektkontekst på tvers av coding-verktøy er disse filene lagt i repoet:

- `CLAUDE.md` – kanonisk prosjektkontekst (domene, struktur, rutiner)
- `AGENTS.md` – kryssverktøy-peker som instruerer andre assistenter til å bruke `CLAUDE.md`

### Vedlikehold

Oppdater alltid `CLAUDE.md` først. Hold `AGENTS.md` kort og som referanse, slik at konteksten ikke dupliseres eller divergerer.

## Kjør lokalt

Åpne `index.html` direkte i nettleser, eller start en enkel statisk server:

```bash
npx serve .
# eller
python3 -m http.server 8080
```


## Fase 1 (påbegynt)

Siden er startet opp i en fler-siders struktur for enklere navigering:

- `index.html` – eksisterende fulloversikt (legacy)
- `arsplan.html` – egen side for årsplan
- `kalender.html` – kalender-MVP
- `okter.html` – økter/lenker
- `assets/css/styles.css` – felles stil
- `assets/js/main.js` – felles JS (tab-funksjon + aktiv toppnavigasjon)


## Fase 2 (påbegynt)

Datadrevet innhold er introdusert:

- `data/content.json` – kalenderdata + øvelsesdata
- `kalender.html` rendrer ukeøkter dynamisk fra JSON
- `okter.html` rendrer øvelseskort dynamisk med filter på fase/alder
- `assets/js/main.js` håndterer lasting/rendering og filtre
