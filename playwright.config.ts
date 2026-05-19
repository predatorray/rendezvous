import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright e2e config for Rendezvous.
 *
 * Tests spin up multiple browser contexts inside a single test to simulate
 * a host and one or more guest peers connecting through the PeerJS broker.
 * The CRA dev server is started automatically via `webServer`.
 */
export default defineConfig({
  testDir: './e2e',
  // PeerJS broker handshake + WebRTC negotiation can take a few seconds.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  // Multi-peer tests open several contexts; one worker keeps the broker
  // from being hammered and avoids cross-test peer-id collisions.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    // Auto-accept getUserMedia in headless Chromium.
    launchOptions: {
      args: [
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream',
        '--autoplay-policy=no-user-gesture-required',
      ],
    },
    permissions: ['camera', 'microphone'],
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      BROWSER: 'none',
      CI: 'true',
    },
  },
});
