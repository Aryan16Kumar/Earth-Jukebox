import * as Tone from "tone";
import { mapping, type Feature } from "./analysis";
export class AudioEngine {
  voices: Tone.Synth[] = [];
  pans: Tone.Panner[] = [];
  master: Tone.Volume;
  limiter: Tone.Limiter;
  constructor() {
    this.master = new Tone.Volume(-12);
    this.limiter = new Tone.Limiter(-3).toDestination();
    this.master.connect(this.limiter);
    for (let i = 0; i < 3; i++) {
      const p = new Tone.Panner(0).connect(this.master);
      this.pans.push(p);
      this.voices.push(
        new Tone.Synth({
          oscillator: { type: i === 1 ? "sine" : "triangle" },
          envelope: { attack: 0.06, decay: 0.15, sustain: 0.1, release: 0.45 },
        }).connect(p),
      );
    }
  }
  async start() {
    await Tone.start();
  }
  play(features: Feature[], enabled: boolean[]) {
    features.forEach((f, i) => {
      if (!enabled[i] || f.brightness < 0.002) return;
      const m = mapping(f);
      this.pans[i].pan.rampTo(m.pan, 0.12);
      this.voices[i].triggerAttackRelease(
        Tone.Frequency(m.midi, "midi").toFrequency(),
        0.2,
        Tone.now(),
        m.gain,
      );
    });
  }
  volume(value: number) {
    this.master.volume.rampTo(
      value === 0 ? -100 : 20 * Math.log10(value) - 8,
      0.1,
    );
  }
  stop() {
    this.voices.forEach((v) => v.triggerRelease());
  }
  dispose() {
    this.voices.forEach((v) => v.dispose());
    this.pans.forEach((p) => p.dispose());
    this.master.dispose();
    this.limiter.dispose();
  }
}
