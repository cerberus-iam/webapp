# AI Prompt: Create New Component

Use this template when creating a new UI component for Cerberus IAM Frontend.

---

## Prompt

Create a new React component with the following specifications:

### Component Details

- **Name**: [ComponentName]
- **Purpose**: [Brief description of what the component does]
- **Location**: `src/components/[category]/[ComponentName].tsx`

### Requirements

1. **TypeScript Interface**:
   - Create a properly typed props interface
   - Include all required and optional props
   - Add JSDoc comments for complex props

2. **Implementation**:
   - Use functional component with TypeScript
   - Follow shadcn/ui patterns if it's a UI component
   - Use Radix UI primitives where applicable
   - Implement proper error handling

3. **Styling**:
   - Use Tailwind CSS utility classes
   - Follow the existing design system
   - Support className prop for custom styling
   - Use `cn()` utility for conditional classes
   - Ensure responsive design (mobile-first)

4. **Accessibility**:
   - Add appropriate ARIA attributes
   - Ensure keyboard navigation works
   - Use semantic HTML elements
   - Include focus states

5. **Testing**:
   - Create unit tests in `__tests__/[ComponentName].test.tsx`
   - Test rendering, user interactions, and edge cases
   - Aim for >80% coverage

### Example Structure

```typescript
import * as React from 'react'
import { cn } from '@/lib/utils'

interface [ComponentName]Props {
  /**
   * Description of prop
   */
  propName: string
  /**
   * Optional prop description
   */
  optional?: boolean
  className?: string
  children?: React.ReactNode
}

export function [ComponentName]({
  propName,
  optional = false,
  className,
  children,
}: [ComponentName]Props) {
  return (
    <div className={cn('base-classes', className)}>
      {/* Component implementation */}
      {children}
    </div>
  )
}
```

### Test Structure

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { [ComponentName] } from '../[ComponentName]'

describe('[ComponentName]', () => {
  it('renders correctly', () => {
    render(<[ComponentName] propName="test" />)
    expect(screen.getByRole('...')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<[ComponentName] propName="test" onClick={handleClick} />)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = render(
      <[ComponentName] propName="test" className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
```

### Checklist

- [ ] TypeScript interface defined with JSDoc
- [ ] Component implemented as functional component
- [ ] Tailwind CSS used for styling
- [ ] Accessibility attributes included
- [ ] Responsive design implemented
- [ ] Unit tests created and passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Follows existing code patterns
- [ ] Documented in Storybook (if applicable)

---

## Example Usage

After creating, document how to use the component:

```tsx
import { [ComponentName] } from '@/components/[category]/[ComponentName]'

export function ExamplePage() {
  return (
    <[ComponentName]
      propName="value"
      optional={true}
      className="custom-styles"
    >
      Content
    </[ComponentName]>
  )
}
```
