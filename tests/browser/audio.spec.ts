import { test, expect } from "@playwright/test";
import { writeFile, mkdir } from "node:fs/promises";
import { catalog } from "../../src/catalog";
import { regions } from "../../src/scenes";
test("render real-image audio and compare audible characteristics", async ({
  page,
}) => {
  test.setTimeout(240000);
  await page.goto("/");
  await page
    .getByRole("heading", { name: "THE PLANET HAS A SOUNDTRACK." })
    .waitFor();
  const scenes = [...regions, ...catalog];
  await mkdir("test-results/audio", { recursive: true });
  const metrics = [];
  for (const scene of scenes) {
    const result = await page.evaluate(async (scene) => {
      const { renderAudioPreview } = await import("/src/audio.ts");
      const { analyzeScene } = await import("/src/catalogAnalysis.ts");
      const { analyzeBand } = await import("/src/analysis.ts");
      const { soundDesigns, calibrate } = await import("/src/soundDesign.ts");
      const im = new Image();
      im.src = "/assets/" + scene.image;
      await im.decode();
      const c = document.createElement("canvas");
      c.width = 192;
      c.height = 108;
      const ctx = c.getContext("2d")!;
      const [x, y, w, h] = scene.roi ?? [0, 0, 1, 1];
      ctx.drawImage(
        im,
        x * im.width,
        y * im.height,
        w * im.width,
        h * im.height,
        0,
        0,
        192,
        108,
      );
      const data = ctx.getImageData(0, 0, 192, 108).data;
      const profile = scene.profile ?? "night";
      const sample = (p: number) =>
        profile === "night"
          ? [0, 1, 2].map((b) => ({
              ...analyzeBand(
                ctx.getImageData(Math.min(184, Math.floor(p * 184)), 0, 8, 108)
                  .data,
                8,
                108,
                b,
              ),
              horizontal: p,
            }))
          : analyzeScene(data, 192, 108, p, profile);
      const duration = 8;
      const samples = Array.from({ length: 120 }, (_, i) => sample(i / 120));
      const buffer = await renderAudioPreview(profile, samples, duration);
      const left = buffer.getChannelData(0),
        right = buffer.getChannelData(1);
      let sum = 0,
        peak = 0,
        changes = 0;
      const energy: number[] = [];
      for (let i = 0; i < left.length; i++) {
        sum += left[i] * left[i];
        peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
        if (i && left[i] * left[i - 1] < 0) changes++;
        if (i % 2205 === 0) energy.push(Math.abs(left[i]));
      }
      const bytes = new ArrayBuffer(44 + left.length * 4),
        v = new DataView(bytes);
      function text(offset: number, s: string) {
        for (let i = 0; i < s.length; i++)
          v.setUint8(offset + i, s.charCodeAt(i));
      }
      text(0, "RIFF");
      v.setUint32(4, 36 + left.length * 4, true);
      text(8, "WAVE");
      text(12, "fmt ");
      v.setUint32(16, 16, true);
      v.setUint16(20, 1, true);
      v.setUint16(22, 2, true);
      v.setUint32(24, 22050, true);
      v.setUint32(28, 88200, true);
      v.setUint16(32, 4, true);
      v.setUint16(34, 16, true);
      text(36, "data");
      v.setUint32(40, left.length * 4, true);
      for (let i = 0; i < left.length; i++) {
        v.setInt16(
          44 + i * 4,
          Math.max(-1, Math.min(1, left[i])) * 32767,
          true,
        );
        v.setInt16(
          46 + i * 4,
          Math.max(-1, Math.min(1, right[i])) * 32767,
          true,
        );
      }
      const u = new Uint8Array(bytes);
      let str = "";
      for (let i = 0; i < u.length; i += 8192)
        str += String.fromCharCode(...u.subarray(i, i + 8192));

      return {
        id: scene.id,
        profile,
        rms: Math.sqrt(sum / left.length),
        peak,
        crossings: changes,
        signature: energy.map((v) => v.toFixed(5)).join(","),
        wav: btoa(str),
      };
    }, scene);
    expect(result.rms, scene.id + " must render audible audio").toBeGreaterThan(
      0.0002,
    );
    expect(result.peak, scene.id + " must not clip").toBeLessThan(0.99);
    await writeFile(
      `test-results/audio/${scene.id}.wav`,
      Buffer.from(result.wav, "base64"),
    );
    const { wav, ...metric } = result;
    metrics.push(metric);
  }
  expect(new Set(metrics.map((m) => m.signature)).size).toBe(scenes.length);
  const carbon = metrics.find((m) => m.id === "co2")!,
    stars = metrics.find((m) => m.id === "caldwell")!;
  expect(stars.crossings).toBeGreaterThan(carbon.crossings * 4);

  await writeFile(
    "test-results/audio/metrics.json",
    JSON.stringify(metrics, null, 2),
  );
});
