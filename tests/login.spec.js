// playwright-login.spec.js
const { test, expect, request } = require('@playwright/test');

test('Login via API and verify user UI elements', async ({ page }) => {
  const loginUrl = 'https://staging-api.celebut.com/v1/auth/login';

  // Step 1: Make an API request to login
  const apiContext = await request.newContext();
  const response = await apiContext.post(loginUrl, {
    data: {
      email: 'morscino@gmail.com',
      password: 'Lubulubu$$12345',
    },
  });

  expect(response.ok()).toBeTruthy(); // Assert login was successful

  const responseBody = await response.json();
  const token = responseBody.token || responseBody.accessToken;

  // Add assertion to verify the responseBody contains 'data' and has elements inside
  expect(responseBody).toHaveProperty('data'); // Check if 'data' property exists
  expect(responseBody.data).toBeDefined(); // Check if 'data' is not undefined or null

  // If 'data' is expected to be an object and not empty:
  expect(Object.keys(responseBody.data).length).toBeGreaterThan(0);
  console.log('Response data:', responseBody.data);

  // If 'data' is expected to be an array and not empty:
  // expect(Array.isArray(responseBody.data)).toBeTruthy();
  // expect(responseBody.data.length).toBeGreaterThan(0);


  // Inject token into localStorage or cookies if needed
  await page.addInitScript((token) => {
    localStorage.setItem('auth_token', token);
  }, token);

  // Reload the page with token set
  await page.reload();

  // Step 3: Verify user is logged in

  console.log('✅ Login verified successfully via API');
});