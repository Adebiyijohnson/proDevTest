// global-setup.js
const { request, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Define the path where the authentication state will be saved
const AUTH_FILE = path.join(__dirname, '.auth/user.json'); // It's good practice to save this in a .auth directory and add it to .gitignore

async function globalSetup() {
  console.log('Running Playwright Global Setup...');
  const loginUrl = 'https://staging-api.celebut.com/v1/auth/login';

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

  // IMPORTANT: If your application primarily uses localStorage for the token,
  // you'll need to create a dummy page to inject the token into its localStorage
  // and then save that page's storageState.
  // This is because apiContext doesn't directly manage browser contexts.

  const browser = await require('@playwright/test').chromium.launch();
  const page = await browser.newPage();

  // Inject token into localStorage
  await page.addInitScript((tokenValue) => {
    localStorage.setItem('auth_token', tokenValue);
    // If your app uses session storage for the token, add:
    // sessionStorage.setItem('auth_token', tokenValue);
  }, token);

  // You might need to navigate to your app's base URL to ensure the localStorage
  // is properly set for that origin before saving the state.
  await page.goto('https://staging-api.celebut.com/'); // Replace with your application's base URL if different

  // Save the storage state (cookies, local storage, session storage)
  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();

  console.log('✅ Access token saved to .auth/user.json via Global Setup.');
}

module.exports = globalSetup;