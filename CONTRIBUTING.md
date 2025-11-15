# Contributing to Cerberus IAM Frontend

Thank you for your interest in contributing to Cerberus IAM Frontend! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Review Process](#review-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js 20.x LTS or higher
- npm 10.x or higher
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository** on GitHub

2. **Clone your fork**:

   ```bash
   git clone https://github.com/your-username/app.git
   cd app
   ```

3. **Add upstream remote**:

   ```bash
   git remote add upstream https://github.com/cerberus-iam/app.git
   ```

4. **Install dependencies**:

   ```bash
   npm install
   ```

5. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

6. **Verify setup**:
   ```bash
   npm run dev
   npm run lint
   npm test
   ```

## Development Workflow

### 1. Sync with Upstream

Before starting work, sync your fork with the upstream repository:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

### 2. Create a Feature Branch

Create a new branch for your work:

```bash
git checkout -b feat/your-feature-name
```

See [Branching Strategy](#branching-strategy) for naming conventions.

### 3. Make Your Changes

- Write clean, readable code
- Follow the project's code style
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

```bash
npm run lint          # Check for linting errors
npm run format        # Format code with Prettier
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests (if applicable)
npm run build         # Ensure the build succeeds
```

### 5. Commit Your Changes

Follow the [Commit Message Guidelines](#commit-message-guidelines):

```bash
git add .
git commit -m "feat: add user profile editing"
```

### 6. Push and Create Pull Request

```bash
git push origin feat/your-feature-name
```

Then open a pull request on GitHub.

## Branching Strategy

### Branch Naming Conventions

Use the following prefixes for branch names:

- `feat/` - New features or enhancements
  - Example: `feat/user-profile-editing`
- `fix/` - Bug fixes
  - Example: `fix/login-redirect-loop`
- `docs/` - Documentation only changes
  - Example: `docs/update-api-integration-guide`
- `refactor/` - Code refactoring without changing functionality
  - Example: `refactor/api-client-structure`
- `test/` - Adding or updating tests
  - Example: `test/auth-flow-e2e`
- `chore/` - Maintenance tasks, dependency updates
  - Example: `chore/update-dependencies`
- `perf/` - Performance improvements
  - Example: `perf/optimize-table-rendering`

### Branch Lifecycle

- Create branches from `main`
- Keep branches focused and small
- Delete branches after merging
- Rebase on `main` regularly to stay up to date

## Commit Message Guidelines

This project enforces **Conventional Commits** format. All commits must follow this standard.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

Must be one of the following:

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Code style changes (formatting, missing semi-colons, etc.)
- `refactor` - Code change that neither fixes a bug nor adds a feature
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `build` - Changes to build system or dependencies
- `ci` - Changes to CI configuration files and scripts
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit

### Scope (Optional)

The scope should specify the affected area:

- `auth` - Authentication related
- `ui` - User interface components
- `api` - API integration
- `users` - User management features
- `dashboard` - Dashboard features

### Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize the first letter
- No period (.) at the end
- Maximum 100 characters

### Examples

```bash
feat(auth): add password strength indicator

fix(users): resolve pagination issue on user list

docs: update API integration examples

refactor(api): simplify error handling logic

test(auth): add E2E tests for login flow

chore(deps): update dependencies to latest versions
```

### Breaking Changes

For breaking changes, add `BREAKING CHANGE:` in the footer:

```bash
feat(api): change authentication endpoint structure

BREAKING CHANGE: The login endpoint now requires a different payload format.
Clients must update their request structure to include the `organizationSlug` field.
```

### Commit Message Validation

Pre-commit hooks will automatically validate your commit messages. If a commit message doesn't follow the format, the commit will be rejected with an error message.

## Code Style

### General Principles

- Write clean, self-documenting code
- Keep functions small and focused
- Use meaningful variable and function names
- Avoid unnecessary complexity
- Follow DRY (Don't Repeat Yourself) principle

### TypeScript

- Use strict TypeScript mode
- Avoid `any` types - use proper types or `unknown`
- Define interfaces for complex objects
- Use type inference where appropriate
- Prefer `interface` over `type` for object shapes

**Example:**

```typescript
// Good
interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
}

// Avoid
type UserProfile = any
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop typing with TypeScript

**Example:**

```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline'
  onClick?: () => void
  children: React.ReactNode
}

export function Button({ variant = 'default', onClick, children }: ButtonProps) {
  return (
    <button className={cn('btn', `btn-${variant}`)} onClick={onClick}>
      {children}
    </button>
  )
}
```

### File Organization

- One component per file
- Group related files in the same directory
- Use index files for clean exports
- Keep test files alongside source files

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Use CSS variables for theming
- Avoid inline styles unless absolutely necessary

### API Integration

- Use the Result pattern for error handling
- Properly type API responses
- Handle loading and error states
- Use the existing API client in `src/lib/api/client.ts`

### Linting and Formatting

The project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **lint-staged** for pre-commit checks

Run before committing:

```bash
npm run format      # Auto-format code
npm run lint        # Check for linting issues
```

## Testing Requirements

### Unit Tests

- Write unit tests for all new utility functions
- Test components with React Testing Library
- Aim for at least 70% code coverage
- Test edge cases and error scenarios

**Example:**

```typescript
describe('formatUserName', () => {
  it('should format full name correctly', () => {
    expect(formatUserName('John', 'Doe')).toBe('John Doe')
  })

  it('should handle missing last name', () => {
    expect(formatUserName('John', '')).toBe('John')
  })
})
```

### E2E Tests

- Add E2E tests for critical user flows
- Test happy paths and common error scenarios
- Ensure tests are deterministic and don't flake

### Running Tests

```bash
npm test              # Run unit tests
npm run test:watch    # Run in watch mode
npm run test:coverage # Generate coverage report
npm run test:e2e      # Run E2E tests
```

## Pull Request Process

### Before Creating a PR

1. **Ensure all tests pass**:

   ```bash
   npm test
   npm run test:e2e
   ```

2. **Check linting and formatting**:

   ```bash
   npm run lint
   npm run format:check
   ```

3. **Verify build succeeds**:

   ```bash
   npm run build
   ```

4. **Update documentation** if needed

5. **Add entry to CHANGELOG.md** under "Unreleased" section

### Creating the PR

1. Push your branch to your fork
2. Open a pull request against `main` branch
3. Fill out the PR template completely
4. Link related issues using `Closes #123`
5. Add appropriate labels

### PR Title

PR titles should follow the same format as commit messages:

```
feat: add user profile editing feature
fix: resolve login redirect issue
docs: update deployment guide
```

### PR Description

Use the provided template to:

- Describe what changes were made
- Explain why the changes were needed
- List any breaking changes
- Provide testing instructions
- Add screenshots/videos for UI changes

### PR Checklist

Ensure you've completed all items in the PR template checklist:

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where necessary
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added and passing
- [ ] CHANGELOG.md updated

## Review Process

### What to Expect

- All PRs require at least one approval from a maintainer
- Automated checks must pass (CI, linting, tests)
- Reviews typically happen within 1-2 business days
- Be responsive to feedback and questions

### Responding to Feedback

- Address all review comments
- Push additional commits to the same branch
- Request re-review when ready
- Be open to suggestions and constructive criticism

### After Approval

- Maintainers will merge your PR
- Your branch will be automatically deleted
- Celebrate your contribution! 🎉

## Questions?

If you have questions or need help:

- Check existing documentation (README.md, DEVELOPMENT.md)
- Search existing issues and discussions
- Open a new discussion on GitHub
- Ask in the project's communication channels

---

Thank you for contributing to Cerberus IAM Frontend!
