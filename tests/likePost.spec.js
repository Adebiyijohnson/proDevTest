// like-post.spec.js
const { test, expect, request } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Define the path to the authentication file saved by global-setup.js
const AUTH_FILE = path.join(__dirname, '.auth/user.json');

test('Like a post via API', async () => {
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
        console.log('Access Token retrieved from storage for liking post:', accessToken.substring(0, 20) + '...');
      } else {
        throw new Error('auth_token not found in localStorage in .auth/user.json for like post test');
      }
    } else {
      throw new Error('No localStorage entries found for the specified origin in .auth/user.json for like post test');
    }
  } catch (error) {
    console.error('Error reading or parsing authentication file for like post:', error);
    expect.fail(`Failed to retrieve access token for like post: ${error.message}`);
  }

  // Ensure accessToken is available before proceeding
  expect(accessToken).toBeDefined();

  // --- Step 2: Define the API endpoint for toggling like on a post ---
  // IMPORTANT: Replace '5d0e7c89-f11f-4791-b214-2ac0004555d2' with a real post ID
  // that you want to like/unlike. This ID is static in the request.
  const postIdToLike = '5d0e7c89-f11f-4791-b214-2ac0004555d2'; // Use an existing post ID
  const toggleLikeUrl = `https://staging-api.celebut.com/v1/posts/${postIdToLike}/toggle-like`;

  // --- Step 3: Make the API request to toggle the like ---
  const apiContext = await request.newContext();
  const response = await apiContext.put(toggleLikeUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` // Attach the retrieved access token
    },
    // For toggle-like, the request body might be empty or require a specific payload
    // based on the API documentation. Assuming it's a simple PUT request with auth.
    // If a body is required, add it here:
    // data: {},
  });

  // --- Step 4: Assert the like toggle was successful ---
  expect(response.ok()).toBeTruthy(); // Assert that the response status is 2xx

  const responseBody = await response.json();
  console.log('Toggle Like Post response:', JSON.stringify(responseBody, null, 2));

  // Add more specific assertions based on your API's success response for toggling a like.
  // For example, check for a success message, or a new 'liked' status.
  // This example assumes a simple success message or status.
  expect(responseBody).toHaveProperty('message');
  expect(responseBody.message).toContain('Post liked successfully') || expect(responseBody.message).toContain('Post unliked successfully');


  console.log(`✅ Post with ID ${postIdToLike} like status toggled successfully.`);
});
