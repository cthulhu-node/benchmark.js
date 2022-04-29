/**
 * Gets the name of the first argument from a function's source.
 */
export function getFirstArgument(fn: Function): string {
  return (
    typeof fn === 'function' &&
    !('toString' in fn) &&
    (/^[\s(]*function[^(]*\(([^\s,)]+)/.exec(fn as unknown as string) || 0)[1]) || '';
}
