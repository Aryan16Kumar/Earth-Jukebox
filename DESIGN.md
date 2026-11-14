# Earth Jukebox visual system

This records the implemented redesign and the explicit brief of 2026-11-14. It does not infer preferences for other projects.

## Composition

The Earth is the interface. The explorer is a full-viewport experience with a large globe, lightweight peripheral controls, a nonmodal source panel and a persistent audio dock. The landing page is separate and introduces the experience. Avoid generic dashboard card grids and music-streaming layouts: the user wants an immersive geographic experience.

## Color and type

The requested ground is #050709, primary accent #C5F277 and secondary accent #4BA3FF. Tokens live in src/redesign.css. Lime marks actions and listening signals. DM Sans supplies editorial headings and readable UI; IBM Plex Mono is reserved for coordinates, scan timing and scientific metadata. Large headings use -0.035em tracking; body copy is untracked.

## Motion and materials

Globe focus interpolates from its current orientation and yields immediately to drag input. Preserve north-up selection. ASCII is a single Canvas with organic clusters, restrained flicker and cursor response, never code rain or individual DOM particles. Nonmodal source panels leave the Earth interactive. Functional floating chrome has dark material depth. Reduced motion disables ambient animation; reduced transparency makes chrome opaque.

## Product truth

Only India and Ukraine have geographic source windows. Other NASA scenes are library studies, not arbitrary local environmental data. The globe texture is context imagery, separate from scientific input. Preserve every source explanation, caveat, source link, voice control, ASCII mode and audio control. Audio visualization must use actual output.

## User references

"The Earth is the interface. Sound is the experience. Geography is the navigation."
"Avoid generic SaaS dashboards, excessive cards, or traditional music streaming app layouts."
"Do not invent unsupported audio categories or claim unavailable data exists."
