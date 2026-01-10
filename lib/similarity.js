function zScore(value, mean, std) {
  return std === 0 ? 0 : Math.abs(value - mean) / std;
}

export function computeSimilarity(target, references) {
  const metrics = ["defectDensity", "meanSize", "spatialEntropy"];

  let score = 0;

  for (const m of metrics) {
    const values = references.map(r => r[m]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
    );

    score += zScore(target[m], mean, std);
  }

  score /= metrics.length;

  let alert = "GREEN";
  if (score > 2) alert = "YELLOW";
  if (score > 3.5) alert = "RED";

  return {
    score: Number(score.toFixed(2)),
    alert
  };
}
