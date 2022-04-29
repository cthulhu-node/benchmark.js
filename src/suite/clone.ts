import { cloneDeep } from "../helpers/cloneDeep";
import { has } from "../helpers/has";

export function cloneSuite(suite, options) {
  const result = new suite.constructor(Object.assign({}, suite.options, options));

  // Copy own properties.
  const keys = Object.keys(suite);
  for (let i = 0, il = keys.length; i < il; ++i) {
    const key = keys[i],
      value = suite[keys[i]];
    if (!has(result, key)) {
      result[key] = typeof (value && value.clone) === 'function'
        ? value.clone()
        : cloneDeep(value);
    }
  }
  return result;
}
