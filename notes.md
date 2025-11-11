# Cerberus IAM Admin Console - Implementation Plan

## Overview

Build a complete admin console for the Cerberus IAM API with all requested features, leveraging the existing Next.js infrastructure, shadcn/ui components, and authentication system.

## Phase 1: Authentication & Core Pages (Priority 1)

### 1.1 Login & Registration Pages

- **Login page** (`/src/pages/login.tsx`)
  - Email/password form with react-hook-form + Zod validation
  - MFA token input (conditional, when user has MFA enabled)
  - "Remember me" checkbox
  - "Forgot password" link
  - Error handling with toast notifications
  - Redirect to returnTo URL or dashboard after login

- **Register Organization page** (`/src/pages/register.tsx`)
  - Organization details step (name, slug, email, website)
  - Owner account step (firstName, lastName, email, password)
  - Confirmation step
  - Uses existing onboarding components from `src/components/blocks/`
  - Calls `/v1/auth/register` endpoint

- **Accept Invitation page** (`/src/pages/invitations/accept.tsx`)
  - Token validation from URL query params
  - User registration form (firstName, lastName, password)
  - Calls `/v1/auth/invitations/accept` endpoint

- **Forgot/Reset Password pages**
  - `/src/pages/auth/forgot-password.tsx` - Email input form
  - `/src/pages/auth/reset-password.tsx` - Token + new password form

### 1.2 Enhanced Dashboard

- **Dashboard page** (`/src/pages/index.tsx`)
  - Welcome message with user name
  - Key metrics cards (total users, active sessions, roles, teams)
  - Recent audit logs table (last 10 events)
  - Quick actions (invite user, create role, view audit logs)
  - User growth chart (using recharts)
  - System health indicator

## Phase 2: User Management (Priority 1)

### 2.1 Users List Page

- **Path**: `/src/pages/iam/users/index.tsx`
- Features:
  - Data table with columns: Name, Email, Roles, Status, Last Login, Actions
  - Search/filter by name, email, role, status
  - Pagination (client-side initially, prepare for server-side)
  - Bulk actions (assign role, block/unblock)
  - "Invite User" button (opens dialog)
  - Actions dropdown: Edit, Assign Roles, Block/Unblock, Delete

### 2.2 User Detail/Edit Page

- **Path**: `/src/pages/iam/users/[id].tsx`
- Tabs:
  - **Profile**: Edit firstName, lastName, email, phone, profilePhoto
  - **Roles**: Assign/remove roles with searchable select
  - **Teams**: Add/remove team memberships
  - **Sessions**: View active sessions with revoke action
  - **Audit**: User-specific audit logs
  - **Security**: Block account, force password reset, disable MFA (admin override)

### 2.3 Create User Modal/Page

- Form with: firstName, lastName, email, phone, roles (multi-select)
- Option to send invitation email or set temporary password
- Calls `/v1/admin/users` POST endpoint

### 2.4 Invite User Dialog

- Email input with role pre-selection
- Optional team assignment
- Calls `/v1/admin/invitations` POST endpoint
- Success toast with invitation link

## Phase 3: Roles & Permissions (Priority 1)

### 3.1 Roles List Page

- **Path**: `/src/pages/iam/roles/index.tsx`
- Data table: Name, Description, Permissions Count, Users Count, Is Default, Actions
- "Create Role" button
- Actions: Edit, Duplicate, Delete (with confirmation)
- Badge for default roles

### 3.2 Role Detail/Edit Page

- **Path**: `/src/pages/iam/roles/[id].tsx`
- Edit role name, slug, description
- Mark as default role (checkbox)
- Permissions section:
  - Use existing `PermissionsSelector` component
  - Group permissions by resource (users, roles, teams, etc.)
  - Searchable with wildcard badge display
- Users section: List of users with this role (with remove action)
- Audit trail for role changes

### 3.3 Create Role Page

- **Path**: `/src/pages/iam/roles/create.tsx`
- Form: name, slug (auto-generated), description
- Permission selector
- "Create and assign users" checkbox (optional)

## Phase 4: Teams Management (Priority 2)

### 4.1 Teams List Page

- **Path**: `/src/pages/iam/teams/index.tsx`
- Grid or table view: Team name, Description, Member count, Created date
- "Create Team" button
- Search and filter

### 4.2 Team Detail Page

