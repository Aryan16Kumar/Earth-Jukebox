import { type Scene } from "./scenes";
const limit =
  "One published still is scanned in image space, not historical time. Sound describes rendered visual features; it does not recover calibrated physical values, motion, event counts, or causes. Globe views are not georeferenced maps.";
export const catalog: Scene[] = [
  {
    id: "currents",
    name: "Ocean currents & temperature",
    subtitle: "Heat carried across the blue planet",
    image: "catalog/currents.jpg",
    profile: "thermal",
    category: "Ocean",
    source: "3912",
    period: "Source simulation: March 2007–March 2008",
    credit: "NASA SVS / Greg Shirah. ECCO2, MIT/JPL.",
    roi: [0.015, 0.07, 0.97, 0.84],
    layers: ["Warm-colored flow", "Cool-colored flow", "Fine current texture"],
    suffix: "",
    story:
      "ECCO2 combines ocean modeling with satellite and in-situ information. Its surface currents are colored by temperature. Explore the contrast between warm and cool rendered flow patterns.",
    explanation:
      "Warm color excess drives a triangle voice; cool color excess drives a sine voice. Local edge contrast produces a higher texture voice. Color is an artistic proxy, not a temperature reading. Left-to-right scan position controls stereo placement.",
    limitation: limit,
  },
  {
    id: "aerosols",
    name: "GEOS aerosols",
    subtitle: "An atmosphere with many voices",
    image: "catalog/aerosols.jpg",
    profile: "aerosol",
    category: "Atmosphere",
    source: "5572",
    period: "Source model: August 1–September 14, 2024",
    credit:
      "NASA SVS / GMAO. Joseph V. Ardizzone, Helen-Nicole Kostis; science: Lesley Ott.",
    roi: [0.015, 0.04, 0.97, 0.82],
    layers: ["Warm / magenta color", "Blue color", "Green color"],
    suffix: "",
    story:
      "GEOS renders atmospheric aerosols with distinct colors. NASA identifies blue sea salt, magenta dust, warm smoke, and green sulfates. Our three-voice sketch groups warm and magenta visual activity; it cannot separate overlapping aerosol species.",
    explanation:
      "Three voices measure warm/magenta, blue, and green channel excess in the scan strip. Saturated pixels contribute; neutral terrain and neutral labels are suppressed. Colored terrain can still contribute. Intensity drives note strength, and vertical distribution drives pitch.",
    limitation:
      limit + " RGB channels are not independently measured aerosol layers.",
  },
  {
    id: "air-quality",
    name: "Air quality model runs",
    subtitle: "Listening to a modeled atmosphere",
    image: "catalog/air-quality.jpg",
    profile: "air",
    category: "Atmosphere",
    source: "5533",
    period: "Source GEOS-CF run: July–August 2024",
    credit:
      "NASA SVS / NASA GMAO. Helen-Nicole Kostis, Joseph V. Ardizzone; science: Lesley Ott.",
    roi: [0.24, 0.05, 0.52, 0.87],
    layers: [
      "Warm rendered layer",
      "Green rendered layer",
      "Blue / violet rendered layer",
    ],
    suffix: "",
    story:
      "GEOS-CF models the transport of pollutants including CO, PM2.5, ozone, and nitrogen oxides. This composite shows multiple colored layers. Listen to their visual balance, rather than interpreting sound as an air-quality index.",
    explanation:
      "The cropped sphere excludes its outer white frame. Warm, green, and cool color excesses drive three voices. Neutral labels are filtered out; no color channel is assigned to a particular pollutant or health threshold.",
    limitation: limit + " This is not an air-quality alert or a live forecast.",
  },
  {
    id: "perpetual",
    name: "Perpetual Ocean 2",
    subtitle: "Western boundary currents, in texture",
    image: "catalog/perpetual.jpg",
    profile: "flow",
    category: "Ocean",
    source: "5425",
    period: "Published still · western boundary currents",
    credit:
      "NASA Scientific Visualization Studio / Greg Shirah and collaborators. ECCO ocean model.",
    roi: [0.12, 0.03, 0.76, 0.91],
    layers: [
      "Flow-line contrast",
      "Bright current detail",
      "Blue / cyan detail",
    ],
    suffix: "",
    story:
      "The western edges of ocean basins contain major current systems. This beauty rendering uses white and blue/cyan flow lines. Its linework becomes an evolving spatial composition as the cursor crosses the still.",
    explanation:
      "Neighboring-pixel contrast drives the first voice; bright detail drives the second; blue/cyan excess drives the third. Line contrast represents visual texture, not current speed. A still cannot reveal flow direction or motion.",
    limitation: limit + " Beauty-render colors are not a temperature scale.",
  },
  {
    id: "co2",
    name: "DYAMOND carbon dioxide",
    subtitle: "Patterns in an invisible gas",
    image: "catalog/co2.jpg",
    profile: "carbon",
    category: "Atmosphere",
    source: "5196",
    period: "Source simulation: January–March 2020",
    credit:
      "NASA SVS / AJ Christensen, Greg Shirah, Helen-Nicole Kostis, Mark SubbaRao. DYAMOND; science: Lesley Ott and collaborators.",
    roi: [0.23, 0.07, 0.53, 0.82],
    layers: ["Warm-colored volume", "Cool-colored volume", "Color coverage"],
    suffix: "",
    story:
      "NASA renders CO2 from the coupled DYAMOND model as a volume around Earth. The scan explores the visual distribution of colored gas in one camera view. CO2 also exists where the rendering is transparent.",
    explanation:
      "Warm and cool chromatic excess drive two voices; total color saturation drives the third. Cropping removes the timestamp. Neutral land is suppressed, but colored terrain and rendering opacity can influence the signal. No ppm value is inferred.",
    limitation:
      limit +
      " Camera angle and volume opacity influence this artistic reading.",
  },
  {
    id: "lightning",
    name: "Lightning from the ISS",
    subtitle: "A percussive reading of bright events",
    image: "catalog/lightning.jpg",
    profile: "lightning",
    category: "Atmosphere",
    source: "5011",
    period: "Source observations: 2017–2023 · published preview",
    credit:
      "NASA SVS / Michala Garrison, Greg Shirah, Kel Elkins, Alex Kekesi. ISS Lightning Imaging Sensor / NASA GHRC.",
    roi: [0.08, 0.07, 0.85, 0.85],
    layers: [
      "Upper yellow highlights",
      "Middle yellow highlights",
      "Lower yellow highlights",
    ],
    suffix: "",
    story:
      "LIS detected lightning from the International Space Station. NASA visualizes detections with a rolling time window. Our still-image study translates yellow highlights into short, percussive notes—not recordings of thunder or reconstructions of individual strikes.",
    explanation:
      "Only yellow-dominant pixels contribute. Three horizontal bands trigger short square-wave notes as the cursor reaches their highlights. Neutral clouds, white ISS text, and white annotation lines do not contribute to the yellow detector. A note can represent many rendered pixels.",
    limitation:
      limit +
      " Highlight density is not a count or timing of lightning events.",
  },
  {
    id: "river",
    name: "An atmospheric river",
    subtitle: "A corridor of moisture across the Pacific",
    image: "catalog/river.jpg",
    profile: "moisture",
    category: "Atmosphere",
    source: "4960",
    period: "MERRA-2 visualization · published still",
    credit:
      "NASA SVS / Greg Shirah, Horace Mitchell, Cindy Starr, Kel Elkins. MERRA-2; science: Allison Collow, Natalie Thomas, Michael Bosilovich.",
    roi: [0.04, 0.06, 0.92, 0.82],
    layers: ["Blue shading", "Cyan shading", "Moisture-pattern contrast"],
    suffix: "",
    story:
      "MERRA-2 blends a model with observations. NASA uses blue shading to show water-vapor transport in three dimensions. Explore how the rendered corridor spans the image, while remembering that the ocean and terrain can also contain blue.",
    explanation:
      "Blue and cyan channel excess become two gentle voices; local color contrast becomes a third. This is a rendered-image interpretation, not a water-vapor-transport estimate. Static position, rather than atmospheric movement, drives the scan.",
    limitation:
      limit +
      " The detector cannot completely distinguish moisture from similarly colored background.",
  },
  {
    id: "forest",
    name: "GEDI forest height",
    subtitle: "Canopy structure translated into notes",
    image: "catalog/forest.jpg",
    profile: "canopy",
    category: "Land",
    source: "4950",
    period: "Source observations: April 2019–April 2020",
    credit: "NASA SVS / Kel Elkins. GEDI observations aboard the ISS.",
    roi: [0.24, 0.04, 0.51, 0.86],
    layers: ["Green canopy color", "Bright green detail", "Vegetation texture"],
    suffix: "",
    story:
      "GEDI measures the three-dimensional structure of forests. NASA renders shorter vegetation in brown/dark green and taller vegetation in bright green/white, with height exaggerated. This crop excludes the legend; it is an artistic canopy-color study.",
    explanation:
      "Green excess drives a soft sine voice; bright green detail drives a second voice; green-weighted local contrast supplies texture. Blue ocean is suppressed. The visual mapping cannot recover tree height in meters, and white-only tall-canopy pixels may be omitted.",
    limitation:
      limit +
      " Color rendering, illumination, and exaggeration affect the signal.",
  },
  {
    id: "caldwell",
    name: "Caldwell 73 listening lesson",
    subtitle: "Learn the language of sonification",
    image: "catalog/caldwell.jpg",
    profile: "stars",
    category: "Space lesson",
    source: "13786",
    period: "Hubble image · methodological reference",
    credit:
      "NASA Goddard Space Flight Center / Hubble. Original sonification: SYSTEM Sounds (M. Russo, A. Santaguida). Our synthesis is original.",
    roi: [0.03, 0.03, 0.94, 0.94],
    layers: ["Orange / red starlight", "Blue starlight", "Neutral starlight"],
    suffix: "",
    story:
      "NASA’s Caldwell 73 example uses a rotating scan, radial pitch, and different instruments for stellar colors. Our original listening exercise applies those principles to its published image. This globular cluster is outside Earth and is kept separate from the Earth-science tracks.",
    explanation:
      "A rotating wedge scans clockwise from the top. Red/orange, blue, and near-neutral bright pixels become three voices. Greater distance from the image center maps to higher pitch. This is an original simplified synthesis, not NASA’s choir, marimba, or glockenspiel soundtrack.",
    limitation:
      limit +
      " The published preview contains rendered elements; this is a pedagogical demonstration, not stellar photometry.",
  },
];
export function info(scene: Scene) {
  return {
    profile: scene.profile ?? "night",
    source: `https://svs.gsfc.nasa.gov/${scene.source ?? "5313"}/`,
    period: scene.period ?? "2012 · annual average",
    credit:
      scene.credit ??
      "NASA SVS / Kel Elkins. Black Marble: NASA Earth Observatory / Joshua Stevens; Suomi NPP VIIRS data / Miguel Román, NASA GSFC.",
    layers: scene.layers ?? ["Northern band", "Middle band", "Southern band"],
    explanation:
      scene.explanation ??
      "Scan west to east. Brightness drives note strength, vertical light concentration selects a pentatonic pitch, and scan position controls stereo pan. These are image features, not calibrated radiance.",
    limitation:
      scene.limitation ??
      "2012 still frame from the EIC 2012–2023 animation. Regional rectangles include neighboring territory. Scan time is spatial, not historical; no trend or cause is inferred.",
  };
}
