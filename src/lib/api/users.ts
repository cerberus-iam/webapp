import type { Result } from '@/lib/result';
import type { User } from '@/types/iam';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface ListUsersParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: 'active' | 'blocked' | '';
  sort?: 'createdAt' | 'email' | 'name';
  order?: 'asc' | 'desc';
}

export interface ListUsersResponse {
  users: User[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleIds?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface AssignRolesRequest {
  roleIds: string[];
}

export interface RemoveRolesRequest {
  roleIds: string[];
}

export class UsersApi {
  constructor(private readonly client: IamApiClient) {}

  async list(
    params: ListUsersParams = {}
  ): Promise<Result<ListUsersResponse, ApiError>> {
    return this.client.request<ListUsersResponse>('/v1/admin/users', {
      method: 'GET',
      query: params as Record<string, string | number | undefined>,
    });
  }

  async get(userId: string): Promise<Result<User, ApiError>> {
    return this.client.request<User>(`/v1/admin/users/${userId}`, {
      method: 'GET',
    });
  }

  async create(data: CreateUserRequest): Promise<Result<User, ApiError>> {
    return this.client.request<User>('/v1/admin/users', {
      method: 'POST',
      body: data,
    });
  }

  async update(
    userId: string,
    data: UpdateUserRequest
  ): Promise<Result<User, ApiError>> {
    return this.client.request<User>(`/v1/admin/users/${userId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  async delete(userId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async assignRoles(
    userId: string,
    data: AssignRolesRequest
  ): Promise<Result<User, ApiError>> {
    return this.client.request<User>(`/v1/admin/users/${userId}/roles`, {
      method: 'POST',
      body: data,
    });
  }

  async removeRoles(
    userId: string,
    data: RemoveRolesRequest
  ): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/users/${userId}/roles`, {
      method: 'DELETE',
      body: data,
    });
  }
}
