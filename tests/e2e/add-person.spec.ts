import { test, expect } from './fixtures/test-fixtures';

test.describe('Add Person Form', () => {
  test('should display form fields correctly', async ({ page, mockApi }) => {
    await page.goto('/people/new');
    
    // Check form heading
    await expect(page.locator('h1')).toContainText('Add Family Member');
    await expect(page.getByText('Add a new person to your family tree')).toBeVisible();
    
    // Check Personal Information section
    await expect(page.getByText('Personal Information')).toBeVisible();
    
    // Check required fields exist
    await expect(page.getByRole('textbox', { name: /first name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /last name/i })).toBeVisible();
    
    // Check optional fields exist
    await expect(page.getByRole('textbox', { name: /middle name/i })).toBeVisible();
    
    // Check if date fields are present (they might be textboxes)
    const birthDateField = page.locator('input[name*="birth" i], input[placeholder*="birth" i], input[type="date"]').first();
    await expect(birthDateField).toBeVisible();
    
    // Check if place fields exist
    await expect(page.getByRole('textbox', { name: /birth place/i })).toBeVisible();
    
    // Check back navigation
    await expect(page.getByRole('link', { name: 'Back to People' })).toBeVisible();
  });

  test('should allow filling out the form', async ({ page, mockApi }) => {
    await page.goto('/people/new');
    
    // Fill required fields
    await page.getByRole('textbox', { name: /first name/i }).fill('Test');
    await page.getByRole('textbox', { name: /last name/i }).fill('Person');
    
    // Fill optional fields
    await page.getByRole('textbox', { name: /middle name/i }).fill('Middle');
    
    // Fill birth place
    await page.getByRole('textbox', { name: /birth place/i }).fill('Test City, Test State');
    
    // Check if gender dropdown exists and try to select
    const genderField = page.locator('select, [role="combobox"]').filter({ hasText: /gender/i }).first();
    if (await genderField.isVisible()) {
      await genderField.click();
      // Try to select an option if dropdown opens
      const maleOption = page.getByRole('option', { name: /male/i });
      if (await maleOption.isVisible({ timeout: 2000 }).catch(() => false)) {
        await maleOption.click();
      }
    }
    
    // Verify fields were filled
    await expect(page.getByRole('textbox', { name: /first name/i })).toHaveValue('Test');
    await expect(page.getByRole('textbox', { name: /last name/i })).toHaveValue('Person');
  });

  test('should navigate back to people page', async ({ page, mockApi }) => {
    await page.goto('/people/new');
    
    await page.getByRole('link', { name: 'Back to People' }).click();
    await expect(page).toHaveURL('/people');
  });

  test('should show form validation', async ({ page, mockApi }) => {
    await page.goto('/people/new');
    
    // Try to submit with empty required fields
    const submitButton = page.getByRole('button', { name: /submit|add|save/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should stay on the same page or show validation
      await expect(page).toHaveURL('/people/new');
    }
  });
});