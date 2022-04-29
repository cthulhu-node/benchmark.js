import { isArrayLikeObject } from "../helpers/isArrayLikeObject";
import { cloneArray } from "./cloneArray";

export function toArray(value: ArrayLike<any>): any[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return cloneArray(value);
  }

  if (isArrayLikeObject(value)) {
    const result = new Array(value.length);
    for (let i = 0, il = value.length; i < il; ++i) {
      result[i] = value[i];
    }
    return result;
  }

  throw new TypeError('Expected an ArrayLikeObject');
}