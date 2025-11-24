import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface InvitedBy {
  id: string;
  email: string;
  name: string | null;
}

export interface RoleSummary {
  id: string;
  name: string;
  slug: string;
}

export interface OrganisationSummary {
  id: string;
  slug: string;
  name: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: RoleSummary;
  roleId: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  expiresAt: string;
  createdAt: string;
  invitedBy: InvitedBy;
}

/**
 * Public invitation details returned when validating an invitation token.
 * Used on the invitation acceptance page to display invitation information.
 */
export interface PublicInvitationDetails {
  email: string;
  organisation: OrganisationSummary;
  role: RoleSummary;
  invitedBy?: InvitedBy;
  expiresAt: string;
}

/**
 * Request body for accepting an invitation.
 */
export interface AcceptInvitationRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

/**
 * Response from accepting an invitation.
 */
export interface AcceptInvitationResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  organisation: OrganisationSummary;
  role: RoleSummary;
}

export interface CreateInvitationRequest {
  email: string;
  roleId: string;
  teamIds?: string[];
  expiresInDays?: number;
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

  /**
   * Validate an invitation token and get invitation details (public endpoint).
   * Used on the invitation acceptance page before showing the registration form.
   *
   * @param token - The invitation token from the URL
   * @returns Invitation details including email, organisation, and role
   */
  async validateToken(
    token: string
  ): Promise<Result<PublicInvitationDetails, ApiError>> {
    return this.client.request<PublicInvitationDetails>(
      `/v1/public/invitations/${token}`,
      {
        method: 'GET',
      }
    );
  }

  /**
   * Accept an invitation and create a new user account (public endpoint).
   * The email must match the invitation's email.
   *
   * @param token - The invitation token from the URL
   * @param data - Registration data including email, firstName, lastName, password
   * @returns Auth response with user and organisation details, plus session cookie is set
   */
  async acceptInvitation(
    token: string,
    data: AcceptInvitationRequest
  ): Promise<Result<AcceptInvitationResponse, ApiError>> {
    return this.client.request<AcceptInvitationResponse>(
      `/v1/public/invitations/${token}/accept`,
      {
        method: 'POST',
        body: data,
      }
    );
  }
}
