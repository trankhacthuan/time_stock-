import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/playwright",
  globalSetup: "./tests/e2e/global-setup.ts",
  globalTeardown: "./tests/e2e/global-teardown.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "line",
  use: { baseURL: "http://127.0.0.1:3100", trace: "retain-on-failure" },
  webServer: { command: "pnpm dev --hostname 127.0.0.1 --port 3100", url: "http://127.0.0.1:3100/login", reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "reduced-motion", use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" } },
  ],
});
