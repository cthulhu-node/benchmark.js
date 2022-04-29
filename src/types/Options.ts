import type { ThisBenchmarkFunction } from "./ThisBenchmarkFunction";

export interface Options {
  args?: any | any[];
  /**
   * A flag to indicate that benchmark cycles will execute asynchronously
   * by default.
   *
   * @type {boolean}
   */
  async?: boolean | undefined;

  /**
   * A flag to indicate that the benchmark clock is deferred.
   *
   * @type {boolean}
   * @default false
   */
  defer?: boolean | undefined;

  /**
   * The delay between test cycles (secs).
   *
   * @type {number}
   * @default 0.005
   */
  delay?: number | undefined;

  /**
   * Displayed by `Benchmark#toString` when a `name` is not available
   * (auto-generated if absent).
   *
   * @type {string}
   */
  id?: string | undefined;

  /**
   * The default number of times to execute a test on a benchmark's first cycle.
   *
   * @type {number}
   */
  initCount?: number | undefined;

  /**
   * The maximum time a benchmark is allowed to run before finishing (secs).
   *
   * Note: Cycle delays aren't counted toward the maximum time.
   *
   * @type {number}
   * @default 5
   */
  maxTime?: number | undefined;

  /**
   * The minimum sample size required to perform statistical analysis.
   *
   * @type {number}
   * @default 5
   */
  minSamples?: number | undefined;

  /**
   * The time needed to reduce the percent uncertainty of measurement to 1% (secs).
   *
   * @type {number}
   * @default 0
   */
  minTime?: number | undefined;

  /**
   * The name of the benchmark.
   *
   * @type {string}
   */
  name?: string | undefined;

  /**
   * An event listener called when the benchmark is aborted.
   *
   * @type Function
   */
  onAbort?: Function | undefined;

  /**
   * An event listener called when the benchmark completes running.
   *
   * @type Function
   */
  onComplete?: Function | undefined;

  /**
   * An event listener called after each run cycle.
   *
   * @type Function
   */
  onCycle?: Function | undefined;

  /**
   * An event listener called when a test errors.
   *
   * @type Function
   */
  onError?: Function | undefined;

  /**
   * An event listener called when the benchmark is reset.
   *
   * @type Function
   */
  onReset?: Function | undefined;

  /**
   * An event listener called when the benchmark starts running.
   *
   * @type Function
   */
  onStart?: Function | undefined;

  setup?: ThisBenchmarkFunction | string | undefined;
  teardown?: ThisBenchmarkFunction | string | undefined;
  fn?: Function | string | undefined;
  queued?: boolean | undefined;
}