# AI Prompt: Write Tests

Use this template when writing tests for Cerberus IAM Frontend.

---

## Prompt

Write comprehensive tests for [component/function/feature name].

### Test Subject Details

- **Type**: [Component | Function | Hook | API | E2E Flow]
- **Location**: `[file path]`
- **Purpose**: [What it does]

### Testing Requirements

#### For React Components

1. **Rendering Tests**:
   - Test that component renders without errors
   - Test with different prop combinations
   - Test with required vs optional props

2. **User Interaction Tests**:
   - Test click handlers
   - Test form submissions
   - Test keyboard navigation
   - Test accessibility (screen reader support)

3. **State Tests**:
   - Test initial state
   - Test state changes
   - Test conditional rendering

4. **Edge Cases**:
   - Test with missing/null data
   - Test error states
   - Test loading states

#### For Functions/Utilities

1. **Happy Path**:
   - Test normal operation
   - Test expected inputs and outputs

2. **Edge Cases**:
   - Test with edge values (0, null, undefined, empty arrays)
   - Test boundary conditions
   - Test error scenarios

3. **Error Handling**:
   - Test invalid inputs
   - Test exception handling

---

## Component Test Template

```typescript
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { [ComponentName] } from '../[ComponentName]'

describe('[ComponentName]', () => {
  // Rendering tests
  describe('rendering', () => {
    it('renders without errors', () => {
      render(<[ComponentName] requiredProp="value" />)
      expect(screen.getByRole('...')).toBeInTheDocument()
    })

    it('renders with all props', () => {
      render(
        <[ComponentName]
          requiredProp="value"
          optionalProp="optional"
          className="custom"
        />
      )
      expect(screen.getByRole('...')).toHaveClass('custom')
    })

    it('renders children correctly', () => {
      render(
        <[ComponentName] requiredProp="value">
          <span>Child content</span>
        </[ComponentName]>
      )
      expect(screen.getByText('Child content')).toBeInTheDocument()
    })
  })

  // Interaction tests
  describe('interactions', () => {
    it('handles click events', async () => {
      const user = userEvent.setup()
      const handleClick = jest.fn()

      render(<[ComponentName] requiredProp="value" onClick={handleClick} />)

      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('handles keyboard navigation', async () => {
      const user = userEvent.setup()

      render(<[ComponentName] requiredProp="value" />)

      await user.tab()
      expect(screen.getByRole('button')).toHaveFocus()

      await user.keyboard('{Enter}')
      // Assert expected behavior
    })
  })

  // State tests
  describe('state management', () => {
    it('shows loading state', () => {
      render(<[ComponentName] requiredProp="value" loading={true} />)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('shows error state', () => {
      render(<[ComponentName] requiredProp="value" error="Error message" />)
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  // Edge cases
  describe('edge cases', () => {
    it('handles empty data gracefully', () => {
      render(<[ComponentName] requiredProp="" />)
      expect(screen.getByText(/no data/i)).toBeInTheDocument()
    })

    it('handles null values', () => {
      render(<[ComponentName] requiredProp="value" optionalProp={null} />)
      // Assert component handles null gracefully
    })
  })

  // Accessibility
  describe('accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<[ComponentName] requiredProp="value" />)
      const element = screen.getByRole('button')
      expect(element).toHaveAttribute('aria-label', '...')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<[ComponentName] requiredProp="value" />)

      await user.tab()
      expect(document.activeElement).toHaveAttribute('role', 'button')
    })
  })
})
```

---

## Function Test Template

```typescript
import { [functionName] } from '../[fileName]'

describe('[functionName]', () => {
  // Happy path
  describe('normal operation', () => {
    it('returns expected result for valid input', () => {
      const result = [functionName]('valid input')
      expect(result).toEqual('expected output')
    })

    it('handles multiple arguments correctly', () => {
      const result = [functionName]('arg1', 'arg2')
      expect(result).toEqual('expected output')
    })
  })

  // Edge cases
  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = [functionName]('')
      expect(result).toEqual('expected for empty')
    })

    it('handles null', () => {
      const result = [functionName](null)
      expect(result).toEqual('expected for null')
    })

    it('handles undefined', () => {
      const result = [functionName](undefined)
      expect(result).toEqual('expected for undefined')
    })

    it('handles zero', () => {
      const result = [functionName](0)
      expect(result).toEqual('expected for zero')
    })
  })

  // Error handling
  describe('error handling', () => {
    it('throws error for invalid input', () => {
      expect(() => [functionName]('invalid')).toThrow('Error message')
    })

    it('returns error result for failure', async () => {
      const result = await [functionName]('causes error')
      expect(result.ok).toBe(false)
      if (!result.ok) {
        expect(result.error.message).toBe('Expected error')
      }
    })
  })
})
```

---

## E2E Test Template (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('[Feature name]', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/[route]')
  })

  test('completes happy path flow', async ({ page }) => {
    // Step 1: Navigate to page
    await expect(page).toHaveURL('/[route]')

    // Step 2: Fill form
    await page.fill('[name="field1"]', 'value1')
    await page.fill('[name="field2"]', 'value2')

    // Step 3: Submit
    await page.click('button[type="submit"]')

    // Step 4: Verify success
    await expect(page).toHaveURL('/success-route')
    await expect(page.locator('text=Success')).toBeVisible()
  })

  test('shows validation errors', async ({ page }) => {
    // Submit without filling form
    await page.click('button[type="submit"]')

    // Check for validation errors
    await expect(page.locator('text=Required')).toBeVisible()
  })

  test('handles API errors', async ({ page }) => {
    // Mock API error
    await page.route('**/api/**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      })
    )

    await page.click('button[type="submit"]')

    // Check error message displayed
    await expect(page.locator('text=Server error')).toBeVisible()
  })
})
```

---

## Testing Best Practices

### Do's ✅

- Test user behavior, not implementation details
- Use accessible queries (`getByRole`, `getByLabelText`)
- Test edge cases and error scenarios
- Keep tests focused and isolated
- Use descriptive test names
- Mock external dependencies
- Test accessibility

### Don'ts ❌

- Don't test implementation details
- Don't use `querySelector` (use Testing Library queries)
- Don't test third-party libraries
- Don't create brittle tests (dependent on specific text/class names)
- Don't skip error cases
- Don't write tests without assertions

---

## Coverage Goals

- **Statements**: > 70%
- **Branches**: > 70%
- **Functions**: > 70%
- **Lines**: > 70%

Critical paths should have higher coverage (>90%).

---

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

---

## Checklist

- [ ] All rendering scenarios covered
- [ ] User interactions tested
- [ ] Edge cases handled
- [ ] Error scenarios tested
- [ ] Accessibility checked
- [ ] Tests are deterministic (no flaky tests)
- [ ] Tests have clear, descriptive names
- [ ] Mocks are properly set up and cleaned
- [ ] Coverage meets thresholds
- [ ] Tests pass in CI
