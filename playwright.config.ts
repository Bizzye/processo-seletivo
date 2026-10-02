import { defineConfig, devices } from '@playwright/test';

const PORTA = 4317;
const URL_BASE = process.env['PLAYWRIGHT_BASE_URL'] ?? `http://127.0.0.1:${PORTA}`;
const naCi = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: naCi,
  retries: naCi ? 2 : 0,
  reporter: naCi ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: URL_BASE,
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /screenshots\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      testIgnore: /screenshots\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'screenshots',
      testMatch: /screenshots\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Requer `ng build` antes (os scripts `npm run e2e`/`screenshots` já fazem isso).
  // Serve o build de produção pelo emulador do Firebase Hosting: mesmo artefato, headers e CSP
  // que vão para o ar. Porta definida em firebase.json (emulators.hosting.port).
  webServer: process.env['PLAYWRIGHT_BASE_URL']
    ? undefined
    : {
        command: 'npm run serve:dist',
        url: URL_BASE,
        reuseExistingServer: false,
        timeout: 180_000,
      },
});
