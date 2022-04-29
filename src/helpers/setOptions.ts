import type { AnyObject } from "../types/AnyObject";
import { cloneDeep } from "./cloneDeep";
import { each } from "./each";
import { has } from "./has";

const onEventRE = /^on[A-Z]/;
/**
 * A helper function for setting options/event handlers.
 */
// TODO
export function setOptions(object: AnyObject, options: AnyObject): void {
  // @ts-ignore
  options = object.options = Object.assign({}, cloneDeep(object.constructor.options), cloneDeep(options));

  var keys = Object.keys(options);
  for (var i = 0, il = keys.length; i < il; ++i) {
    var key = keys[i],
      value = options[keys[i]];
    if (value != null) {
      // Add event listeners.
      if (onEventRE.test(key)) {
        var onEventKeys = key.indexOf(' ') === -1
          ? [key]
          : key.split(' ');

        each(onEventKeys, function (key) {
          object.on(key.slice(2).toLowerCase(), value);
        });
      } else if (!has(object, key)) {
        object[key] = cloneDeep(value);
      }
    }
  }
}