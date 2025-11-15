import type { IncomingHttpHeaders } from 'http';

const COOKIE_HEADER = 'cookie';

export const getCookieHeader = (
  headers?: IncomingHttpHeaders
): string | undefined => {
  if (!headers) {
    return undefined;
  }

  const cookieHeader = headers[COOKIE_HEADER];
  if (Array.isArray(cookieHeader)) {
    return cookieHeader.join('; ');
  }

  return cookieHeader;
};
