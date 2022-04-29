
/**
 * An object of stats including mean, margin or error, and standard deviation.
 *
 * @type {Object}
 */
export interface Stats {
  /**
   * The margin of error.
   *
   * @type {number}
   */
  moe: number;

  /**
   * The relative margin of error (expressed as a percentage of the mean).
   *
   * @type {number}
   */
  rme: number;

  /**
   * The standard error of the mean.
   *
   * @type {number}
   */
  sem: number;

  /**
   * The sample standard deviation.
   *
   * @type {number}
   */
  deviation: number;

  /**
   * The sample arithmetic mean (secs).
   *
   * @type {number}
   */
  mean: number;
  /**
   * The array of sampled periods.
   *
   * @type Array
   */
  sample: any[];

  /**
   * The sample variance.
   *
   * @memberOf Benchmark#stats
   * @type {number}
   */
  variance: number;
}
