import type { Context } from "../types/Context";

/**
 * Computes the variance of a sample.
 */
export function getVariance(sample: number[], mean: number, size: number, context: Context): number {
  if (sample.length === 0) {
    return 0;
  }
  let result = 0;
  let i = 0;
  const il = sample.length;
  for (; i < il; ++i) {
    result += context.Math.pow(sample[i] - mean, 2);
  }
  return result / (size - 1);
}