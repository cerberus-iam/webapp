import { type ApiError, isNetworkError } from './types'

export type FieldErrorMap = Record<string, string[]>

const appendError = (
  map: FieldErrorMap,
  field: string,
  message: string | undefined
): void => {
  if (!message) {
    return
  }

  const key = field.trim() || 'form'
  if (!map[key]) {
    map[key] = []
  }

  if (!map[key].includes(message)) {
    map[key].push(message)
  }
}

const extractFromArray = (errors: unknown, map: FieldErrorMap): void => {
  if (!Array.isArray(errors)) {
    return
  }

  for (const entry of errors) {
    if (!entry) {
      continue
    }

    if (typeof entry === 'string') {
      appendError(map, 'form', entry)
      continue
    }

    if (typeof entry === 'object') {
      const issue = entry as Record<string, unknown>
      const pathValue = issue.path
      const path = Array.isArray(pathValue)
        ? pathValue
            .filter(
              (segment) =>
                typeof segment === 'string' || typeof segment === 'number'
            )
            .join('.')
        : typeof pathValue === 'string'
          ? pathValue
          : ''
      appendError(
        map,
        path,
        typeof issue.message === 'string' ? issue.message : undefined
      )
      continue
    }

    appendError(map, 'form', String(entry))
  }
}

const extractFromObject = (errors: unknown, map: FieldErrorMap): void => {
  if (!errors || typeof errors !== 'object' || Array.isArray(errors)) {
    return
  }

  const record = errors as Record<string, unknown>
  for (const [field, value] of Object.entries(record)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string') {
          appendError(map, field, item)
        } else if (item && typeof item === 'object') {
          const message = (item as { message?: string }).message
          appendError(
            map,
            field,
            typeof message === 'string' ? message : undefined
          )
        } else if (item !== undefined && item !== null) {
          appendError(map, field, String(item))
        }
      }
      continue
    }

    if (typeof value === 'string') {
      appendError(map, field, value)
      continue
    }

    if (value && typeof value === 'object') {
      const message = (value as { message?: string }).message
      appendError(map, field, typeof message === 'string' ? message : undefined)
      continue
    }

    if (value !== undefined && value !== null) {
      appendError(map, field, String(value))
    }
  }
}

export const extractFieldErrors = (error: ApiError): FieldErrorMap => {
  const map: FieldErrorMap = {}

  if (!error || typeof error !== 'object') {
    return map
  }

  const rawErrors = (error as Record<string, unknown>).errors
  extractFromArray(rawErrors, map)
  extractFromObject(rawErrors, map)

  return map
}

export const getProblemMessage = (error: ApiError): string => {
  if (isNetworkError(error)) {
    const detail = typeof error.detail === 'string' ? error.detail.trim() : ''
    if (detail) {
      const normalized = detail.toLowerCase()
      if (
        normalized !== 'failed to fetch' &&
        normalized !== 'network request failed'
      ) {
        return detail
      }
    }

    return 'Unable to reach the Cerberus IAM API. Check your connection or try again shortly.'
  }

  const detail = typeof error.detail === 'string' ? error.detail.trim() : ''
  if (detail) {
    return detail
  }

  const title = typeof error.title === 'string' ? error.title.trim() : ''
  if (title) {
    return title
  }

  return 'Request failed. Please try again.'
}
