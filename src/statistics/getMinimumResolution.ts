import { getMean } from "../math/getMean";
import type { AnyObject } from "../types/AnyObject";

/**
 * Gets the current timer's minimum resolution (secs).
 */
export function getMinimumResolution(timer: AnyObject, unit: string) {
  let measured: number,
    begin: number,
    count = 30,
    divisor = 1e3,
    ns = timer.ns,
    sample = [];

  // Get average smallest measurable time.
  while (count--) {
    if (unit === 'us') {
      divisor = 1e6;
      if (ns.stop) {
        ns.start();
        while (!(measured = ns.microseconds())) { }
      } else {
        begin = ns();
        while (!(measured = ns() - begin)) { }
      }
    }
    else if (unit === 'ns') {
      divisor = 1e9;
      begin = (begin = ns())[0] + (begin[1] / divisor);
      while (!(measured = ((measured = ns())[0] + (measured[1] / divisor)) - begin)) { }
      divisor = 1;
    }
    else if (ns.now) {
      begin = (+ns.now());
      while (!(measured = (+ns.now()) - begin)) { }
    }
    else {
      begin = new ns().getTime();
      while (!(measured = new ns().getTime() - begin)) { }
    }
    // Check for broken timers.
    if (measured > 0) {
      sample.push(measured);
    } else {
      sample.push(Infinity);
      break;
    }
  }
  // Convert to seconds.
  return getMean(sample) / divisor;
}
