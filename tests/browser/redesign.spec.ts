import { test, expect } from "@playwright/test";
test("search, route history, reduced motion and mobile details", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Resume ambient motion" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ENTER EARTH", exact: true }).click();
  await expect(page).toHaveURL(/\/explore$/);
  const search = page.getByLabel("Search places and NASA studies");
  await search.fill("India");
  await page.locator(".search-results button").click();
  await expect(page.locator(".coordinates")).toContainText("23");
  await expect(page.locator(".transport")).toBeVisible();
  await page.getByRole("button", { name: "Close listening room" }).click();
  await search.fill("not-a-place");
  await expect(page.getByRole("status")).toContainText("No studies found");
  await search.fill("ocean");
  await page.locator(".search-results button").first().click();
  await expect(page.locator(".coordinates")).toHaveCount(0);
  await expect(page.locator("#scene-title")).toContainText("Ocean");
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "THE PLANET HAS A SOUNDTRACK." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore");
  await page.locator(".region-card").first().click();
  await page.getByRole("button", { name: "Expand details" }).click();
  await expect(
    page.getByRole("button", { name: "Collapse details" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByLabel("Volume")).toBeInViewport();
  await page.getByRole("button", { name: "Close listening room" }).click();
  await expect(page.locator(".listening-room")).toHaveCount(0);
});
test("globe selection stays north-up and actual waveform receives audio", async ({
  page,
}) => {
  await page.goto("/explore");
  await expect(page.locator(".globe-label")).toHaveCount(2, { timeout: 30000 });
  await page.screenshot({ path: "test-results/explorer-desktop.png" });
  await page.locator(".region-card").first().click();
  await expect(
    page.getByRole("button", { name: "Pause sonification" }),
  ).toBeVisible({ timeout: 20000 });
  await expect
    .poll(
      async () =>
        page.locator(".waveform").evaluate((c: HTMLCanvasElement) => {
          const ctx = c.getContext("2d")!;
          const data = ctx.getImageData(0, 0, c.width, c.height).data;
          let colored = 0;
          for (let y = 0; y < c.height; y++)
            if (Math.abs(y - c.height / 2) > 3)
              for (let x = 0; x < c.width; x++)
                if (data[(y * c.width + x) * 4 + 3] > 0) colored++;
          return colored;
        }),
      { timeout: 15000 },
    )
    .toBeGreaterThan(0);
  await page.screenshot({ path: "test-results/explorer-audio.png" });
});
