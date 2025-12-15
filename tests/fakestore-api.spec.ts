import { test, expect } from '@playwright/test';
import Ajv from 'ajv';

// Initialize Ajv for JSON Schema validation
const ajv = new Ajv();

// Define JSON Schema for the product response
const productSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    title: { type: 'string' },
    price: { type: 'number' },
    category: { type: 'string' },
    description: { type: 'string' },
    image: { type: 'string' },
    rating: {
      type: 'object',
      properties: {
        rate: { type: 'number' },
        count: { type: 'number' },
      },
    },
  },
  required: ['id', 'title', 'price', 'category', 'description'],
};

test('FakeStore API - Get Product by ID', async ({ request }) => {
  // Define the API endpoint
  const apiUrl = 'https://fakestoreapi.com/products/1';

  console.log(`Sending GET request to: ${apiUrl}`);

  // Send GET request to the endpoint
  const response = await request.get(apiUrl);

  // Verify the response status is 200
  expect(response.status()).toBe(200);
  console.log(`✓ Response status: ${response.status()}`);

  // Parse the response body
  const responseBody = await response.json();
  console.log(`✓ Response received:`, JSON.stringify(responseBody, null, 2));

  // Validate that response contains all required keys
  const requiredKeys = ['id', 'title', 'price', 'category', 'description'];
  for (const key of requiredKeys) {
    expect(responseBody).toHaveProperty(key);
    console.log(`✓ Key '${key}' exists in response`);
  }

  // Validate the data types using JSON Schema with Ajv
  const validate = ajv.compile(productSchema);
  const isValid = validate(responseBody);

  if (!isValid) {
    console.error('Schema validation errors:', validate.errors);
  }
  expect(isValid).toBe(true);
  console.log('✓ JSON Schema validation passed');

  // Log the product title and price to the console
  const productTitle = responseBody.title;
  const productPrice = responseBody.price;

  console.log(`\n📦 Product Details:`);
  console.log(`   Title: ${productTitle}`);
  console.log(`   Price: $${productPrice}`);

  // Additional assertions on the values
  expect(productTitle).toBeTruthy();
  expect(productPrice).toBeGreaterThan(0);
});
