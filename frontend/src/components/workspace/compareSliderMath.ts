/** Clamp wipe position to 0–100 (percent from left = before width). */
export function clampComparePercent(value: number): number {
  if (Number.isNaN(value)) return 50
  return Math.min(100, Math.max(0, value))
}

export function percentFromPointer(
  clientX: number,
  rectLeft: number,
  rectWidth: number,
): number {
  if (rectWidth <= 0) return 50
  return clampComparePercent(((clientX - rectLeft) / rectWidth) * 100)
}
