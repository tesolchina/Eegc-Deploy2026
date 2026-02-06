# EEGC Automated Testing Plan

Version: 1.0
Last Updated: 2026-02-06

---

## Overview

This document outlines a plan for writing automated tests for the EEGC application. It covers what to test, which tools to use, and provides code examples for each test category.

The goal is to catch bugs early, prevent regressions after code changes, and ensure the application remains stable as new features are added.

---

## Recommended Testing Stack

| Tool | Purpose | Why |
|------|---------|-----|
| **Vitest** | Unit tests & API tests | Native Nuxt/Vite support, fast, works with TypeScript |
| **Playwright** | End-to-end browser tests | Cross-browser support, reliable for form interactions and navigation |
| **@nuxt/test-utils** | Nuxt-specific test helpers | Provides `setup()`, `$fetch()`, and server context for Nuxt apps |

### Installation

> **Important**: Modifying `package.json` and `nuxt.config.ts` requires Kaitai's approval before proceeding, as these are restricted files in our workflow. Discuss with the team before making these changes.

```bash
npm install -D vitest @nuxt/test-utils playwright @playwright/test
npx playwright install chromium
```

### Configuration

Add to `nuxt.config.ts` (requires approval):
```ts
export default defineNuxtConfig({
  // ... existing config
  modules: [
    '@nuxt/test-utils/module'  // only needed for Nuxt-specific test helpers
  ]
})
```

Add `vitest.config.ts` (new file, safe to create):
```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        dotenv: { fileName: '.env.test' }
      }
    }
  }
})
```

Add scripts to `package.json` (requires approval):
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## Test Category 1: API Unit Tests (Vitest)

Test each server API endpoint in isolation. These tests make HTTP requests to the Nitro server and verify responses.

### File Structure
```
tests/
├── api/
│   ├── student-signup.test.ts
│   ├── student-login.test.ts
│   ├── student-submit-report.test.ts
│   ├── teacher-login.test.ts
│   ├── teacher-reports.test.ts
│   ├── teacher-duplicate-check.test.ts
│   ├── poe-chat.test.ts
│   └── auth-middleware.test.ts
├── e2e/
│   ├── landing.spec.ts
│   ├── student-flow.spec.ts
│   ├── teacher-flow.spec.ts
│   └── eegc-chat.spec.ts
├── integration/
│   └── supabase.test.ts
└── fixtures/
    └── test-data.ts
```

