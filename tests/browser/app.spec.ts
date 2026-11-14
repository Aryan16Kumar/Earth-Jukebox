import { test, expect } from "@playwright/test";
test("region listening, ASCII, audio controls, focus restoration and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A planet worth listening to." }),
  ).toBeVisible();
  await expect(page.locator(".globe-label")).toHaveCount(2, { timeout: 30000 });
  await page.screenshot({
    path: "test-results/landing-desktop.png",
    fullPage: true,
  });
  const region = page.locator(".region-card").first();
  await region.click();
  const room = page.getByRole("dialog");
  await expect(room).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Pause sonification" }),
  ).toBeVisible({ timeout: 20000 });
  await expect
    .poll(
      async () =>
        Number(await page.getByLabel("Spatial scan position").inputValue()),
      { timeout: 15000 },
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "Pause sonification" }).click();
  await page.getByRole("button", { name: "ASCII signal" }).click();
  await expect(room.locator("pre")).not.toBeEmpty();
  await page.getByLabel("Spatial scan position").fill("0.7");
  await page.screenshot({ path: "test-results/listening-desktop.png" });
  await page.keyboard.press("Escape");
  await expect(room).not.toBeVisible();
  await expect(region).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".globe-label")).toHaveCount(2, { timeout: 30000 });
  await page.screenshot({
    path: "test-results/landing-mobile.png",
    fullPage: true,
  });
  await page.locator(".region-card").nth(1).click();
  await expect(
    page.getByRole("heading", { name: "Ukraine at night." }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/listening-mobile.png" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
