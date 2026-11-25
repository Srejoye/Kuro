# KURO — Scientific Methodology

KURO is a lunar South Pole landing-site analysis and visualisation platform. It combines lunar topography, time-dependent Sun and Earth geometry, terrain-horizon modelling, mission-stay sampling, weighted candidate scoring, and crater detection in one interactive workflow.

## 1. Candidate-site framework

KURO evaluates **78 candidate coordinates across the nine lunar South Pole regions identified by NASA for Artemis III**:

1. Haworth
2. Peak near Cabeus B
3. Malapert Massif
4. Mons Mouton Plateau
5. Mons Mouton
6. Nobile Rim 1
7. Nobile Rim 2
8. de Gerlache Rim 2
9. Slater Plain

The 78 candidate coordinates are maintained in KURO's generated candidate registry and originate from the project's backend terrain-extraction workflow.

| Region | KURO candidates |
|---|---:|
| Haworth | 11 |
| Peak near Cabeus B | 5 |
| Malapert Massif | 5 |
| Mons Mouton Plateau | 11 |
| Mons Mouton | 10 |
| Nobile Rim 1 | 9 |
| Nobile Rim 2 | 9 |
| de Gerlache Rim 2 | 7 |
| Slater Plain | 11 |
| **Total** | **78** |

The application ranks the candidates for a selectable landing date, landing time and surface-stay duration of 7–120 days. Results are presented as a score out of 100, with component scores and data-completeness information.

## 2. Lunar reference frame and celestial geometry

### 2.1 JPL DE421 and MOON_ME

Sun and Earth state vectors are generated from the **JPL DE421 planetary and lunar ephemeris**. The computation uses DE421 barycentric positions for the Earth–Moon system and the Moon, derives the geocentric Earth and Moon positions, and evaluates the Sun relative to the Moon. One iteration of solar light-time correction is applied.

DE421's lunar libration angles (`phi`, `theta`, `psi`) provide the time-dependent orientation of the Moon. The implementation forms the rotation from inertial coordinates to lunar Principal Axes and then applies the fixed Principal-Axes-to-Mean-Earth rotation. The resulting vectors are expressed in the **Moon Mean-Earth / Polar-Axis frame (MOON_ME)**.

This frame choice keeps the ephemeris vectors aligned with the frame used by the South Pole LOLA elevation products. The same lunar coordinate convention is used by the terrain, local-sky and visibility calculations.

### 2.2 Precomputed ephemeris table

KURO bundles a precomputed ephemeris table sampled every **0.5 day (12 hours)**. The table contains 61,363 samples, beginning at JD 2439126.5 (1966-01-01 TT) and ending at the 2050-01-01 table boundary. The application exposes the supported interval through 2049 and does not extrapolate outside the available interpolation interval.

Each sample contains six little-endian `float32` values:

- Sun X, Y and Z from the Moon's centre, in astronomical units (AU).
- Earth X, Y and Z from the Moon's centre, in kilometres (km).

The browser interpolates between samples using Catmull–Rom cubic interpolation. The interface accepts UTC, converts it to terrestrial time (TT) using the project's leap-second table, and uses the table's recorded TT/TDB convention for the DE421 lookup. Solar light-time is applied in the table-generation step. Stellar aberration and Earth light-time are recorded as separate correction flags in `ephemeris.json`.

### 2.3 From Moon-centred vectors to the local sky

For a selected candidate and time, KURO transforms the Moon-centred vectors into the local site frame and computes the Sun and Earth azimuth and elevation. The local observer position is included, so the Earth direction incorporates topocentric parallax. At lunar-polar locations, this parallax can shift the apparent Earth direction by a fraction of a degree and is relevant because Earth lies close to the horizon.

