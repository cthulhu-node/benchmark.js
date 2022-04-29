export function getScore(xA: number, sampleB: number[]): number {
  let total = 0;
  for (let i = 0, il = sampleB.length; i < il; ++i) {
    total += (sampleB[i] > xA ? 0 : sampleB[i] < xA ? 1 : 0.5);
  }
  return total;
}