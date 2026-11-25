# KURO — Research References and Data Sources

This document collects the research papers, official data products, catalogues, model artefacts and software references used to develop KURO's lunar terrain, celestial-geometry, illumination, site-scoring and crater-analysis workflows. Research coverage is prioritised from **2020–2026**, with earlier foundational sources retained where they define the ephemeris, coordinate frame or physical equations used by the implementation.

## 1. Lunar South Pole regions and mission context

### NASA Artemis III candidate landing regions

**NASA (28 October 2024).** *NASA Provides Update on Artemis III Moon Landing Regions.* NASA Release 24-136.

- Official announcement: https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/
- Use in KURO: source for the nine named South Pole regions represented in the candidate-site interface: Peak near Cabeus B, Haworth, Malapert Massif, Mons Mouton Plateau, Mons Mouton, Nobile Rim 1, Nobile Rim 2, de Gerlache Rim 2 and Slater Plain.

## 2. LOLA elevation, South Pole DEMs and terrain products

### Barker et al. (2023) — South Pole LOLA products

**Barker, M. K., Mazarico, E., Neumann, G. A., Smith, D. E., Zuber, M. T., Head, J. W., & Sun, X. (2023).** *A New View of the Lunar South Pole from the Lunar Orbiter Laser Altimeter (LOLA).* The Planetary Science Journal, 4, 183.

- Paper: https://doi.org/10.3847/PSJ/acf3e1
- NASA GSFC PGDA Product 90: https://pgda.gsfc.nasa.gov/products/90
- Data DOI: https://doi.org/10.60903/gsfcpgda-lola-spole
- Direct 80 m/pixel South Pole DEM: https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEM_80S_80MPP_ADJ.TIF
- Direct 80 m/pixel LOLA count grid: https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEC_80S_80MPP_ADJ.TIF
- Direct 240 m/pixel 60°S DEM: https://pgda.gsfc.nasa.gov/data/LOLA_20mpp/LDEM_60S_240MPP_ADJ.TIF
- Use in KURO: native 80 m South Pole terrain, regional terrain context, MOON_ME coordinate-frame alignment, elevation/slope visualisation and terrain-horizon calculations.

### Barker et al. (2021) — DEM uncertainty and illumination

**Barker, M. K., Mazarico, E., Neumann, G. A., Smith, D. E., Zuber, M. T., & Head, J. W. (2021).** *Improved LOLA elevation maps for south pole landing sites: Error estimates and their impact on illumination conditions.* Planetary and Space Science, 203, 105119.

- Paper: https://doi.org/10.1016/j.pss.2020.105119
- NASA NTRS record: https://ntrs.nasa.gov/citations/20205009660
- Use in KURO: context for the role of DEM height and slope accuracy in horizon elevation and predicted polar illumination. The study's uncertainty analysis informs the interpretation of terrain-derived visibility results.

### Direct LOLA data access

- NASA GSFC Planetary Geodynamics Data Archive, Product 90: https://pgda.gsfc.nasa.gov/products/90
- NASA PDS Geosciences LOLA archive: https://pds-geosciences.wustl.edu/missions/lro/lola.htm
- LOLA data node: https://imbrium.mit.edu/
- Direct PDS global `LDEM_16.img`: https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/cylindrical/img/ldem_16.img
- Direct PDS South Pole `ldem_80s_80m.img`: https://pds-geosciences.wustl.edu/lro/lro-l-lola-3-rdr-v1/lrolol_1xxx/data/lola_gdr/polar/img/ldem_80s_80m.img
- Use in KURO: whole-Moon global elevation and the 80–90°S polar elevation source grids.

### NASA Scientific Visualization Studio — CGI Moon Kit

- CGI Moon Kit product directory: https://svs.gsfc.nasa.gov/4720/
- Global elevation `ldem_16_uint.tif`: https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_16_uint.tif
- LROC colour mosaic `lroc_color_2k.jpg`: https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg
- Use in KURO: global lunar elevation and global WAC colour context for the Moon views.

### NASA Moon Trek — lunar imagery and illumination layers

- Moon Trek: https://trek.nasa.gov/moon/
- Lunar LRO WAC / LOLA map layers: https://trek.nasa.gov/moon/
- South Pole LOLA illumination / PSR tile service used by the application: https://trek.nasa.gov/tiles/Moon/EQ/LRO_LOLA_Illumination_SPole65S_240m_EQ/1.0.0/default/default028mm
- Use in KURO: high-resolution WAC map context and the 240 m/pixel South Pole illumination / permanently shadowed-region overlay.

