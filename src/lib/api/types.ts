export interface ProblemDetails {
  type?: string
  title: string
  status: number
  detail?: string
  instance?: string
  [key: string]: unknown
}

export interface NetworkError extends ProblemDetails {
  type: 'network_error'
  status: 0
  cause?: unknown
}

export type ApiError = ProblemDetails | NetworkError

export const isProblemDetails = (value: unknown): value is ProblemDetails => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const maybe = value as Record<string, unknown>
  return typeof maybe.title === 'string' && typeof maybe.status === 'number'
}

export const isNetworkError = (value: unknown): value is NetworkError => {
  if (!isProblemDetails(value)) {
    return false
  }

  return value.type === 'network_error' && value.status === 0
}

export const createNetworkError = (cause: unknown): NetworkError => {
  const message =
    cause instanceof Error ? cause.message : 'Network request failed'

  return {
    type: 'network_error',
    title: 'Network Error',
    status: 0,
    detail: message,
    cause,
  }
}
