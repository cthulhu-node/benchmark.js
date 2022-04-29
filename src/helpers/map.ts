import { AnyObject } from "../types/AnyObject";

export function map(collection: AnyObject | Array<any>, iteratee: Function | string): any[] {
  const result = [];

  if (typeof iteratee === 'string') {
    const keys = Object.keys(collection);
    for (let i = 0, il = keys.length; i < il; ++i) {
      const key = keys[i];
      if (collection[key][iteratee] !== undefined) {
        result.push(collection[key][iteratee]);
      }
    }
    return result;
  }
  if (Array.isArray(collection)) {
    for (var i = 0, il = collection.length; i < il; ++i) {
      result.push(iteratee(collection[i], i, collection));
    }
    return result;
  }
  if (typeof collection === 'object' && collection !== null) {
    const keys = Object.keys(collection);
    for (let i = 0, il = keys.length; i < il; ++i) {
      const key = keys[i];
      result.push(iteratee(collection[key], key, collection));
    }
    return result;
  }
}