## 3. South Pole illumination and landing-site selection (2020–2026)

### Liu et al. (2023) — illumination and slope constraints

**Liu, D., Gan, H., Wei, G., Qiu, Y., Wan, L., & Li, X. (2023).** *Lunar South Polar Landing Area Selection Constrained by Illumination Conditions and Slopes.* Journal of Deep Space Exploration, 10(5), 544–556.

- Paper: https://doi.org/10.15982/j.issn.2096-9287.2023.20220091
- Full journal page: https://jdse.bit.edu.cn/sktcxb/en/article/doi/10.15982/j.issn.2096-9287.2023.20220091
- Use in KURO: research context for combining illumination duration and slope suitability in South Pole landing-area analysis.

### Zhang et al. (2023) — multi-temporal illumination analysis

**Zhang, Y., Liu, B., Di, K., Liu, S., Yue, Z., Han, S., Wang, J., Wan, W., & Xie, B. (2023).** *Analysis of Illumination Conditions in the Lunar South Polar Region Using Multi-Temporal High-Resolution Orbital Images.* Remote Sensing, 15(24), 5691.

- Paper: https://doi.org/10.3390/rs15245691
- Full text: https://www.mdpi.com/2072-4292/15/24/5691
- Use in KURO: time-dependent polar illumination, image acquisition geometry, solar elevation/azimuth and the use of multi-temporal orbital imagery in mission planning.

### Tong et al. (2023) — horizon-based illumination modelling

**Tong, X.-H., Huang, Q., Liu, S.-J., Xie, H., Chen, H., Wang, Y.-Q., Xu, X., Wang, C., & Jin, Y.-M. (2023).** *A High-Precision Horizon-Based Illumination Modeling Method for the Lunar Surface Using Pyramidal LOLA Data.* Icarus, 390, 115302.

- Paper: https://doi.org/10.1016/j.icarus.2022.115302
- Use in KURO: literature basis for precomputed horizon-elevation profiles, multi-resolution LOLA terrain sampling, time-dependent illumination evaluation and treatment of the Sun as an extended disc.

### Barker et al. (2021) — illumination sensitivity to topography

- Citation and links are in Section 2.
- Use in KURO: scientific context for how DEM resolution and elevation uncertainty affect computed horizon elevation and sunlight availability.

## 4. Lunar crater detection research (2020–2026)

### Fairweather et al. (2022) — small craters in LRO NAC imagery

**Fairweather, J. H., Lagain, A., Servis, K., Benedix, G. K., Kumar, S. S., & Bland, P. A. (2022).** *Automatic Mapping of Small Lunar Impact Craters Using LRO-NAC Images.* Earth and Space Science, 9, e2021EA002177.

- Paper: https://doi.org/10.1029/2021EA002177
- Full text and supporting information: https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2021EA002177
- Supporting information S1 PDF: https://agupubs.onlinelibrary.wiley.com/action/downloadSupplement?doi=10.1029%2F2021EA002177&file=2021EA002177-sup-0001-Supporting+Information+SI-S01.pdf
- Supporting dataset S1: https://agupubs.onlinelibrary.wiley.com/action/downloadSupplement?doi=10.1029%2F2021EA002177&file=2021EA002177-sup-0002-Data+Set+SI-S01.csv
- Supporting dataset S2: https://agupubs.onlinelibrary.wiley.com/action/downloadSupplement?doi=10.1029%2F2021EA002177&file=2021EA002177-sup-0003-Data+Set+SI-S02.csv
- Supporting dataset S3: https://agupubs.onlinelibrary.wiley.com/action/downloadSupplement?doi=10.1029%2F2021EA002177&file=2021EA002177-sup-0004-Data+Set+SI-S03.zip
- Supporting dataset S4: https://agupubs.onlinelibrary.wiley.com/action/downloadSupplement?doi=10.1029%2F2021EA002177&file=2021EA002177-sup-0005-Data+Set+SI-S04.zip
- Use in KURO: real LROC NAC crater imagery, crater annotation and mapping workflow, and image-illumination context for crater detection.