Lunar optical and physical libration are included in the time-dependent orientation. Optical libration produces east–west and north–south apparent motion of Earth in the lunar sky; KURO also includes the smaller physical-libration contribution from DE421. The project’s Methods page describes optical libration of up to about 7.9° east–west and an approximately 6.7° lunar-axis tilt. At the South Pole, this time-dependent geometry brings Earth above the local horizon during recurring windows. The Explorer, comparison view, mission planner, site reports and visibility summaries use the same ephemeris engine.

## 3. Lunar elevation and image datasets

### 3.1 Whole-Moon context

The global terrain layer uses the NASA PDS LOLA GDR `LDEM_16` elevation grid. KURO converts and averages the source grid to a 2,880 × 1,440 equirectangular `global.u16` raster. The source grid is approximately 1,895 m per pixel; the packaged grid is a 2 × 2 averaged representation. Heights are decoded using the manifest's half-metre scale and offset.

The global colour layer is an LRO Lunar Reconnaissance Orbiter Camera (LROC) Wide Angle Camera (WAC) mosaic, stored as a 4,096 × 2,048 equirectangular image. Higher-detail Moon Trek WAC tiles are also used around the map and globe view when available.

### 3.2 South Pole terrain

KURO uses the NASA GSFC Planetary Geodynamics Data Archive (PGDA) **Product 90**, based on the LOLA South Pole elevation products described by Barker et al. (2023). The source DEM is `LDEM_80S_80MPP_ADJ`, supplied in south-polar stereographic coordinates and the MOON_ME frame.

Two packaged terrain scales are used:

| Terrain layer | Packaged resolution | Coverage / role |
|---|---:|---|
| South Pole overview | 320 m/pixel | Regional coverage from 80°S to the pole; produced by averaging the 80 m source grid |
| South Pole core | 80 m/pixel | Native-resolution central area, approximately 163.84 km square |

The terrain manifest records raster dimensions, pixel spacing, origin, no-data value, lunar reference radius, projection and source product. The South Pole projection is stereographic, true scale at the pole, with a lunar reference radius of 1,737.4 km.

### 3.3 Permanently shadowed regions and colour context

A NASA Moon Trek LOLA illumination / permanently shadowed region layer is available as a 240 m/pixel map overlay. It provides a visual comparison layer alongside KURO's own time-dependent terrain illumination. LROC WAC colour imagery supplies the lunar surface context in the globe and regional views.

## 4. Terrain analysis and local horizons

### 4.1 Slope

Local slope is calculated from a 3 × 3 neighbourhood of LOLA elevation samples using **Horn's method**. The derivative is evaluated at the DEM's own grid spacing: 80 m in the South Pole core and 320 m in the regional overview. The output is the local gradient magnitude converted to degrees.

### 4.2 Skyline / horizon calculation

For each candidate, KURO computes the terrain skyline along **360 azimuth bearings**, from an observer height of **2 m** above the surface and out to **300 km**. Each ray follows a great-circle path over the lunar sphere. The elevation angle to terrain samples includes lunar-curvature correction using a reference lunar radius of 1,737.4 km.

The sampling distance starts at the local DEM spacing (with a 20 m minimum) and increases gradually with range. The highest terrain elevation angle in each azimuth bin becomes that bearing's horizon angle. The project stores precomputed 360-bearing horizon profiles for all 78 candidate coordinates in `site-horizons.json`; the live terrain-tracing function uses the same method.

The resulting horizon is shared by Sun visibility, Earth visibility, site detail panels, comparison, mission planning and visibility summaries. A local 9 × 9 neighbourhood analysis can also recompute the selected stay at 250 m, 500 m or 1 km grid spacing around a candidate. This precomputed-horizon approach is aligned with recent lunar illumination research that combines multi-resolution LOLA terrain, stored horizon profiles and solar-disc visibility (Tong et al., 2023).

### 4.3 Terrain visualisation

The South Pole, Drone and Surface views build terrain meshes in a local frame using the same LOLA source data. For each terrain cell, the graphics pipeline traces toward the current Sun and Earth directions to visualise illumination and line of sight. Stay-wide visual layers evaluate up to 240 instants and accumulate the resulting illumination pattern. Vertical exaggeration is a rendering control; the underlying terrain measurements retain their source scale.

