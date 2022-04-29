import type { AnyObject } from "../types/AnyObject";

const objectCtorString = Object.prototype.toString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * isPlainObject(new Foo);
 * // => false
 *
 * isPlainObject([1, 2, 3]);
 * // => false
 *
 * isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * isPlainObject(Object.create(null));
 * // => true
 */
 export function isPlainObject<T = AnyObject>(value: unknown): value is T {
    if (typeof value !== 'object' || value === null) {
      return false;
    }
    const proto = Object.getPrototypeOf(value);
    if (proto === null) {
      return true;
    }
    const Ctor = Object.hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor === 'function' && Ctor instanceof Ctor &&
      Object.prototype.toString.call(Ctor) === objectCtorString;
  }
  