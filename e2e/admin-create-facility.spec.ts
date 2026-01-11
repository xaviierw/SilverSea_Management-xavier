import './playwright-coverage.js'
import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:5050";

test.describe("Admin Create Facility", () => {
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

  test("admin can add a facility", async ({ page }) => {
    const facilityId = `FAC${Date.now()}`.slice(0, 10);
    await page.fill("#facilityId", facilityId);
    await page.fill("#facilityName", "Basketball Court");
    await page.fill("#facilityLocation", "Block 5");
    await page.fill("#facilityDescription", "Start hoppin today");
    await page.fill("#facilityOpeningHours", "12:00 - 22:00");
    await page.fill("#facilityOpeningDays", "Monday - Sunday");
    page.once("dialog", (dialog) => dialog.accept());
    await page.click("#facilityForm button:has-text('Add Facility')");
    const row = page.locator("#facilitiesBody tr", { hasText: facilityId });
    await row.waitFor({ state: "visible", timeout: 30000 });
    await expect(row).toBeVisible();
    await expect(row).toContainText("Basketball Court");
    await expect(row).toContainText("Block 5");
  });

  test("shows alert when Facility ID is empty", async ({ page }) => {
    await page.fill("#facilityName", "Test Facility");
    await page.fill("#facilityLocation", "Block 1");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility ID is required!");
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility ID exceeds 10 characters", async ({ page }) => {
    await page.fill("#facilityId", "ABCDEFGHIJ123456789K");
    await page.fill("#facilityName", "Test Facility");
    await page.fill("#facilityLocation", "Block 1");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility ID must not exceed 10 characters");
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility Name is empty", async ({ page }) => {
    const id = "F" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await page.fill("#facilityId", id);
    await page.fill("#facilityLocation", "test");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility Name is required!");
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility Name exceeds 25 characters", async ({ page }) => {
    const id = "F" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await page.fill("#facilityId", id);
    await page.fill("#facilityName", "This facility name is over twenty five");
    await page.fill("#facilityLocation", "Block 1");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility name must not exceed 25 characters");
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility Location is empty", async ({ page }) => {
    const id = "F" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await page.fill("#facilityId", id);
    await page.fill("#facilityName", "test");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility location is required!");
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility Location exceeds 25 characters", async ({ page }) => {
    const id = "F" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await page.fill("#facilityId", id);
    await page.fill("#facilityName", "Test Facility");
    await page.fill("#facilityLocation", "This location is definitely over twenty five");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility location must not exceed 25 characters");
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Opening Hours format is invalid", async ({ page }) => {
    const id = "F" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await page.fill("#facilityId", id);
    await page.fill("#facilityName", "Gym");
    await page.fill("#facilityLocation", "Block 1");
    await page.fill("#facilityOpeningHours", "10am - 10pm");
    await page.fill("#facilityOpeningDays", "Monday - Sunday");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe(
        "Opening Hours must be in format HH:MM - HH:MM (e.g. 10:00 - 22:00)"
      );
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Opening Hours start time is later than end time", async ({ page }) => {
    const id = "F" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await page.fill("#facilityId", id);
    await page.fill("#facilityName", "Gym");
    await page.fill("#facilityLocation", "Block 1");
    await page.fill("#facilityOpeningHours", "22:00 - 10:00");
    await page.fill("#facilityOpeningDays", "Monday - Sunday");
    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Opening Hours start time must be earlier than end time");
      dialog.accept();
    });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Opening Hours has invalid time values", async ({ page }) => {
    const id = "F" + Math.random().toString(36).slice(2, 10).toUpperCase();
    await page.fill("#facilityId", id);
    await page.fill("#facilityName", "Gym");
    await page.fill("#facilityLocation", "Block 1");
    await page.fill("#facilityOpeningHours", "10:99 - 22:00");
    await page.fill("#facilityOpeningDays", "Monday - Sunday");
  page.once("dialog", (dialog) => {
    expect(dialog.message()).toBe("Opening Hours has invalid time values (00:00 to 23:59 only)");
    dialog.accept();
  });
    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows error when facility ID already exists (duplicate)", async ({ page }) => {
    const dupId = `DUP${Date.now()}`.slice(0, 10);
    await page.fill("#facilityId", dupId);
    await page.fill("#facilityName", "First Facility");
    await page.fill("#facilityLocation", "Block A");
    await page.fill("#facilityOpeningHours", "12:00 - 22:00");
    await page.click("#facilityForm button:has-text('Add Facility')");
    const row = page.locator("#facilitiesBody tr", { hasText: dupId });
    await row.waitFor({ state: "visible", timeout: 30000 });
    await page.fill("#facilityId", dupId);
    await page.fill("#facilityName", "Duplicate Facility");
    await page.fill("#facilityLocation", "Block X");
    await page.fill("#facilityOpeningHours", "12:00 - 22:00");
    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.click("#facilityForm button:has-text('Add Facility')"),
    ]);
    expect(dialog.message()).toBe("Facility ID already exists");
    await dialog.accept();
  });

  test("shows alert on network error", async ({ page }) => {
    await page.goto("http://localhost:5050/xavier.html");
    await page.route("**/*/api/facility", (route) => route.abort());
    await page.fill("#facilityId", "NET123");
    await page.fill("#facilityName", "Gym");
    await page.fill("#facilityLocation", "Block 1");
    await page.fill("#facilityOpeningDays", "Monday - Sunday");
    const [dialog] = await Promise.all([
      page.waitForEvent("dialog"),
      page.click("#facilityForm button:has-text('Add Facility')"),
    ]);
    expect(dialog.message()).toBe("Unable to add facility! (network or server error)");
    await dialog.accept();
    await page.unroute("**/*/api/facility");
  });
});