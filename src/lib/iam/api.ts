import { apiRequest } from '@/lib/http';
import type {
  AcceptInvitationResponse,
  AuthOnboardResponse,
  ApiKeyCreateResponse,
  ApiKeyListResponse,
  AuditLogListResponse,
  AuthRegisterResponse,
  InvitationValidationResponse,
  LoginResponse,
  MessageResponse,
  OrganisationDetails,
  PermissionListResponse,
  ProfileResponse,
  RoleListResponse,
  UserListResponse,
} from '@/types/api';

type AuditLogQuery = {
  userId?: string;
  clientId?: string;
  eventType?: string;
  eventCategory?: string;
  action?: string;
  resourceType?: string;
  resourceId?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
};

type LoginPayload = {
  email: string;
  password: string;
  mfaToken?: string;
};

type RegisterPayload = {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type OnboardPayload = {
  organisationName: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  token: string;
  password: string;
};

type AcceptInvitationPayload = {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
};

export const iamApi = {
  auth: {
    login: (payload: LoginPayload) =>
      apiRequest<LoginResponse>('/v1/auth/login', { method: 'POST', body: payload }),
    logout: () => apiRequest<void>('/v1/auth/session', { method: 'DELETE' }),
    onboard: (payload: OnboardPayload) =>
      apiRequest<AuthOnboardResponse>('/v1/auth/onboard', { method: 'POST', body: payload }),
    register: (payload: RegisterPayload) =>
      apiRequest<AuthRegisterResponse>('/v1/auth/register', {
        method: 'POST',
        body: payload,
      }),
    forgotPassword: (payload: ForgotPasswordPayload) =>
      apiRequest<MessageResponse>('/v1/auth/forgot-password', {
        method: 'POST',
        body: payload,
      }),
    resetPassword: (payload: ResetPasswordPayload) =>
      apiRequest<MessageResponse>('/v1/auth/reset-password', { method: 'POST', body: payload }),
    validateInvitation: (token: string, signal?: AbortSignal) =>
      apiRequest<InvitationValidationResponse>(
        `/v1/auth/invitations/validate?token=${encodeURIComponent(token)}`,
        { signal },
      ),
    verifyEmail: (token: string) =>
      apiRequest<MessageResponse>(`/v1/auth/verify-email?token=${encodeURIComponent(token)}`),
    acceptInvitation: (payload: AcceptInvitationPayload) =>
      apiRequest<AcceptInvitationResponse>('/v1/auth/invitations/accept', {
        method: 'POST',
        body: payload,
      }),
  },
  me: {
    profile: () => apiRequest<ProfileResponse>('/v1/me/profile'),
  },
  admin: {
    users: {
      list: () => apiRequest<UserListResponse>('/v1/admin/users'),
      get: (id: string) => apiRequest<UserListResponse['data'][number]>(`/v1/admin/users/${id}`),
      create: (payload: {
        firstName: string;
        lastName: string;
        email: string;
        password?: string;
        roleIds?: string[];
      }) =>
        apiRequest<UserListResponse['data'][number]>('/v1/admin/users', {
          method: 'POST',
          body: payload,
        }),
      update: (
        id: string,
        payload: {
          firstName?: string;
          lastName?: string;
          email?: string;
          password?: string;
        },
      ) =>
        apiRequest<UserListResponse['data'][number]>(`/v1/admin/users/${id}`, {
          method: 'PATCH',
          body: payload,
        }),
      delete: (id: string) =>
        apiRequest<{ message: string }>(`/v1/admin/users/${id}`, { method: 'DELETE' }),
      assignRole: (id: string, roleId: string) =>
        apiRequest<{ message: string }>(`/v1/admin/users/${id}/roles`, {
          method: 'POST',
          body: { roleId },
        }),
      unassignRole: (id: string, roleId: string) =>
        apiRequest<{ message: string }>(`/v1/admin/users/${id}/roles`, {
          method: 'DELETE',
          body: { roleId },
        }),
    },
    roles: {
      list: () => apiRequest<RoleListResponse>('/v1/admin/roles'),
    },
    auditLogs: {
      list: (params: AuditLogQuery = {}) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null || value === '') return;
          search.set(key, String(value));
        });
        const qs = search.toString();
        const path = qs ? `/v1/admin/audit-logs?${qs}` : '/v1/admin/audit-logs';
        return apiRequest<AuditLogListResponse>(path);
      },
    },
    apiKeys: {
      list: () => apiRequest<ApiKeyListResponse>('/v1/admin/api-keys'),
      create: (payload: { name: string; scopes: string[]; expiresInDays?: number }) =>
        apiRequest<ApiKeyCreateResponse>('/v1/admin/api-keys', { method: 'POST', body: payload }),
      revoke: (id: string) =>
        apiRequest<{ message: string }>(`/v1/admin/api-keys/${id}/revoke`, { method: 'POST' }),
    },
    organisation: {
      get: () => apiRequest<OrganisationDetails>('/v1/admin/organisation'),
    },
    permissions: {
      list: () => apiRequest<PermissionListResponse>('/v1/admin/permissions'),
    },
  },
};
