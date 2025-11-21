import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface InvitedBy {
  id: string;
  email: string;
  name: string | null;
}

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
  invitedBy: InvitedBy;
}

export interface CreateInvitationRequest {
  email: string;
  roleIds: string[];
}

export interface ListInvitationsParams {
  limit?: number;
  offset?: number;
  search?: string;
  status?: 'pending' | 'accepted' | 'expired' | 'revoked' | '';
  sort?: 'createdAt' | 'email' | 'expiresAt';
  order?: 'asc' | 'desc';
}

export interface ListInvitationsResponse {
  data: Invitation[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export class InvitationsApi {
  constructor(private readonly client: IamApiClient) {}

  /**
   * List all invitations in the organization
   */
  async list(
    params?: ListInvitationsParams
  ): Promise<Result<ListInvitationsResponse, ApiError>> {
    return this.client.request<ListInvitationsResponse>(
      '/v1/admin/invitations',
      {
        method: 'GET',
        query: params as Record<string, string | number | undefined>,
      }
    );
  }

  /**
   * Create a new invitation
   */
  async create(
    data: CreateInvitationRequest
  ): Promise<Result<Invitation, ApiError>> {
    return this.client.request<Invitation>('/v1/admin/invitations', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Resend invitation email
   */
  async resend(invitationId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(
      `/v1/admin/invitations/${invitationId}/resend`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Revoke an invitation
   */
  async revoke(invitationId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  }
}
