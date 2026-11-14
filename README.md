# Earth Jukebox

Explore NASA imagery through an interactive 3D Earth, a searchable listening library, original browser-generated audio, and an ASCII image view. Built for The Earth Information Jukebox, NASA Space Apps 2026.

## What is implemented

- India and Ukraine regional windows from the EIC night-lights visualization.
- Eight additional Earth-science resources: surface currents/temperature, GEOS aerosols, air quality, Perpetual Ocean 2, DYAMOND CO2, ISS lightning, atmospheric rivers, and GEDI canopy height.
- Caldwell 73 as a separate astronomy teaching exercise with a clockwise radial scan.
- EIC Content Database entry point in the library; category filtering, search, source links, per-track explanations and limitations.
- Three controllable synth voices, volume, pause/replay, seeking, ASCII rendering, keyboard-accessible dialogs and responsive layouts.

Each visual resource currently uses a **published still or extracted frame**. Sound is generated dynamically by scanning image space. The app does not yet play complete historical animations, query live NASA data, or reconstruct calibrated physical measurements. Geographic globe selection is available for the two validated night-lights regions; other camera views remain in the library rather than being given invented map coordinates.

## Run

Node.js 22.12+ and npm:

```sh
npm ci
npm run dev
npm run build
npm test
npx playwright install chromium
npx playwright test
```

The static production output is `dist/`. Relative base paths support subdirectory deployment. Public hosting is not configured automatically. No database, backend API, paid service, or API key is required.

## NASA resource coverage

| Official resource                            | Use                                                                            | Original source                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Earth Information Center Content Database    | Source directory linked from the listening library                             | [EIC gallery](https://svs.gsfc.nasa.gov/gallery/earth-information-center/) |
| Night Lights 2012–2023, EIC Version          | Globe texture; two regional sonifications of frame 0, labeled 2012             | [SVS 5313](https://svs.gsfc.nasa.gov/5313/)                                |
| Global Sea Surface Currents and Temperature  | Warm/cool color and edge texture voices                                        | [SVS 3912](https://svs.gsfc.nasa.gov/3912/)                                |
| GEOS Aerosols                                | Warm/magenta, blue, green visual groups                                        | [SVS 5572](https://svs.gsfc.nasa.gov/5572/)                                |
| Air Quality Model Runs                       | Three color-excess voices; not pollutant concentrations                        | [SVS 5533](https://svs.gsfc.nasa.gov/5533/)                                |
| Perpetual Ocean 2: Western Boundary Currents | Flow-line contrast, bright detail, blue/cyan detail                            | [SVS 5425](https://svs.gsfc.nasa.gov/5425/)                                |
| DYAMOND Global Carbon Dioxide                | Warm/cool rendered volume colors and saturation                                | [SVS 5196](https://svs.gsfc.nasa.gov/5196/)                                |
| Lightning Events Detected from ISS 2017–2023 | Yellow highlights trigger short percussive notes                               | [SVS 5011](https://svs.gsfc.nasa.gov/5011/)                                |
| A 3D View of an Atmospheric River            | Blue/cyan shading and image contrast                                           | [SVS 4960](https://svs.gsfc.nasa.gov/4960/)                                |
| GEDI Forest Height                           | Green excess, bright green detail and vegetation texture                       | [SVS 4950](https://svs.gsfc.nasa.gov/4950/)                                |
| Data Sonification: Caldwell 73               | Original teaching synthesis using rotating scan, radial pitch and color voices | [SVS 13786](https://svs.gsfc.nasa.gov/13786/)                              |

The EIC database is a directory, not a separate dataset. Caldwell 73 is an astronomy example, not Earth data. Our Caldwell audio is original and differs from the reference soundtrack credited to SYSTEM Sounds (M. Russo, A. Santaguida).

## Scientific scope and provenance

`src/catalog.ts` records each source, credit, observation/model context, normalized analysis crop, voice labels, artistic mapping, and limitations. `public/assets/catalog/provenance.json` records downloaded image URLs, dimensions, and processing. `public/assets/validation.json` records the original EIC frame and regional pixel crops. Regional bounding boxes include neighboring territory; they are not national-boundary masks.

Color profiles suppress neutral text, borders, clouds and terrain, but similarly colored background can still contribute. Masks are approximate visual rules, not scientific segmentation. Rendered colors, compositing, camera angle, opacity and height exaggeration affect the sound. No source is converted into ppm, meters, temperature, AQI, water transport, current speed, or individual lightning timing. Lightning signal receives a fixed gain boost for audibility, not a calibration.

Credit: NASA Scientific Visualization Studio and the named visualizers/scientists on each linked source. Black Marble: NASA Earth Observatory / Joshua Stevens; Suomi NPP VIIRS data / Miguel Román, NASA GSFC. Air-quality and aerosol images: NASA GMAO. Full per-track credits are available in the player and catalog. Follow [NASA media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). This independent project is not endorsed by NASA.

## Processing and audio architecture

Python prepares assets; React/TypeScript/Vite serves the app; React Three Fiber/Drei/Three.js renders the globe; Canvas extracts features; Tone.js produces the audio. The 24-second scan follows the audio-context clock. Color and spatial features select notes in a C pentatonic scale, note strength, and stereo placement. Three synths use envelopes and a master limiter. Lightning uses short square-wave envelopes; forest and moisture use sine voices. ASCII renders the same crop and does not alter audio input.

Audio startup depends on browser gesture policy; an explicit Play control is always available. Closing a scene disposes its synth resources.

## Reproduce imagery

Python dependencies: `requests`, `opencv-python`, `Pillow`.

```sh
python scripts/prepare_assets.py
python scripts/extract_regions.py
python scripts/prepare_catalog.py
```

Downloads and review contact sheets stay in ignored `.cache/`. Bundled image derivatives are versioned. Scene crops are applied in the browser so the original published still remains traceable.

## Validation and remaining work

Unit checks cover resource coverage, metadata, crop bounds, deterministic features, dark/transparent inputs, color separation, neutral annotation suppression, and ASCII. Browser checks cover all nine added resources, real-image signals, filters/search/empty states, source links, ASCII, playback, focus restoration, and desktop/mobile layout.

Human listening/comprehension tests, full screen-reader review, and validation with blind or low-vision users remain outstanding. The large 3D bundle remains a performance optimization opportunity. Future work includes temporal frame sequences and more precise scientific masks; neither is represented as already implemented.

## Reference projects

Tone.js is the audio dependency. NASA GIBS examples, TwoTone, EarthTunes, Green Corner, and Highcharts Sonification Studio informed research only; their application code was not copied. Highcharts is not a dependency. Other libraries and Google Fonts retain their respective licenses. The local implementation plan is intentionally gitignored.

Verification for this expansion: 23 unit tests pass; the original desktop/mobile browser flow and expanded catalog flow pass. The catalog also verifies nonzero image-derived signals for every bundled source. Screenshots were inspected at desktop and 390px mobile widths. Human listening quality and specialist accessibility validation remain pending.
