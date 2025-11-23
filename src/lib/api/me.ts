import type { Result } from '@/lib/result';
import type { MeProfile } from '@/types/iam';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface UpdateProfileData {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
}

export interface ListSessionsResponse {
  data: Session[];
}

export interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MfaStatusResponse {
  enabled: boolean;
  backupCodesRemaining: number;
}

export class MeApi {
  constructor(private client: IamApiClient) {}

  async getProfile(): Promise<Result<MeProfile, ApiError>> {
    return this.client.request<MeProfile>('/v1/me/profile', {
      method: 'GET',
    });
  }

  async updateProfile(
    data: UpdateProfileData
  ): Promise<Result<MeProfile, ApiError>> {
    return this.client.request<MeProfile>('/v1/me/profile', {
      method: 'PATCH',
      body: data,
    });
  }

  async listSessions(): Promise<Result<ListSessionsResponse, ApiError>> {
    return this.client.request<ListSessionsResponse>('/v1/me/sessions', {
      method: 'GET',
    });
  }

  async revokeSession(sessionId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/me/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async getMfaStatus(): Promise<Result<MfaStatusResponse, ApiError>> {
    return this.client.request<MfaStatusResponse>('/v1/me/mfa', {
      method: 'GET',
    });
  }

  async setupMfa(): Promise<Result<MfaSetupResponse, ApiError>> {
    return this.client.request<MfaSetupResponse>('/v1/me/mfa/enable', {
      method: 'POST',
    });
  }

  async verifyMfa(code: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>('/v1/me/mfa/verify', {
      method: 'POST',
      body: { code },
    });
  }

  async disableMfa(code: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>('/v1/me/mfa/disable', {
      method: 'POST',
      body: { code },
    });
  }

  async regenerateBackupCodes(): Promise<
    Result<{ backupCodes: string[] }, ApiError>
  > {
    return this.client.request<{ backupCodes: string[] }>(
      '/v1/me/mfa/backup-codes',
      {
        method: 'POST',
      }
    );
  }
}
