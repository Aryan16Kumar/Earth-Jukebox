export type Feature = {
  brightness: number;
  vertical: number;
  horizontal: number;
};
export function analyzeBand(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  band: number,
): Feature {
  let energy = 0,
    xsum = 0,
    ysum = 0;
  const from = Math.floor((band * height) / 3),
    to = Math.floor(((band + 1) * height) / 3);
  for (let y = from; y < to; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const l =
        ((0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) /
          255) *
        (data[i + 3] / 255);
      energy += l;
      xsum += (l * x) / Math.max(1, width - 1);
      ysum += (l * y) / Math.max(1, height - 1);
    }
  return {
    brightness: energy / (width * (to - from) || 1),
    horizontal: energy ? xsum / energy : 0.5,
    vertical: energy ? ysum / energy : 0.5,
  };
}
export const SCALE = [48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72];
export function mapping(f: Feature) {
  return {
    midi: SCALE[Math.round((1 - f.vertical) * (SCALE.length - 1))],
    gain: Math.min(0.28, Math.sqrt(f.brightness) * 0.36),
    pan: Math.max(-1, Math.min(1, f.horizontal * 2 - 1)),
  };
}
export function asciiFrame(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const chars = " .,:;irsXA253hMHGS#9B&@";
  let s = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const l =
        (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      s +=
        chars[
          Math.min(
            chars.length - 1,
            Math.round(Math.sqrt(l) * (chars.length - 1)),
          )
        ];
    }
    s += "\n";
  }
  return s;
}
