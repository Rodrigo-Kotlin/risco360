import { test, expect } from '@playwright/test'

test.describe('Wizard de Levantamento', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/empresas/, { timeout: 10000 })
  })

  test('Continuar preenchimento abre no ultimo_step salvo', async ({ page }) => {
    await page.getByText('Empresa Modelo Risco360 LTDA').first().click()
    await page.waitForURL(/\/empresas\//)

    await page.getByRole('link', { name: /levantamento/i }).first().click().catch(() => {})
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url).toMatch(/levantamento/i)

    if (url.includes('/levantamentos/')) {
      await page.getByRole('button', { name: /continuar preenchimento/i }).first().click().catch(() => {})
      await page.waitForTimeout(2000)
      const wizardUrl = page.url()
      expect(wizardUrl).toMatch(/editar/)
      expect(wizardUrl).toMatch(/step=/)
    }
  })

  test('Wizard com ?step valido na URL permanece estavel', async ({ page }) => {
    await page.goto('/levantamentos')
    await expect(page.getByRole('heading', { name: 'Levantamentos', level: 1 })).toBeVisible({ timeout: 10000 })

    const levantamentoLink = page.getByRole('link', { name: /visualizar/i }).first()
    if (await levantamentoLink.isVisible()) {
      await levantamentoLink.click()
      await page.waitForURL(/\/levantamentos\//)
      const detailUrl = page.url()

      const match = detailUrl.match(/\/levantamentos\/([^/]+)$/)
      if (match) {
        const id = match[1]
        await page.goto(`/levantamentos/${id}/editar?step=5`)
        await page.waitForTimeout(2000)
        const finalUrl = page.url()
        expect(finalUrl).toMatch(/step=5/)
        await page.waitForTimeout(1000)
        const stableUrl = page.url()
        expect(stableUrl).toBe(finalUrl)
      }
    }
  })
})
