- Install Playwright
npm init playwright@latest

- Create Spec Files

- Add Global Variables (Playwright's Global Setup)
// global-setup.js
const { request, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

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

  expect(response.ok()).toBeTruthy();

  const responseBody = await response.json();
  const token = responseBody.token || responseBody.accessToken;

  const browser = await require('@playwright/test').chromium.launch();
  const page = await browser.newPage();

  await page.addInitScript((tokenValue) => {
    localStorage.setItem('auth_token', tokenValue);
  }, token);

  await page.goto('https://staging-api.celebut.com/');

  await page.context().storageState({ path: AUTH_FILE });
  await browser.close();

  console.log('✅ Access token saved to .auth/user.json via Global Setup.');
}

module.exports = globalSetup;
