/**
 * Computes the arithmetic mean of a sample.
 */
export function getMean(sample: number[]): number {
  if (sample.length === 0) {
    return 0;
  }

  var result = 0;

  for (var i = 0, il = sample.length; i < il; ++i) {
    result += sample[i];
  }
  return result / sample.length;
}
