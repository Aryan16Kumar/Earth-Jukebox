import { useEffect, useRef, type RefObject } from "react";
import type { AudioEngine } from "./audio";
export default function Waveform({
  engine,
  playing,
}: {
  engine: RefObject<AudioEngine | null>;
  playing: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let frame = 0,
      last = 0;
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (time: number) => {
      frame = requestAnimationFrame(draw);
      if (time - last < (reduced ? 150 : 40) || document.hidden) return;
      last = time;
      const w = (c.width = 400),
        h = (c.height = 64);
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "#C5F277";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const data = playing ? engine.current?.waveform() : undefined;
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w,
          y = h / 2 + (data?.[i] ?? 0) * h * 1.6;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [engine, playing]);
  return (
    <canvas
      ref={ref}
      className="waveform"
      aria-label={playing ? "Live audio waveform" : "Audio paused"}
    />
  );
}
