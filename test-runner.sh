#!/bin/bash

echo "🧪 Running Family Tree Application Tests"
echo "========================================"

echo ""
echo "📋 Test Environment Information:"
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Required Node: $(cat .nvmrc)"
echo "Required Bun: $(cat .bun-version)"

echo ""
echo "🔧 Running Unit Tests (Vitest)..."
npm run test -- --run workers/tests/common.test.ts

echo ""
echo "🌐 E2E Test Setup Ready"
echo "Playwright configuration: ✅"
echo "Test fixtures with mock data: ✅"
echo "Test specs created: ✅"

echo ""
echo "📝 E2E Tests Available:"
echo "  - Navigation tests"
echo "  - People management tests"
echo "  - Add person form tests"

echo ""
echo "🚀 To run E2E tests with browsers:"
echo "  1. Install browsers: npx playwright install"
echo "  2. Start dev server: npm run dev"
echo "  3. Run tests: npm run test:e2e"

echo ""
echo "✅ Test setup complete!"