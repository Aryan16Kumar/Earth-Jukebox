import * as Tone from "tone";
import { type Feature } from "./analysis";
import { type Profile } from "./scenes";
import {
  soundDesigns,
  outputTrimDb,
  soundParameters,
  shouldTrigger,
  defaultCalibration,
  type Calibration,
  type Instrument,
} from "./soundDesign";
type Voice =
  | Tone.Synth
  | Tone.FMSynth
  | Tone.AMSynth
  | Tone.PluckSynth
  | Tone.MembraneSynth;
function instrument(kind: Instrument): Voice {
  switch (kind) {
    case "pluck":
      return new Tone.PluckSynth({
        attackNoise: 0.5,
        dampening: 3600,
        resonance: 0.72,
      });
    case "bell":
      return new Tone.FMSynth({
        harmonicity: 3.01,
        modulationIndex: 5,
        envelope: { attack: 0.004, decay: 1.1, sustain: 0, release: 0.8 },
        modulationEnvelope: {
          attack: 0.001,
          decay: 0.45,
          sustain: 0,
          release: 0.5,
        },
      });
    case "fm":
      return new Tone.FMSynth({
        harmonicity: 1.5,
        modulationIndex: 2.5,
        envelope: { attack: 0.008, decay: 0.18, sustain: 0.08, release: 0.25 },
        modulationEnvelope: {
          attack: 0.003,
          decay: 0.2,
          sustain: 0.1,
          release: 0.2,
        },
      });
    case "am":
      return new Tone.AMSynth({
        harmonicity: 2.5,
        oscillator: { type: "triangle" },
        envelope: { attack: 0.015, decay: 0.16, sustain: 0.15, release: 0.2 },
      });
    case "drum":
      return new Tone.MembraneSynth({
        pitchDecay: 0.035,
        octaves: 5,
        envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.1 },
      });
    case "pad":
      return new Tone.Synth({
        oscillator: { type: "fatsine", count: 3, spread: 12 },
        envelope: { attack: 0.24, decay: 0.3, sustain: 0.6, release: 0.55 },
      });
    case "sub":
      return new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.015, decay: 0.12, sustain: 0.35, release: 0.25 },
      });
    case "reed":
      return new Tone.Synth({
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.02, decay: 0.09, sustain: 0.18, release: 0.12 },
      });
    default:
      return new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.08, decay: 0.2, sustain: 0.35, release: 0.35 },
      });
  }
}
export class AudioEngine {
  voices: Voice[] = [];
  pans: Tone.Panner[] = [];
  filters: Tone.Filter[] = [];
  gains: Tone.Gain[] = [];
  master: Tone.Volume;
  limiter: Tone.Limiter;
  delay: Tone.FeedbackDelay;
  constructor(
    public profile: Profile = "night",
    public calibration: Calibration = defaultCalibration,
  ) {
    const d = soundDesigns[profile];
    this.master = new Tone.Volume(-12 + outputTrimDb[profile]);
    this.limiter = new Tone.Limiter(-3).toDestination();
    this.delay = new Tone.FeedbackDelay({
      delayTime: d.delay,
      feedback: 0.18,
      wet: d.wet,
    }).connect(this.limiter);
    this.master.connect(this.delay);
    for (let i = 0; i < 3; i++) {
      const pan = new Tone.Panner(0).connect(this.master);
      const gain = new Tone.Gain(0).connect(pan);
      this.gains.push(gain);
      const filter = new Tone.Filter({
        frequency: d.cutoff[i],
        type: "lowpass",
        Q: 0.7,
      }).connect(gain);
      this.pans.push(pan);
      this.filters.push(filter);
      this.voices.push(instrument(d.instruments[i]).connect(filter));
    }
  }
  async start() {
    await Tone.start();
  }
  play(features: Feature[], enabled: boolean[], step = 0, time = Tone.now()) {
    const d = soundDesigns[this.profile];
    features.forEach((f, i) => {
      if (
        !enabled[i] ||
        !shouldTrigger(this.profile, i, step, f, this.calibration[i])
      )
        return;
      const p = soundParameters(f, this.profile, i, this.calibration[i]);
      this.gains[i].gain.setTargetAtTime(p.gain, time, 0.008);
      this.pans[i].pan.setValueAtTime(p.pan, time);
      this.filters[i].frequency.setTargetAtTime(p.cutoff, time, 0.045);
      this.voices[i].triggerAttackRelease(
        Tone.Frequency(p.midi, "midi").toFrequency(),
        d.duration[i] * (0.7 + p.level * 0.6),
        time,
        0.8,
      );
    });
  }
  volume(value: number) {
    this.master.volume.rampTo(
      value === 0
        ? -100
        : 20 * Math.log10(value) - 8 + outputTrimDb[this.profile],
      0.1,
    );
  }
  setEnabled(enabled: boolean[]) {
    this.gains.forEach((g, i) => {
      if (!enabled[i]) g.gain.rampTo(0, 0.015);
    });
  }
  stop() {
    this.voices.forEach((v) => {
      if ("triggerRelease" in v) v.triggerRelease();
    });
    this.master.mute = true;
    this.delay.wet.value = 0;
  }
  resume() {
    this.master.mute = false;
    this.delay.wet.value = soundDesigns[this.profile].wet;
  }
  dispose() {
    this.voices.forEach((v) => v.dispose());
    this.filters.forEach((f) => f.dispose());
    this.gains.forEach((g) => g.dispose());
    this.pans.forEach((p) => p.dispose());
    this.master.dispose();
    this.delay.dispose();
    this.limiter.dispose();
  }
}
export async function renderAudioPreview(
  profile: Profile,
  samples: Feature[][],
  duration = 8,
) {
  const { calibrate } = await import("./soundDesign");
  let engine: AudioEngine | undefined;
  const buffer = await Tone.Offline(
    () => {
      engine = new AudioEngine(profile, calibrate(samples));
      const stepTime = soundDesigns[profile].step;
      const scanDuration = duration - 2;
      for (let step = 0; step * stepTime < scanDuration; step++) {
        const time = step * stepTime;
        const f =
          samples[
            Math.min(
              samples.length - 1,
              Math.floor((time / scanDuration) * samples.length),
            )
          ];
        engine.play(f, [true, true, true], step, time + 0.03);
      }
    },
    duration,
    2,
    22050,
  );
  engine?.dispose();
  return buffer;
}
