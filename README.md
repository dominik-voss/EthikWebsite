# Defense & Ethik

**Berufsethik unter Studierenden** – scrollbares Storytelling in der TH Nürnberg auf Basis einer Umfrage von Studierenden im Bezug zu Karriere und der Meinung zu Defense und Dual-Use stehen.

🔗 **Live-Demo:** [dominik-voss.github.io/EthikWebsite](https://dominik-voss.github.io/EthikWebsite/)

## Über das Projekt

Diese Website präsentiert die Ergebnisse einer Umfrage unter Studierenden der TH Nürnberg (n = 227) zur Berufsethik im Kontext der Verteidigungsindustrie. Im Scrollytelling-Format werden Fragen wie diese visuell aufbereitet:

- Würden Studierende eher für ein Militärunternehmen mit höherem Gehalt oder für ein ziviles Unternehmen mit geringerem Gehalt arbeiten?
- Wie unterscheiden sich die Antworten nach Studiengang und Geschlecht?
- Wird Berufsethik im Studium überhaupt thematisiert?

Die Seite stellt Militär- und Zivilsektor gegenüber, zeigt Verteilungen nach Studiengang und lässt sich per Filter (z. B. Geschlecht, "alle" vs. "nur Entschiedene") interaktiv erkunden.

## Tech-Stack

- [Vite](https://vitejs.dev/) – Build-Tool & Dev-Server
- Vanilla JavaScript (ES Modules)
- HTML5 & CSS3
- [Highcharts](https://www.highcharts.com/) – Datenvisualisierung/Diagramme

## Projektstruktur

```
EthikWebsite/
├── .github/workflows/   # CI/CD-Workflow für das GitHub-Pages-Deployment
├── public/              # Statische Assets
├── src/                 # Anwendungscode (JS, CSS, Daten)
├── index.html           # Einstiegspunkt der Anwendung
├── vite.config.js        # Vite-Konfiguration
├── package.json
└── package-lock.json
```

## Lokale Entwicklung

### Voraussetzungen

- [Node.js](https://nodejs.org/)
- npm

### Installation

```bash
git clone https://github.com/dominik-voss/EthikWebsite.git
cd EthikWebsite
npm install
```

### Verfügbare Skripte

| Befehl            | Beschreibung                                      |
|--------------------|----------------------------------------------------|
| `npm run dev`      | Startet den lokalen Entwicklungsserver mit Hot Reload |
| `npm run build`    | Erstellt einen optimierten Production-Build im `dist/`-Ordner |
| `npm run preview`  | Startet einen lokalen Server zur Vorschau des Production-Builds |

Nach `npm run dev` ist die Seite standardmäßig unter `http://localhost:5173` erreichbar.

## Autor

Erstellt von
- [Dominik](https://github.com/dominik-voss)
- [Mary-Joyce](https://github.com/MJTONYE)
- Viktor
- Ahmet
