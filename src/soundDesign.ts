import { type Feature } from "./analysis";
import { type Profile } from "./scenes";
export type Instrument =
  "pluck" | "fm" | "am" | "pad" | "sub" | "reed" | "drum" | "bell" | "sine";
export type SoundDesign = {
  name: string;
  description: string;
  instruments: [Instrument, Instrument, Instrument];
  step: number;
  patterns: [number[], number[], number[]];
  roots: [number, number, number];
  scale: number[];
  duration: [number, number, number];
  cutoff: [number, number, number];
  delay: number;
  wet: number;
};
export const soundDesigns: Record<Profile, SoundDesign> = {
  night: {
    name: "City chimes",
    description:
      "Short plucked lights in staggered patterns. Brighter clusters open denser phrases.",
    instruments: ["pluck", "bell", "pluck"],
    step: 0.16,
    patterns: [
      [0, 4],
      [1, 5],
      [2, 6],
    ],
    roots: [48, 60, 67],
    scale: [0, 2, 4, 7, 9],
    duration: [0.16, 0.22, 0.12],
    cutoff: [3600, 6000, 4800],
    delay: 0.24,
    wet: 0.12,
  },
  thermal: {
    name: "Thermal duet",
    description:
      "Warm AM tones answer a soft cool-water pad; fine texture adds high FM accents.",
    instruments: ["am", "pad", "fm"],
    step: 0.28,
    patterns: [
      [0, 3, 6],
      [0, 4],
      [2, 5, 7],
    ],
    roots: [43, 55, 67],
    scale: [0, 2, 3, 7, 10],
    duration: [0.42, 0.9, 0.13],
    cutoff: [2200, 1500, 4200],
    delay: 0.28,
    wet: 0.09,
  },
  aerosol: {
    name: "Atmospheric reeds",
    description:
      "Three filtered, breath-like reed voices move in interleaved pulses; color strength opens their filters.",
    instruments: ["reed", "am", "reed"],
    step: 0.19,
    patterns: [
      [0, 2, 5],
      [1, 4, 7],
      [0, 3, 6],
    ],
    roots: [50, 57, 62],
    scale: [0, 1, 5, 7, 8],
    duration: [0.3, 0.22, 0.4],
    cutoff: [1300, 2600, 1800],
    delay: 0.19,
    wet: 0.16,
  },
  air: {
    name: "Composition pulses",
    description:
      "Dry, clipped bass and reed pulses make the three rendered color layers easy to separate.",
    instruments: ["sub", "reed", "am"],
    step: 0.12,
    patterns: [
      [0, 4],
      [2, 6],
      [1, 3, 5, 7],
    ],
    roots: [36, 48, 60],
    scale: [0, 3, 5, 6, 10],
    duration: [0.075, 0.09, 0.065],
    cutoff: [650, 1400, 2400],
    delay: 0.12,
    wet: 0,
  },
  flow: {
    name: "Current bubbles",
    description:
      "Round FM bubbles and low plucks follow uneven, rolling groups; line contrast changes their articulation.",
    instruments: ["fm", "pluck", "sine"],
    step: 0.13,
    patterns: [
      [0, 3, 5],
      [1, 4, 7],
      [0, 6],
    ],
    roots: [48, 60, 36],
    scale: [0, 2, 5, 7, 9],
    duration: [0.11, 0.1, 0.55],
    cutoff: [2800, 4200, 900],
    delay: 0.26,
    wet: 0.23,
  },
  carbon: {
    name: "Carbon resonance",
    description:
      "Slow low-register pads and a resonant FM undertone swell with rendered color coverage.",
    instruments: ["pad", "sub", "fm"],
    step: 0.48,
    patterns: [
      [0, 4],
      [2, 6],
      [0, 3, 6],
    ],
    roots: [31, 38, 43],
    scale: [0, 2, 5, 7, 10],
    duration: [1.3, 1, 0.8],
    cutoff: [850, 500, 1200],
    delay: 0.48,
    wet: 0.08,
  },
  lightning: {
    name: "Electric percussion",
    description:
      "Yellow highlights trigger low membrane hits, sharp FM clicks and clipped high pulses. Sparse highlights leave gaps.",
    instruments: ["drum", "fm", "reed"],
    step: 0.075,
    patterns: [
      [0, 2, 4, 6],
      [1, 3, 5, 7],
      [0, 1, 3, 5, 6, 7],
    ],
    roots: [28, 55, 76],
    scale: [0, 7, 12, 19, 24],
    duration: [0.065, 0.035, 0.025],
    cutoff: [1800, 7000, 8500],
    delay: 0.09,
    wet: 0.06,
  },
  moisture: {
    name: "Moisture swell",
    description:
      "Long soft pads and sine tones overlap into a continuous swell; contrast adds distant FM droplets.",
    instruments: ["pad", "sine", "fm"],
    step: 0.36,
    patterns: [
      [0, 4],
      [2, 6],
      [1, 5, 7],
    ],
    roots: [45, 52, 69],
    scale: [0, 2, 5, 9, 12],
    duration: [1.1, 0.9, 0.18],
    cutoff: [1200, 1800, 3200],
    delay: 0.36,
    wet: 0.2,
  },
  canopy: {
    name: "Canopy wood",
    description:
      "Dry wooden plucks in a spacious call-and-response pattern; stronger green detail increases note density.",
    instruments: ["pluck", "am", "pluck"],
    step: 0.22,
    patterns: [
      [0, 3, 6],
      [2, 5],
      [1, 4, 7],
    ],
    roots: [55, 62, 74],
    scale: [0, 2, 4, 7, 11],
    duration: [0.09, 0.14, 0.07],
    cutoff: [2400, 3600, 5000],
    delay: 0.11,
    wet: 0.07,
  },
  stars: {
    name: "Radial starlight",
    description:
      "High FM bells ring at three registers as the wedge crosses the image; larger radius raises pitch.",
    instruments: ["bell", "fm", "bell"],
    step: 0.2,
    patterns: [
      [0, 4],
      [1, 3, 5, 7],
      [2, 6],
    ],
    roots: [67, 79, 86],
    scale: [0, 2, 4, 7, 9],
    duration: [0.6, 0.4, 0.7],
    cutoff: [7000, 9000, 11000],
    delay: 0.3,
    wet: 0.27,
  },
};
export type Calibration = [number, number, number];
export const defaultCalibration: Calibration = [0.12, 0.12, 0.12];
export function calibrate(samples: Feature[][]): Calibration {
  return [0, 1, 2].map((i) => {
    const values = samples
      .map((f) => f[i].brightness)
      .filter((v) => v > 0.002)
      .sort((a, b) => a - b);
    return Math.max(
      0.008,
      values[Math.floor((values.length - 1) * 0.9)] ?? 0.12,
    );
  }) as Calibration;
}
export function soundParameters(
  f: Feature,
  profile: Profile,
  voice: number,
  reference = 0.12,
) {
  const d = soundDesigns[profile],
    level = Math.min(1, Math.max(0, f.brightness) / Math.max(0.008, reference));
  const pitch =
    profile === "stars"
      ? 1 - f.vertical
      : 0.65 * (1 - f.vertical) + 0.35 * level;
  const index = Math.round(
    Math.min(1, Math.max(0, pitch)) * (d.scale.length * 2 - 1),
  );
  return {
    midi:
      d.roots[voice] +
      d.scale[index % d.scale.length] +
      12 * Math.floor(index / d.scale.length),
    gain: f.brightness <= 0.002 ? 0 : 0.1 + 0.55 * Math.sqrt(level),
    pan: Math.max(-1, Math.min(1, f.horizontal * 2 - 1)),
    cutoff: d.cutoff[voice] * (0.45 + level * 1.2),
    level,
  };
}
export function shouldTrigger(
  profile: Profile,
  voice: number,
  step: number,
  f: Feature,
  reference: number,
) {
  if (f.brightness <= 0.002) return false;
  const d = soundDesigns[profile],
    slot = ((step % 8) + 8) % 8;
  if (!d.patterns[voice].includes(slot)) return false;
  const strength = Math.min(1, f.brightness / Math.max(0.008, reference));
  // Strong local features fill more phrases. Silence never generates a backing track.
  return strength >= 0.28 || Math.floor(step / 8) % 2 === 0;
}
export const outputTrimDb: Record<Profile, number> = {
  night: 8,
  thermal: 0,
  aerosol: 4,
  air: 3,
  flow: 0,
  carbon: 1,
  lightning: 7,
  moisture: 0,
  canopy: 15,
  stars: 7,
};
