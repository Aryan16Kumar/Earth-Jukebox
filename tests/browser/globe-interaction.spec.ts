import { test, expect } from "@playwright/test";
test("landing zoom uses the full hero and orbit resumes after drag", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".globe-label")).toHaveCount(2, { timeout: 30000 });
  const hero = await page.locator(".landing-hero").boundingBox();
  const canvas = await page.locator(".landing-globe canvas").boundingBox();
  expect(canvas!.y).toBeCloseTo(hero!.y, 0);
  expect(canvas!.height).toBeCloseTo(hero!.height, 0);
  await page.mouse.move(640, 430);
  for (let i = 0; i < 10; i++) {
    await page.mouse.wheel(0, -100);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: "test-results/landing-zoom-full-hero.png" });
  await page.mouse.move(600, 420);
  await page.mouse.down();
  await page.mouse.move(700, 430, { steps: 12 });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Pause ambient motion" }),
  ).toBeVisible();
  const transforms = () =>
    page
      .locator(".globe-label")
      .first()
      .evaluate((el) => {
        let p: HTMLElement | null = el as HTMLElement;
        const a = [];
        for (let i = 0; p && i < 4; i++, p = p.parentElement)
          a.push(p.style.transform);
        return a.join("|");
      });
  await page.waitForTimeout(1500);
  const before = await transforms();
  await expect.poll(transforms, { timeout: 6000 }).not.toBe(before);
  await page.getByRole("button", { name: "Pause ambient motion" }).click();
  await page.mouse.move(600, 430);
  await page.mouse.down();
  await page.mouse.move(650, 450, { steps: 8 });
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "Resume ambient motion" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileHero = await page.locator(".landing-hero").boundingBox();
  const mobileCanvas = await page
    .locator(".landing-globe canvas")
    .boundingBox();
  expect(mobileCanvas!.height).toBeCloseTo(mobileHero!.height, 0);
  await page.screenshot({ path: "test-results/landing-zoom-mobile.png" });
});
