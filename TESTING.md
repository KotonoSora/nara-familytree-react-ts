# Testing Guide

This project includes comprehensive testing setup with both unit tests and end-to-end tests.

## Test Types

### Unit/API Tests (Vitest)
- **Location**: `workers/tests/`
- **Framework**: Vitest with Cloudflare Workers pool
- **Purpose**: Test API endpoints and business logic

### End-to-End Tests (Playwright)
- **Location**: `tests/e2e/`
- **Framework**: Playwright
- **Purpose**: Test user interactions and UI functionality

## Running Tests

### Unit Tests
```bash
# Run all unit tests
npm run test

# Run specific test file
npm run test workers/tests/common.test.ts

# Run tests with coverage
npm run coverage
```

### E2E Tests
```bash
# Install browsers (one-time setup)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Quick Test Runner
```bash
# Run comprehensive test check
./test-runner.sh
```

## Test Data

E2E tests use mocked API responses with predefined family data:
- 4 mock family members (John, Jane, Alice, Bob)
- Family relationships (parent-child, spouse)
- Comprehensive person attributes

## Test Coverage

### Unit Tests Cover:
- ✅ API health endpoints
- ✅ Hello world functionality  
- ❌ People CRUD operations (requires DB setup)
- ❌ Relationships API (requires DB setup)

### E2E Tests Cover:
- ✅ Navigation between pages
- ✅ Home page content and layout
- ✅ People management interface
- ✅ Add person form functionality
- ✅ Responsive design
- ✅ API mocking and data handling

## Environment Requirements

- **Node.js**: v22.17.1 (see `.nvmrc`)
- **Bun**: 1.2.18 (see `.bun-version`)
- **Browsers**: Chromium (for Playwright)

## Known Issues

- Some unit tests require proper database binding setup
- Browser download may fail in certain environments
- Node version mismatch warnings (project requires v22.17.1)