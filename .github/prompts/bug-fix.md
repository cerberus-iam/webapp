# AI Prompt: Debug and Fix Bug

Use this template when debugging and fixing bugs in Cerberus IAM Frontend.

---

## Prompt

Debug and fix the following bug in Cerberus IAM Frontend.

### Bug Details

- **Title**: [Brief description]
- **Severity**: [Critical | High | Medium | Low]
- **Affected Component/Feature**: [Component or feature name]
- **Environment**: [Development | Staging | Production]

### Bug Description

**What is happening**:
[Describe the current broken behavior]

**What should happen**:
[Describe the expected correct behavior]

**Steps to Reproduce**:

1. [Step 1]
2. [Step 2]
3. [Step 3]

**Error Messages** (if any):

```
[Paste error messages, stack traces, console logs]
```

---

## Debugging Workflow

### 1. Reproduce the Bug

First, reproduce the bug locally:

```bash
# Start development server
npm run dev

# Follow the steps to reproduce
```

**Verification**:

- [ ] Bug reproduced in development
- [ ] Error message observed
- [ ] Behavior documented

### 2. Isolate the Issue

Use debugging tools to identify the root cause:

#### Browser DevTools

```javascript
// Add console logs
console.log('State:', state);
console.log('Props:', props);
console.log('API Response:', response);

// Add breakpoints in Sources tab
debugger;
```

#### React DevTools

- Inspect component props and state
- Check component hierarchy
- Identify unnecessary re-renders

#### Network Tab

- Check API requests/responses
- Verify request headers
- Check response status codes

#### VSCode Debugger

Use launch configurations in `.vscode/launch.json`:

- "Next.js: Debug Server-side"
- "Next.js: Debug Client-side"

### 3. Identify Root Cause

Common issues and how to identify them:

#### TypeScript Errors

```bash
npx tsc --noEmit
```

#### Runtime Errors

- Check browser console
- Check server logs (`npm run dev` terminal)
- Add try-catch blocks

#### Logic Errors

- Review recent changes (`git log`, `git diff`)
- Check related code
- Review test failures

#### API Issues

- Test API endpoint directly (Postman/curl)
- Check network tab for request/response
- Verify environment variables

### 4. Implement Fix

#### Fix Template

```typescript
// Before (buggy code)
function buggyFunction(param: string) {
  // Problem: doesn't handle null
  return param.toUpperCase()
}

// After (fixed code)
function fixedFunction(param: string | null) {
  // Fix: handle null case
  if (!param) {
    return ''
  }
  return param.toUpperCase()
}
```

#### Common Fix Patterns

**Null/Undefined Handling**:

```typescript
// Add null checks
if (!value) return null

// Use optional chaining
user?.profile?.name

// Use nullish coalescing
const name = user?.name ?? 'Unknown'
```

**Error Handling**:

```typescript
// Wrap in try-catch
try {
  const result = await riskyOperation()
  return { ok: true, value: result }
} catch (error) {
  return { ok: false, error: error as Error }
}
```

**Type Safety**:

```typescript
// Add proper types
interface Props {
  value: string | null  // Be explicit about nullability
}

// Use type guards
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}
```

**State Management**:

```typescript
// Fix stale closures
useEffect(() => {
  // Use latest value
}, [dependency])  // Add missing dependency

// Fix infinite loops
useEffect(() => {
  // Ensure condition to prevent infinite updates
  if (shouldUpdate) {
    setState(newState)
  }
}, [dependency])  // Carefully manage dependencies
```

### 5. Add Regression Test

Prevent the bug from reoccurring:

```typescript
describe('Bug fix: [Bug title]', () => {
  it('handles [scenario that caused bug]', () => {
    // Setup scenario that caused bug
    const result = functionThatWasBuggy(edgeCaseInput)

    // Assert fix works
    expect(result).toBe(expectedCorrectValue)
  })

  it('does not break existing functionality', () => {
    // Ensure fix didn't break normal cases
    const result = functionThatWasBuggy(normalInput)
    expect(result).toBe(expectedNormalValue)
  })
})
```

### 6. Verify Fix

- [ ] Bug no longer reproducible locally
- [ ] Regression test added and passing
- [ ] All existing tests still pass
- [ ] No new TypeScript errors
- [ ] No new linting errors
- [ ] Manually tested the fixed feature
- [ ] Tested related features (ensure no side effects)

### 7. Document the Fix

**Commit Message**:

```
fix([scope]): [brief description of fix]

- Describe what was broken
- Explain why it was broken
- Describe what was changed to fix it

Fixes #[issue-number]
```

**Code Comments** (if needed):

```typescript
// Fix: Handle null case to prevent TypeError
// Previously, this would crash when user.profile was null
if (!user?.profile) {
  return defaultProfile
}
```

---

## Common Bug Categories

### TypeScript/Type Errors

**Symptoms**:

- Compilation errors
- Type mismatch errors
- `any` type issues

**Fix**:

```typescript
// Add proper types
interface User {
  id: string
  name: string | null  // Be explicit
}

// Use type guards
if (typeof value === 'string') {
  // TypeScript knows value is string here
}
```

### Null/Undefined Errors

**Symptoms**:

- "Cannot read property of undefined"
- "Cannot read property of null"

**Fix**:

```typescript
// Optional chaining
const name = user?.profile?.name

// Nullish coalescing
const displayName = name ?? 'Unknown'

// Early return
if (!user) return null
```

### State Management Issues

**Symptoms**:

- Component not re-rendering
- Stale state values
- Infinite loops

**Fix**:

```typescript
// Use functional updates
setState(prev => ({ ...prev, updated: true }))

// Fix missing dependencies
useEffect(() => {
  doSomething(value)
}, [value])  // Add all dependencies
```

### API Integration Issues

**Symptoms**:

- Failed requests
- Wrong data format
- CORS errors

**Fix**:

```typescript
// Handle errors properly
const result = await apiCall()
if (!result.ok) {
  toast.error(result.error.message)
  return
}

// Validate response
const schema = z.object({ ... })
const validated = schema.parse(response)
```

### Routing Issues

**Symptoms**:

- Wrong redirects
- 404 errors
- Infinite redirect loops

**Fix**:

```typescript
// Use proper Pages Router redirect
export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  }
}
```

---

## Checklist

- [ ] Bug reproduced and verified
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Regression test added
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Manually tested
- [ ] Side effects checked
- [ ] Code reviewed
- [ ] Commit message follows format
- [ ] Issue linked in commit
- [ ] Documentation updated (if needed)

---

## Resources

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [VSCode Debugging](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Next.js Debugging](https://nextjs.org/docs/pages/building-your-application/configuring/debugging)
