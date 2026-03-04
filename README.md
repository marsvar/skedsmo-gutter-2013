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
