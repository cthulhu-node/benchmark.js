import { AnyObject } from "../types/AnyObject";

export function reduce(collection: AnyObject | Array<any>, iteratee: Function, initialValue: any): any {
    if (Array.isArray(collection)) {
      if (collection.length === 0) {
        return initialValue;
      }
      let value = initialValue || collection[0];
  
      for (let i = 1, il = collection.length; i < il; ++i) {
        value = iteratee(value, collection[i], i, collection);
      }
      return value;
    }
  
    if (typeof collection === 'object' && collection !== null) {
      let keys = Object.keys(collection);
  
      if (keys.length === 0) {
        return initialValue;
      }
      let value = initialValue || collection[keys[0]];
  
      for (let i = 0, il = keys.length; i < il; ++i) {
        const key = keys[i];
        value = iteratee(value, collection[key], key, collection);
      }
      return value;
    }
  }