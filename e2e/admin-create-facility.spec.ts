import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5050";

test.describe("Admin Create Facility", () => {
  test.beforeEach(async ({ page }) => {
    page.on("dialog", (d) => d.accept()); // Prevent any unexpected alert from blocking clicks

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

    await page.waitForTimeout(200);

    await page.goto(`${BASE_URL}/xavier.html`);
    await expect(page).toHaveURL(/xavier\.html/i);
    await expect(page.locator("#facilityId")).toBeVisible({ timeout: 10000 });
  });

  test("admin can add a facility", async ({ page }) => {
    const facilityId = `${Date.now()}`;

    await page.fill("#facilityId", facilityId);
    await page.fill("#facilityName", "Basketball Court");
    await page.fill("#facilityLocation", "Block 5");
    await page.fill("#facilityDescription", "Start hoppin today");
    await page.fill("#facilityOpeningHours", "12:00 - 22:00");
    await page.fill("#facilityOpeningDays", "Monday - Sunday");
    await page.fill("#facilityImage1", "/images/facility-default.png");
    await page.fill("#facilityImage2", "/images/facility-default.png");
    await page.fill("#facilityImage3", "/images/facility-default.png");
    await page.click("#facilityForm button:has-text('Add Facility')");

    const row = page.locator("#facilitiesBody tr", { hasText: facilityId });
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row).toContainText("Basketball Court");
    await expect(row).toContainText("Block 5");
  });

  test("shows alert when Facility ID is empty", async ({ page }) => {
    await page.fill("#facilityName", "Test Facility");
    await page.fill("#facilityLocation", "Block 1");

    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.click("#facilityForm button:has-text('Add Facility')"),
    ]);
    expect(dialog.message()).toBe("Facility ID is required!");
  });

  test("shows alert when Facility Name is empty", async ({ page }) => {
    await page.fill("#facilityId", "3323232");
    await page.fill("#facilityLocation", "test");

    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.click("#facilityForm button:has-text('Add Facility')"),
    ]);
    expect(dialog.message()).toBe("Facility Name is required!");
  });

  test("shows alert when Facility Location is empty", async ({ page }) => {
    await page.fill("#facilityId", "121");
    await page.fill("#facilityName", "test");

    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.click("#facilityForm button:has-text('Add Facility')"),
    ]);
    expect(dialog.message()).toBe("Facility location is required!");
  });

  test("shows error when facility ID already exists (duplicate)", async ({ page }) => {
    await page.fill("#facilityId", "1");
    await page.fill("#facilityName", "Duplicate Facility");
    await page.fill("#facilityLocation", "Block X");

    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.click("#facilityForm button:has-text('Add Facility')"),
    ]);
    expect(dialog.message().toLowerCase()).toBe("facility id already exists");
  });
});
