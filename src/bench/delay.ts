/**
 * Delay the execution of a function based on the benchmark's `delay` property.
 */
export function delay(bench, fn: Function) {
  bench._timerId = setTimeout(fn, bench.delay * 1e3);
}
