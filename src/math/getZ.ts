import type { Context } from "../types/Context";

export function getZ(u: number, size1: number, size2: number, context: Context) {
  return (u - ((size1 * size2) / 2)) / context.Math.sqrt((size1 * size2 * (size1 + size2 + 1)) / 12);
}
