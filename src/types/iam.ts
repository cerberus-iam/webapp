export interface OrganisationSummary {
  id: string
  slug: string
  name: string
}

export interface RoleSummary {
  id: string
  name: string
  slug: string
  description?: string | null
  isDefault?: boolean
}

export interface LoginResponse {
  message: string
  user: {
    id: string
    email: string
    name: string
  }
  organisation: OrganisationSummary
}

export interface OnboardOrganisationConfig {
  allowedCallbackUrls: string[]
  allowedLogoutUrls: string[]
  allowedOrigins: string[]
  sessionLifetime: number
  sessionIdleTimeout: number
  requireMfa: boolean
  allowedMfaMethods: string[]
  passwordPolicy: Record<string, unknown> | null
  tokenLifetimePolicy: Record<string, unknown> | null
  branding: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
}

export interface OnboardResponse {
  message: string
  organisation: OrganisationSummary & {
    configs: OnboardOrganisationConfig
  }
  user: {
    id: string
    email: string
    name: string
  }
  roles: Array<
    RoleSummary & {
      permissions: Array<{
        id: string
        slug: string
        name: string
      }>
      createdAt: string
      updatedAt: string
      _count: {
        users: number
      }
    }
  >
  invitationDefaults: {
    roleId: string | null
    expiresInHours: number
    maxUses: number
  }
}

export interface ForgotPasswordResponse {
  message: string
}

export interface MeProfile {
  id: string
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  emailVerified: boolean
  phone: string | null
  mfaEnabled: boolean
  organisation: OrganisationSummary
  roles: RoleSummary[]
  permissions: string[]
}

export interface TeamSummary {
  id: string
  name: string
  slug: string
}

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  name: string | null
  phone: string | null
  emailVerifiedAt: string | null
  mfaEnabled: boolean
  blockedAt: string | null
  blockedReason: string | null
  createdAt: string
  updatedAt: string
  roles: RoleSummary[]
  teams: TeamSummary[]
}

export interface UsersListResponse {
  data: User[]
  total: number
}
