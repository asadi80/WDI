function scale(features, mean, scale) {
  return features.map((v, i) => (v - mean[i]) / scale[i]);
}

export function mlAnomalyScore(features, model) {
  const scaled = scale(
    features,
    model.mean,
    model.scale
  );

  // Simple distance-based fallback score
  const dist = Math.sqrt(
    scaled.reduce((sum, v) => sum + v * v, 0)
  );

  // Normalize to 0–100 anomaly score
  return Math.min(100, Math.round(dist * 20));
}
