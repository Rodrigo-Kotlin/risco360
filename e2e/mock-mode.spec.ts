import { test, expect } from '@playwright/test'

test.describe('Mock mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('App abre sem login e mock data aparece', async ({ page }) => {
    await expect(page).toHaveURL(/\/empresas/)
    await expect(page.getByText('Empresa Modelo Risco360 LTDA')).toBeVisible({ timeout: 10000 })
  })

  test('Setores mock aparecem', async ({ page }) => {
    await expect(page).toHaveURL(/\/empresas/)
    await page.getByText('Empresa Modelo Risco360 LTDA').first().click()
    await page.waitForURL(/\/empresas\//)
    await expect(page.getByRole('heading', { name: /setores/i })).toBeVisible({ timeout: 10000 })
  })

  test('Levantamento mock abre', async ({ page }) => {
    await expect(page).toHaveURL(/\/empresas/)
    await page.getByText('Empresa Modelo Risco360 LTDA').first().click()
    await page.waitForURL(/\/empresas\//)
    await page.getByRole('link', { name: /levantamento/i }).first().click().catch(() => {})
    await page.waitForTimeout(2000)
    const url = page.url()
    expect(url).toMatch(/levantamento/i)
  })

  test('Navega entre paginas', async ({ page }) => {
    const sidebar = page.getByLabel('Navegação principal')

    await sidebar.getByRole('link', { name: 'Setores' }).click()
    await expect(page).toHaveURL(/\/setores/, { timeout: 5000 })

    await sidebar.getByRole('link', { name: 'Relatórios' }).click()
    await expect(page).toHaveURL(/\/relatorios/, { timeout: 5000 })

    await sidebar.getByRole('link', { name: 'Configurações' }).click()
    await expect(page).toHaveURL(/\/configuracoes/, { timeout: 5000 })

    await sidebar.getByRole('link', { name: 'Empresas' }).click()
    await expect(page).toHaveURL(/\/empresas/, { timeout: 5000 })
  })

  test('Configuracoes mostra status sincronizacao', async ({ page }) => {
    await page.goto('/configuracoes')
    await expect(page.getByRole('heading', { name: 'Configurações', level: 1 })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('heading', { name: /Dados offline/i })).toBeVisible()
    await expect(page.getByText('Pendentes').first()).toBeVisible()
    await expect(page.getByText('Sincronizados').first()).toBeVisible()
  })

  test('Mock data e exibida sem depender do Supabase', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/empresas/)
    await expect(page.getByText('Empresa Modelo Risco360 LTDA')).toBeVisible({ timeout: 10000 })
  })

  test('OfflineBanner mostra mensagem correta em offline', async ({ page, context }) => {
    await page.goto('/empresas')
    await page.waitForTimeout(1000)
    await context.setOffline(true)
    await page.waitForTimeout(1000)
    const alert = page.getByRole('alert').first()
    await expect(alert).toBeVisible({ timeout: 5000 })
    await expect(alert).toContainText(/offline/i)
    await context.setOffline(false)
  })
})
