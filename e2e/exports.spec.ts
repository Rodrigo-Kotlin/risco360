import { test, expect } from '@playwright/test'

test.describe('Exportacoes', () => {
  test('Pagina empresa carrega', async ({ page }) => {
    await page.goto('/empresas')
    await expect(page).toHaveURL(/\/empresas/, { timeout: 10000 })

    await page.getByText('Empresa Modelo Risco360 LTDA').first().click()
    await page.waitForURL(/\/empresas\//, { timeout: 10000 })
  })

  test('PDF de conferencia carrega sem undefined', async ({ page }) => {
    await page.goto('/empresas')
    await expect(page).toHaveURL(/\/empresas/, { timeout: 10000 })

    await page.getByText('Empresa Modelo Risco360 LTDA').first().click()
    await page.waitForURL(/\/empresas\//, { timeout: 10000 })

    const pdfUrl = page.url().replace(/\/empresas\/(.+)/, '/empresas/$1/consolidado/pdf')
    await page.goto(pdfUrl)
    await page.waitForTimeout(3000)

    const body = await page.locator('body').textContent()
    expect(body).not.toContain('undefined')
    expect(body).not.toContain('[object Object]')
  })
})
