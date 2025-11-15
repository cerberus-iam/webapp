export type Result<T, E = unknown> = Ok<T> | Err<E>;

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E> {
  readonly ok: false;
  readonly error: E;
}

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });

export const err = <E>(error: E): Err<E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is Err<E> =>
  !result.ok;

export const map = <T, U, E>(
  result: Result<T, E>,
  mapper: (value: T) => U
): Result<U, E> => (result.ok ? ok(mapper(result.value)) : result);

export const mapErr = <T, E, F>(
  result: Result<T, E>,
  mapper: (error: E) => F
): Result<T, F> => (result.ok ? result : err(mapper(result.error)));

export const unwrapOr = <T, E>(result: Result<T, E>, fallback: T): T =>
  result.ok ? result.value : fallback;
