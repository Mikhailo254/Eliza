// src/components/layout/MainArea/FieldsPage/FieldCard.jsx
import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  geometryToPoints,
  getCenterFromPoints,
} from "./fieldGeometry";

function FieldCard({ field, onClick }) {
  const points = geometryToPoints(field.geometry);
  const center =
    field.mapView?.center ||
    (points.length ? getCenterFromPoints(points) : DEFAULT_CENTER);
  const zoom = field.mapView?.zoom ?? DEFAULT_ZOOM;

  // key, щоб карта перемаунчувалась, коли центр/зум змінюються
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

          {/* Білі підписи населених пунктів поверх супутника */}
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
            attribution=""
            opacity={0.9}
            zIndex={2}
          />

          {points.length >= 3 && (
            <Polygon positions={points} pathOptions={{ weight: 2 }} />
          )}
        </MapContainer>
      </div>

      <div className="field-card__info">
        <div>
          <strong>{field.name || "Без назви"}</strong>
        </div>

        {attributes.map((attr) => (
          <div key={attr.id || attr.label} className="info-row">
            <span className="label">{attr.label}:</span>

            <span className="value">{attr.value || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FieldCard;
