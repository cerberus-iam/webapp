import type { Result } from '@/lib/result';

import type { IamApiClient } from './client';
import type { ApiError } from './types';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  lastTriggeredAt: string | null;
}

export interface CreateWebhookRequest {
  url: string;
  events: string[];
  secret?: string;
}

export interface UpdateWebhookRequest {
  url?: string;
  events?: string[];
  active?: boolean;
}

export interface ListWebhooksParams {
  limit?: number;
  offset?: number;
  search?: string;
  sort?: 'createdAt' | 'url';
  order?: 'asc' | 'desc';
}

export interface ListWebhooksResponse {
  data: Webhook[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export class WebhooksApi {
  constructor(private readonly client: IamApiClient) {}

  /**
   * List all webhooks in the organization
   */
  async list(
    params?: ListWebhooksParams
  ): Promise<Result<ListWebhooksResponse, ApiError>> {
    return this.client.request<ListWebhooksResponse>('/v1/admin/webhooks', {
      method: 'GET',
      query: params as Record<string, string | number | undefined>,
    });
  }

  /**
   * Create a new webhook
   */
  async create(data: CreateWebhookRequest): Promise<Result<Webhook, ApiError>> {
    return this.client.request<Webhook>('/v1/admin/webhooks', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Update a webhook
   */
  async update(
    webhookId: string,
    data: UpdateWebhookRequest
  ): Promise<Result<Webhook, ApiError>> {
    return this.client.request<Webhook>(`/v1/admin/webhooks/${webhookId}`, {
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * Delete a webhook
   */
  async delete(webhookId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/webhooks/${webhookId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get a specific webhook by ID
   */
  async get(webhookId: string): Promise<Result<Webhook, ApiError>> {
    return this.client.request<Webhook>(`/v1/admin/webhooks/${webhookId}`, {
      method: 'GET',
    });
  }

  /**
   * Rotate the webhook signing secret
   */
  async rotateSecret(webhookId: string): Promise<Result<Webhook, ApiError>> {
    return this.client.request<Webhook>(
      `/v1/admin/webhooks/${webhookId}/rotate-secret`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Test a webhook by sending a test event
   */
  async test(webhookId: string): Promise<Result<void, ApiError>> {
    return this.client.request<void>(`/v1/admin/webhooks/${webhookId}/test`, {
      method: 'POST',
    });
  }
}
