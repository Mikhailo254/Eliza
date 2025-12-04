// Спільні константи та утиліти для роботи з геометрією полів

export const DEFAULT_CENTER = [49.0, 32.0];
export const DEFAULT_ZOOM = 15;

// Перетворення GeoJSON Polygon → масив точок {lat, lng}
export function geometryToPoints(geometry) {
  if (
    !geometry ||
    geometry.type !== "Polygon" ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length === 0
  ) {
    return [];
  }

  const ring = geometry.coordinates[0] || [];
  // прибираємо останню дубльовану точку (якщо є)
  const cleaned = ring.slice(0, -1);
  if (!cleaned.length) return [];

  return cleaned.map(([lng, lat]) => ({ lat, lng }));
}

// Обчислення центру масиву точок
export function getCenterFromPoints(points) {
  if (!points || points.length === 0) return DEFAULT_CENTER;

  const { latSum, lngSum } = points.reduce(
    (acc, p) => ({
      latSum: acc.latSum + p.lat,
      lngSum: acc.lngSum + p.lng,
    }),
    { latSum: 0, lngSum: 0 }
  );

  const n = points.length;
  return [latSum / n, lngSum / n];
}
