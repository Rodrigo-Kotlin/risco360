import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'e2e-report' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'mock-mode',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'mock-mode.spec.ts',
    },
    {
      name: 'supabase-mode',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'supabase-mode.spec.ts',
    },
    {
      name: 'offline-sync',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'offline-sync.spec.ts',
    },
    {
      name: 'evidencias',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'evidencias.spec.ts',
    },
    {
      name: 'exports',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'exports.spec.ts',
    },
    {
      name: 'pwa-icons',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'pwa-icons.spec.ts',
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: {
        VITE_ENABLE_MOCK_MODE: 'true',
        VITE_SUPABASE_URL: '',
        VITE_SUPABASE_ANON_KEY: '',
      },
    },
  ],
})