### API Endpoints Reference

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/student/signup` | POST | No | Student registration (whitelist check) |
| `/api/student/login` | POST | No | Student login (JWT issued) |
| `/api/student/submit-report` | POST | Student JWT | Submit learning report |
| `/api/teacher/login` | POST | No | Teacher login (JWT issued) |
| `/api/teacher/reports` | GET | Teacher JWT | Fetch all learning reports |
| `/api/teacher/duplicate-check` | GET | Teacher JWT | Check for duplicate student IDs |
| `/api/poe-chat` | POST | Student or Teacher JWT | AI chat (supports streaming) |
| `/api/submit-report` | POST | No (legacy) | Legacy report submission (may be deprecated) |

### Example: Student Signup API Test

```ts
// tests/api/student-signup.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('POST /api/student/signup', async () => {
  await setup({ server: true })

  it('returns 400 when required fields are missing', async () => {
    try {
      await $fetch('/api/student/signup', {
        method: 'POST',
        body: { student_number_suffix: 1234 }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
      expect(error.statusMessage).toBe('Missing required fields')
    }
  })

  it('returns 403 when student is not in whitelist', async () => {
    try {
      await $fetch('/api/student/signup', {
        method: 'POST',
        body: {
          student_number_suffix: 9999,
          name_prefix: 'ZZ',
          section_number: 1
        }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(403)
      expect(error.statusMessage).toBe('NOT_IN_WHITELIST')
    }
  })

  it('registers successfully when student is in whitelist', async () => {
    // Prerequisite: suffix 5678 must be in student_whitelist table
    const response = await $fetch('/api/student/signup', {
      method: 'POST',
      body: {
        student_number_suffix: 5678,
        name_prefix: 'TS',
        section_number: 1
      }
    })
    expect(response.success).toBe(true)
    expect(response.random_code).toHaveLength(2)
  })
})
```

### Example: Student Login API Test

```ts
// tests/api/student-login.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('POST /api/student/login', async () => {
  await setup({ server: true })

  it('returns 400 when uniqueId is missing', async () => {
    try {
      await $fetch('/api/student/login', {
        method: 'POST',
        body: {}
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('returns 400 for invalid ID format', async () => {
    try {
      await $fetch('/api/student/login', {
        method: 'POST',
        body: { uniqueId: 'invalid-format' }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
      expect(error.statusMessage).toContain('Invalid ID format')
    }
  })

  it('returns 401 for non-existent student', async () => {
    try {
      await $fetch('/api/student/login', {
        method: 'POST',
        body: { uniqueId: '0000-XX-ZZ' }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
    }
  })
})
```

### Example: Teacher Login API Test

```ts
// tests/api/teacher-login.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('POST /api/teacher/login', async () => {
  await setup({ server: true })

  it('returns 400 when email or password missing', async () => {
    try {
      await $fetch('/api/teacher/login', {
        method: 'POST',
        body: { email: 'test@example.com' }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(400)
    }
  })

  it('returns 401 for wrong credentials', async () => {
    try {
      await $fetch('/api/teacher/login', {
        method: 'POST',
        body: { email: 'wrong@email.com', password: 'wrong' }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
    }
  })
})
```

### Example: Student Report Submission API Test

```ts
// tests/api/student-submit-report.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('POST /api/student/submit-report', async () => {
  await setup({ server: true })

  it('returns 401 when no student auth cookie', async () => {
    try {
      await $fetch('/api/student/submit-report', {
        method: 'POST',
        body: {
          rating: 5,
          comment: 'Good session',
          mode: 'training',
          chat_history: [],
          contribution_analysis: 'Test analysis'
        }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
      expect(error.statusMessage).toContain('Unauthorized')
    }
  })
})
```

### Example: Poe Chat API Test (Model Fallback & Validation)

```ts
// tests/api/poe-chat.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('POST /api/poe-chat', async () => {
  await setup({ server: true })

  it('returns 400 when chat_history is missing', async () => {
    // Note: This test requires a valid auth cookie.
    // In practice, the auth middleware blocks unauthenticated requests first.
    try {
      await $fetch('/api/poe-chat', {
        method: 'POST',
        body: {}
      })
    } catch (error: any) {
      // Will be 401 (auth) or 400 (validation) depending on cookie state
      expect([400, 401]).toContain(error.statusCode)
    }
  })

  it('returns 400 when chat_history is not an array', async () => {
    try {
      await $fetch('/api/poe-chat', {
        method: 'POST',
        body: { chat_history: 'not-an-array' }
      })
    } catch (error: any) {
      expect([400, 401]).toContain(error.statusCode)
    }
  })

  // Model fallback behavior:
  // If an unrecognized model_name is provided, the server falls back to 'gemini-3-flash'
  // Allowed models: 'gpt-5.2', 'gemini-3-flash', 'gpt-5.2-instant'
  // This behavior should be validated when auth is available
})
```

> **Note on Streaming**: The `/api/poe-chat` endpoint supports SSE streaming (`stream: true`).
> Testing streaming responses requires reading the response as a stream rather than awaiting JSON.
> This is more complex to test and may require a dedicated streaming test helper:
>
> ```ts
> // Pseudocode for streaming test
> const response = await fetch('http://localhost:5000/api/poe-chat', {
>   method: 'POST',
>   headers: { 'Content-Type': 'application/json', Cookie: 'student_auth=<valid-token>' },
>   body: JSON.stringify({
>     chat_history: [{ role: 'user', content: 'Hello' }],
>     model_name: 'gemini-3-flash',
>     stream: true
>   })
> })
> expect(response.headers.get('content-type')).toContain('text/event-stream')
> // Read chunks from response.body reader
> ```

### Example: Auth Middleware Test

```ts
// tests/api/auth-middleware.test.ts
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

describe('Auth Middleware', async () => {
  await setup({ server: true })

  it('blocks /api/teacher/reports without auth cookie', async () => {
    try {
      await $fetch('/api/teacher/reports')
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
      expect(error.statusMessage).toContain('Unauthorized')
    }
  })

  it('blocks /api/poe-chat without any auth cookie', async () => {
    try {
      await $fetch('/api/poe-chat', {
        method: 'POST',
        body: { chat_history: [{ role: 'user', content: 'hello' }] }
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(401)
    }
  })

  it('allows /api/student/signup without auth (public route)', async () => {
    // Signup should not require auth - it should fail with 400 for missing fields, not 401
    try {
      await $fetch('/api/student/signup', {
        method: 'POST',
        body: {}
      })
    } catch (error: any) {
      expect(error.statusCode).toBe(400) // Not 401
    }
  })
})
```

---

## Test Category 2: End-to-End Tests (Playwright)

Test full user flows in a real browser.

### Playwright Configuration

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:5000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5000',
    reuseExistingServer: true,
    timeout: 120000
  }
})
```

### Example: Landing Page E2E Test

```ts
// tests/e2e/landing.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('displays role selection buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=EEGC')).toBeVisible()
    await expect(page.locator('text=Teacher Portal')).toBeVisible()
    await expect(page.locator('text=Student Entrance')).toBeVisible()
  })

  test('navigates to teacher login', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Teacher Portal')
    await expect(page).toHaveURL('/teacher/login')
  })

  test('navigates to student login', async ({ page }) => {
    await page.goto('/')
    await page.click('text=Student Entrance')
    await expect(page).toHaveURL('/student/login')
  })
})
```

### Example: Student Registration and Login Flow

```ts
// tests/e2e/student-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Student Registration Flow', () => {
  test('shows error for non-whitelisted student', async ({ page }) => {
    await page.goto('/student/signup')
    await page.fill('input[placeholder="e.g. 1234"]', '9999')
    await page.fill('input[placeholder="e.g. JD"]', 'ZZ')
    await page.fill('input[placeholder="e.g. 1"]', '1')
    await page.click('button[type="submit"]')

    // Wait for SweetAlert2 popup
    await expect(page.locator('.swal2-title')).toContainText('Registration Not Allowed')
  })

  test('successfully registers a whitelisted student', async ({ page }) => {
    await page.goto('/student/signup')

    const suffix = '5678' // Must be in whitelist
    const uniqueSuffix = Date.now().toString().slice(-2) // for unique name prefix
    const namePrefix = 'T' + uniqueSuffix[0]

    await page.fill('input[placeholder="e.g. 1234"]', suffix)
    await page.fill('input[placeholder="e.g. JD"]', namePrefix)
    await page.fill('input[placeholder="e.g. 1"]', '1')
    await page.click('button[type="submit"]')

    // Wait for success popup
    await expect(page.locator('.swal2-title')).toContainText('Registration Successful')
  })
})

test.describe('Student Login Flow', () => {
  test('shows two options on student login page', async ({ page }) => {
    await page.goto('/student/login')
    await expect(page.locator('text=I have an ID')).toBeVisible()
    await expect(page.locator("text=I'm new here")).toBeVisible()
  })

  test('shows login form when clicking "I have an ID"', async ({ page }) => {
    await page.goto('/student/login')
    await page.click('text=I have an ID')
    await expect(page.locator('input[placeholder="e.g. 1234-JD-A1"]')).toBeVisible()
  })

  test('shows error for invalid login code', async ({ page }) => {
    await page.goto('/student/login')
    await page.click('text=I have an ID')
    await page.fill('input[placeholder="e.g. 1234-JD-A1"]', '0000-XX-ZZ')
    await page.click('text=Access My Portal')

    await expect(page.locator('.swal2-title')).toContainText('Login Failed')
  })
})
```

### Example: Teacher Dashboard Flow

```ts
// tests/e2e/teacher-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Teacher Login and Dashboard', () => {
  test('shows error for wrong credentials', async ({ page }) => {
    await page.goto('/teacher/login')
    await page.fill('input[type="email"]', 'wrong@email.com')
    await page.fill('input[type="password"]', 'wrongpass')
    await page.click('text=Login to Portal')

    await expect(page.locator('.swal2-title')).toContainText('Login Failed')
  })

  // This test requires real teacher credentials - use environment variables
  test('successful login and dashboard access', async ({ page }) => {
    const email = process.env.TEST_TEACHER_EMAIL || 'teacher@hkbu.edu.hk'
    const password = process.env.TEST_TEACHER_PASSWORD || 'testpass'

    await page.goto('/teacher/login')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.click('button:has-text("Login to Portal")')

    // Wait for SweetAlert success, then redirect
    await page.waitForURL('/teacher/dashboard', { timeout: 10000 })

    // Verify dashboard elements match actual UI text from teacher/dashboard.vue
    await expect(page.locator('text=Teacher Portal')).toBeVisible()
    await expect(page.locator('h2:has-text("Reports Dashboard")')).toBeVisible()
    await expect(page.locator('text=Check Duplicate ID Suffix')).toBeVisible()
    await expect(page.locator('text=Sign Out')).toBeVisible()
  })
})
```

---

## Test Category 3: Component Tests (Optional, Future)

If the project grows, consider adding Vue component tests using Vitest + Vue Test Utils.

### When to Add Component Tests
- When a component has complex internal logic (e.g. `ChatInterface`, `WritingBotReport`)
- When a component handles form validation
- When refactoring a component and want to ensure no regressions

### Example: ModeSelector Component Test

```ts
// tests/components/ModeSelector.test.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ModeSelector from '~/components/eegc/ModeSelector.vue'

describe('ModeSelector', () => {
  it('renders all three mode options', async () => {
    const component = await mountSuspended(ModeSelector, {
      props: {
        currentMode: 'briefing',
        isThinking: false,
        modeLabels: { briefing: 'Briefing', training: 'Training', assessment: 'Assessment' },
        modeColors: { briefing: 'blue', training: 'green', assessment: 'red' },
        isOpen: true
      }
    })

    expect(component.text()).toContain('Briefing')
    expect(component.text()).toContain('Training')
    expect(component.text()).toContain('Assessment')
  })
})
```

---

## Test Category 4: Database Integration Tests

These tests verify that the Supabase queries work correctly. They require a live connection to the Supabase database.

### Important Notes
- Use a **test/staging Supabase project** if possible, not production
- Clean up test data after each test run
- Never run destructive tests against the production database

### Example: Database Query Test

```ts
// tests/integration/supabase.test.ts
import { describe, it, expect, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
)

const testSuffix = 7777 // Use a unique number for test data

describe('Supabase Database', () => {
  afterAll(async () => {
    // Clean up test data
    await supabase.from('students').delete().eq('student_number_suffix', testSuffix)
  })

  it('can query student_whitelist table', async () => {
    const { data, error } = await supabase
      .from('student_whitelist')
      .select('*')
      .limit(1)

    expect(error).toBeNull()
    expect(data).toBeDefined()
  })

  it('can insert and read a student', async () => {
    const { data, error } = await supabase
      .from('students')
      .insert({ student_number_suffix: testSuffix, name_prefix: 'TS', section_number: 1, random_code: 'Z9' })
      .select()

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data![0].student_number_suffix).toBe(testSuffix)
  })

  it('can query learning_reports table', async () => {
    const { data, error } = await supabase
      .from('learning_reports')
      .select('*')
      .limit(1)

    expect(error).toBeNull()
  })
})
```

---

## Implementation Priority

Recommended order for writing automated tests:

| Priority | Category | Reason |
|----------|----------|--------|
| 1 | API Unit Tests | Fastest to write, catches backend bugs immediately |
| 2 | Auth Middleware Tests | Security-critical, must always work correctly |
| 3 | E2E Landing + Login Flows | Validates the most common user paths |
| 4 | E2E Registration Flow | Important for demo day |
| 5 | E2E Teacher Dashboard | Validates data display and interactions |
| 6 | Database Integration Tests | Ensures Supabase connectivity and queries |
| 7 | Component Tests | Lower priority; add when refactoring components |

---

## Test Environment Variables

Create a `.env.test` file (do not commit to git):

```env
SUPABASE_URL=<your-supabase-url>
SUPABASE_PUBLISHABLE_KEY=<your-supabase-key>
POE_API_KEY=<your-poe-api-key>
JWT_SECRET=test-secret-key
TEST_TEACHER_EMAIL=<test-teacher-email>
TEST_TEACHER_PASSWORD=<test-teacher-password>
```

Add `.env.test` to `.gitignore`.

---

## Running Tests

```bash
# Run all unit/API tests
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run end-to-end tests
npm run test:e2e

# Run a specific test file
npx vitest run tests/api/student-signup.test.ts

# Run E2E tests with visible browser (for debugging)
npx playwright test --headed
```

---

## CI/CD Integration (Future)

When ready, add a GitHub Actions workflow:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - run: npx playwright install chromium
      - run: npm run test:e2e
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_PUBLISHABLE_KEY: ${{ secrets.SUPABASE_PUBLISHABLE_KEY }}
      JWT_SECRET: ${{ secrets.JWT_SECRET }}
```
