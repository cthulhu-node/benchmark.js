/**
 * Computes the arithmetic mean of a sample.
 */
export function getMean(sample: number[]): number {
  if (sample.length === 0) {
    return 0;
  }

  let result = 0;
  let i = 0;
  const il = sample.length;
  for (; i < il; ++i) {
    result += sample[i];
  }
  return result / sample.length;
}