### Lin et al. (2022) — crater detection on DEMs

**Lin, X., Zhu, Z., Yu, X., Ji, X., Luo, T., Xi, X., Zhu, M., & Liang, Y. (2022).** *Lunar Crater Detection on Digital Elevation Model: A Complete Workflow Using Deep Learning and Its Application.* Remote Sensing, 14(3), 621.

- Paper: https://doi.org/10.3390/rs14030621
- Full text: https://www.mdpi.com/2072-4292/14/3/621
- Use in KURO: deep-learning crater detection workflow, DEM-based crater recognition and confidence-threshold selection.

### Tewari et al. (2022) — optical, DEM and slope fusion

**Tewari, A., Verma, V., Srivastava, P., Jain, V., & Khanna, N. (2022).** *Automated Crater Detection from Co-registered Optical Images, Elevation Maps and Slope Maps Using Deep Learning.* Planetary and Space Science, 218, 105500.

- Paper: https://doi.org/10.1016/j.pss.2022.105500
- Use in KURO: research context for combining image texture, elevation and slope information in planetary crater analysis.

### Sinha et al. (2024) — Chandrayaan-2 TMC-2 crater identification

**Sinha, M., Paul, S., Ghosh, M., Mohanty, S. N., & Pattanayak, R. M. (2024).** *Automated Lunar Crater Identification with Chandrayaan-2 TMC-2 Images Using Deep Convolutional Neural Networks.* Scientific Reports, 14, 8231.

- Paper: https://doi.org/10.1038/s41598-024-58438-4
- Full text: https://www.nature.com/articles/s41598-024-58438-4
- Use in KURO: recent crater-identification methods using Indian lunar orbital imagery and convolutional segmentation architectures.

### Mu et al. (2023) — small crater detection

**Mu, L., Xian, L., Li, L., Liu, G., Chen, M., & Zhang, W. (2023).** *YOLO-Crater Model for Small Crater Detection.* Remote Sensing, 15(20), 5040.

- Paper: https://doi.org/10.3390/rs15205040
- Full text: https://www.mdpi.com/2072-4292/15/20/5040
- Use in KURO: size-aware lunar crater detection, sample imbalance handling and feature attention for complex planetary imagery.

### Zang et al. (2021) — semi-supervised crater detection using CE-2 DOM

**Zang, S., Mu, L., Xian, L., & Zhang, W. (2021).** *Semi-Supervised Deep Learning for Lunar Crater Detection Using CE-2 DOM.* Remote Sensing, 13(14), 2819.

- Paper: https://doi.org/10.3390/rs13142819
- Full text: https://www.mdpi.com/2072-4292/13/14/2819
- CE-2 data search and ordering: https://moon.bao.ac.cn/searchOrder_pdsData.search
- Use in KURO: related crater-detection research using Chang'E-2 digital orthophoto imagery, semi-supervised learning and crater recognition across lunar highlands and maria.

### La Grassa et al. (2023) — YOLOLens and super-resolution

**La Grassa, R., Cremonese, G., Gallo, I., Re, C., & Martellato, E. (2023).** *YOLOLens: A Deep Learning Model Based on Super-Resolution to Enhance Crater Detection of Planetary Surfaces.* Remote Sensing, 15(5), 1171.

- Paper: https://doi.org/10.3390/rs15051171
- Use in KURO: research context for image-resolution enhancement and crater detection across planetary surfaces.

### Dsouza & Kumar (2024) — South Pole crater characterisation

**Dsouza, H., & Kumar, S. (2024).** *Characterization of the Moon’s South Polar Craters Using Optical, Microwave and Thermal Remote Sensing.* Advances in Space Research, 73(4), 2297–2322.

- Paper: https://doi.org/10.1016/j.asr.2023.11.009
- Use in KURO: multi-sensor context for the de Gerlache, Haworth and Shoemaker crater regions, and interpretation of optical imagery alongside thermal and microwave observations.

### La Grassa et al. (2025) — LU5M812TGT global crater catalogue

**La Grassa, R., Martellato, E., Cremonese, G., Re, C., Tullo, A., & Bertoli, S. (2025).** *LU5M812TGT: An AI-Powered Global Database of Impact Craters ≥0.4 km on the Moon.* ISPRS Journal of Photogrammetry and Remote Sensing, 220, 75–84.

