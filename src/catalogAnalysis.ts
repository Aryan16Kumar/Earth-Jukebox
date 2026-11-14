import { type Feature } from "./analysis";
import { type Profile } from "./scenes";
export function analyzeScene(
  data: Uint8ClampedArray,
  w: number,
  h: number,
  p: number,
  profile: Profile,
): Feature[] {
  const sums = [0, 0, 0],
    ys = [0, 0, 0],
    counts = [0, 0, 0];
  const sector = p * Math.PI * 2;
  const centerX = (w - 1) / 2,
    centerY = (h - 1) / 2;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (profile === "stars") {
        const a =
          (Math.atan2(x - centerX, centerY - y) + Math.PI * 2) % (Math.PI * 2);
        if ((a - sector + Math.PI * 2) % (Math.PI * 2) > 0.14) continue;
      } else if (Math.abs(x - p * (w - 1)) > 4) continue;
      const k = (y * w + x) * 4,
        r = data[k] / 255,
        g = data[k + 1] / 255,
        b = data[k + 2] / 255,
        alpha = data[k + 3] / 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b),
        sat = max - min,
        l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      const warm = Math.max(0, r - (g + b) / 2),
        cool = Math.max(0, b - (r + g) / 2),
        green = Math.max(0, g - (r + b) / 2),
        cyan = Math.max(0, Math.min(g, b) - r),
        yellow = Math.max(0, Math.min(r, g) - b);
      const previous = x ? (data[k - 4] + data[k - 3] + data[k - 2]) / 765 : l,
        edge = Math.abs(l - previous);
      let values: number[];
      switch (profile) {
        case "thermal":
          values = [warm, cool, edge * sat * 3];
          break;
        case "aerosol":
          values = [Math.max(warm, Math.min(r, b) - g), cool, green];
          break;
        case "air":
          values = [warm, green, cool];
          break;
        case "flow":
          values = [edge * 3, l > 0.45 ? l : 0, Math.max(cool, cyan)];
          break;
        case "carbon":
          values = [warm, cool, sat];
          break;
        case "moisture":
          values = [cool, cyan, edge * sat * 3];
          break;
        case "canopy":
          values = [green, green * l * 2, edge * green * 5];
          break;
        case "lightning":
          values = [0, 0, 0];
          values[Math.min(2, Math.floor((y / h) * 3))] =
            yellow > 0.12 ? yellow : 0;
          break;
        case "stars":
          values = [warm * l, cool * l, sat < 0.12 && l > 0.3 ? l : 0];
          break;
        default:
          values = [l, l, l];
      }
      for (let i = 0; i < 3; i++) {
        const v = Math.max(0, Math.min(1, values[i])) * alpha;
        counts[i]++;
        sums[i] += v;
        const vertical =
          profile === "stars"
            ? 1 -
              Math.min(
                1,
                Math.hypot((x - centerX) / (w / 2), (y - centerY) / (h / 2)),
              )
            : y / Math.max(1, h - 1);
        ys[i] += v * vertical;
      }
    }
  return sums.map((s, i) => ({
    brightness: Math.min(
      1,
      (s / (counts[i] || 1)) * (profile === "lightning" ? 12 : 1),
    ),
    vertical: s ? ys[i] / s : 0.5,
    horizontal: profile === "stars" ? 0.5 + 0.5 * Math.sin(sector) : p,
  }));
}
