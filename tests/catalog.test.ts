import { describe, it, expect } from "vitest";
import { analyzeScene } from "../src/catalogAnalysis";
import { catalog, info } from "../src/catalog";
import { type Profile } from "../src/scenes";
const profiles = catalog.map((s) => s.profile!);
function image(r: number, g: number, b: number) {
  const d = new Uint8ClampedArray(40 * 30 * 4);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    d[i + 3] = 255;
  }
  return d;
}
describe("NASA catalog and scientific mappings", () => {
  it("covers every remaining visual resource exactly once", () => {
    expect(new Set(catalog.map((s) => s.source))).toEqual(
      new Set([
        "3912",
        "5572",
        "5533",
        "5425",
        "5196",
        "5011",
        "4960",
        "4950",
        "13786",
      ]),
    );
  });
  it("has credits, source links, masks and explicit limitations", () => {
    for (const s of catalog) {
      expect(info(s).source).toMatch(/^https:\/\/svs.gsfc.nasa.gov\/\d+\/$/);
      expect(s.credit!.length).toBeGreaterThan(20);
      expect(s.limitation).toContain("still");
      expect(s.roi).toHaveLength(4);
      const [x, y, w, h] = s.roi!;
      expect(x + w).toBeLessThanOrEqual(1);
      expect(y + h).toBeLessThanOrEqual(1);
    }
  });
  for (const profile of profiles) {
    it(`${profile}: dark inputs are silent and outputs deterministic`, () => {
      const a = analyzeScene(image(0, 0, 0), 40, 30, 0.4, profile);
      expect(a.every((f) => f.brightness === 0)).toBe(true);
      expect(a).toEqual(analyzeScene(image(0, 0, 0), 40, 30, 0.4, profile));
    });
  }
  it("separates warm and cool colors", () => {
    const red = analyzeScene(image(255, 0, 0), 40, 30, 0.5, "thermal");
    const blue = analyzeScene(image(0, 0, 255), 40, 30, 0.5, "thermal");
    expect(red[0].brightness).toBeGreaterThan(red[1].brightness);
    expect(blue[1].brightness).toBeGreaterThan(blue[0].brightness);
  });
  it("suppresses neutral white annotation pixels in color detectors", () => {
    for (const p of [
      "air",
      "aerosol",
      "carbon",
      "moisture",
      "canopy",
      "lightning",
    ] as Profile[])
      expect(
        analyzeScene(image(255, 255, 255), 40, 30, 0.5, p).every(
          (f) => f.brightness === 0,
        ),
      ).toBe(true);
  });
  it("detects yellow lightning but ignores white cloud pixels", () => {
    expect(
      analyzeScene(image(255, 255, 0), 40, 30, 0.5, "lightning").some(
        (f) => f.brightness > 0,
      ),
    ).toBe(true);
  });
  it("green canopy detector excludes blue ocean", () => {
    expect(
      analyzeScene(image(0, 0, 255), 40, 30, 0.5, "canopy").every(
        (f) => f.brightness === 0,
      ),
    ).toBe(true);
    expect(
      analyzeScene(image(0, 255, 0), 40, 30, 0.5, "canopy")[0].brightness,
    ).toBeGreaterThan(0);
  });
});
