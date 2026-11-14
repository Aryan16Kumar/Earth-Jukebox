import { describe, it, expect } from "vitest";
import {
  soundDesigns,
  soundParameters,
  shouldTrigger,
  calibrate,
  type Calibration,
} from "../src/soundDesign";
import { type Profile } from "../src/scenes";
const f = { brightness: 0.05, vertical: 0.4, horizontal: 0.5 };
describe("audibly distinct image-driven arrangements", () => {
  it("every topic has a distinct instrument/register/rhythm fingerprint", () => {
    const signatures = Object.values(soundDesigns).map((d) =>
      JSON.stringify([d.instruments, d.roots, d.step, d.patterns, d.duration]),
    );
    expect(new Set(signatures).size).toBe(10);
  });
  it("carbon has lower notes and slower pulses than stars and lightning", () => {
    expect(soundParameters(f, "carbon", 0).midi).toBeLessThan(
      soundParameters(f, "stars", 0).midi - 24,
    );
    expect(soundDesigns.carbon.step).toBeGreaterThan(
      soundDesigns.lightning.step * 4,
    );
  });
  it("blank image never creates notes in any arrangement", () => {
    for (const p of Object.keys(soundDesigns) as Profile[])
      for (let step = 0; step < 24; step++)
        for (let voice = 0; voice < 3; voice++)
          expect(
            shouldTrigger(p, voice, step, { ...f, brightness: 0 }, 0.1),
          ).toBe(false);
  });
  it("local brightness changes pitch, gain, and filter opening", () => {
    const low = soundParameters({ ...f, brightness: 0.005 }, "thermal", 0, 0.1),
      high = soundParameters({ ...f, brightness: 0.1 }, "thermal", 0, 0.1);
    expect(high.midi).toBeGreaterThan(low.midi);
    expect(high.gain).toBeGreaterThan(low.gain);
    expect(high.cutoff).toBeGreaterThan(low.cutoff);
  });
  it("stronger local features fill more phrases", () => {
    const count = (b: number) =>
      Array.from({ length: 32 }, (_, step) =>
        shouldTrigger("canopy", 0, step, { ...f, brightness: b }, 0.1),
      ).filter(Boolean).length;
    expect(count(0.1)).toBeGreaterThan(count(0.005));
  });
  it("scene calibration ignores silence and remains fixed and bounded", () => {
    const silent = calibrate(
      Array.from({ length: 10 }, () =>
        Array.from({ length: 3 }, () => ({ ...f, brightness: 0 })),
      ),
    );
    expect(silent.every((v) => v >= 0.008)).toBe(true);
    const samples = Array.from({ length: 20 }, (_, i) =>
      Array.from({ length: 3 }, () => ({ ...f, brightness: i / 100 })),
    );
    expect(calibrate(samples)).toEqual(calibrate(samples));
  });
  it("stars use radial position for pitch and never brightness for pitch", () => {
    expect(
      soundParameters({ ...f, vertical: 0.1 }, "stars", 0).midi,
    ).toBeGreaterThan(
      soundParameters({ ...f, vertical: 0.9 }, "stars", 0).midi,
    );
    expect(soundParameters({ ...f, brightness: 0.01 }, "stars", 0).midi).toBe(
      soundParameters({ ...f, brightness: 0.1 }, "stars", 0).midi,
    );
  });
});
