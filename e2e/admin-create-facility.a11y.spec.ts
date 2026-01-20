import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const BASE_URL = "http://localhost:5050";

test.describe("Accessibility (axe) - Admin Create Facility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login.html`);
    await page.click("#tab-admin");
    await page.fill("#email", "admin@silversea.com");
    await page.fill("#password", "test");

    await Promise.all([
      page.waitForResponse((res) => {
        const url = res.url().toLowerCase();
        return url.includes("login") && res.status() >= 200 && res.status() < 400;
      }),
      page.click("#signinBtn"),
    ]);

    await expect(page).toHaveURL(/xavier\.html/i);
    await expect(page.locator("#facilityId")).toBeVisible({ timeout: 10000 });
  });

  test("xavier.html should have no critical accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include("#facilityForm")
      .analyze();

    // Only fail on serious issues
    const seriousOrCritical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical"
    );

    // If it fails, this will print what is wrong
    if (seriousOrCritical.length > 0) {
      console.log(
        seriousOrCritical.flatMap(v =>
          v.nodes.map(n => ({
            id: v.id,
            impact: v.impact,
            target: n.target,
            html: n.html
          }))
        )
      );
    }
    expect(seriousOrCritical.length).toBe(0);
  });
});
