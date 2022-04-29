import { isArrayLikeObject } from "../helpers/isArrayLikeObject";
import type { AnyObject } from "../types/AnyObject";

export function join(object: AnyObject, separator1?: string, separator2?: string) {
  const result = [];

  separator2 || (separator2 = ': ');

  if (Array.isArray(object)) {
    return object.join(separator1 || ',');
  } else if (isArrayLikeObject(object)) {
    for (let i = 0, il = object.length; i < il; ++i) {
      result.push(object[i]);
    }
    return result.join(separator1 || ',');
  } else {
    const keys = Object.keys(object);
    for (let i = 0, il = keys.length; i < il; ++i) {
      result.push(keys[i] + separator2 + object[keys[i]]);
    }
    return result.join(separator1 || ',');
  }
}
