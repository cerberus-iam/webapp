import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  addedAt: string;
}

export interface CreateTeamData {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateTeamData {
  name?: string;
  description?: string;
}

export interface ListTeamsParams {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface ListTeamsResponse {
  teams: Team[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export class TeamsApi {
  constructor(private readonly client: IamApiClient) {}

  /**
   * List all teams in the organization
   */
  async list(
    params?: ListTeamsParams
  ): Promise<Result<ListTeamsResponse, ApiError>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    const url = `/v1/admin/teams${query ? `?${query}` : ''}`;

    return this.client.request<ListTeamsResponse>(url, {
      method: 'GET',
    });
  }

  /**
   * Get a specific team by ID (includes members)
   */
  async get(teamId: string): Promise<Result<Team, ApiError>> {
    return this.client.request<Team>(`/v1/admin/teams/${teamId}`, {
      method: 'GET',
    });
  }

  /**
   * Create a new team
   */
  async create(data: CreateTeamData): Promise<Result<Team, ApiError>> {
    return this.client.request<Team>('/v1/admin/teams', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Update a team
   */
  async update(
    teamId: string,
    data: UpdateTeamData
  ): Promise<Result<Team, ApiError>> {
    return this.client.request<Team>(`/v1/admin/teams/${teamId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * Delete a team
   */
  async delete(teamId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/teams/${teamId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add a member to a team
   */
  async addMember(
    teamId: string,
    userId: string
  ): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/teams/${teamId}/members`, {
      method: 'POST',
      body: { userId },
    });
  }

  /**
   * Remove a member from a team
   */
  async removeMember(
    teamId: string,
    userId: string
  ): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/teams/${teamId}/members`, {
      method: 'DELETE',
      body: { userId },
    });
  }
}
