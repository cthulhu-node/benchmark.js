import type { Context } from "../types/Context";

/** Used to detect primitive types. */
const rePrimitive = /^(?:boolean|number|string|undefined)$/;

/**
 * Host objects can return type values that are different from their actual
 * data type. The objects we are concerned with usually return non-primitive
 * types of "object", "function", or "unknown".
 */
export function isHostType(object: { [key: string]: any; }, property: keyof Context) {
  if (object == null) {
    return false;
  }
  var type = typeof object[property];
  return !rePrimitive.test(type) && (type != 'object' || !!object[property]);
}