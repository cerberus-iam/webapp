import { publicEnv } from "@/config/env";
import type { ProblemDetails } from "@/types/api";

const API_BASE_URL = publicEnv.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
const DEFAULT_TENANT_SLUG = publicEnv.NEXT_PUBLIC_TENANT_SLUG;

let csrfToken: string | null = null;

export class ApiError extends Error {
  status: number;
  payload?: ProblemDetails | unknown;

  constructor(message: string, status: number, payload?: ProblemDetails | unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  signal?: AbortSignal;
  orgDomain?: string;
};

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = new Headers(options.headers ?? {});
  headers.set("Accept", "application/json");

  if (options.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (!headers.has("X-Org-Domain") && DEFAULT_TENANT_SLUG) {
    headers.set("X-Org-Domain", options.orgDomain ?? DEFAULT_TENANT_SLUG);
  }

  if (csrfToken && !headers.has("X-CSRF-Token")) {
    headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(url, {
    method: options.method ?? (options.body ? "POST" : "GET"),
    credentials: "include",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  const nextToken = response.headers.get("x-csrf-token");
  if (nextToken) {
    csrfToken = nextToken;
  }

  const contentType = response.headers.get("content-type");
  const expectsJson = contentType?.includes("application/json");
  let payload: unknown = null;

  if (expectsJson) {
    payload = await response.json().catch(() => null);
  } else if (response.status !== 204 && response.status !== 205) {
    payload = await response.text();
  }

  if (!response.ok) {
    const problem = (payload ?? undefined) as ProblemDetails | undefined;
    throw new ApiError(
      problem?.detail || problem?.title || `Request failed with status ${response.status}`,
      response.status,
      problem,
    );
  }

  return (payload ?? undefined) as T;
}

export function getCsrfToken() {
  return csrfToken;
}

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    const detail =
      (typeof error.payload === "object" && error.payload && "detail" in error.payload
        ? (error.payload.detail as string | undefined)
        : undefined) || error.message;

    if (error.status === 401) {
      return detail || "Your session has expired. Please sign in again.";
    }

    if (
      error.status === 403 &&
      (detail?.toLowerCase().includes("csrf") || detail?.toLowerCase().includes("forbidden"))
    ) {
      return (
        detail ||
        "CSRF protection blocked this action. Refresh the page to obtain a new security token."
      );
    }

    return detail || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
