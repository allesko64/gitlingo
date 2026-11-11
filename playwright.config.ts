import { defineConfig, devices } from "@playwright/test";

try {
  process.loadEnvFile(".env.local");
} catch {
  // CI provides the variables directly.
}

const PORT = 3210;
const liveUrl = process.env.E2E_BASE_URL;
const baseURL = liveUrl ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Tests share one database, so run them one at a time.
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: liveUrl
    ? undefined
    : {
        command: `pnpm build && pnpm start -p ${PORT}`,
        url: baseURL,
        timeout: 300_000,
        // Never reuse: a stale server on this port would silently test an old build.
        reuseExistingServer: false,
        env: {
          NEXT_DIST_DIR: ".next-e2e",
          BETTER_AUTH_URL: baseURL,
          DISABLE_AUTH_RATE_LIMIT: "1",
        },
      },
});
