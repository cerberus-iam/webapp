# AI Prompt: Add New API Endpoint Integration

Use this template when integrating a new backend API endpoint.

---

## Prompt

Integrate a new API endpoint for [feature name] in Cerberus IAM Frontend.

### Endpoint Details

- **URL**: `/v1/[resource]/[action]`
- **Method**: [GET | POST | PUT | PATCH | DELETE]
- **Purpose**: [Description of what this endpoint does]

### Requirements

1. **Type Definitions** (`src/types/[resource].ts`):
   - Define request payload type (if POST/PUT/PATCH)
   - Define response data type
   - Include proper TypeScript interfaces

2. **API Function** (`src/lib/api/[resource].ts`):
   - Create function using Result pattern
   - Handle errors gracefully
   - Include proper types for parameters and return value
   - Add JSDoc comments

3. **Error Handling**:
   - Return `Result<T>` type
   - Catch and wrap errors
   - Provide meaningful error messages

4. **Usage Example**:
   - Show how to call the function in a component
   - Demonstrate success and error handling
   - Include loading states

### Type Definition Template

```typescript
// src/types/[resource].ts

/**
 * Request payload for [action]
 */
export interface [Action]Request {
  field1: string
  field2: number
  optionalField?: boolean
}

/**
 * Response data for [action]
 */
export interface [Action]Response {
  id: string
  data: SomeType
  createdAt: string
}
```

### API Function Template

````typescript
// src/lib/api/[resource].ts

import { apiClient } from './client'
import type { Result } from '@/lib/result'
import type { [Action]Request, [Action]Response } from '@/types/[resource]'

/**
 * [Description of what this function does]
 *
 * @param payload - The request payload
 * @returns Result containing [Action]Response or Error
 *
 * @example
 * ```ts
 * const result = await [functionName]({ field1: 'value', field2: 42 })
 * if (result.ok) {
 *   console.log(result.value)
 * } else {
 *   console.error(result.error)
 * }
 * ```
 */
export async function [functionName](
  payload: [Action]Request
): Promise<Result<[Action]Response>> {
  try {
    const response = await apiClient.post<[Action]Response>(
      '/v1/[resource]/[action]',
      payload
    )
    return { ok: true, value: response }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    }
  }
}
````

### Component Usage Template

```typescript
// In a component

import { [functionName] } from '@/lib/api/[resource]'
import { useState } from 'react'
import { toast } from 'sonner'

export function MyComponent() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<[Action]Response | null>(null)

  const handleAction = async () => {
    setLoading(true)

    const result = await [functionName]({
      field1: 'value',
      field2: 42,
    })

    if (result.ok) {
      setData(result.value)
      toast.success('Action completed successfully')
    } else {
      toast.error(`Failed: ${result.error.message}`)
    }

    setLoading(false)
  }

  return (
    <div>
      <Button onClick={handleAction} disabled={loading}>
        {loading ? 'Loading...' : 'Perform Action'}
      </Button>
      {data && <div>{/* Render data */}</div>}
    </div>
  )
}
```

### Testing Template

```typescript
// src/lib/api/__tests__/[resource].test.ts

import { [functionName] } from '../[resource]'
import { apiClient } from '../client'

jest.mock('../client')

describe('[functionName]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns success result on successful request', async () => {
    const mockResponse = { id: '123', data: {...}, createdAt: '2025-01-01' }
    ;(apiClient.post as jest.Mock).mockResolvedValue(mockResponse)

    const result = await [functionName]({ field1: 'test', field2: 42 })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toEqual(mockResponse)
    }
  })

  it('returns error result on failed request', async () => {
    const mockError = new Error('API Error')
    ;(apiClient.post as jest.Mock).mockRejectedValue(mockError)

    const result = await [functionName]({ field1: 'test', field2: 42 })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.message).toBe('API Error')
    }
  })
})
```

### Checklist

- [ ] Types defined in `src/types/[resource].ts`
- [ ] API function created in `src/lib/api/[resource].ts`
- [ ] Result pattern used for error handling
- [ ] JSDoc comments added
- [ ] Unit tests created and passing
- [ ] Integration tested in a component
- [ ] Error cases handled
- [ ] Loading states implemented
- [ ] Success/error toasts shown
- [ ] TypeScript compiles without errors

### Additional Considerations

For **GET requests**:

- Add query parameters type if needed
- Consider caching strategy
- Handle pagination if applicable

For **POST/PUT requests**:

- Validate payload before sending (use Zod)
- Handle optimistic updates if needed
- Invalidate cache after mutation

For **DELETE requests**:

- Add confirmation dialog
- Handle cleanup after deletion
- Show success feedback

---

## Environment Variables

If the endpoint requires special configuration:

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Ensure it's documented in `.env.example`.
