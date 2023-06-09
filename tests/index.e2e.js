import { expect, test } from "@playwright/test";

const basePath = '/hugo-tailwindcss-template/'

test("has title", async ({ page }) => {
  await page.goto(basePath);

  await expect(page).toHaveTitle(/Myopic Design/);
});

test("has heading", async ({ page }) => {
  await page.goto(basePath);

  const heading = await page.getByRole("heading", { level: 1 });
  await expect(heading).toContainText("Myopic Design");
});
