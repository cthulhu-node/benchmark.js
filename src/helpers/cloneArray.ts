import { cloneDeep } from "./cloneDeep";

export function cloneArray(arr: any[]): any[] {
  const il = arr.length;
  const ret = new Array(il);
  let i = 0;
  for (; i < il; ++i) {
    ret[i] = cloneDeep(arr[i]);
  }

  return ret;
}