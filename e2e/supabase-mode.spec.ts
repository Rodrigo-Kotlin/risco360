import { test, expect } from '@playwright/test'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || ''
const hasSupabaseCreds = SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0

test.describe('Supabase mode', () => {
  test.skip(!hasSupabaseCreds, 'Credenciais Supabase nao disponiveis no ambiente')

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('Login real funciona', async ({ page }) => {
    await page.getByLabel('E-mail').fill('teste@risco360.com.br')
    await page.getByLabel('Senha').fill('Teste@123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/empresas/, { timeout: 15000 })
  })

  test('Criar empresa remota', async ({ page }) => {
    await page.getByLabel('E-mail').fill('teste@risco360.com.br')
    await page.getByLabel('Senha').fill('Teste@123')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await page.waitForURL(/\/empresas/, { timeout: 15000 })

    await page.getByText('Nova empresa').click()
    await page.waitForURL(/\/empresas\/nova/, { timeout: 5000 })

    const cnpj = `${String(Math.random()).slice(2, 14)}`
    await page.getByLabel('Razao Social').fill('Empresa E2E Teste')
    await page.getByLabel('Nome Fantasia').fill('E2E Teste')
    await page.getByLabel('CNPJ').fill(cnpj)
    await page.getByRole('button', { name: 'Salvar' }).click()
    await page.waitForURL(/\/empresas\//, { timeout: 10000 })
    await expect(page.getByText('Empresa E2E Teste')).toBeVisible({ timeout: 5000 })
  })
})