- **Path**: `/src/pages/iam/teams/[id].tsx`
- Edit team name, slug, description
- Members list with avatar, name, role badges
- "Add members" button (user selector dialog)
- Remove member action
- Team activity/audit logs

## Phase 5: OAuth2 Clients (Priority 2)

### 5.1 Clients List Page

- **Path**: `/src/pages/iam/clients/index.tsx`
- Table: Name, Client ID, Type (confidential/public), Grant Types, Status, Actions
- "Create Client" button
- Filter by status (active/revoked)

### 5.2 Client Detail Page

- **Path**: `/src/pages/iam/clients/[id].tsx`
- Tabs:
  - **Details**: Name, description, type, logo
  - **Configuration**: Redirect URIs, scopes, grant types, PKCE settings
  - **Credentials**: Client ID (copy), Client secret (masked with rotate button)
  - **Token Settings**: Access/refresh/ID token lifetimes
  - **Security**: Allowed origins, consent settings
  - **Activity**: Recent token grants, audit logs

### 5.3 Create Client Page

- **Path**: `/src/pages/iam/clients/create.tsx`
- Multi-step wizard:
  - Step 1: Basic info (name, description, type)
  - Step 2: OAuth configuration (grant types, redirect URIs)
  - Step 3: Security settings (PKCE, consent, scopes)
  - Step 4: Token lifetimes
  - Step 5: Review and create

## Phase 6: Organization & Profile (Priority 2)

### 6.1 Organization Settings Page

- **Path**: `/src/pages/settings/organisation.tsx`
- Sections:
  - **General**: Name, slug, email, phone, website, logo
  - **Security**: MFA requirements, allowed MFA methods, password policy
  - **Sessions**: Session lifetime, idle timeout
  - **OAuth**: Allowed callback/logout URLs, allowed origins
  - **Branding**: Logo, colors, custom domain (future)
  - **Danger Zone**: Transfer ownership, suspend organization

### 6.2 User Profile Page

- **Path**: `/src/pages/profile.tsx`
- Tabs:
  - **Profile**: Edit own firstName, lastName, email, phone, profilePhoto
  - **Security**: Change password, enable/disable MFA, backup codes
  - **Sessions**: Active sessions with device info, last activity, revoke action
  - **Privacy**: Export data (GDPR), delete account

### 6.3 MFA Enrollment Flow

- Dialog component with steps:
  - Step 1: Explanation and QR code display
  - Step 2: Enter verification code
  - Step 3: Download backup codes
- Calls `/v1/me/mfa/enable`, `/v1/me/mfa/verify` endpoints

## Phase 7: API Keys & Tokens (Priority 2)

### 7.1 API Keys List Page

- **Path**: `/src/pages/iam/api-keys/index.tsx`
- Table: Name, Key prefix, Scopes, Last used, Expires, Actions
- "Create API Key" button
- Filter by status (active/revoked/expired)

### 7.2 Create API Key Dialog

- Form: Name, scopes (multi-select), expiration (optional)
- Show key ONCE after creation (copy to clipboard warning)
- Calls `/v1/admin/api-keys` POST endpoint

## Phase 8: Invitations Management (Priority 2)

### 8.1 Invitations List Page

- **Path**: `/src/pages/iam/invitations/index.tsx`
- Table: Email, Role, Invited by, Status (pending/accepted/expired), Sent date, Actions
- Filters: Status, date range
- Actions: Resend, Copy link, Revoke

## Phase 9: Webhooks (Priority 3)

### 9.1 Webhooks List Page

- **Path**: `/src/pages/iam/webhooks/index.tsx`
- Table: URL, Events, Status (active/inactive), Last triggered, Failure count, Actions
- "Create Webhook" button

### 9.2 Webhook Detail Page

- **Path**: `/src/pages/iam/webhooks/[id].tsx`
- Edit URL, events, active status
- Rotate secret button
- Test webhook button
- Recent deliveries log (timestamp, event, status, response)

## Phase 10: Audit Logs (Priority 2)

### 10.1 Audit Logs Page

- **Path**: `/src/pages/audit/logs.tsx`
- Advanced filtering:
  - Event category (auth, user, client, permission, system)
  - Action (create, read, update, delete, login, logout)
  - User (searchable select)
  - Date range picker
  - Success/failure toggle
