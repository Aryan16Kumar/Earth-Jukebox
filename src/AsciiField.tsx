import { useEffect, useRef } from "react";
export default function AsciiField({ paused }: { paused: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!,
      ctx = c.getContext("2d")!;
    let frame = 0,
      last = 0;
    const mouse = { x: -1000, y: -1000 };
    let w = 0,
      h = 0;
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w;
      c.height = h;
      draw(0);
    };
    const pointer = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    function draw(t: number) {
      ctx.clearRect(0, 0, w, h);
      const step = w < 600 ? 24 : 18;
      ctx.font = "10px monospace";
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const center = Math.abs(x - w / 2) / (w / 2);
          if (center < 0.42) continue;
          const n =
            Math.sin(x * 0.012 + Math.sin(y * 0.013) * 2) +
            Math.cos(y * 0.017 - x * 0.005) +
            Math.sin(x * 0.037 + y * 0.027) * 0.45;
          if (n < 0.7) continue;
          const near = Math.max(
            0,
            1 - Math.hypot(x - mouse.x, y - mouse.y) / 180,
          );
          const a =
            (0.06 + Math.max(0, n - 1) * 0.12) *
              (0.8 + Math.sin(t * 0.0006 + x + y) * 0.2) +
            near * 0.2;
          ctx.fillStyle = `rgba(197,242,119,${a})`;
          const k = Math.abs(Math.floor(Math.sin(x * 12 + y * 7) * 100));
          if (k % 4 === 0) ctx.fillRect(x, y, 5, 5);
          else ctx.fillText(".:+01"[k % 5], x, y);
        }
      }
    }
    const loop = (t: number) => {
      frame = requestAnimationFrame(loop);
      if (t - last < 80 || document.hidden) return;
      last = t;
      draw(t);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", pointer, { passive: true });
    if (!paused) frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointer);
    };
  }, [paused]);
  return <canvas ref={ref} className="ascii-field" aria-hidden="true" />;
}
