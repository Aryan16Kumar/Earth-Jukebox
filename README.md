# Earth Jukebox

A globe-first listening atlas built for NASA Space Apps 2026, The Earth Information Jukebox. Rotate Earth, select the India or Ukraine regional window, and explore NASA night-lights imagery through original browser-generated sound. Includes a synchronized spatial scan, three musical voices, mute/solo controls, and an optional ASCII view.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
npm run build
npm test
npx playwright test
```

Install the test browser once with `npx playwright install chromium`. The static production output is in `dist/`; relative asset paths support subdirectory hosting. Public deployment has not yet been configured.

## NASA imagery and scientific scope

Source: [NASA SVS 5313 — Change in Night Lights between 2012 and 2023, EIC version](https://svs.gsfc.nasa.gov/5313/).

The current scenes use **frame 0, labeled 2012 annual average**, not the full historical animation. The EIC 7680 × 2160 render repeats a global map; we extract the first 3840 × 2160 map. Regional windows are rectangular equirectangular crops and include neighboring territory:

| Window  | West | South | East | North |
| ------- | ---: | ----: | ---: | ----: |
| India   |   67 |     6 |   98 |    37 |
| Ukraine |   22 |    44 |   41 |    53 |

See `public/assets/validation.json` for exact source pixels. Labels and legend areas lie outside these regional windows. The globe is a resized decorative version of the same map. It is a geographic selector, not an analytical map or a national-boundary dataset.

Credit: NASA Scientific Visualization Studio, visualization by Kel Elkins (USRA). Scientific consulting: Zhuosen Wang, Miguel Román, Ranjay Shrestha, Srija Chakraborty, Virginia Kalb. Black Marble imagery: NASA Earth Observatory images by Joshua Stevens, using Suomi NPP VIIRS data from Miguel Román, NASA GSFC. NASA imagery remains subject to [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). This independent project is not endorsed by NASA.

## How the sound works

A 24-second cursor scans **space from west to east**, not years. A narrow image strip is divided into northern, middle, and southern bands. Luminance controls note strength; the vertical light centroid selects a note from a fixed C pentatonic scale; scan position controls stereo pan. Analysis uses rendered RGB luminance, including map background, and is not calibrated physical radiance. No cause, growth rate, economic statistic, or temporal trend is inferred.

Tone.js synthesizes three voices using gentle envelopes and a master limiter. The scan follows the audio-context clock; notes are triggered at fixed scan intervals. Pausing, closing, and changing scenes release the voices. ASCII characters render luminance for display only and do not change the audio input. Audio requires a user gesture.

## Architecture and references

React + TypeScript + Vite; React Three Fiber / Drei / Three.js for the globe; Canvas for image analysis; Tone.js for sound; Lucide for interface icons. Dependencies retain their own licenses. Fonts: DM Sans and IBM Plex Mono via Google Fonts, with local system fallbacks.

Reference research: [NASA GIBS examples](https://github.com/nasa-gibs/gibs-web-examples), [TwoTone](https://github.com/kineteklabs/twotone), [EarthTunes](https://github.com/parinithad62/earthtunes), [Green Corner](https://github.com/Mlink1415/green-corner-app), and [Highcharts Sonification Studio](https://github.com/highcharts/sonification-studio). These were references, not copied application code. Highcharts is not a dependency.

## Asset reproduction

Python scripts require `requests`, `opencv-python`, and `Pillow`. Run `python scripts/prepare_assets.py` then `python scripts/extract_regions.py`. Source video downloads to ignored `.cache/`. The app uses bundled image derivatives, not a runtime NASA API. The extraction report records geographic and pixel bounds.

## Accessibility and testing

Native dialogs with Escape-to-close and restored focus, labeled controls, keyboard-accessible regional cards, reduced-motion support, and descriptive scientific explanations. The globe is supplemented by the region list. ASCII decoration is hidden from screen readers.

Automated checks cover deterministic mappings, silent/transparent inputs, band isolation, stereo position, pitch ordering, and ASCII output. Browser checks cover region selection, playback progress, seeking, ASCII, dialog focus restoration, and mobile layout. Human listening tests, screen-reader usability, and testing with blind or low-vision participants remain outstanding. Automated checks cannot establish that the sound is musically effective or that the product is accessible to every user.

## Team delivery checklist

Before submission: complete human listening and keyboard/screen-reader reviews; record the actual findings; produce the presentation/video; verify current event rules, award categories, credits, AI/tool disclosure requirements, and submission deadlines. The private implementation checklist is intentionally gitignored.

## Verification status

Production build and eight analysis unit tests pass. The browser smoke test checks desktop/mobile region selection, playback, spatial seeking, ASCII output, dialog focus restoration, and overflow. Browser policy can require pressing Play after selecting a region; the dialog remains usable either way. The lazy-loaded 3D bundle is the largest asset and remains a performance optimization opportunity.
