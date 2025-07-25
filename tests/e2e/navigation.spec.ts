import { test, expect } from './fixtures/test-fixtures';

test.describe('Family Tree Application Navigation', () => {
  test('should display the home page with correct content', async ({ page, mockApi }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Family Tree/);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Family Tree Manager');
    
    // Check navigation links
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'People' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Family Tree' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Add Person' })).toBeVisible();
    
    // Check feature cards
    await expect(page.getByText('Manage People')).toBeVisible();
    await expect(page.getByText('Family Tree')).toBeVisible();
    await expect(page.getByText('Add Family Member')).toBeVisible();
    await expect(page.getByText('Relationships')).toBeVisible();
  });

  test('should navigate between main pages', async ({ page, mockApi }) => {
    await page.goto('/');
    
    // Navigate to People page
    await page.getByRole('link', { name: 'People' }).click();
    await expect(page).toHaveURL('/people');
    await expect(page.locator('h1')).toContainText('Family Members');
    
    // Navigate to Add Person page
    await page.getByRole('link', { name: 'Add Person' }).click();
    await expect(page).toHaveURL('/people/new');
    await expect(page.locator('h1')).toContainText('Add Family Member');
    
    // Navigate to Family Tree page
    await page.getByRole('link', { name: 'Family Tree' }).click();
    await expect(page).toHaveURL('/tree');
    await expect(page.locator('h1')).toContainText('Family Tree Visualization');
    
    // Navigate back to Home
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should have responsive navigation', async ({ page, mockApi }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Navigation should still be functional
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'People' })).toBeVisible();
  });
});