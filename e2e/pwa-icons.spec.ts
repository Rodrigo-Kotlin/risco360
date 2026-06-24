import { test, expect } from '@playwright/test'

test.describe('PWA / Icons', () => {
  test('manifest link existe no HTML', async ({ page }) => {
    await page.goto('/')
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toBeAttached()
    const href = await manifestLink.getAttribute('href')
    expect(href).toBe('/manifest.webmanifest')
  })

  test('apple-touch-icon existe', async ({ page }) => {
    await page.goto('/')
    const link = page.locator('link[rel="apple-touch-icon"]')
    await expect(link).toBeAttached()
    const href = await link.getAttribute('href')
    expect(href).toBe('/apple-touch-icon.png')
  })

  test('favicon existe', async ({ page }) => {
    await page.goto('/')
    const favicon32 = page.locator('link[rel="icon"][sizes="32x32"]')
    await expect(favicon32).toBeAttached()
    const href = await favicon32.getAttribute('href')
    expect(href).toBe('/favicon-32x32.png')
  })

  test('manifest contem icon-192 e icon-512 PNG', async ({ page }) => {
    await page.goto('/')
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toBeAttached()
    const href = await manifestLink.getAttribute('href')
    const resp = await page.request.get(href!)
    expect(resp.ok()).toBeTruthy()
    const manifest = await resp.json()
    const icon192 = manifest.icons.find((i: { src: string }) => i.src === '/icons/icon-192x192.png')
    const icon512 = manifest.icons.find((i: { src: string }) => i.src === '/icons/icon-512x512.png')
    const mask192 = manifest.icons.find((i: { src: string; purpose?: string }) =>
      i.src === '/icons/maskable-icon-192x192.png'
    )
    expect(icon192).toBeTruthy()
    expect(icon192.type).toBe('image/png')
    expect(icon512).toBeTruthy()
    expect(icon512.type).toBe('image/png')
    expect(mask192).toBeTruthy()
  })

  test('manifest tem propriedades basicas', async ({ page }) => {
    await page.goto('/')
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toBeAttached()
    const href = await manifestLink.getAttribute('href')
    const resp = await page.request.get(href!)
    expect(resp.ok()).toBeTruthy()
    const manifest = await resp.json()
    expect(manifest.name).toBe('Risco360')
    expect(manifest.short_name).toBe('Risco360')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#0B6B3A')
    expect(manifest.start_url).toBe('/')
    expect(manifest.lang).toBe('pt-BR')
  })
})
