/**
 * Test setup file for Jest
 * This file is executed before each test file
 */

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

// After all tests, you can add cleanup if needed
afterAll(() => {
  // Any global cleanup
});
