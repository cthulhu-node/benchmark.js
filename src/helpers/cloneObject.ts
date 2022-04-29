import { AnyObject } from "../types/AnyObject";
import { cloneDeep } from "./cloneDeep";

export function cloneObject(obj: AnyObject): AnyObject {
  const ret = {};

  let key = '';
  const keys = Object.keys(obj);

  for (let i = 0, il = keys.length; i < il; ++i) {
    key = keys[i];
    ret[key] = cloneDeep(obj[key]);
  }

  return ret;
}