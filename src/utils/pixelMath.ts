/**
 * Returns average RGB diff between pixel at `index` in data vs bgModel.
 * `index` is the byte offset (multiple of 4 for RGBA data).
 */
export function pixelDiff(
  data: Uint8ClampedArray,
  bgModel: Float32Array,
  index: number
): number {
  const dr = Math.abs(data[index]     - bgModel[index]);
  const dg = Math.abs(data[index + 1] - bgModel[index + 1]);
  const db = Math.abs(data[index + 2] - bgModel[index + 2]);
  return (dr + dg + db) / 3;
}

/**
 * Updates bgModel[index..index+2] toward data values with given alpha
 * (exponential moving average, RGB channels only).
 */
export function updateBgModel(
  bgModel: Float32Array,
  data: Uint8ClampedArray,
  index: number,
  alpha: number
): void {
  bgModel[index]     += alpha * (data[index]     - bgModel[index]);
  bgModel[index + 1] += alpha * (data[index + 1] - bgModel[index + 1]);
  bgModel[index + 2] += alpha * (data[index + 2] - bgModel[index + 2]);
}
