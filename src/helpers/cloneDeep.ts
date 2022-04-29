import { cloneObject } from "./cloneObject";
import { cloneArray } from "./cloneArray";
import { isPlainObject } from "./isPlainObject";

/**
 * A specialized version of lodashs `cloneDeep` which only clones arrays and plain
 * objects assigning all other values by reference.
 */
export function cloneDeep(value: any): any {
  if (Array.isArray(value)) {
    return cloneArray(value);
  }

  if (isPlainObject(value)) {
    return cloneObject(value);
  }

  return value;
}