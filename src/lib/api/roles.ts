import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSystemRole: boolean;
  isDefault?: boolean;
  permissionCount?: number;
  permissions?: Permission[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface Permission {
  id: string;
  action: string;
  resource: string;
  description: string | null;
  isSystemPermission: boolean;
  createdAt: string;
}

export interface ListRolesParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ListRolesResponse {
  roles: Role[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface ListPermissionsParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ListPermissionsResponse {
  permissions: Permission[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CreateRoleRequest {
  name: string;
  slug: string;
  description?: string;
  permissions?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AddPermissionRequest {
  permissionId: string;
}

export interface RemovePermissionRequest {
  permissionId: string;
}

export class RolesApi {
  constructor(private readonly client: IamApiClient) {}

  async list(
    params: ListRolesParams = {}
  ): Promise<Result<ListRolesResponse, ApiError>> {
    return this.client.request<ListRolesResponse>('/v1/admin/roles', {
      method: 'GET',
      query: params as Record<string, string | number | undefined>,
    });
  }

  async get(roleId: string): Promise<Result<Role, ApiError>> {
    return this.client.request<Role>(`/v1/admin/roles/${roleId}`, {
      method: 'GET',
    });
  }

  async create(data: CreateRoleRequest): Promise<Result<Role, ApiError>> {
    return this.client.request<Role>('/v1/admin/roles', {
      method: 'POST',
      body: data,
    });
  }

  async update(
    roleId: string,
    data: UpdateRoleRequest
  ): Promise<Result<Role, ApiError>> {
    return this.client.request<Role>(`/v1/admin/roles/${roleId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete(roleId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/roles/${roleId}`, {
      method: 'DELETE',
    });
  }

  async addPermission(
    roleId: string,
    data: AddPermissionRequest
  ): Promise<Result<Role, ApiError>> {
    return this.client.request<Role>(`/v1/admin/roles/${roleId}/permissions`, {
      method: 'POST',
      body: data,
    });
  }

  async removePermission(
    roleId: string,
    data: RemovePermissionRequest
  ): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/roles/${roleId}/permissions`, {
      method: 'DELETE',
      body: data,
    });
  }
}

export class PermissionsApi {
  constructor(private readonly client: IamApiClient) {}

  async list(
    params: ListPermissionsParams = {}
  ): Promise<Result<ListPermissionsResponse, ApiError>> {
    return this.client.request<ListPermissionsResponse>(
      '/v1/admin/permissions',
      {
        method: 'GET',
        query: params as Record<string, string | number | undefined>,
      }
    );
  }
}
