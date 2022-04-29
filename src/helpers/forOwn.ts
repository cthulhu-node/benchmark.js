import type { AnyObject } from "../types/AnyObject";

export function forOwn(object: AnyObject, iteratee) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      if (iteratee(object[key], key, object) === false) {
        break;
      }
    }
  }
}
