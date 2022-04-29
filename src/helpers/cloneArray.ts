import { cloneDeep } from "./cloneDeep";

export function cloneArray(arr: any[]): any[] {
  var ret = new Array(arr.length);

  for (var i = 0, il = arr.length; i < il; ++i) {
    ret[i] = cloneDeep(arr[i]);
  }

  return ret;
}