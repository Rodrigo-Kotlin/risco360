import { test, expect } from '@playwright/test'

test.describe('Evidencias', () => {
  test('Pagina empresa mostra secao setores', async ({ page }) => {
    await page.goto('/empresas')
    await expect(page).toHaveURL(/\/empresas/, { timeout: 10000 })

    await page.getByText('Empresa Modelo Risco360 LTDA').first().click()
    await page.waitForURL(/\/empresas\//, { timeout: 10000 })

    await expect(page.getByText('Setores').first()).toBeVisible({ timeout: 5000 })
  })

  test('Configuracoes mostra secao de evidencias', async ({ page }) => {
    await page.goto('/configuracoes')
    await expect(page.getByRole('heading', { name: 'Configurações', level: 1 })).toBeVisible({ timeout: 10000 })
  })
})
