export type Region = {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lon: number;
  bounds: [number, number, number, number];
  image: string;
  story: string;
};
export const regions: Region[] = [
  {
    id: "india",
    name: "India",
    subtitle: "A constellation of human activity",
    lat: 23,
    lon: 79,
    bounds: [67, 6, 98, 37],
    image: "india.jpg",
    story:
      "Across the subcontinent, connected clusters of light trace settlements and infrastructure. Listen for how the brightness and distribution of these rendered lights change as the scan moves from west to east.",
  },
  {
    id: "ukraine",
    name: "Ukraine",
    subtitle: "Reading a changing night",
    lat: 49,
    lon: 32,
    bounds: [22, 44, 41, 53],
    image: "ukraine.jpg",
    story:
      "NASA includes Ukraine in its night-lights comparison. This listening study explores the spatial pattern in one rendered frame. Light alone cannot establish the cause of a change; interpretation requires context and the original scientific source.",
  },
];
export const asset = (name: string) =>
  `${import.meta.env.BASE_URL}assets/${name}`;
