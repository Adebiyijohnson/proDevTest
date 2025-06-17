// create-post.spec.js
const { test, expect, request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Define the path to the authentication file saved by global-setup.js
const AUTH_FILE = path.join(__dirname, '.auth/user.json');

test('Create a new post via API', async () => {
  // --- Step 1: Retrieve the access token from the saved authentication state ---
  let accessToken;
  try {
    const authState = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    // Find the localStorage item that contains the auth_token
    const localStorageEntry = authState.origins.find(
      (origin) => origin.origin === 'https://staging-api.celebut.com' // Match your application's origin
    )?.localStorage;

    if (localStorageEntry) {
      const tokenEntry = localStorageEntry.find((item) => item.name === 'auth_token');
      if (tokenEntry) {
        accessToken = tokenEntry.value;
        console.log('Access Token retrieved from storage:', accessToken.substring(0, 20) + '...'); // Log first 20 chars for privacy
      } else {
        throw new Error('auth_token not found in localStorage in .auth/user.json');
      }
    } else {
      throw new Error('No localStorage entries found for the specified origin in .auth/user.json');
    }
  } catch (error) {
    console.error('Error reading or parsing authentication file:', error);
    // Fail the test if we can't get the token, as it's required for the API call
    expect.fail(`Failed to retrieve access token: ${error.message}`);
  }

  // Ensure accessToken is available before proceeding
  expect(accessToken).toBeDefined();

  // --- Step 2: Define the API endpoint for creating posts ---
  const createPostUrl = 'https://staging-api.celebut.com/v1/posts';

  // --- Step 3: Prepare the request body for the new post ---
  const requestBody = {
    "media_1": {
      "filename": "image_upload_1.jpg",
      "header": {
        "additionalProp1": ["value1a"],
        "additionalProp2": ["value1b"],
        "additionalProp3": ["value1c"]
      },
      "size": 1024 // Example size in bytes
    },
    // You can remove media_2 to media_6 if they are optional or not needed
    // or provide different dummy data for each
    "media_2": {
      "filename": "video_upload_2.mp4",
      "header": {
        "additionalProp1": ["value2a"],
        "additionalProp2": ["value2b"],
        "additionalProp3": ["value2c"]
      },
      "size": 51200 // Example size in bytes
    },
    "message": "This is a new test post created via Playwright API!",
    "reply_to": "some_post_id_if_replying" // Set to an actual post ID or null/empty string if not a reply
  };

  // --- Step 4: Make the API request to create the post ---
  const apiContext = await request.newContext();
  const response = await apiContext.post(createPostUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` // Attach the retrieved access token
    },
    data: requestBody,
  });

  // --- Step 5: Assert the post creation was successful ---
  expect(response.ok()).toBeTruthy(); // Assert that the response status is 2xx

  const responseBody = await response.json();
  console.log('Post creation response:', JSON.stringify(responseBody, null, 2));

  // Add more specific assertions based on your API's success response structure
  // For example, check if a 'post_id' or 'id' is returned
  expect(responseBody).toHaveProperty('data');
  expect(responseBody.data).toHaveProperty('id');
  expect(typeof responseBody.data.id).toBe('string'); // Assuming id is a string
  expect(responseBody.data.message).toEqual(requestBody.message);

  console.log(`✅ New post created successfully with ID: ${responseBody.data.id}`);
});
