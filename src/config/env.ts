import { z } from 'zod';

const urlSchema = z
  .string()
  .url()
  .transform((value) => value.replace(/\/+$/, ''));

const envSchema = z.object({
  NEXT_PUBLIC_IAM_API_BASE_URL: urlSchema,
  NEXT_PUBLIC_APP_URL: urlSchema.optional(),
  NEXT_PUBLIC_DEFAULT_ORG_SLUG: z.string().min(1).optional(),
  IAM_API_URL: urlSchema.optional(),
});

type EnvSchema = z.infer<typeof envSchema>;

type RawEnv = {
  [K in keyof EnvSchema]: string | undefined;
};

const clean = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const rawEnv: RawEnv = {
  NEXT_PUBLIC_IAM_API_BASE_URL:
    clean(process.env.NEXT_PUBLIC_IAM_API_BASE_URL) ??
    clean(process.env.IAM_API_URL),
  NEXT_PUBLIC_APP_URL: clean(process.env.NEXT_PUBLIC_APP_URL),
  NEXT_PUBLIC_DEFAULT_ORG_SLUG: clean(process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG),
  IAM_API_URL: clean(process.env.IAM_API_URL),
};

const parsedEnv = envSchema.safeParse(rawEnv);

const fallbackEnv: RawEnv = {
  NEXT_PUBLIC_IAM_API_BASE_URL:
    clean(process.env.IAM_API_URL) ?? 'http://localhost:4000',
  NEXT_PUBLIC_APP_URL:
    clean(process.env.NEXT_PUBLIC_APP_URL) ?? 'http://localhost:3000',
  NEXT_PUBLIC_DEFAULT_ORG_SLUG: clean(process.env.NEXT_PUBLIC_DEFAULT_ORG_SLUG),
  IAM_API_URL: clean(process.env.IAM_API_URL) ?? 'http://localhost:4000',
};

let resolved: EnvSchema;

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors;
  console.warn(
    'Invalid environment configuration detected, falling back to defaults',
    errors
  );

  const fallbackResult = envSchema.safeParse(fallbackEnv);
  if (!fallbackResult.success) {
    console.error(
      'Fallback environment configuration invalid',
      fallbackResult.error.flatten().fieldErrors
    );
    throw new Error('Invalid environment configuration for Next.js app');
  }

  resolved = fallbackResult.data;
} else {
  resolved = parsedEnv.data;
}

const iamApiBaseUrl =
  resolved.IAM_API_URL ?? resolved.NEXT_PUBLIC_IAM_API_BASE_URL;

export const env = Object.freeze({
  ...resolved,
  iamApiBaseUrl,
});

export type AppEnv = typeof env;

export const getEnv = (): AppEnv => env;

export const getIamApiBaseUrl = (): string => env.iamApiBaseUrl;

export const getDefaultOrgSlug = (): string | undefined =>
  env.NEXT_PUBLIC_DEFAULT_ORG_SLUG;
