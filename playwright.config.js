const { defineConfig, devices } = require("@playwright/test");

const baseURL = "http://localhost:1313/hugo-tailwindcss-template/";

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testMatch: "**/*.e2e.{js,jsx,ts,tsx}",
  testDir: "tests",
  outputDir: "e2e-results",
  retries: 2,

  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],

  use: {
    baseURL,
    screenshot: "on",
    video: "on-first-retry",
    trace: "on-first-retry",
  },

  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env["CI"],
  },

  projects: [
    { name: "Desktop Chrome", use: devices["Desktop Chrome"] },
    { name: "Desktop Firefox", use: devices["Desktop Firefox"] },
    { name: "Desktop Safari", use: devices["Desktop Safari"] },
    { name: "Mobile Chrome", use: devices["Pixel 5"] },
    { name: "Mobile Safari", use: devices["iPhone 12"] },
  ],
};

module.exports = defineConfig(config);
