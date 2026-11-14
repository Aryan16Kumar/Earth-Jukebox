# UI redesign summary

## Changes

- Separate cinematic landing page and `/explore` product screen, with browser history support.
- Existing React Three Fiber globe retained; NASA Blue Marble context texture, improved lighting/render resolution, compact markers and interruptible north-up region focus.
- Unified place/study search, regional shortcuts and a floating NASA library reuse all existing scenes.
- Nonmodal location/source panel, expandable mobile bottom sheet and persistent audio dock with real Tone waveform, play/pause, seeking and volume.
- Canvas ASCII ambient field, original per-image ASCII mode, responsive composition, focus restoration, reduced-motion/transparency and contrast treatments.

## Files

App.tsx and Globe.tsx redesigned. ListeningRoom.tsx and About.tsx extracted from App.tsx. AsciiField.tsx, Waveform.tsx and redesign.css added. ResourceLibrary.tsx reused. audio.ts adds only a lazily connected analyser and its cleanup. DESIGN.md records the user-specified direction. Globe texture provenance is in public/assets/globe-provenance.json.

## Preservation and dependencies

No new package dependencies. Backend/API architecture, original NASA study imagery, source metadata, image analysis, calibration, synth instruments and scientific mappings remain unchanged. All eleven studies, voice mute/solo, ASCII, source explanations and source links remain available.

## Verification

Production build and all 30 unit tests passed. All five browser tests passed, covering desktop/mobile flows, all NASA scenes, actual audio comparisons for eleven studies, search, history, reduced motion, mobile expansion and a non-flat actual-output waveform. Desktop and mobile screenshots were inspected; oversized labels and inverted focus orientation were corrected.

## Limitations

The globe uses a 5400 x 2700 global NASA texture, not streamed terrain or Google Earth-level deep zoom. Geographic coverage remains two regional windows; other scenes retain their original camera geography. Still-image scan time is not historical time. Mobile details expand via a button, not a swipe gesture. Human listening, real-device touch performance and specialist screen-reader validation remain outstanding. The existing large Three.js/Tone bundles still produce a build-size warning. Static hosts need SPA fallback for `/explore`.

## Landing globe follow-up

The WebGL canvas now fills the entire hero behind its text and controls, preventing internal top/bottom clipping when zooming. Orbit pauses during drag and resumes on release unless manually paused or reduced motion is enabled. Upgraded the NASA texture to 5400 x 2700 and enabled the GPU-supported anisotropic filtering maximum. Build and targeted browser checks verify full-hero bounds, post-drag rotation, manual pause and mobile layout.
