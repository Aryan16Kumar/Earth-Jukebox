import { describe, it, expect } from "vitest";
import { analyzeBand, mapping, asciiFrame } from "../src/analysis";
function pixels(
  w: number,
  h: number,
  lights: (x: number, y: number) => number,
) {
  const p = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      p[i] = p[i + 1] = p[i + 2] = lights(x, y);
      p[i + 3] = 255;
    }
  return p;
}
describe("image-derived sonification", () => {
  it("darkness has zero gain", () => {
    const f = analyzeBand(
      pixels(9, 9, () => 0),
      9,
      9,
      0,
    );
    expect(f.brightness).toBe(0);
    expect(mapping(f).gain).toBe(0);
  });
  it("brighter pixels have greater gain", () => {
    const a = analyzeBand(
        pixels(9, 9, () => 40),
        9,
        9,
        0,
      ),
      b = analyzeBand(
        pixels(9, 9, () => 200),
        9,
        9,
        0,
      );
    expect(mapping(b).gain).toBeGreaterThan(mapping(a).gain);
  });
  it("left and right distributions map to opposite stereo positions", () => {
    const a = analyzeBand(
        pixels(9, 9, (x) => (x === 0 ? 255 : 0)),
        9,
        9,
        0,
      ),
      b = analyzeBand(
        pixels(9, 9, (x) => (x === 8 ? 255 : 0)),
        9,
        9,
        0,
      );
    expect(mapping(a).pan).toBe(-1);
    expect(mapping(b).pan).toBe(1);
  });
  it("northern lights map to higher notes", () => {
    const a = analyzeBand(
        pixels(9, 9, () => 255),
        9,
        9,
        0,
      ),
      b = analyzeBand(
        pixels(9, 9, () => 255),
        9,
        9,
        2,
      );
    expect(mapping(a).midi).toBeGreaterThan(mapping(b).midi);
  });
  it("separates horizontal bands", () => {
    const p = pixels(9, 9, (_, y) => (y < 3 ? 255 : 0));
    expect(analyzeBand(p, 9, 9, 0).brightness).toBeCloseTo(1);
    expect(analyzeBand(p, 9, 9, 2).brightness).toBe(0);
  });
  it("transparent pixels are silent", () => {
    expect(
      analyzeBand(new Uint8ClampedArray(9 * 9 * 4), 9, 9, 0).brightness,
    ).toBe(0);
  });
  it("is deterministic and bounded", () => {
    const p = pixels(9, 9, (x) => x * 20);
    const f = analyzeBand(p, 9, 9, 1);
    expect(f).toEqual(analyzeBand(p, 9, 9, 1));
    expect(mapping(f).gain).toBeLessThanOrEqual(0.28);
  });
  it("ASCII distinguishes darkness and light", () => {
    expect(
      asciiFrame(
        pixels(2, 1, (x) => (x ? 255 : 0)),
        2,
        1,
      ),
    ).toBe(" @\n");
  });
});
