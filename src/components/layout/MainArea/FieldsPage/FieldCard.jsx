// src/components/layout/MainArea/FieldsPage/FieldCard.jsx
import { MapContainer, TileLayer, Polygon } from "react-leaflet";

const DEFAULT_CENTER = [49.0, 32.0];
const DEFAULT_ZOOM = 15;

function getPolygonPointsFromGeometry(geometry) {
  if (
    !geometry ||
    geometry.type !== "Polygon" ||
    !Array.isArray(geometry.coordinates) ||
    geometry.coordinates.length === 0
  ) {
    return null;
  }

  const ring = geometry.coordinates[0] || [];
  const cleaned = ring.slice(0, -1);
  if (!cleaned.length) return null;

  return cleaned.map(([lng, lat]) => ({ lat, lng }));
}

function getCenterFromPoints(points) {
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

function FieldCard({ field, onClick }) {
  const points = getPolygonPointsFromGeometry(field.geometry);
  const center =
    field.mapView?.center ||
    (points ? getCenterFromPoints(points) : DEFAULT_CENTER);
  const zoom = field.mapView?.zoom ?? DEFAULT_ZOOM;

  const mapKey = `${field.id}-${center[0].toFixed(4)}-${center[1].toFixed(
    4
  )}-${zoom}`;

  const attributes = field.attributes || [];

  return (
    <div className="field-card" onClick={onClick}>
      <div className="field-card__map">
        <MapContainer
          key={mapKey}
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          dragging={false}
          zoomControl={false}
          attributionControl={false}
        >
          {/* Супутниковий фон */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            zIndex={1}
          />

          {/* Білі підписи населених пунктів поверх супутника (як раніше) */}
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            opacity={0.9}
            zIndex={2}
          />

          {points && points.length >= 3 && (
            <Polygon positions={points} pathOptions={{ weight: 2 }} />
          )}
        </MapContainer>
      </div>

      <div className="field-card__info">
        <div>
          <strong>{field.name || "Без назви"}</strong>
        </div>

        {attributes.map((attr) => (
          <div key={attr.id || attr.label}>
            {attr.label}: {attr.value || "—"}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FieldCard;
