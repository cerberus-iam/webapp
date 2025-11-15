# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive testing infrastructure with Jest and Playwright
- GitHub Actions CI/CD workflows for automated testing and deployment
- Code quality tooling (Prettier, ESLint, Husky, lint-staged, commitlint)
- Professional documentation (README, CONTRIBUTING, DEVELOPMENT, DEPLOYMENT)
- AI pair programming guidelines (.cursorrules, GitHub Copilot instructions)
- VSCode workspace configuration
- GitHub issue and PR templates
- User management features with data table
- Authentication flows (login, register, forgot password)
- Dashboard page with sidebar navigation

### Changed

- Updated README.md with comprehensive project documentation
- Configured explicit Tailwind CSS theming with design system tokens
- Enhanced API client with Result pattern for error handling

### Fixed

- Fixed NEXT_REDIRECT error on home page by using proper Pages Router redirect pattern

## [0.1.0] - 2025-01-XX

### Added

- Initial project setup with Next.js 16 and React 19
- TypeScript configuration with strict mode
- Tailwind CSS 4 for styling
- shadcn/ui component library integration
- Radix UI primitives
- API integration with Cerberus IAM backend
- Basic authentication pages
- User directory and management interface

[Unreleased]: https://github.com/cerberus-iam/app/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/cerberus-iam/app/releases/tag/v0.1.0