- Paper: https://doi.org/10.1016/j.isprsjprs.2024.11.010
- Dataset record: https://zenodo.org/records/13990480
- Direct catalogue file: https://zenodo.org/records/13990480/files/Moon_Diamond_catalog_4.csv
- Use in KURO: global lunar crater catalogue, crater centre coordinates, elliptical diameters and catalogue-scale comparison.

### Liu et al. (2025) — DBYOLO

**Liu, Y., Chen, F., Qiu, D., Liu, W., & Yan, J. (2025).** *DBYOLO: Dual-Backbone YOLO Network for Lunar Crater Detection.* Remote Sensing, 17(19), 3377.

- Paper: https://doi.org/10.3390/rs17193377
- Source code: https://github.com/cfk4563/Dbyolo
- Global lunar crater catalogue: https://zenodo.org/records/4983248
- LROC product selector: https://data.lroc.im-ldi.com/lroc/rdr_product_select
- Use in KURO: recent YOLO architecture research, dual-backbone feature extraction and use of optical/terrain products in crater detection.

### Ma et al. (2026) — Moon and Mars crater detection framework

**Ma, Y., Guo, J., Yu, Z., & Chandra, R. (2026).** *Deep Learning Framework for Crater Detection and Identification on the Moon and Mars.* npj Space Exploration, 2, Article 19.

- Paper: https://doi.org/10.1038/s44453-026-00036-x
- Full text: https://www.nature.com/articles/s44453-026-00036-x
- Code and labelled data: https://github.com/sydney-machine-learning/crater-identification
- Use in KURO: recent multi-stage crater detection and classification, tiled inference for large images, and NMS for overlapping candidate regions.

### Robbins & Hoover (2026) — uniform crater-catalogue evaluation

**Robbins, S. J., & Hoover, R. H. (2026).** *A Comparison of Lunar AI-based Crater Databases Using Uniform Criteria.* The Planetary Science Journal, 7, 164.

- Paper: https://doi.org/10.3847/PSJ/ae6b82
- Use in KURO: crater-catalogue comparison methods, consistent matching criteria, diameter-resolved precision/recall and interpretation of catalogue benchmark metrics. This reference informs the way crater performance results are organised and interpreted by crater-size range.

## 5. Crater datasets and catalogues — direct access

### LU3M6TGT — real LROC WAC crater patches

- Kaggle dataset: https://www.kaggle.com/datasets/riccardolagrassa/lu3m6tgt
- Model dataset mirror: https://huggingface.co/datasets/huseyincavus/lunar-trn-datasets
- Dataset licence stated by the dataset/model card: CC BY-SA 4.0.
- Use in KURO: the real LROC WAC crater-patch domain used by the Lunar TRN fine-tuned detector.

### Lunar TRN real-domain crater checkpoint

- Hugging Face model: https://huggingface.co/huseyincavus/lunar-trn-ft-real
- Source repository: https://github.com/huseyincavusbi/lunar-trn
- Checkpoint file: `best.pt` in the model repository.
- Weights licence stated by the model card: MIT.
- Model: YOLO26s, single crater class, 1,024 × 1,024 inference input.
- Training profile: 8,756 LU3M6TGT training patches; 1,545 held-out patches.
- Model benchmark profile: mAP@50 94.7%; mAP@50–95 83.0%; Robbins ≥2 km human-verified recall 60.6%; isolated-tile mAP@50 94.2%.
- Use in KURO: the crater detector exported to `frontend/public/models/lunar_crater_detector.onnx` and run in the browser through ONNX Runtime Web.

### LU1319373 — global catalogue for craters ≥1 km

- Zenodo dataset: https://zenodo.org/records/4983248
- Direct archive: https://zenodo.org/records/4983248/files/LU1319373_Wang%26Wu_2021.rar
- Dataset DOI: https://doi.org/10.5281/zenodo.4983248
- Paper: Wang, Y., Wu, B., Xue, H., Li, X., & Ma, J. (2021). *An Improved Global Catalog of Lunar Impact Craters (≥1 km) with 3D Morphometric Information and Updates on Global Crater Analysis.* Journal of Geophysical Research: Planets, 126, e2020JE006728. https://doi.org/10.1029/2020JE006728
- Use in KURO: crater centre coordinates, diameter and depth data for catalogue comparison and geometric context.

