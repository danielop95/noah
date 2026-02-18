import { test, expect } from '@playwright/test'

test.describe('User Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to /register and wait for the redirect to /en/register if it happens
    await page.goto('/register')
    await expect(page).toHaveURL(/.*\/register/)
  })

  test('TC001: Registration step 1 validates required fields', async ({ page }) => {
    // Click "Siguiente" without filling anything
    await page.getByRole('button', { name: /Siguiente/i }).click()

    // Verify validation errors (in Spanish as found by exploration)
    await expect(page.getByText('El nombre es requerido')).toBeVisible()
    await expect(page.getByText('El apellido es requerido')).toBeVisible()
  })

  test('TC002: Navigate through Step 1 to Step 2', async ({ page }) => {
    // Fill Step 1
    await page.getByLabel(/Nombre/i).fill('Test')
    await page.getByLabel(/Apellido/i).fill('User')

    // Select Document Type (it's a MUI Select)
    await page.getByLabel(/Tipo de Documento/i).click()
    await page.getByRole('option', { name: /Cédula de Ciudadanía/i }).click()

    await page.getByLabel(/Número de Documento/i).fill('12345678')

    // Select Gender
    await page.getByLabel(/Masculino/i).check()

    // Fill Birth Date
    // Note: Date inputs can be tricky, but standard HTML date inputs work with .fill('YYYY-MM-DD')
    await page.locator('input[type="date"]').fill('1990-01-01')

    await page.getByRole('button', { name: /Siguiente/i }).click()

    // Verify we are in Step 2 by checking for "Estado Civil" or "¿Tienes hijos?"
    await expect(page.getByText('Estado Civil').first()).toBeVisible()
    await expect(page.getByText('¿Tienes hijos?')).toBeVisible()
  })

  test('TC003: Step 4 validates account fields', async ({ page }) => {
    // We need to skip to the end or fill everything
    // Step 1
    await page.getByLabel(/Nombre/i).fill('Test')
    await page.getByLabel(/Apellido/i).fill('User')
    await page.getByLabel(/Tipo de Documento/i).click()
    await page.getByRole('option', { name: /Cédula de Ciudadanía/i }).click()
    await page.getByLabel(/Número de Documento/i).fill('12345678')
    await page.getByLabel(/Masculino/i).check()
    await page.locator('input[type="date"]').fill('1990-01-01')
    await page.getByRole('button', { name: /Siguiente/i }).click()

    // Step 2: Familia
    await expect(page.getByText('Estado Civil').first()).toBeVisible()
    await page.getByRole('button', { name: /Siguiente/i }).click()

    // Step 3: Contacto
    await expect(page.getByText('Teléfono').first()).toBeVisible()
    await page.getByLabel(/Teléfono/i).fill('5551234')
    await page.getByLabel(/Ciudad/i).fill('Bogotá')
    await page.getByRole('button', { name: /Siguiente/i }).click()

    // Step 4: Cuenta
    await expect(page.getByText('Email').first()).toBeVisible()

    // Click Registrarse without filling
    await page.getByRole('button', { name: /Registrarse/i }).click()

    // Verify errors
    await expect(page.getByText('El email es requerido')).toBeVisible()
    await expect(page.getByText('La contraseña es requerida')).toBeVisible()
    await expect(page.getByText('Confirma tu contraseña')).toBeVisible()
    await expect(page.getByText('Debes aceptar los términos y condiciones')).toBeVisible()
  })
})
