import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface OAuth2Client {
  id: string;
  clientId: string;
  name: string;
  clientType: 'confidential' | 'public';
  isActive: boolean;
  redirectUris: string[];
  allowedScopes: string[];
  grantTypes: string[];
  tokenEndpointAuthMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientData {
  name: string;
  clientType: 'confidential' | 'public';
  redirectUris: string[];
  allowedScopes: string[];
  tokenEndpointAuthMethod?: string;
}

export interface UpdateClientData {
  name?: string;
  redirectUris?: string[];
  allowedScopes?: string[];
}

export interface ListClientsParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: 'active' | 'revoked' | '';
}

export interface ListClientsResponse {
  clients: OAuth2Client[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface CreateClientResponse {
  id: string;
  clientId: string;
  clientSecret: string;
  name: string;
  clientType: 'confidential' | 'public';
  redirectUris: string[];
  allowedScopes: string[];
  grantTypes: string[];
  tokenEndpointAuthMethod: string;
  createdAt: string;
}

export interface RotateSecretResponse {
  clientSecret: string;
}

export class ClientsApi {
  constructor(private readonly client: IamApiClient) {}

  /**
   * List all OAuth2 clients in the organization
   */
  async list(
    params?: ListClientsParams
  ): Promise<Result<ListClientsResponse, ApiError>> {
    return this.client.request<ListClientsResponse>('/v1/admin/clients', {
      method: 'GET',
      query: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Get a specific OAuth2 client by ID
   * Note: clientSecret is never returned
   */
  async get(clientId: string): Promise<Result<OAuth2Client, ApiError>> {
    return this.client.request<OAuth2Client>(`/v1/admin/clients/${clientId}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new OAuth2 client
   * Returns the client with clientSecret - save it immediately as it's only shown once
   */
  async create(
    data: CreateClientData
  ): Promise<Result<CreateClientResponse, ApiError>> {
    return this.client.request<CreateClientResponse>('/v1/admin/clients', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Update an OAuth2 client
   */
  async update(
    clientId: string,
    data: UpdateClientData
  ): Promise<Result<OAuth2Client, ApiError>> {
    return this.client.request<OAuth2Client>(`/v1/admin/clients/${clientId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * Rotate the client secret
   * Returns new secret - save it immediately as it's only shown once
   */
  async rotateSecret(
    clientId: string
  ): Promise<Result<RotateSecretResponse, ApiError>> {
    return this.client.request<RotateSecretResponse>(
      `/v1/admin/clients/${clientId}/rotate-secret`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Revoke an OAuth2 client (soft delete)
   */
  async revoke(clientId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/clients/${clientId}/revoke`, {
      method: 'POST',
    });
  }
}