### LU5M812TGT — global catalogue for craters ≥0.4 km

- Zenodo dataset: https://zenodo.org/records/13990480
- Direct CSV: https://zenodo.org/records/13990480/files/Moon_Diamond_catalog_4.csv
- Dataset DOI: https://doi.org/10.5281/zenodo.13990480
- Paper: La Grassa et al. (2025), cited in Section 4.
- Use in KURO: global crater locations and diameter fields for research comparisons and crater-size context.

### Chang’E-2 Digital Orthophoto Map (CE-2 DOM)

- Chinese Lunar Exploration Program data search / order portal: https://moon.bao.ac.cn/searchOrder_pdsData.search
- Use in research: CE-2 DOM imagery supports the semi-supervised crater-detection workflow described by Zang et al. (2021) and the small-crater dataset work described by Mu et al. (2023).

### Robbins lunar crater database

- USGS Astropedia record: https://astrogeology.usgs.gov/search/map/moon_crater_database_v1_robbins
- Robbins et al. (2019) paper: https://doi.org/10.1029/2018JE005592
- Use in KURO: human-compiled crater reference catalogue used by the Lunar TRN model evaluation and human-verified recall metric.

### Fairweather et al. (2022) LRO-NAC crater annotations

- Article and supplements: https://agupubs.onlinelibrary.wiley.com/doi/full/10.1029/2021EA002177
- Supporting information and datasets: see the direct S1–S4 links in Section 4.
- Use in KURO: high-resolution LROC NAC crater annotation and small-crater mapping research.

## 6. Celestial geometry, ephemerides and coordinate systems

### Foundational DE421 reference

**Folkner, W. M., Williams, J. G., & Boggs, D. H. (2009).** *The Planetary and Lunar Ephemeris DE421.* JPL Interplanetary Network Progress Report, 42-178.

- Report: https://ipnpr.jpl.nasa.gov/progress_report/42-178/178C.html
- PDF: https://ipnpr.jpl.nasa.gov/progress_report/42-178/178C.pdf
- DE421 SPK kernel: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/de421.bsp
- PyPI package: https://pypi.org/project/de421/
- Use in KURO: barycentric Sun, Earth and Moon positions used by the ephemeris-table builder.

### Foundational lunar orientation memo

**Williams, J. G., Boggs, D. H., & Folkner, W. M. (2008).** *DE421 Lunar Orbit, Physical Librations, and Surface Coordinates.* JPL Interoffice Memorandum 335-JW, DB, WF-20080314-001.

- PDF: https://naif.jpl.nasa.gov/pub/naif/generic_kernels/spk/planets/a_old_versions/de421_lunar_ephemeris_and_orientation.pdf
- Use in KURO: DE421 lunar libration angles, lunar orientation and the Principal-Axes to Mean-Earth coordinate transformation.

### JPL Horizons reference system

- Horizons overview and API documentation: https://ssd.jpl.nasa.gov/horizons/manual.html
- Horizons API: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- Use in KURO: reference ephemerides for the Sun and Earth at selected lunar surface locations. The project stores a DE441 / MEAN_ME / airless reference set for comparison with its DE421 engine.

### Time-scale and leap-second reference

- IERS bulletins and leap-second information: https://www.iers.org/IERS/EN/Publications/Bulletins/bulletins.html
- Use in KURO: UTC-to-TT conversion for date and time selection before ephemeris lookup.

### IAU cartographic coordinate references

**Archinal, B. A., Acton, C. H., A’Hearn, M. F., et al. (2018).** *Report of the IAU Working Group on Cartographic Coordinates and Rotational Elements: 2015.* Celestial Mechanics and Dynamical Astronomy, 130, 22.

- Paper: https://doi.org/10.1007/s10569-017-9805-5
- Use in KURO: cartographic coordinate and rotational-element conventions for lunar mapping and the sky display.

**Archinal, B. A., Conrad, A., Duxbury, T., Hestroffer, D., Jorda, L., Kirk, R. L., Klioner, S., Margot, J.-L., Oberst, J., Paganelli, F., Ping, J., Seidelmann, K., Tholen, D., & Williams, I. (2023).** *The Cartographic Lunar Reference Frame.* USGS Publications Warehouse.

