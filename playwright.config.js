// playwright.config.js
import { defineConfig, devices } from '@playwright/test';
import path from 'path'; // Import path module

// Define the path where the authentication state will be saved (must match global-setup.js)
const AUTH_FILE = path.join(__dirname, '.auth/user.json');

export default defineConfig({
  // Global Setup to run before all tests
  globalSetup: require.resolve('./global-setup'), // Adjust path if global-setup.js is in a subfolder

  testDir: './tests', // Or wherever your tests are located
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'https://staging-api.celebut.com', // Your application's base URL
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use the authentication state saved by global setup
        storageState: AUTH_FILE,
      },
    },

    // You can add other browsers like firefox, webkit if needed
    // {
    //   name: 'firefox',
    //   use: {
    //     ...devices['Desktop Firefox'],
    //     storageState: AUTH_FILE,
    //   },
    // },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //     storageState: AUTH_FILE,
    //   },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});