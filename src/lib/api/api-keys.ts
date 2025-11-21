import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  status: 'active' | 'revoked';
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyRequest {
  name: string;
  expiresAt?: string | null;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  prefix: string;
  status: 'active' | 'revoked';
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  key: string; // Full API key - only returned on creation
}

export interface ListApiKeysResponse {
  data: ApiKey[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export class ApiKeysApi {
  constructor(private readonly client: IamApiClient) {}

  async list(params?: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: 'active' | 'revoked';
    sort?: 'createdAt' | 'name' | 'lastUsedAt';
    order?: 'asc' | 'desc';
  }): Promise<Result<ListApiKeysResponse>> {
    return this.client.request<ListApiKeysResponse>('/v1/admin/api-keys', {
      method: 'GET',
      query: params as Record<string, string | number | undefined>,
    });
  }

  async get(keyId: string): Promise<Result<ApiKey>> {
    return this.client.request<ApiKey>(`/v1/admin/api-keys/${keyId}`, {
      method: 'GET',
    });
  }

  async create(
    data: CreateApiKeyRequest
  ): Promise<Result<CreateApiKeyResponse>> {
    return this.client.request<CreateApiKeyResponse>('/v1/admin/api-keys', {
      method: 'POST',
      body: data,
    });
  }

  async revoke(keyId: string): Promise<Result<void>> {
    return this.client.request<void>(`/v1/admin/api-keys/${keyId}/revoke`, {
      method: 'POST',
    });
  }
}
