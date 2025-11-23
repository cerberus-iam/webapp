import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface OverviewStats {
  totalUsers: number;
  activeUsers30d: number;
  mfaAdoptionRate: number;
  totalSessions: number;
  totalClients: number;
  totalApiKeys: number;
  trends: {
    users30d: number;
    clients30d: number;
  };
}

export interface ActivityDataPoint {
  date: string;
  count: number;
}

export interface AuthEventsDataPoint {
  date: string;
  successful: number;
  failed: number;
}

export interface ActivityStats {
  loginActivity: ActivityDataPoint[];
  newUsers: ActivityDataPoint[];
  authEvents: AuthEventsDataPoint[];
}

export interface UsersByStatus {
  active: number;
  inactive: number;
  blocked: number;
}

export interface MfaBreakdown {
  enabled: number;
  disabled: number;
}

export interface TopActiveUser {
  id: string;
  name: string | null;
  loginCount: number;
  lastLoginAt: string | null;
}

export interface RecentSignup {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
}

export interface SecurityStats {
  usersByStatus: UsersByStatus;
  mfaBreakdown: MfaBreakdown;
  topActiveUsers: TopActiveUser[];
  recentSignups: RecentSignup[];
}

export class StatsApi {
  constructor(private readonly client: IamApiClient) {}

  /**
   * Get overview statistics for dashboard stat cards
   */
  async getOverview(): Promise<Result<OverviewStats, ApiError>> {
    return this.client.request<OverviewStats>('/v1/admin/stats/overview', {
      method: 'GET',
    });
  }

  /**
   * Get activity statistics for charts
   */
  async getActivity(
    days: number = 30
  ): Promise<Result<ActivityStats, ApiError>> {
    return this.client.request<ActivityStats>('/v1/admin/stats/activity', {
      method: 'GET',
      query: { days: days.toString() },
    });
  }

  /**
   * Get security-focused statistics
   */
  async getSecurity(): Promise<Result<SecurityStats, ApiError>> {
    return this.client.request<SecurityStats>('/v1/admin/stats/security', {
      method: 'GET',
    });
  }
}