## 5. Sunlight and Earth visibility

KURO evaluates Sun and Earth directions across the selected mission stay using the sample sequence supplied to the mission-analysis engine. Each visibility sample stores the Sun and Earth status at its timestamp; the scoring engine uses the sample interval when calculating the duration of continuous darkness and Earth-outage windows.

### Sun visibility

For the ranking component, the Sun's centre is tested against the local terrain horizon. The separate sunlight-available display models the Sun as a disc with an angular diameter of approximately **0.53°**, and computes the visible fraction of that disc. This provides a gradual sunrise and sunset representation at the low solar elevations common near the lunar poles.

### Earth visibility

Earth visibility is based on the elevation of Earth's centre relative to the terrain horizon. The user-selectable antenna margin is 0° by default and can be increased from 0° to 10°. The same margin is applied consistently in the Explorer, Compare view, mission planner, ranking and reports. This is a geometric line-of-sight measure for direct-to-Earth visibility.

### Joint visibility and time windows

KURO records:

- Percentage of stay samples with the Sun visible.
- Percentage of stay samples with Earth visible.
- Percentage of samples with both visible simultaneously.
- Longest continuous interval of blocked sunlight.
- Longest continuous interval of blocked Earth visibility.

The mission planner and site panels express these values as visibility windows, countdowns and stay-level summaries.

## 6. Landing-site ranking methodology

The browser implementation mirrors the KURO backend recommendation engine, including thresholds, component weights, rounding and ranking order. The total score is presented on a 0–100 scale.

### 6.1 Top-level score weights

| Component | Weight | Primary inputs |
|---|---:|---|
| Flat ground / terrain | 25% | Slope and surface roughness |
| Safety | 25% | Slope, roughness, hazard input, longest darkness and longest Earth outage |
| Sunlight / illumination | 20% | Fraction of the stay with the Sun visible |
| Earth communication geometry | 15% | Fraction of the stay with Earth visible, including antenna margin |
| Joint Sun + Earth opportunity | 15% | Fraction of the stay with both Sun and Earth visible simultaneously |

### 6.2 Component weights and thresholds

The terrain component uses slope at 60% and roughness at 40%. Its slope scale runs from 0° (best) to 15° (zero for that subcomponent); its roughness scale runs from 0 m RMS to 1 m RMS.

The safety component uses:

| Safety input | Weight within safety | Reference interval |
|---|---:|---|
| Slope | 20% | Fully safe through 5°; zero at 15° |
| Roughness | 15% | Fully safe through 0.2 m; zero at 1 m |
| Hazard map | 25% | Structured hazard input category |
| Longest darkness | 20% | Safe through 2 days; zero at 10 days |
| Longest Earth outage | 20% | Safe through 2 hours; zero at 24 hours |

For lower-is-better inputs, the backend applies a bounded linear score between the safe and critical thresholds. Visibility percentages are bounded to 0–100. Each component reports its score and data completeness. Available component weights are normalised according to the completeness of their inputs, and the site breakdown exposes the resulting data coverage.

### 6.3 KURO score rule and ranking

The application includes an operational rule for solar-powered, direct-to-Earth mission scenarios: a candidate that has no Sun visibility during the selected stay, or no Earth visibility during the stay, receives a KURO overall score of zero and displays the corresponding reason. The backend recommendation score remains available in the score breakdown for context.

The score is recalculated for the exact landing date, landing time, stay duration and antenna margin chosen by the user. The same score and component breakdown are used by the Explorer, Compare view and reports.

## 7. Thermal and solar-energy estimates

KURO calculates solar irradiance at the Moon from the solar constant at 1 AU, corrected for the Sun's actual distance. The implementation uses **1,361 W/m²** at 1 AU. A Sun-tracking panel receives the incident flux multiplied by the visible fraction of the solar disc. Level ground receives this panel flux multiplied by the sine of solar elevation.

