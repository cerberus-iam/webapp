export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: unknown;
};

export type MessageResponse = {
  message: string;
};

export type OrganisationSummary = {
  id: string;
  slug: string;
  name: string;
};

export type RoleSummary = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  permissions?: PermissionSummary[];
  _count?: {
    users?: number;
  };
};

export type PermissionSummary = {
  id: string;
  slug: string;
  name?: string;
};

export type TeamSummary = {
  id: string;
  name: string;
  slug: string;
};

export type UserSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  phone: string | null;
  emailVerifiedAt: string | null;
  mfaEnabled: boolean;
  blockedAt: string | null;
  blockedReason: string | null;
  createdAt: string;
  updatedAt: string;
  roles: Array<Pick<RoleSummary, 'id' | 'name' | 'slug'>>;
  teams?: TeamSummary[];
};

export type AuditLogEntry = {
  id: string;
  organisationId: string;
  userId: string | null;
  clientId: string | null;
  eventType: string;
  eventCategory: 'auth' | 'user' | 'client' | 'permission' | 'system';
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
  resourceType: string;
  resourceId: string | null;
  success: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    email: string | null;
    name: string | null;
  } | null;
  client?: {
    id: string;
    name: string | null;
    clientId: string | null;
  } | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  limit?: number;
  offset?: number;
};

export type UserListResponse = PaginatedResponse<UserSummary>;
export type RoleListResponse = PaginatedResponse<RoleSummary>;
export type AuditLogListResponse = PaginatedResponse<AuditLogEntry>;

export type ApiKeySummary = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiKeyListResponse = PaginatedResponse<ApiKeySummary>;

export type ApiKeyCreateResponse = ApiKeySummary & {
  key?: string;
  warning?: string;
};

export type ProfileResponse = {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  phone: string | null;
  mfaEnabled: boolean;
  organisation: OrganisationSummary;
  roles: Array<Pick<RoleSummary, 'id' | 'name' | 'slug'>>;
  permissions: string[];
};

export type LoginResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  organisation: OrganisationSummary;
};

export type AuthRegisterResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  organisation: OrganisationSummary;
};

export type AcceptInvitationResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
};

export type InvitationValidationResponse = {
  email: string;
  organisation: OrganisationSummary;
  role?: Pick<RoleSummary, 'id' | 'name' | 'slug'>;
  invitedBy?: {
    id: string;
    email: string | null;
    name: string | null;
  };
  expiresAt: string;
};

export type OrganisationDetails = {
  id: string;
  slug: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  ownerId?: string | null;
  allowedCallbackUrls?: string[];
  allowedLogoutUrls?: string[];
  allowedOrigins?: string[];
  sessionLifetime?: number;
  sessionIdleTimeout?: number;
  requireMfa?: boolean;
  allowedMfaMethods?: string[];
  passwordPolicy?: Record<string, unknown>;
  tokenLifetimePolicy?: Record<string, unknown>;
  branding?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type PermissionRecord = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category?: string | null;
};

export type PermissionListResponse = PaginatedResponse<PermissionRecord>;
