import type { Context } from "../types/Context";

/**
 * Computes the variance of a sample.
 */
export function getVariance(sample: number[], mean: number, size: number, context: Context): number {
  if (sample.length === 0) {
    return 0;
  }
  var result = 0;

  for (var i = 0, il = sample.length; i < il; ++i) {
    result += context.Math.pow(sample[i] - mean, 2);
  }
  return result / (size - 1);
}