- Publication record: https://www.usgs.gov/publications/cartographic-lunar-reference-frame
- Use in KURO: recent discussion of the internationally used lunar Mean-Earth / Polar-Axis frame and its relationship to existing lunar data products.

## 7. Thermal and solar-radiation references

### Diviner data and lunar thermal observations

- NASA Diviner mission data portal: https://www.diviner.ucla.edu/data
- NASA PDS Diviner archive: https://pds-geosciences.wustl.edu/missions/lro/diviner.htm
- Use in KURO: lunar polar surface-temperature context and the temperature information shown for shadowed terrain.

**Paige, D. A., Siegler, M. A., Zhang, J. A., Hayne, P. O., et al. (2010).** *Diviner Lunar Radiometer Observations of Cold Traps in the Moon’s South Polar Region.* Science, 330(6003), 479–482.

- Paper: https://doi.org/10.1126/science.1187726
- Use in KURO: polar cold-trap and permanently shadowed-region temperature context.

**Feng, J., & Siegler, M. A. (2021).** *Reconciling the Infrared and Microwave Observations of the Lunar South Pole: A Study on Subsurface Temperature and Regolith Density.* Journal of Geophysical Research: Planets, 126, e2020JE006623.

- Paper: https://doi.org/10.1029/2020JE006623
- Use in KURO: Diviner and Chang’E-2 microwave context for polar regolith thermal properties and permanently shadowed-region temperature interpretation.

**Liu, N., & Jin, Y.-Q. (2021).** *Simulation and Data Analysis of the Temperature Distribution and Variation in the Permanently Shadowed Region of the Moon.* IEEE Transactions on Geoscience and Remote Sensing, 59(4), 2962–2972.

- Paper: https://doi.org/10.1109/TGRS.2020.3009117
- Use in KURO: time-dependent temperature modelling in polar permanently shadowed terrain.

**Yin, Z., Liu, N., & Jin, Y.-Q. (2024).** *Simulation of the Temperatures in the Permanently Shadowed Region of the Moon’s South Pole and Data Validation.* Icarus, 411, 115917.

- Paper: https://doi.org/10.1016/j.icarus.2023.115917
- Use in KURO: recent South Pole PSR temperature modelling, crater-floor geometry and comparison with Diviner measurements.

**Vasavada, A. R., Bandfield, J. L., Greenhagen, B. T., Hayne, P. O., Siegler, M. A., Williams, J.-P., & Paige, D. A. (2012).** *Lunar Equatorial Surface Temperatures and Regolith Properties from the Diviner Lunar Radiometer Experiment.* Journal of Geophysical Research: Planets, 117, E00H18.

- Paper: https://doi.org/10.1029/2011JE003987
- Use in KURO: lunar regolith Bond albedo and infrared emissivity parameters used in the radiative-equilibrium temperature estimate.

**Kopp, G., & Lean, J. L. (2011).** *A New, Lower Value of Total Solar Irradiance: Evidence and Climate Significance.* Geophysical Research Letters, 38, L01706.

- Paper: https://doi.org/10.1029/2010GL045777
- Use in KURO: 1 AU solar-irradiance reference used by the solar-flux calculation.

### Star catalogues and sky rendering data

- d3-celestial source: https://github.com/ofrohn/d3-celestial
- ESA Hipparcos catalogues: https://www.cosmos.esa.int/web/hipparcos/catalogues
- Yale Bright Star Catalogue information: http://tdc-www.harvard.edu/catalogs/bsc5.html
- Use in KURO: catalogue-based star positions, magnitudes and colour information used by the lunar sky visualisation. The generated star and Milky Way assets are stored in `frontend/public/data/`.

## 8. Terrain derivatives and visual methods

**Horn, B. K. P. (1981).** *Hill Shading and the Reflectance Map.* Proceedings of the IEEE, 69(1), 14–47.

- Paper: https://doi.org/10.1109/PROC.1981.11918
- Use in KURO: 3 × 3 gridded elevation derivative method used to calculate local slope.

**LROC / Arizona State University.** Lunar Reconnaissance Orbiter Camera archive and product catalogue.

- LROC PDS archive: https://pds.lroc.im-ldi.com/data
- LROC product selector: https://data.lroc.im-ldi.com/lroc/rdr_product_select
- LROC public site: https://www.lroc.asu.edu/
- Use in KURO: LROC WAC imagery, NAC products and source imagery for lunar crater analysis.
