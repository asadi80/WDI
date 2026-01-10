export function computeWaferFeatures(defects) {
  const n = defects.length;

  if (!n) return {};

  const sizes = defects.map(d => d.defectSizeNm || 0);
  const avg = sizes.reduce((a, b) => a + b, 0) / n;

  const std = Math.sqrt(
    sizes.reduce((s, v) => s + (v - avg) ** 2, 0) / n
  );

  const cx =
    defects.reduce((s, d) => s + d.x, 0) / n;
  const cy =
    defects.reduce((s, d) => s + d.y, 0) / n;

  return {
    defectCount: n,
    avgDefectSize: avg,
    stdDefectSize: std,
    spatial: {
      centroidX: cx,
      centroidY: cy
    }
  };
}
