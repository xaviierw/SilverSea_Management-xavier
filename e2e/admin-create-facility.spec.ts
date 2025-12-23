// import './playwright-coverage'
// import { test, expect } from "@playwright/test";

// const BASE_URL = "http://localhost:5050";

// test.describe("Admin Create Facility", () => {
//   test.beforeEach(async ({ page }) => {
//     page.on("dialog", (d) => d.accept());

//     await page.goto(`${BASE_URL}/login.html`);
//     await page.click("#tab-admin");
//     await page.fill("#email", "admin@silversea.com");
//     await page.fill("#password", "test");

//     await Promise.all([
//       page.waitForResponse((res) => {
//         const url = res.url().toLowerCase();
//         return url.includes("login") && res.status() >= 200 && res.status() < 400;
//       }),
//       page.click("#signinBtn"),
//     ]);

//     await expect(page).toHaveURL(/xavier\.html/i);
//     await expect(page.locator("#facilityId")).toBeVisible({ timeout: 10000 });
//   });

//   test("admin can add a facility", async ({ page }) => {
//     const facilityId = `FAC${Date.now()}`.slice(0, 10);

//     await page.fill("#facilityId", facilityId);
//     await page.fill("#facilityName", "Basketball Court");
//     await page.fill("#facilityLocation", "Block 5");
//     await page.fill("#facilityDescription", "Start hoppin today");
//     await page.fill("#facilityOpeningHours", "12:00 - 22:00");
//     await page.fill("#facilityOpeningDays", "Monday - Sunday");
//     await page.click("#facilityForm button:has-text('Add Facility')");

//     const row = page.locator("#facilitiesBody tr", { hasText: facilityId });
//     await expect(row).toBeVisible({ timeout: 10000 });
//     await expect(row).toContainText("Basketball Court");
//     await expect(row).toContainText("Block 5");
//   });

//   test("shows alert when Facility ID is empty", async ({ page }) => {
//     await page.fill("#facilityName", "Test Facility");
//     await page.fill("#facilityLocation", "Block 1");

//     const [dialog] = await Promise.all([
//       page.waitForEvent("dialog"),
//       page.click("#facilityForm button:has-text('Add Facility')"),
//     ]);
//     expect(dialog.message()).toBe("Facility ID is required!");
//   });

//   test("shows alert when Facility ID exceeds 10 characters", async ({ page }) => {
//     await page.fill("#facilityId", "ABCDEFGHIJ123456789K"); // 11 chars
//     await page.fill("#facilityName", "Test Facility");
//     await page.fill("#facilityLocation", "Block 1");

//     const [dialog] = await Promise.all([
//       page.waitForEvent("dialog"),
//       page.click("#facilityForm button:has-text('Add Facility')"),
//     ]);
//     expect(dialog.message()).toBe("Facility ID must not exceed 10 characters");
//   });

//   test("shows alert when Facility Name is empty", async ({ page }) => {
//     await page.fill("#facilityId", "3323232");
//     await page.fill("#facilityLocation", "test");

//     const [dialog] = await Promise.all([
//       page.waitForEvent("dialog"),
//       page.click("#facilityForm button:has-text('Add Facility')"),
//     ]);
//     expect(dialog.message()).toBe("Facility Name is required!");
//   });

//   test("shows alert when Facility Name exceeds 25 characters", async ({ page }) => {
//     await page.fill("#facilityId", "FAC1234567"); // 10 chars
//     await page.fill("#facilityName", "This facility name is over 25");
//     await page.fill("#facilityLocation", "Block 1");

//     const [dialog] = await Promise.all([
//       page.waitForEvent("dialog"),
//       page.click("#facilityForm button:has-text('Add Facility')"),
//     ]);
//     expect(dialog.message()).toBe("Facility name must not exceed 25 characters");
//   });

//   test("shows alert when Facility Location is empty", async ({ page }) => {
//     await page.fill("#facilityId", "121");
//     await page.fill("#facilityName", "test");

//     const [dialog] = await Promise.all([
//       page.waitForEvent("dialog"),
//       page.click("#facilityForm button:has-text('Add Facility')"),
//     ]);
//     expect(dialog.message()).toBe("Facility location is required!");
//   });

//   test("shows alert when Facility Location exceeds 25 characters", async ({ page }) => {
//     await page.fill("#facilityId", "FAC7654321"); // 10 chars
//     await page.fill("#facilityName", "Test Facility");
//     await page.fill("#facilityLocation", "This location is definitely over 25");

//     const [dialog] = await Promise.all([
//       page.waitForEvent("dialog"),
//       page.click("#facilityForm button:has-text('Add Facility')"),
//     ]);
//     expect(dialog.message()).toBe("Facility location must not exceed 25 characters");
//   });

//   test("shows error when facility ID already exists (duplicate)", async ({ page }) => {
//     await page.fill("#facilityId", "1");
//     await page.fill("#facilityName", "Duplicate Facility");
//     await page.fill("#facilityLocation", "Block X");

//     const [dialog] = await Promise.all([
//       page.waitForEvent("dialog"),
//       page.click("#facilityForm button:has-text('Add Facility')"),
//     ]);
//     expect(dialog.message().toLowerCase()).toBe("facility id already exists");
//   });
// });

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

    // Accept confirmation dialog
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
    await page.fill("#facilityId", "3323232");
    await page.fill("#facilityLocation", "test");

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility Name is required!");
      dialog.accept();
    });

    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility Name exceeds 25 characters", async ({ page }) => {
    await page.fill("#facilityId", "FAC1234567");
    await page.fill("#facilityName", "This facility name is over twenty five");
    await page.fill("#facilityLocation", "Block 1");

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility name must not exceed 25 characters");
      dialog.accept();
    });

    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility Location is empty", async ({ page }) => {
    await page.fill("#facilityId", "121");
    await page.fill("#facilityName", "test");

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility location is required!");
      dialog.accept();
    });

    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows alert when Facility Location exceeds 25 characters", async ({ page }) => {
    await page.fill("#facilityId", "FAC7654321");
    await page.fill("#facilityName", "Test Facility");
    await page.fill("#facilityLocation", "This location is definitely over twenty five");

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility location must not exceed 25 characters");
      dialog.accept();
    });

    await page.click("#facilityForm button:has-text('Add Facility')");
  });

  test("shows error when facility ID already exists (duplicate)", async ({ page }) => {
    await page.fill("#facilityId", "1");
    await page.fill("#facilityName", "Duplicate Facility");
    await page.fill("#facilityLocation", "Block X");

    page.once("dialog", (dialog) => {
      expect(dialog.message()).toBe("Facility ID already exists");
      dialog.accept();
    });

    await page.click("#facilityForm button:has-text('Add Facility')");
  });
});
