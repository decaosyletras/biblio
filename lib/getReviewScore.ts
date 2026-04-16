export function getReviewScore(metrics: { id: number; value: number }[]
) {
  const total = metrics.reduce((acc, m) => acc + m.value, 0)
  return (total / metrics.length).toFixed(1)
}