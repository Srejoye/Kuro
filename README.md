# 🌕 KURO

> An interactive lunar landing-site intelligence platform that evaluates 78 candidate sites across 9 regions near the Moon’s South Pole — combining NASA terrain data, celestial ephemerides, horizon analysis and 3D visualization to identify optimal conditions for sunlight and Earth communication.

🔗 **[Live Demo](https://kuro-mnsy.onrender.com/)** &nbsp;|&nbsp; Built with React · TypeScript · Three.js · Python · NASA JPL DE421 · LOLA · ONNX Runtime

---

## 📌 Overview

**KURO** is an interactive decision-support platform designed to explore, evaluate and compare potential lunar landing sites near the Moon’s South Pole.

Landing near the lunar South Pole presents a unique challenge. The Sun remains close to the horizon, surrounding terrain can obstruct sunlight for extended periods, and direct-to-Earth communication depends on the local skyline. Even small differences in elevation and landing location can significantly affect mission conditions.

KURO addresses this challenge by evaluating **78 candidate landing sites across 9 lunar South Pole regions**. Users can select a mission date, landing time and surface-stay duration to calculate site suitability, inspect local terrain and identify the most promising landing locations.

Unlike a static landing-site map, KURO combines scientific terrain analysis, celestial geometry and an interactive 3D lunar environment. Every ranking is supported by computed terrain and visibility metrics, allowing users to explore not just which site ranks highest, but why.

---

## ✨ Features

| Feature | Description |
|---|---|
| **78-Site Evaluation** | Evaluates 78 candidate landing sites distributed across 9 lunar South Pole regions |
| **Date & Mission Planning** | Select a landing date, time and surface-stay duration from 7 to 120 days |
| **Dynamic Site Ranking** | Scores and ranks candidate locations using sunlight, Earth visibility and terrain metrics |
| **3D Lunar Explorer** | Interactive lunar environment with Globe, Pole, Drone and Rover viewing modes |
| **Real NASA Terrain** | Uses LOLA elevation data to represent lunar topography and local terrain |
| **Local Horizon Analysis** | Computes terrain skylines in 360 directions around each candidate site |
| **Sun Visibility Analysis** | Determines when the Sun clears the local terrain horizon |
| **Earth Visibility Analysis** | Evaluates direct geometric visibility of Earth above the local skyline |
| **Mission Duration Analysis** | Evaluates illumination and communication availability throughout the selected stay |
| **Site Comparison** | Compares the top four candidate sites through synchronized rover views |
| **Sky Visualization** | Displays the Sun, Earth and celestial environment relative to the local horizon |
| **Scientific Validation** | Compares computed celestial directions against NASA JPL Horizons reference data |
| **Lunar Crater Detection** | Browser-based crater detection using a fine-tuned YOLO26s ONNX model |
| **Data Explorer** | Presents datasets, scientific references and validation methodology |
| **Mission Intelligence** | Explains site rankings and visibility conditions using computed metrics |

---

## ⚙️ How It Works

KURO combines lunar terrain analysis, celestial geometry, visibility calculations and a multi-factor scoring system.

### Step 1 — Celestial Position Calculation

Sun and Earth directions are derived from the NASA JPL DE421 ephemeris.

- Uses the lunar Mean-Earth coordinate frame.
- Accounts for lunar physical librations.
- Supports dates from 1966 to 2049.
- Precomputed ephemeris data is stored in a compact binary format.
- The browser interpolates between stored samples.

### Step 2 — Terrain and Horizon Analysis

KURO uses NASA Lunar Orbiter Laser Altimeter (LOLA) elevation data to analyse the terrain surrounding each candidate landing site.

- Evaluates 360 azimuth directions around a site.
- Traces the local skyline out to 300 km.
- Accounts for lunar curvature.
- Uses an observer height of 2 metres.
- Includes precomputed horizon profiles for all 78 candidate sites.

These profiles determine whether the Sun or Earth is geometrically obstructed by surrounding terrain.

### Step 3 — Sun and Earth Visibility

For each selected mission period, KURO samples celestial positions at approximately 15-minute intervals.

**Sun visibility**
- Determines whether the Sun's centre rises above the local terrain skyline.
- Calculates the fraction of the mission stay with direct sunlight.
- Identifies extended periods of darkness.

**Earth visibility**
- Determines whether Earth clears the local skyline.
- Supports an optional antenna elevation margin from 0° to 10°.
- Calculates the fraction of the stay with geometric Earth visibility.
- Identifies extended communication gaps.

### Step 4 — Terrain Suitability

Terrain suitability is evaluated using local slope and available terrain information.

- Slope is derived from the LOLA South Pole DEM.
- Roughness needs terrain at 20–40 m per pixel; KURO's finest grid is 80 m, so roughness is not scored for most polar sites.
- No structured hazard map exists yet. Missing inputs are dropped, never guessed, and each category is down-weighted by how much of it had data (as in the backend).

### Step 5 — Site Scoring and Ranking

Each candidate site receives a score out of 100 using five weighted categories.

| Category | Weight | Evaluation |
|---|---:|---|
| **Flat Ground** | 25% | Slope and terrain roughness |
| **Safety** | 25% | Slope, roughness (where terrain data allows), longest darkness and longest radio gap. A hazard-map input is reserved in the formula but not yet available. |
| **Sunlight** | 20% | Fraction of the mission stay with the Sun visible |
| **Earth Link** | 15% | Fraction of the mission stay with Earth geometrically visible |
| **Sun + Earth** | 15% | Fraction of the stay with both sunlight and Earth visibility |

The scoring implementation is reproduced in the frontend and designed to match the KURO backend scoring formula.

---

## 🔬 Scientific Validation

KURO's celestial and terrain calculations are checked against independent references and published observations.

| Validation | Result |
|---|---:|
| Sun and Earth directions against NASA JPL Horizons | Maximum difference: **0.0071°** |
| Direction validation threshold | **0.02°** |
| Ephemeris interpolation vs direct DE421 — Sun | ≤ 0.0012° |
| Ephemeris interpolation vs direct DE421 — Earth | ≤ 0.0004° |
| Apollo 11 landing Sun elevation | 10.7° (recorded value approximately 10.8°) |
| Shackleton rim ridge illumination, 2020 | 86% vs 85.5% published |
| Permanently shadowed crater floors | Remain dark throughout the evaluated year |
| Frontend ranking vs KURO Python backend | Identical scores |

---

## 🌑 NASA Data Sources

KURO integrates publicly available lunar and planetary datasets.

| Dataset / Resource | Application |
|---|---|
| **NASA JPL DE421** | Sun, Earth and Moon ephemerides |
| **NASA JPL Horizons** | Independent reference for celestial direction validation |
| **LOLA South Pole DEM — PGDA Product 90** | Elevation, slope and local terrain analysis |
| **LOLA LDEM_16** | Global lunar terrain and distant landscape representation |
| **LRO WAC Mosaic** | Lunar surface imagery and visual context |
| **NASA Moon Trek** | Lunar imagery and permanently shadowed region information |
| **LROC QuickMap** | High-resolution lunar imagery and site inspection |
| **NASA Artemis III Candidate Regions** | Regional grouping of the 9 candidate landing areas |
| **NASA Scientific Visualization Studio — CGI Moon Kit** | Global lunar visualization assets |
| **NASA Diviner** | Lunar polar thermal and permanently shadowed region context |

Additional research papers, dataset references and attribution details are available in `docs/RESEARCH_REFERENCES.md`.

---

## 🧠 Lunar Crater Detection

KURO includes a computer-vision workspace for detecting lunar craters in uploaded imagery.

| Component | Details |
|---|---|
| **Model** | Lunar TRN real-domain fine-tuned YOLO26s |
| **Task** | Single-class lunar crater detection |
| **Input** | 1024 × 1024 RGB image |
| **Output** | Crater bounding boxes and confidence scores |
| **Inference** | ONNX Runtime Web |
| **Execution** | Browser-side inference |

The model is based on the publicly available `huseyincavus/lunar-trn-ft-real` checkpoint.

The Vision workspace reports detection count, mean confidence, bounding-box measurements, detections per megapixel and inference time.

---

## 🚀 How to Run

KURO is a React + TypeScript application powered by Vite. The required lunar datasets and model assets are included in the project.

### Prerequisites

- Node.js 20.19 or newer
- npm
- Git

> **Note on size:** The repository is roughly 58 MB because all lunar datasets (`frontend/public/moon/`), the ephemeris (`frontend/public/data/`) and the 38 MB crater model (`frontend/public/models/`) are bundled, so no extra downloads are needed. The first page load fetches the Moon data and the model; later visits are cached.

### 1. Clone the repository

```bash
git clone https://github.com/Srejoye/Kuro.git
cd Kuro
```

### 2. Install dependencies

```bash
cd frontend
npm ci
```

### 3. Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite, usually **http://localhost:5173**.

---

## 🗂️ Project Structure

```text
Kuro/
├── build_ephemeris.py              # Offline DE421 ephemeris builder
├── export_crater.py                # Crater model export utility
├── requirements.txt                # Python pipeline dependencies
├── render.yaml                     # Render static-site configuration
│
├── docs/
│   ├── SCIENTIFIC_METHODOLOGY.md   # Scientific and mathematical methodology
│   └── RESEARCH_REFERENCES.md      # Research papers and dataset references
│
└── frontend/
    ├── index.html                  # Application entry point
    ├── package.json                # Dependencies and scripts
    ├── vite.config.ts              # Vite configuration
    │
    ├── public/
    │   ├── moon/                   # Packed lunar elevation and surface data
    │   ├── data/                   # Ephemeris and sky visualization assets
    │   ├── models/                 # Lunar crater detection ONNX model
    │   ├── vision/                 # Vision model metadata
    │   ├── hero/                   # Landing page visual assets
    │   └── compare/                # Rover comparison assets
    │
    ├── scripts/
    │   ├── fetch-moon-data.mjs     # NASA lunar data preparation
    │   └── pack-moon-data.mjs      # Elevation grid packing utility
    │
    └── src/
        ├── components/             # Reusable UI and visualization components
        ├── data/                   # Candidate sites, horizons and references
        ├── engine/                 # Ephemeris, visibility and geometry engines
        ├── explorer/               # 3D lunar environment and terrain rendering
        ├── pages/                  # Application pages
        ├── services/               # Scoring and data services
        ├── styles/                 # Application styles
        ├── hooks.ts                # Application hooks
        ├── store.ts                # Shared application state
        └── App.tsx                 # Main application routing
```

---

## 🎨 Tech Stack

| Technology | Role |
|---|---|
| **React 19** | Component-based application interface |
| **TypeScript** | Typed application logic and scientific calculations |
| **Three.js** | Interactive 3D lunar terrain and rover visualization |
| **Vite** | Development server and production build |
| **Zustand** | Shared application state management |
| **ONNX Runtime Web** | Browser-based lunar crater inference |
| **GeoTIFF** | Lunar elevation data processing |
| **Python** | Offline ephemeris and model preparation |
| **NASA JPL DE421** | Planetary and lunar ephemeris source |
| **NASA LOLA** | Lunar elevation and terrain source |

---

## 📚 Concepts Covered

- **Celestial Mechanics** — computing Sun and Earth directions using planetary ephemerides
- **Lunar Coordinate Systems** — working with lunar Mean-Earth coordinates and physical librations
- **Terrain Analysis** — deriving local slope and analysing lunar elevation data
- **Horizon Computation** — calculating terrain obstruction across 360 azimuth directions
- **Solar Illumination** — evaluating sunlight availability over a mission duration
- **Geometric Visibility** — determining line-of-sight visibility between lunar sites, Earth and the Sun
- **Multi-Criteria Decision Analysis** — combining terrain and mission conditions into a weighted site score
- **3D Geospatial Visualization** — rendering lunar terrain and mission conditions in an interactive environment
- **Browser-Based Machine Learning** — running a lunar crater detection model through ONNX Runtime Web

---

## ⭐ Support

If you found this project useful or interesting, consider giving it a ⭐ on GitHub.
