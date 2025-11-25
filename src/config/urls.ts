/**
 * External URL configuration for the admin console.
 * These are the public-facing URLs for various Cerberus IAM services.
 */

export const urls = {
  /** Main marketing website */
  website: 'https://cerberus-iam.com',

  /** API base URL */
  api: 'https://api.cerberus-iam.com',

  /** Documentation site */
  docs: 'https://docs.cerberus-iam.com',

  /** Admin console (this app) */
  console: 'https://app.cerberus-iam.com',

  /** GitHub organization */
  github: 'https://github.com/cerberus-iam',

  /** Status page */
  status: 'https://status.cerberus-iam.com',
} as const;

/**
 * Helper to build documentation URLs
 */
export const docsUrl = (path?: string): string => {
  if (!path) return urls.docs;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${urls.docs}${cleanPath}`;
};

export type Urls = typeof urls;
