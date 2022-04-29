/**
 * An object of timing data including cycle, elapsed, period, start, and stop.
 *
 * @type {Object}
 */
export interface Times {

  /**
   * The time taken to complete the last cycle (secs).
   *
   * @type {number}
   */
  cycle: number;

  /**
   * The time taken to complete the benchmark (secs).
   *
   * @type {number}
   */
  elapsed: number;

  /**
   * The time taken to execute the test once (secs).
   *
   * @type {number}
   */
  period: number;

  /**
   * A timestamp of when the benchmark started (ms).
   *
   * @type {number}
   */
  timeStamp: number;
}
