export function applyIfDefined<T, R>(
  value: T | null | undefined,
  fn: (val: T) => R,
): R | null {
  if (value === null || value === undefined) {
    return null;
  }
  return fn(value);
}
