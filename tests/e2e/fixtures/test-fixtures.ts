import { test as base } from '@playwright/test';
import { mockPeople, mockRelationships } from './mock-data';

type TestFixtures = {
  mockApi: void;
};

export const test = base.extend<TestFixtures>({
  mockApi: async ({ page }, use) => {
    // Mock API responses
    await page.route('**/api/people', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: mockPeople }),
        });
      } else if (method === 'POST') {
        const postData = request.postDataJSON();
        const newPerson = {
          id: mockPeople.length + 1,
          ...postData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        await route.fulfill({
          status: 201,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: newPerson }),
        });
      }
    });

    await page.route('**/api/relationships', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: mockRelationships }),
        });
      }
    });

    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ok' }),
      });
    });

    await use();
  },
});

export { expect } from '@playwright/test';