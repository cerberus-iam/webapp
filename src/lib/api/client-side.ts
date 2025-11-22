/**
 * Client-side API helper that proxies requests through Next.js API routes
 * to avoid CORS issues when making direct browser -> backend API calls.
 *
 * Use this in client components instead of the direct apiClient.
 */

export async function fetchFromAPI<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      type: 'about:blank',
      title: 'Request Failed',
      status: response.status,
      detail: response.statusText,
    }));
    throw error;
  }

  return response.json();
}
