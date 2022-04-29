/**
 * Checks if a value can be safely coerced to a string.
 */
export function isStringable(value: any): boolean {
  return (
    typeof value === 'string' ||
    (
      !!value && value.hasOwnProperty('toString') &&
      typeof value.toString === 'function'
    )
  )
}
