export function validateConfidence(value: number): number {
  return Math.max(0, Math.min(5, Math.round(value)))
}
