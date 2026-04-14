export function getReviewScore(metrics: Record<string, number>) {
  const values = Object.values(metrics)
  const avg =
    values.reduce((acc, val) => acc + val, 0) / values.length

  return avg.toFixed(1)
}