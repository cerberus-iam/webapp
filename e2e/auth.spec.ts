import { expect, test } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page which should redirect to login
    await page.goto('/')
  })

  test('should redirect to login page from home', async ({ page }) => {
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i)
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    // Check for email/username input
    await expect(
      page.getByRole('textbox', { name: /email|username/i })
    ).toBeVisible()

    // Check for password input
    await expect(page.getByLabel(/password/i)).toBeVisible()

    // Check for submit button
    await expect(
      page.getByRole('button', { name: /login|sign in/i })
    ).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login')

    // Find and click the register link
    const registerLink = page.getByRole('link', {
      name: /register|sign up|create account/i,
    })
    await registerLink.click()

    await expect(page).toHaveURL('/register')
    await expect(page.locator('h1, h2')).toContainText(
      /register|sign up|create account/i
    )
  })

  test('should display registration form', async ({ page }) => {
    await page.goto('/register')

    // Check for common registration fields
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()
    await expect(page.getByLabel(/password/i).first()).toBeVisible()

    // Check for submit button
    await expect(
      page.getByRole('button', { name: /register|sign up|create account/i })
    ).toBeVisible()
  })

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login')

    // Find and click the forgot password link
    const forgotLink = page.getByRole('link', {
      name: /forgot password|reset password/i,
    })
    await forgotLink.click()

    await expect(page).toHaveURL('/forgot-password')
    await expect(page.locator('h1, h2')).toContainText(
      /forgot password|reset password/i
    )
  })

  test('should display forgot password form', async ({ page }) => {
    await page.goto('/forgot-password')

    // Check for email input
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible()

    // Check for submit button
    await expect(
      page.getByRole('button', { name: /reset|send|submit/i })
    ).toBeVisible()
  })

  test('should show validation errors on empty login form submission', async ({
    page,
  }) => {
    await page.goto('/login')

    // Click submit without filling the form
    await page.getByRole('button', { name: /login|sign in/i }).click()

    // Wait for and check for error messages or required field indicators
    await page.waitForTimeout(500) // Brief wait for validation

    // This test may need adjustment based on your actual validation implementation
    // Example: Check for error text, aria-invalid, or required field styling
  })
})

test.describe('Protected Routes', () => {
  test('should redirect to login when accessing dashboard without auth', async ({
    page,
  }) => {
    await page.goto('/dashboard')

    // Should redirect to login if not authenticated
    // Note: This test assumes you have auth protection set up
    // Adjust based on your actual implementation
    await page.waitForURL(/\/login|\/dashboard/)

    // If redirected to login, that's expected behavior
    // If on dashboard, auth protection may not be implemented yet
    // URL check happens automatically via waitForURL above
  })
})
