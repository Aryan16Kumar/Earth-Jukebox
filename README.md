# Earth Jukebox

Explore NASA imagery through an interactive 3D Earth, a searchable listening library, original browser-generated audio, and an ASCII image view. Built for The Earth Information Jukebox, NASA Space Apps 2026.

## What is implemented

- India and Ukraine regional windows from the EIC night-lights visualization.
- Eight additional Earth-science resources: surface currents/temperature, GEOS aerosols, air quality, Perpetual Ocean 2, DYAMOND CO2, ISS lightning, atmospheric rivers, and GEDI canopy height.
- Caldwell 73 as a separate astronomy teaching exercise with a clockwise radial scan.
- EIC Content Database entry point in the library; category filtering, search, source links, per-track explanations and limitations.
- Three controllable synth voices, volume, pause/replay, seeking, ASCII rendering, keyboard-accessible detail panels, an audio-reactive waveform and responsive layouts.

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

The static production output is `dist/`. The landing page is `/`; the product is `/explore`. Configure your host to serve `index.html` for application routes (SPA fallback). Set Vite base to your deployment path for subdirectory hosting. Public hosting is not configured automatically. No database, backend API, paid service, or API key is required.

## NASA resource coverage

| Official resource                            | Use                                                                            | Original source                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Earth Information Center Content Database    | Source directory linked from the listening library                             | [EIC gallery](https://svs.gsfc.nasa.gov/gallery/earth-information-center/) |
| Night Lights 2012–2023, EIC Version          | Two regional sonifications of frame 0, labeled 2012             | [SVS 5313](https://svs.gsfc.nasa.gov/5313/)                                |
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

Python prepares assets; React/TypeScript/Vite serves the app; React Three Fiber/Drei/Three.js renders the globe; Canvas extracts features; Tone.js produces the audio. The 24-second scan follows the audio-context clock. Color and spatial features select notes from profile-specific scales and pitch registers, note strength, and stereo placement. Three synths use envelopes and a master limiter. Instrument families, pulse grids, envelopes, filters, and delay differ by topic. ASCII renders the same crop and does not alter audio input.

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

Verification for the resource expansion: 23 unit tests passed; the original desktop/mobile browser flow and expanded catalog flow pass. The catalog also verifies nonzero image-derived signals for every bundled source. Screenshots were inspected at desktop and 390px mobile widths. Human listening quality and specialist accessibility validation remain pending.

## Sound identity update

The original engine used almost the same oscillators, note length, pulse, and C-pentatonic register for every image, so differences in the imagery were hard to hear. Each topic now has its own instrument family, pitch register/scale, pulse grid, envelope lengths, filtering, and delay:

| Topic                          | Sound character                      |
| ------------------------------ | ------------------------------------ |
| Night lights                   | Staggered plucks and city chimes     |
| Surface currents / temperature | Warm AM tones, cool pad, FM accents  |
| Aerosols                       | Interleaved filtered reeds           |
| Air quality                    | Dry bass and clipped pulses          |
| Perpetual Ocean                | Rolling FM bubbles and low tones     |
| Carbon dioxide                 | Slow low-register resonance          |
| Lightning                      | Membrane hits and sharp clicks       |
| Atmospheric river              | Overlapping soft swells and droplets |
| Forest canopy                  | Wooden plucks and call-and-response  |
| Caldwell 73                    | High ringing FM bells                |

These instrumental choices are artistic conventions, not natural sounds measured by the satellite. Local image strength controls filter opening, pitch, note strength, and whether weaker phrases leave gaps. A fixed per-scene reference is computed once from 48 image samples; calibration is not recomputed at every scan step. This improves within-scene expression but means loudness between scenes is not a physical comparison. Each sound profile also has an artistic output-level trim.

`src/soundDesign.ts` owns the musical rules. `renderAudioPreview` uses the same engine in an offline audio context for regression testing. The browser audio test writes eight-second comparison WAVs to ignored `test-results/audio/` and checks non-silence, clipping, distinct waveforms, and low/high-register separation. Those checks do not substitute for human listening tests.

## Immersive UI redesign

The separate landing page introduces the experience with a rotating Earth and a Canvas ASCII field. `/explore` contains the globe, regional shortcuts, unified search, NASA library, nonmodal detail panel (expandable bottom sheet on phones), and persistent audio dock. The dock visualizes the actual output through a read-only Tone analyser. Image analysis, calibration, instrument profiles and source assets are unchanged.

The globe uses NASA Blue Marble Next Generation (May 2004), downloaded from NASA Earth Observatory. This 5400 x 2700 context texture is separate from the images used for sonification. Provenance is recorded in `public/assets/globe-provenance.json`. It is a global texture, not streamed Google Earth terrain or street-level imagery.

Reduced motion stops automatic orbit and ASCII animation; search and controls remain immediate. Reduced transparency and high contrast receive explicit surface treatments. No new package dependencies were added. See `UI_REDESIGN_SUMMARY.md` for scope, checks and limitations.

## Dated night-lights comparison

India and Ukraine now offer 2012 and 2023 annual-average snapshots from NASA SVS 5313. Choose a regional study, play, then switch years: the visual, ASCII and input sound features update at the same spatial scan position. Both snapshots share a pooled audio calibration computed from 48 spatial samples per year; this keeps the artistic audio reference consistent within each regional comparison. It does not produce calibrated radiance or establish a cause of change. This is a two-date comparison, not a continuous twelve-year reconstruction.

The 2023 image comes from frame 240 (8 seconds at 30 fps) of the original EIC movie, before the colored difference-map transition. Its year label was visually checked. `public/assets/nightlights-timeline.json` records provenance; `python scripts/prepare_timeline.py` reproduces the derivatives from `.cache/eic.mp4`.

Quick demo: Enter Earth ? India ? Play ? 2023 ? 2012. On phones the year buttons are in the regional panel; the player remains pinned below it.