- Table: Timestamp, User, Action, Resource, IP, Status, Details
- Expandable row for full metadata JSON
- Export to CSV button
- Pagination with server-side support

### 10.2 Audit Log Detail Modal

- Full event details in formatted JSON
- User agent, IP address
- Request/response data (if available)
- Related events link

## Phase 11: Components & Utilities

### 11.1 Reusable Components to Build

- **UserAvatar**: Display user profile photo or initials
- **StatusBadge**: Colored badges for various statuses
- **PermissionBadge**: Display permission with icon
- **DataTable**: Generic table with sorting, filtering, pagination
- **ConfirmDialog**: Reusable confirmation modal
- **CopyButton**: Copy to clipboard with toast
- **DateRangePicker**: Date range selection for filters
- **UserSelector**: Searchable user dropdown
- **RoleSelector**: Multi-select role picker
- **EmptyState**: Consistent empty states with CTA

### 11.2 API Client Extensions

- Extend `src/lib/iam/api.ts` with missing endpoints:
  - Teams CRUD operations
  - Client management
  - Webhooks
  - Invitations resend/revoke
  - User role assignment
  - Session management
  - Organization settings update

### 11.3 Hooks to Add

- **useDebounce**: Debounce search inputs
- **usePagination**: Client-side pagination state
- **useConfirm**: Hook for confirmation dialogs
- **useClipboard**: Copy to clipboard with feedback
- **useUsers**: Enhanced user list with filters
- **useRoles**: Enhanced role list with filters
- **useTeams**: Team management hook

## Phase 12: Testing & Polish (Priority 3)

### 12.1 E2E Tests

- Login flow (email/password, MFA)
- User CRUD operations
- Role assignment flow
- Invitation flow (send, accept)
- API key creation
- Audit log filtering

### 12.2 Component Tests

- Form validation tests
- Permission selector logic
- Data table sorting/filtering
- Authentication state handling

### 12.3 Accessibility

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader testing

### 12.4 Performance

- Code splitting by route
- Image optimization
- API response caching
- Debounced search inputs

## Implementation Order

**Week 1**: Phase 1 (Auth pages) + Phase 2.1-2.3 (User management)
**Week 2**: Phase 3 (Roles) + Phase 4 (Teams)
**Week 3**: Phase 5 (OAuth Clients) + Phase 6 (Org/Profile)
**Week 4**: Phase 7 (API Keys) + Phase 8 (Invitations) + Phase 9 (Webhooks)
**Week 5**: Phase 10 (Audit Logs) + Phase 11 (Components/Utils)
**Week 6**: Phase 12 (Testing & Polish)

## Technical Decisions

1. **Routing**: Pages Router (already in use)
2. **Forms**: react-hook-form + Zod validation
3. **Tables**: Custom DataTable component with shadcn/ui Table primitives
4. **State**: React Context for auth, consider SWR/React Query for future
5. **Notifications**: Sonner (already integrated)
6. **Date handling**: date-fns (already installed)
7. **Charts**: recharts (already installed)
8. **Icons**: lucide-react (already installed)

## API Integration Notes

- All admin routes require session authentication (cookie: `cerb_sid`)
- CSRF token required for state-changing operations (header: `X-CSRF-Token`)
- Tenant context via `X-Org-Domain` header (already handled in http.ts)
- Error handling: RFC 7807 ProblemDetails format (already handled)
- Rate limiting: Handle 429 responses with retry-after
- Pagination: Prepare for `?page=1&limit=50` query params (future API enhancement)

## Backend Gaps

- OAuth client creation currently hard-codes `authorization_code`/`refresh_token` grant types and does not expose fields for redirect URIs, consent requirements, token lifetimes, or token endpoint auth methods. Implement the necessary service/controller changes before building the multi-step wizard in Phase 5.
- There is no metrics/analytics endpoint powering the dashboard cards and charts. Decide whether to add summary endpoints (users, sessions, audit stats) or adjust the dashboard scope.

## Design System Consistency

- Use existing CSS variables for colors
- Follow shadcn/ui composition patterns
- Maintain responsive design (mobile breakpoint: 768px)
- Dark mode support throughout
- Consistent spacing (Tailwind scale)
- Form field patterns from shadcn/ui
- Toast notifications for all user actions

---

**Status**: Plan approved and documented
**Next Steps**: Begin implementation starting with Phase 1 (Authentication pages)
