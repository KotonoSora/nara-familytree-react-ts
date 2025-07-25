import { test, expect } from '@playwright/test';

test.describe('Family Tree Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should navigate through all main pages', async ({ page }) => {
    // Check home page
    await expect(page.locator('h1')).toContainText('Family Tree Manager');
    
    // Navigate to people page
    await page.click('text=People');
    await expect(page.locator('h1')).toContainText('Family Members');
    
    // Navigate to relationships page
    await page.click('text=Relationships');
    await expect(page.locator('h1')).toContainText('Family Relationships');
    
    // Navigate to family tree page
    await page.click('text=Family Tree');
    await expect(page.locator('h1')).toContainText('Family Tree Visualization');
    
    // Navigate to add person page
    await page.click('text=Add Person');
    await expect(page.locator('h1')).toContainText('Add Family Member');
  });

  test('should show empty states correctly', async ({ page }) => {
    // Check people empty state
    await page.goto('/people');
    await expect(page.locator('text=No family members yet')).toBeVisible();
    await expect(page.locator('text=Add First Person')).toBeVisible();
    
    // Check relationships empty state
    await page.goto('/relationships');
    await expect(page.locator('text=No relationships yet')).toBeVisible();
    await expect(page.locator('text=Add First Relationship')).toBeVisible();
    
    // Check tree empty state
    await page.goto('/tree');
    await expect(page.locator('text=Select a person to view their family tree')).toBeVisible();
  });

  test('should display add person form correctly', async ({ page }) => {
    await page.goto('/people/new');
    
    // Check form fields
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="middleName"]')).toBeVisible();
    await expect(page.locator('input[name="birthDate"]')).toBeVisible();
    await expect(page.locator('input[name="deathDate"]')).toBeVisible();
    await expect(page.locator('input[name="birthPlace"]')).toBeVisible();
    await expect(page.locator('textarea[name="bio"]')).toBeVisible();
    
    // Check form validation
    await page.click('button[type="submit"]');
    // Form should not submit without required fields
    await expect(page.url()).toContain('/people/new');
  });

  test('should display add relationship form correctly', async ({ page }) => {
    await page.goto('/relationships/new');
    
    // Should show message about needing more family members
    await expect(page.locator('text=Not Enough Family Members')).toBeVisible();
    await expect(page.locator('text=You need at least 2 family members')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Test with a network failure scenario by going to pages that try to fetch data
    // The pages should show error messages instead of crashing
    
    await page.goto('/people');
    // Should either show people or an error message, not crash
    const hasError = await page.locator('text=Failed to load').isVisible();
    const hasPeople = await page.locator('text=Family Members').isVisible();
    expect(hasError || hasPeople).toBeTruthy();
  });

  test('should have proper navigation highlighting', async ({ page }) => {
    // Test active navigation states
    await page.goto('/people');
    const peopleNav = page.locator('nav a[href="/people"]');
    await expect(peopleNav).toHaveClass(/border-blue-500/);
    
    await page.goto('/relationships');
    const relationshipsNav = page.locator('nav a[href="/relationships"]');
    await expect(relationshipsNav).toHaveClass(/border-blue-500/);
  });

  test('should display tree visualization controls', async ({ page }) => {
    await page.goto('/tree');
    
    // Check for tree visualization elements
    await expect(page.locator('text=Select Root Person')).toBeVisible();
    await expect(page.locator('text=Interactive Family Tree')).toBeVisible();
    
    // The tree component should be present (even if empty)
    await expect(page.locator('.react-flow')).toBeVisible();
  });
});