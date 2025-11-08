"use client";

import { useCallback } from "react";

import { iamApi } from "@/lib/iam/api";
import type {
  ApiKeyListResponse,
  AuditLogEntry,
  PermissionRecord,
  RoleListResponse,
  UserListResponse,
} from "@/types/api";
import { useAuth } from "./use-auth";
import { useIamCollection } from "./use-iam-collection";

export function useIamUsers() {
  const { status } = useAuth();
  const fetcher = useCallback(() => iamApi.admin.users.list(), []);
  return useIamCollection<UserListResponse["data"][number]>(fetcher, status === "authenticated");
}

export function useIamRoles() {
  const { status } = useAuth();
  const fetcher = useCallback(() => iamApi.admin.roles.list(), []);
  return useIamCollection<RoleListResponse["data"][number]>(fetcher, status === "authenticated");
}

export function useAuditLogs(limit = 20) {
  const { status } = useAuth();
  const fetcher = useCallback(() => iamApi.admin.auditLogs.list({ limit }), [limit]);
  return useIamCollection<AuditLogEntry>(fetcher, status === "authenticated");
}

export function useIamApiKeys() {
  const { status } = useAuth();
  const fetcher = useCallback(() => iamApi.admin.apiKeys.list(), []);
  return useIamCollection<ApiKeyListResponse["data"][number]>(fetcher, status === "authenticated");
}

export function usePermissions() {
  const { status } = useAuth();
  const fetcher = useCallback(() => iamApi.admin.permissions.list(), []);
  return useIamCollection<PermissionRecord>(fetcher, status === "authenticated");
}