The ground-temperature display uses radiative equilibrium. Its polar temperature context is informed by Diviner observations and recent South Pole studies that model crater shape, scattered radiation, shadowing and time-dependent thermal behaviour (Feng & Siegler, 2021; Yin et al., 2024):

`(1 − A) × q = ε × σ × T⁴`

where:

- `A = 0.12` is the lunar Bond albedo used by the application.
- `q` is incident solar irradiance at the surface.
- `ε = 0.95` is the broadband infrared emissivity used by the application.
- `σ = 5.670374419 × 10⁻⁸ W m⁻² K⁻⁴` is the Stefan–Boltzmann constant.
- `T` is equilibrium temperature in kelvin.

In shadow, KURO presents polar temperature context from LRO Diviner observations, including very cold permanently shadowed crater floors. The model constants and references are implemented in `frontend/src/engine/thermal.ts`.

## 8. Sky, stars and lunar presentation

The sky view renders **41,411 stars brighter than magnitude 8** at catalogue positions, with catalogue magnitudes and B−V colours used for display. The star data is derived from Hipparcos and Yale Bright Star catalogues through d3-celestial. The Milky Way outline is converted into an equirectangular brightness image. The sky is transformed into the lunar frame using the IAU rotation model and checked against DE421 orientation.

The Moon surface display uses Lambert and Lommel–Seeliger photometric blending for lunar shading. A full-Moon lighting mode is provided as a visualisation aid while the computed Sun/Earth geometry and associated numerical results remain tied to the selected mission time.

## 9. Rover and local exploration

The rover view is placed on the LOLA terrain surface, follows local terrain slope and uses the site's terrain horizon for Sun and Earth line-of-sight readouts out to 300 km. The rover's illustrative travel speed is 0.2 m/s, with a maximum climb setting of 25°. The battery display is a visual mission-planning aid.

## 10. Crater detection and crater measurements

KURO Vision uses the **Lunar TRN real-domain YOLO26s crater detector**, distributed as `huseyincavus/lunar-trn-ft-real`. The checkpoint is exported to ONNX and executed in the browser through ONNX Runtime Web.

| Model property | Configuration |
|---|---|
| Architecture | YOLO26s object detector |
| Detection class | crater |
| Input | 1,024 × 1,024 RGB image, letterboxed |
| Training imagery | 8,756 LROC WAC patches from LU3M6TGT, approximately 100 m/pixel source scale |
| Held-out patches in model evaluation | 1,545 |
| Confidence threshold | 0.25 |
| NMS IoU threshold | 0.70 |
| Maximum detections | 300 |
| Browser model format | ONNX |

The model benchmark profile reports mAP@50 of **94.7%**, mAP@50–95 of **83.0%**, Robbins ≥2 km human-verified recall of **60.6%**, and isolated-tile mAP@50 of **94.2%**. The checkpoint evaluation reports its strongest detection band at approximately 1–4 km and includes size-resolved results for smaller craters. These results are presented alongside the model configuration in the Vision workspace. Recent lunar crater research on LRO NAC imagery, DEM-based detection, optical/terrain fusion, YOLO-based small-crater recognition and multi-scale catalogue evaluation provides the broader methods context (Fairweather et al., 2022; Lin et al., 2022; Tewari et al., 2022; Mu et al., 2023; Robbins & Hoover, 2026).

For each uploaded image, KURO reports crater candidate count, mean and median confidence, median bounding-box span, largest bounding-box span, detections per megapixel, inference time and an individually ranked crater table. The box-span values are measured in source-image pixels; physical diameter can be calculated when image scale and geometric calibration are available.

## Related reading

The supporting bibliography and direct dataset links are in [RESEARCH_REFERENCES.md](RESEARCH_REFERENCES.md).
