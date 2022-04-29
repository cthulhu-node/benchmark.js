import { formatNumber } from "../helpers/formatNumber";
import { join } from "../invoke/join";

export function toString() {
  const bench = this;
  const error = bench.error,
    hz = bench.hz,
    id = bench.id,
    stats = bench.stats,
    size = stats.sample.length,
    pm = '\xb1';
  let result = bench.name || (Number.isNaN(id) ? id : '<Test #' + id + '>');

  if (error) {
    var errorStr;
    if (typeof error !== 'object') {
      errorStr = String(error);
    } else if (!(error instanceof Error)) {
      errorStr = join(error);
    } else {
      // Error#name and Error#message properties are non-enumerable.
      errorStr = join(Object.assign({ 'name': error.name, 'message': error.message }, error));
    }
    result += ': ' + errorStr;
  }
  else {
    result += ' x ' + formatNumber(hz.toFixed(hz < 100 ? 2 : 0)) + ' ops/sec ' + pm +
      stats.rme.toFixed(2) + '% (' + size + ' run' + (size === 1 ? '' : 's') + ' sampled)';
  }
  return result;
}