# GitHub Copilot Instructions - Cerberus IAM Frontend

## Project Context

You are working on **Cerberus IAM Frontend**, a Next.js TypeScript application that provides the web UI for an Identity & Access Management platform. This frontend talks to a backend API (Cerberus IAM API) for all authentication and data operations.

## Key Technologies

- Next.js 16 with **Pages Router** (not App Router)
- TypeScript 5 (strict mode)
- React 19 with functional components and hooks
- Tailwind CSS 4 for styling
- Radix UI + shadcn/ui for components
- Zod for validation
- Jest + React Testing Library + Playwright for testing

## Code Style Guidelines

### TypeScript

- **Strict typing**: Never use `any` - use proper types or `unknown`
- **Interfaces first**: Use `interface` for object shapes, `type` for unions/intersections
- **Type imports**: Use `import type` when importing only types
- **Null handling**: Be explicit with `| null` or `| undefined`

### React Components

```typescript
// Component pattern
interface ComponentProps {
  required: string
  optional?: number
  children?: React.ReactNode
}

export function Component({ required, optional = 0 }: ComponentProps) {
  return <div>{required}</div>
}
```

### Naming Conventions

- Components: `PascalCase` (e.g., `UserProfile.tsx`)
- Functions/variables: `camelCase` (e.g., `getUserData`)
- Hooks: `use` prefix (e.g., `useUser`)
- Types/Interfaces: `PascalCase` (e.g., `UserProfile`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`)

## Common Patterns

### API Calls with Result Pattern

```typescript
import type { Result } from '@/lib/result'

async function fetchData(): Promise<Result<Data>> {
  try {
    const data = await apiClient.get<Data>('/endpoint')
    return { ok: true, value: data }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
}

// Usage
const result = await fetchData()
if (result.ok) {
  // Use result.value
} else {
  // Handle result.error
}
```

### Server-Side Redirects (Pages Router)

```typescript
export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  }
}
```

### Styling with Tailwind

```tsx
import { cn } from '@/lib/utils'

<div className={cn(
  'base classes',
  isActive && 'active classes',
  className
)}>
```

## File Organization

- One component per file
- Co-locate tests: `ComponentName.test.tsx` or `__tests__/ComponentName.test.tsx`
- Use barrel exports (`index.ts`) for clean imports
- Group related files in directories

## Testing

### Unit Tests

```typescript
import { render, screen } from '@testing-library/react'
import { Component } from './Component'

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />)
    expect(screen.getByText('...')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('user flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@example.com')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

Types: feat, fix, docs, style, refactor, test, chore
Example: feat(auth): add password reset flow
```

## Code Review Checklist

When suggesting code, ensure:

- [ ] TypeScript types are correct and strict
- [ ] No `any` types used
- [ ] Error handling is present
- [ ] Accessibility attributes included (ARIA, semantic HTML)
- [ ] Responsive design (mobile-first)
- [ ] Tailwind classes used (no inline styles)
- [ ] Tests included for new features
- [ ] Follows existing code patterns
- [ ] No hardcoded values (use env vars or constants)
- [ ] Proper import paths (`@/` alias)

## Common Mistakes to Avoid

❌ Using App Router APIs (`redirect`, `useRouter` from `next/navigation`)
❌ Using `any` type
❌ Inline styles instead of Tailwind
❌ Throwing errors instead of returning Result
❌ Missing error handling
❌ Not typing component props
❌ Ignoring ESLint warnings
❌ Missing accessibility attributes
❌ Hardcoding API URLs (use env vars)
❌ Making auth decisions in frontend (always call backend)

## Helpful Context

### API Client Location

`src/lib/api/client.ts` - Use this for all API calls

### Common Types

`src/types/iam.ts` - User, Organization, and IAM types

### UI Components

`src/components/ui/` - shadcn/ui components (Button, Input, Dialog, etc.)

### Hooks

`src/hooks/` - Custom React hooks

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` - Client-side API URL
- `API_BASE_URL` - Server-side API URL
- `NEXT_PUBLIC_APP_URL` - Frontend URL

## Example: Creating a New Feature

1. **Define types** in `src/types/`
2. **Create API function** in `src/lib/api/` using Result pattern
3. **Build component** in `src/components/`
4. **Add page** (if needed) in `src/pages/`
5. **Write tests** in `__tests__/` or `.test.tsx` files
6. **Update documentation** if public API changes

## Priority Order

When suggesting code:

1. **Correctness**: Type-safe, error-handled, tested
2. **Security**: No XSS, proper auth checks, env vars
3. **Performance**: Optimized, no unnecessary re-renders
4. **Accessibility**: Keyboard nav, ARIA, semantic HTML
5. **Maintainability**: Clean, documented, follows patterns
6. **Style**: Consistent with existing code

---

Focus on writing production-quality, type-safe code that follows project conventions.
