import type { AnyObject } from "../types/AnyObject";

export function each(collection: AnyObject | Array<any>, iteratee: Function): void {
  if (Array.isArray(collection)) {
    for (let i = 0, il = collection.length; i < il; ++i) {
      if (iteratee(collection[i], i, collection) === false) {
        break;
      };
    }
  } else if (typeof collection === 'object' && collection !== null) {
    const keys = Object.keys(collection);
    for (let i = 0, il = keys.length; i < il; ++i) {
      const key = keys[i];
      if (iteratee(collection[key], key, collection) === false) {
        break;
      };
    }
  }
}
