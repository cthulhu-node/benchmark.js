import { getScore } from "./getScore";

export function getU(sampleA: number[], sampleB: number[]): number {
  let total = 0;
  for (let i = 0, il = sampleA.length; i < il; ++i) {
    total += getScore(sampleA[i], sampleB);
  }
  return total;
}
