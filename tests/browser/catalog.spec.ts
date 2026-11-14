import { test, expect } from "@playwright/test";
import { catalog } from "../../src/catalog";
test("every NASA resource loads, maps pixels, exposes source and renders ASCII", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator(".resource-row")).toHaveCount(9);
  const signals = [];
  for (const scene of catalog) {
    const result = await page.evaluate(async (s) => {
      const im = new Image();
      im.src = "/assets/" + s.image;
      await im.decode();
      const c = document.createElement("canvas");
      c.width = 192;
      c.height = 108;
      const ctx = c.getContext("2d")!;
      const [x, y, w, h] = s.roi!;
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
      const { analyzeScene } = await import("/src/catalogAnalysis.ts");
      const values = Array.from({ length: 20 }, (_, i) =>
        analyzeScene(data, 192, 108, i / 20, s.profile!),
      );
      return {
        id: s.id,
        maxSignal: Math.max(
          ...values.flat().map((v: { brightness: number }) => v.brightness),
        ),
      };
    }, scene);
    expect(
      result.maxSignal,
      scene.id + " must produce a real image-derived signal",
    ).toBeGreaterThan(0.002);
    signals.push(result);
  }
  await test.info().attach("actual-NASA-frame-signals", {
    body: JSON.stringify(signals, null, 2),
    contentType: "application/json",
  });

  await page.getByRole("button", { name: "Ocean", exact: true }).click();
  await expect(page.locator(".resource-row")).toHaveCount(2);
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByLabel("Search NASA resources").fill("nonexistent");
  await expect(page.getByRole("status")).toContainText("No stories match");
  await page.getByLabel("Search NASA resources").fill("");
  await page
    .locator("#library")
    .screenshot({ path: "test-results/catalog-desktop.png" });
  for (const scene of catalog) {
    await page
      .getByRole("button", { name: `Listen to ${scene.name}`, exact: true })
      .click();
    const room = page.getByRole("dialog");
    await expect(room).toBeVisible();
    await expect(room.locator(".scene-tabs")).toContainText(scene.period!);
    await expect(room.locator(".scene-source-label")).toContainText(
      "NASA SCIENTIFIC",
    );

    await expect(room.locator(".play-button")).toBeEnabled();
    if (
      await page.getByRole("button", { name: "Pause sonification" }).isVisible()
    )
      await page.getByRole("button", { name: "Pause sonification" }).click();
    await page.getByLabel("Spatial scan position").fill("0.48");
    await expect(room.locator(".layers button")).toHaveCount(3);
    await page.getByRole("button", { name: "ASCII signal" }).click();
    await expect(room.locator("pre")).not.toBeEmpty();
    await room
      .locator("summary")
      .filter({ hasText: "Source, geography" })
      .click();
    await expect(
      room.locator(`a[href="https://svs.gsfc.nasa.gov/${scene.source}/"]`),
    ).toBeVisible();
    if (scene.id === "aerosols")
      await room.screenshot({ path: "test-results/catalog-player.png" });
    await page.keyboard.press("Escape");
    await expect(room).not.toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .locator("#library")
    .screenshot({ path: "test-results/catalog-mobile.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
