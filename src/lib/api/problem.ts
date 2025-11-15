import type { ProblemDetails } from './types'

const DEFAULT_PROBLEM_TITLE = 'Request failed'

const normalizeDetail = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export const parseProblemDetails = async (
  response: Response
): Promise<ProblemDetails> => {
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''

  if (contentType.includes('json')) {
    try {
      const data = (await response.clone().json()) as unknown

      if (data && typeof data === 'object') {
        const raw = data as Record<string, unknown>
        const normalized: ProblemDetails = {
          ...raw,
          type: typeof raw.type === 'string' ? raw.type : 'about:blank',
          title:
            typeof raw.title === 'string'
              ? raw.title
              : response.statusText || DEFAULT_PROBLEM_TITLE,
          status: typeof raw.status === 'number' ? raw.status : response.status,
          detail: normalizeDetail(raw.detail),
        }

        return normalized
      }
    } catch (error) {
      // Fall back to text parsing when JSON parsing fails
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Failed to parse problem+json payload', error)
      }
    }
  }

  try {
    const text = await response.clone().text()
    const detail = normalizeDetail(text)

    return {
      type: 'about:blank',
      title: response.statusText || DEFAULT_PROBLEM_TITLE,
      status: response.status,
      detail,
    }
  } catch {
    return {
      type: 'about:blank',
      title: response.statusText || DEFAULT_PROBLEM_TITLE,
      status: response.status,
    }
  }
}
