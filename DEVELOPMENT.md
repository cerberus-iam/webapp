# Development Guide

This guide provides detailed information for developers working on Cerberus IAM Frontend.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Setup](#project-setup)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Code Patterns](#code-patterns)
- [API Integration](#api-integration)
- [State Management](#state-management)
- [Styling Guide](#styling-guide)
- [Testing Strategy](#testing-strategy)
- [Debugging](#debugging)
- [Common Issues](#common-issues)
- [Performance Optimization](#performance-optimization)

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 16 (Pages Router)
- **Language**: TypeScript 5
- **UI**: React 19 + Radix UI + shadcn/ui
- **Styling**: Tailwind CSS 4
- **Testing**: Jest + React Testing Library + Playwright
- **Validation**: Zod
- **Build Tool**: Next.js built-in (Turbopack/Webpack)

### Application Architecture

```
┌─────────────────────────────────────────┐
│         Cerberus IAM Frontend           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      Pages (Next.js Router)       │ │
│  │  - Login, Register, Dashboard     │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────▼───────────────────┐ │
│  │      Components (React)           │ │
│  │  - UI Components (shadcn/ui)      │ │
│  │  - Business Logic Components      │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
│  ┌───────────────▼───────────────────┐ │
│  │      Lib & Utilities              │ │
│  │  - API Client                     │ │
│  │  - Auth Helpers                   │ │
│  │  - Result Pattern                 │ │
│  └───────────────┬───────────────────┘ │
│                  │                      │
└──────────────────┼──────────────────────┘
                   │ HTTP/REST
┌──────────────────▼──────────────────────┐
│       Cerberus IAM API (Backend)        │
│  - Authentication                       │
│  - User Management                      │
│  - Session Handling                     │
└─────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: UI components, business logic, and API calls are separated
2. **Type Safety**: Strong TypeScript typing throughout
3. **Error Handling**: Result pattern for predictable error handling
4. **Reusability**: Component composition and custom hooks
5. **Performance**: Code splitting, lazy loading, and optimization

## Project Setup

### Prerequisites

- Node.js 20.x LTS
- npm 10.x or higher
- Git
- VSCode (recommended) with recommended extensions

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/cerberus-iam/app.git
cd app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Configuration

Edit `.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
API_BASE_URL=http://localhost:4000

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ORG_SLUG=cerberus-iam
```

## Development Workflow

### Daily Workflow

1. **Pull latest changes**:

   ```bash
   git pull origin main
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feat/your-feature
   ```

3. **Start dev server**:

   ```bash
   npm run dev
   ```

4. **Make changes and test**:

   ```bash
   npm run lint
   npm test
   ```

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feat/your-feature
   ```

### Hot Reload

Next.js provides hot module replacement (HMR). Changes to code will automatically refresh the browser.

- **Page changes**: Full page reload
- **Component changes**: Hot reload without losing state
- **CSS changes**: Instant update without reload

## Project Structure

```
src/
├── pages/              # Next.js Pages Router
│   ├── _app.tsx        # App wrapper (providers, global layout)
│   ├── _document.tsx   # HTML document (meta tags, fonts)
│   ├── index.tsx       # Home page (redirects to login)
│   ├── login.tsx       # Login page
│   ├── register.tsx    # Registration page
│   ├── forgot-password.tsx  # Password reset
│   ├── dashboard.tsx   # Main dashboard
│   ├── users/          # User management
│   │   └── index.tsx   # User list page
│   └── api/            # API routes (if needed)
│
├── components/
│   ├── ui/             # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── features/       # Feature-specific components
│   │   ├── auth/
│   │   └── users/
│   └── shared/         # Shared components
│
├── layouts/            # Layout components
│   ├── AuthLayout.tsx
│   └── DashboardLayout.tsx
│
├── lib/
│   ├── api/            # API integration
│   │   ├── client.ts   # HTTP client
│   │   ├── auth.ts     # Auth API calls
│   │   └── users.ts    # User API calls
│   ├── auth/           # Auth utilities
│   │   └── session.ts
│   ├── result.ts       # Result pattern
│   └── utils.ts        # General utilities
│
├── hooks/              # Custom React hooks
│   ├── use-mobile.ts
│   └── use-user.ts
│
├── types/              # TypeScript types
│   ├── iam.ts          # IAM-related types
│   └── api.ts          # API response types
│
├── config/             # Configuration
│   └── env.ts          # Environment variables
│
├── styles/             # Global styles
│   └── globals.css     # Tailwind + CSS variables
│
└── content/            # Static content
```

## Code Patterns

### Result Pattern

Use the Result pattern for error handling:

```typescript
// lib/result.ts
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

// Usage
async function loginUser(
  email: string,
  password: string
): Promise<Result<User>> {
  try {
    const response = await apiClient.post('/auth/login', { email, password })
    return { ok: true, value: response.data }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
}

// In component
const result = await loginUser(email, password)
if (result.ok) {
  // Handle success
  console.log(result.value)
} else {
  // Handle error
  console.error(result.error)
}
```

### API Client Pattern

```typescript
// lib/api/client.ts
import { env } from '@/config/env'

export const apiClient = {
  get: async <T>(url: string) => {
    const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}${url}`, {
      credentials: 'include',
    })
    if (!response.ok) throw new Error('Request failed')
    return response.json() as Promise<T>
  },
  // post, put, delete...
}
```

### Component Pattern

```typescript
// Functional component with TypeScript
interface UserCardProps {
  user: User
  onEdit?: (user: User) => void
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{user.name}</h3>
      <p className="text-sm text-muted-foreground">{user.email}</p>
      {onEdit && (
        <Button onClick={() => onEdit(user)}>Edit</Button>
      )}
    </div>
  )
}
```

### Custom Hook Pattern

```typescript
// hooks/use-user.ts
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchUser() {
      const result = await getCurrentUser()
      if (result.ok) {
        setUser(result.value)
      } else {
        setError(result.error)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  return { user, loading, error }
}
```

## API Integration

### Making API Calls

```typescript
// lib/api/users.ts
import type { User } from '@/types/iam'

import { apiClient } from './client'

export async function getUsers(): Promise<Result<User[]>> {
  try {
    const users = await apiClient.get<User[]>('/v1/users')
    return { ok: true, value: users }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
}
```

### Error Handling

```typescript
// In component
const handleSubmit = async () => {
  setLoading(true)
  const result = await loginUser(email, password)

  if (result.ok) {
    router.push('/dashboard')
  } else {
    toast.error(result.error.message)
  }

  setLoading(false)
}
```

## State Management

### Local State

Use React hooks for local component state:

```typescript
const [count, setCount] = useState(0)
const [user, setUser] = useState<User | null>(null)
```

### Global State

For shared state, use React Context:

```typescript
// contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

## Styling Guide

### Tailwind CSS

Use utility classes for styling:

```tsx
<div className="bg-card flex items-center gap-4 rounded-lg p-4">
  <h2 className="text-2xl font-bold">Title</h2>
</div>
```

### CSS Variables

Theme colors are defined as CSS variables:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
}
```

### Component Styling

Use `cn()` utility for conditional classes:

```tsx
import { cn } from '@/lib/utils'

;<Button
  className={cn(
    'base-classes',
    isActive && 'active-classes',
    isPrimary && 'primary-classes'
  )}
/>
```

## Testing Strategy

### Unit Tests

```typescript
// components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### E2E Tests

```typescript
// e2e/login.spec.ts
import { expect, test } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

## Debugging

### VSCode Debugging

Launch configurations are in `.vscode/launch.json`:

- **Next.js: Debug Server-side** - Debug server-side code
- **Next.js: Debug Client-side** - Debug browser code
- **Next.js: Full Stack** - Debug both

### Browser DevTools

- React DevTools extension for component inspection
- Network tab for API call debugging
- Console for logging and errors

### Logging

```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data)
}
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Restart TypeScript server in VSCode
Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Hot Reload Not Working

```bash
# Restart dev server
# Check for syntax errors
# Clear .next directory
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
})
```

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/avatar.jpg"
  width={48}
  height={48}
  alt="Avatar"
/>
```

### Memoization

```typescript
const memoizedValue = useMemo(() => {
  return expensiveCalculation(input)
}, [input])

const memoizedCallback = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

---

For more information, check the [README.md](README.md) and [CONTRIBUTING.md](CONTRIBUTING.md).
