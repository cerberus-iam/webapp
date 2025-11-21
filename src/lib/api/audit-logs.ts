import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface AuditLogActor {
  id: string;
  email: string;
  name: string | null;
}

export interface AuditLogResource {
  type: string;
  id: string;
  email?: string;
}

export interface AuditLogMetadata {
  ipAddress?: string;
  userAgent?: string;
  [key: string]: unknown;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  eventCategory: 'auth' | 'user' | 'client' | 'permission' | 'system';
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout';
  success: boolean;
  actor: AuditLogActor;
  resource: AuditLogResource;
  metadata: AuditLogMetadata;
}

export interface ListAuditLogsParams {
  eventCategory?: 'auth' | 'user' | 'client' | 'permission' | 'system' | '';
  action?: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | '';
  success?: boolean | '';
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
  sort?: 'timestamp' | 'eventCategory' | 'action';
  order?: 'asc' | 'desc';
}

export interface ListAuditLogsResponse {
  data: AuditLog[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export class AuditLogsApi {
  constructor(private readonly client: IamApiClient) {}

  /**
   * Query audit logs with filters
   */
  async list(
    params?: ListAuditLogsParams
  ): Promise<Result<ListAuditLogsResponse, ApiError>> {
    return this.client.request<ListAuditLogsResponse>('/v1/admin/audit-logs', {
      method: 'GET',
      query: params as Record<string, string | number | boolean | undefined>,
    });
  }

  /**
   * Get a single audit log by ID
   */
  async get(logId: string): Promise<Result<AuditLog, ApiError>> {
    return this.client.request<AuditLog>(`/v1/admin/audit-logs/${logId}`, {
      method: 'GET',
    });
  }
}
