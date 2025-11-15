# Cerberus IAM Frontend

A Next.js frontend for Cerberus IAM – the centralized Identity & Access Management and user directory platform. This app provides the web UI for authentication flows, user self-service, and admin user management.

## Overview

Cerberus IAM Frontend is the **UI client** for Cerberus IAM, serving as the primary interface for identity and access management operations. It provides a modern, responsive web application for authentication, user management, and administrative functions.

This application never performs authentication logic on its own; all auth and directory operations are delegated to the **Cerberus IAM API** (ExpressJS backend). The frontend focuses on providing an excellent user experience while maintaining security through proper API integration.

## Key Features

- **Authentication Pages**
  - User login with secure credential handling
  - User registration and account creation
  - Password reset and forgot password flows
  - Secure logout with session cleanup

- **User Self-Service**
  - View and update user profile information
  - Change password functionality
  - Manage user preferences and settings

- **Admin Features**
  - Search and browse user directory
  - View and edit user details
  - Manage user roles and permissions
  - Monitor user status and activity
  - Advanced data table with sorting, filtering, and pagination

- **API Integration**
  - RESTful API calls to Cerberus IAM backend
  - Session-based authentication with secure cookie handling
  - Comprehensive error handling and user feedback
  - Type-safe API client with Result pattern

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (Pages Router)
- **Language**: [TypeScript 5](https://www.typescriptlang.org)
- **UI Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com)
- **Component Library**: [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com)
- **Data Tables**: [TanStack Table](https://tanstack.com/table)
- **Icons**: [Lucide Icons](https://lucide.dev), [Tabler Icons](https://tabler-icons.io)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) for dark mode support
- **Validation**: [Zod](https://zod.dev)
- **HTTP Client**: Custom API client with fetch
- **Testing**: Jest + React Testing Library + Playwright

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x LTS or higher
- **npm**: Version 10.x or higher (comes with Node.js)
- **Cerberus IAM API**: Access to a running instance (development, staging, or production)

## Setup & Local Development

### 1. Clone the repository

```bash
git clone https://github.com/cerberus-iam/app.git
cd app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and configure the required variables (see [Environment Variables](#environment-variables) section below).

### 4. Run the development server

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000).

Open your browser and navigate to the URL. You should be redirected to the login page.

## Environment Variables

The following environment variables are required for the application to function properly:

| Variable                   | Required | Description                                            | Example                                                  |
| -------------------------- | -------- | ------------------------------------------------------ | -------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Yes      | Base URL of the Cerberus IAM API (public, client-side) | `http://localhost:4000` or `https://iam-api.example.com` |
| `API_BASE_URL`             | Yes      | Base URL of the Cerberus IAM API (server-side only)    | `http://localhost:4000` or `https://iam-api.example.com` |
| `NEXT_PUBLIC_APP_URL`      | Yes      | Base URL of this frontend application                  | `http://localhost:3000` or `https://iam.example.com`     |
| `NEXT_PUBLIC_ORG_SLUG`     | No       | Organization slug for multi-tenant setups              | `acme-corp`                                              |

### Setting Environment Variables

1. Copy `.env.example` to `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` with your configuration.

3. **Important**: Never commit `.env.local` or any file containing secrets to version control.

## API Integration

All authentication and user management operations are delegated to the **Cerberus IAM API**. The frontend acts as a client, making HTTP requests to the backend.

### Main API Endpoints Used

| Endpoint                   | Method | Purpose                              |
| -------------------------- | ------ | ------------------------------------ |
| `/v1/auth/login`           | POST   | Authenticate user and create session |
| `/v1/auth/logout`          | POST   | Terminate user session               |
| `/v1/auth/register`        | POST   | Create new user account              |
| `/v1/auth/me`              | GET    | Get current authenticated user       |
| `/v1/auth/forgot-password` | POST   | Initiate password reset flow         |
| `/v1/users`                | GET    | List and search users (admin)        |
| `/v1/users/:id`            | GET    | Get user details by ID               |
| `/v1/users/:id`            | PUT    | Update user information              |

### Session Handling

- **Authentication**: Cookie-based sessions managed by the backend
- **Credentials**: HttpOnly cookies for security (not accessible via JavaScript)
- **CSRF Protection**: Implemented at the API level
- **API Client**: Custom fetch-based client in `src/lib/api/client.ts`

## Project Structure

```
app/
├── src/
│   ├── pages/              # Next.js Pages Router
│   │   ├── index.tsx       # Home page (redirects to login)
│   │   ├── login.tsx       # Login page
│   │   ├── register.tsx    # Registration page
│   │   ├── forgot-password.tsx  # Password reset
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── users/          # User management pages
│   │   │   └── index.tsx   # User list with data table
│   │   ├── api/            # API routes (if any)
│   │   ├── _app.tsx        # App wrapper component
│   │   └── _document.tsx   # HTML document wrapper
│   ├── components/         # Reusable React components
│   │   └── ui/             # shadcn/ui components
│   ├── layouts/            # Layout components
│   ├── lib/                # Utility libraries
│   │   ├── api/            # API client and utilities
│   │   │   └── client.ts   # HTTP client configuration
│   │   ├── auth/           # Authentication utilities
│   │   ├── result.ts       # Result type for error handling
│   │   └── utils.ts        # General utility functions
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── config/             # Application configuration
│   ├── content/            # Static content and data
│   └── styles/             # Global styles and CSS
│       └── globals.css     # Tailwind CSS + CSS variables
├── e2e/                    # Playwright E2E tests
├── public/                 # Static assets
├── .github/                # GitHub workflows and templates
└── [config files]          # Configuration files
```

## Scripts

The following npm scripts are available:

| Script          | Command                 | Description                                              |
| --------------- | ----------------------- | -------------------------------------------------------- |
| `dev`           | `npm run dev`           | Start development server at <http://localhost:3000>      |
| `build`         | `npm run build`         | Create optimized production build                        |
| `start`         | `npm run start`         | Start production server (requires `npm run build` first) |
| `lint`          | `npm run lint`          | Run ESLint to check for code issues                      |
| `format`        | `npm run format`        | Format code with Prettier                                |
| `format:check`  | `npm run format:check`  | Check if code is formatted correctly                     |
| `test`          | `npm test`              | Run unit tests with Jest                                 |
| `test:watch`    | `npm run test:watch`    | Run tests in watch mode                                  |
| `test:coverage` | `npm run test:coverage` | Generate test coverage report                            |
| `test:e2e`      | `npm run test:e2e`      | Run end-to-end tests with Playwright                     |
| `test:e2e:ui`   | `npm run test:e2e:ui`   | Run E2E tests with Playwright UI                         |
| `prepare`       | `npm run prepare`       | Set up Git hooks (runs automatically after install)      |

## Testing

### Unit Tests (Jest + React Testing Library)

Unit tests focus on testing individual components and utility functions in isolation.

**Run unit tests:**

```bash
npm test
```

**Run in watch mode:**

```bash
npm run test:watch
```

**Generate coverage report:**

```bash
npm run test:coverage
```

Test files are located in:

- `src/components/**/__tests__/*.test.tsx`
- `src/lib/**/*.test.ts`

### End-to-End Tests (Playwright)

E2E tests verify critical user flows across the entire application.

**Run E2E tests:**

```bash
npm run test:e2e
```

**Run with UI mode:**

```bash
npm run test:e2e:ui
```

**Critical flows covered:**

- User authentication (login, logout, registration)
- Password reset flow
- Protected route access
- User management operations
- Dashboard navigation

E2E test files are located in `e2e/` directory.

## Deployment

### Railway Deployment

This application is configured for deployment to [Railway](https://railway.app).

**Deployment Steps:**

1. **Connect Repository**: Link your GitHub repository to Railway

2. **Set Environment Variables**: Configure all required environment variables in Railway dashboard:
   - `NEXT_PUBLIC_API_BASE_URL`
   - `API_BASE_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `NEXT_PUBLIC_ORG_SLUG` (if applicable)

3. **Build Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm run start`

4. **Deploy**: Railway will automatically deploy on push to the main branch

### CI/CD

GitHub Actions workflows handle automated testing and deployment:

- **CI Pipeline**: Runs linting, type-checking, and tests on every PR
- **E2E Tests**: Executes Playwright tests on PR creation
- **Deploy**: Automatically deploys to Railway on merge to main
- **PR Checks**: Validates commit messages and code quality

All checks must pass before merging a pull request.

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on:

- Development workflow and branching strategy
- Code style and linting requirements
- Commit message conventions (Conventional Commits)
- Testing requirements
- Pull request process

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add new feature"`
4. Push to your fork: `git push origin feat/your-feature-name`
5. Open a pull request

### Code Quality

Before submitting a PR:

```bash
npm run lint        # Check for linting errors
npm run format      # Format code with Prettier
npm test            # Run unit tests
npm run test:e2e    # Run E2E tests
```

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/) format. Pre-commit hooks will enforce this automatically.

## License

This project is proprietary software. All rights reserved.

See [LICENSE](LICENSE) for more information.

---

**Need Help?** Check out our [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development documentation or open an issue on GitHub.
