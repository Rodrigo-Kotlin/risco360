import { test, expect } from '@playwright/test'

test.describe('Offline sync', () => {
  test('Empresa mock carrega em modo offline', async ({ page }) => {
    await page.goto('/empresas')
    await expect(page).toHaveURL(/\/empresas/, { timeout: 10000 })
    await expect(page.getByText('Empresa Modelo Risco360 LTDA')).toBeVisible({ timeout: 10000 })
  })

  test('Configuracoes mostra status online', async ({ page }) => {
    await page.goto('/configuracoes')
    await expect(page.getByRole('heading', { name: 'Configurações', level: 1 })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Pendentes').first()).toBeVisible()
    await expect(page.getByText('Sincronizados').first()).toBeVisible()
  })

  test('Simula offline mostra banner e volta online nao quebra', async ({ page, context }) => {
    await page.goto('/empresas')
    await page.waitForTimeout(1000)

    await context.setOffline(true)
    await page.waitForTimeout(1000)

    const alert = page.getByRole('alert').first()
    await expect(alert).toBeVisible({ timeout: 5000 })
    await expect(alert).toContainText(/offline/i)

    await context.setOffline(false)
    await page.waitForTimeout(1000)

    await expect(page).toHaveURL(/\/empresas/)
    await expect(page.getByText('Empresa Modelo Risco360 LTDA')).toBeVisible({ timeout: 5000 })
  })
})
