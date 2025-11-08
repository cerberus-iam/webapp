import { apiRequest } from "@/lib/http";
import type {
  ApiKeyCreateResponse,
  ApiKeyListResponse,
  AuditLogListResponse,
  LoginResponse,
  OrganisationDetails,
  PermissionListResponse,
  ProfileResponse,
  RoleListResponse,
  UserListResponse,
} from "@/types/api";

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

export const iamApi = {
  auth: {
    login: (payload: LoginPayload) =>
      apiRequest<LoginResponse>("/v1/auth/login", { method: "POST", body: payload }),
    logout: () => apiRequest<{ message: string }>("/v1/auth/logout", { method: "POST" }),
  },
  me: {
    profile: () => apiRequest<ProfileResponse>("/v1/me/profile"),
  },
  admin: {
    users: {
      list: () => apiRequest<UserListResponse>("/v1/admin/users"),
    },
    roles: {
      list: () => apiRequest<RoleListResponse>("/v1/admin/roles"),
    },
    auditLogs: {
      list: (params: AuditLogQuery = {}) => {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value === undefined || value === null || value === "") return;
          search.set(key, String(value));
        });
        const qs = search.toString();
        const path = qs ? `/v1/admin/audit-logs?${qs}` : "/v1/admin/audit-logs";
        return apiRequest<AuditLogListResponse>(path);
      },
    },
    apiKeys: {
      list: () => apiRequest<ApiKeyListResponse>("/v1/admin/api-keys"),
      create: (payload: { name: string; scopes: string[]; expiresInDays?: number }) =>
        apiRequest<ApiKeyCreateResponse>("/v1/admin/api-keys", { method: "POST", body: payload }),
      revoke: (id: string) =>
        apiRequest<{ message: string }>(`/v1/admin/api-keys/${id}/revoke`, { method: "POST" }),
    },
    organisation: {
      get: () => apiRequest<OrganisationDetails>("/v1/admin/organisation"),
    },
    permissions: {
      list: () => apiRequest<PermissionListResponse>("/v1/admin/permissions"),
    },
  },
};
