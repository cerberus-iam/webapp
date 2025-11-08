import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default(process.env.NODE_ENV ?? "development"),
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Admin Web Portal"),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_TENANT_SLUG: z.string().min(1).optional(),
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  IAM_API_URL: z.string().url(),
  IAM_TOKEN_AUDIENCE: z.string().min(1),
  IAM_DEFAULT_TENANT_ID: z.string().min(1).default("primary"),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  SENTRY_DSN: z.string().url().or(z.literal("")).optional().default(""),
});

const pickWithFallback = (
  primary: string | undefined,
  fallbacks: Array<string | undefined>,
  defaultValue?: string,
): string | undefined => {
  const candidates = [primary, ...fallbacks];
  for (const candidate of candidates) {
    if (candidate && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }
  return defaultValue;
};

const missingEnvMessage = (keys: string[]) =>
  `Missing environment configuration. Please set one of: ${keys.join(", ")}`;

const resolvedNextPublicApiUrl = pickWithFallback(process.env.NEXT_PUBLIC_API_URL, [
  process.env.IAM_API_URL,
  process.env.CERBERUS_IAM_URL,
]);
const resolvedIamApiUrl = pickWithFallback(process.env.IAM_API_URL, [
  process.env.CERBERUS_IAM_URL,
  resolvedNextPublicApiUrl,
]);
const resolvedTokenAudience =
  pickWithFallback(process.env.IAM_TOKEN_AUDIENCE, [
    process.env.CERBERUS_IAM_CLIENT_ID,
    process.env.NEXT_PUBLIC_IAM_CLIENT_ID,
  ]) ?? "cerberus-admin";

if (!resolvedNextPublicApiUrl) {
  throw new Error(missingEnvMessage(["NEXT_PUBLIC_API_URL", "IAM_API_URL", "CERBERUS_IAM_URL"]));
}

if (!resolvedIamApiUrl) {
  throw new Error(missingEnvMessage(["IAM_API_URL", "CERBERUS_IAM_URL"]));
}

const parsed = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_URL: resolvedNextPublicApiUrl,
  NEXT_PUBLIC_TENANT_SLUG: process.env.NEXT_PUBLIC_TENANT_SLUG,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  IAM_API_URL: resolvedIamApiUrl,
  IAM_TOKEN_AUDIENCE: resolvedTokenAudience,
  IAM_DEFAULT_TENANT_ID: process.env.IAM_DEFAULT_TENANT_ID,
  LOG_LEVEL: process.env.LOG_LEVEL,
  SENTRY_DSN: process.env.SENTRY_DSN,
});

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

const result = parsed.data;

const resolvedSecret =
  result.NEXTAUTH_SECRET ??
  (result.NODE_ENV === "development" || result.NODE_ENV === "test"
    ? "local-development-secret"
    : process.env.NETLIFY
      ? "netlify-placeholder-secret"
      : undefined);

const resolvedTenantSlug = result.NEXT_PUBLIC_TENANT_SLUG ?? result.IAM_DEFAULT_TENANT_ID;

export const env = {
  ...result,
  NEXT_PUBLIC_TENANT_SLUG: resolvedTenantSlug,
  NEXTAUTH_SECRET: resolvedSecret,
};

export const publicEnv = {
  NEXT_PUBLIC_APP_NAME: env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_API_URL: env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_TENANT_SLUG: env.NEXT_PUBLIC_TENANT_SLUG,
};

export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
export const isProd = env.NODE_ENV === "production";
