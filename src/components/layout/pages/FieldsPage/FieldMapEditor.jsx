// src/components/layout/MainArea/FieldsPage/FieldMapEditor.jsx
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import area from "@turf/area";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  geometryToPoints,
} from "./fieldGeometry";

function FieldMapEditor({ geometry, view, onGeometryChange, onViewChange }) {
  const [points, setPoints] = useState([]);

  useEffect(() => {
    const pts = geometryToPoints(geometry);
    setPoints(pts);
  }, [geometry]);

  const initialCenter =
    view?.center ||
    (points.length > 0 ? [points[0].lat, points[0].lng] : DEFAULT_CENTER);

  const initialZoom = view?.zoom ?? DEFAULT_ZOOM;

  const updateGeometry = (newPoints) => {
    setPoints(newPoints);

    if (!newPoints || newPoints.length < 3) {
      onGeometryChange(null, 0);
      return;
    }

    const coords = newPoints.map((p) => [p.lng, p.lat]);
    const first = coords[0];
    const last = coords[coords.length - 1];
    if (first[0] !== last[0] || first[1] !== last[1]) {
      coords.push(first);
    }

    const polygon = {
      type: "Polygon",
      coordinates: [coords],
    };

    const areaM2 = area(polygon);
    const areaHa = areaM2 / 10000;

    onGeometryChange(polygon, areaHa);
  };

  function MapLogic() {
    useMapEvents({
      dblclick(e) {
        const newPoints = [...points, e.latlng];
        updateGeometry(newPoints);
      },
      moveend(e) {
        if (!onViewChange) return;
        const map = e.target;
        const center = map.getCenter();
        onViewChange({
          center: [center.lat, center.lng],
          zoom: map.getZoom(),
        });
      },
    });
    return null;
  }

  const mapKey = `${initialCenter[0].toFixed(4)}-${initialCenter[1].toFixed(
    4
  )}-${initialZoom}`;

  return (
    <div className="modal__map">
      <MapContainer
        key={mapKey}
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%" }}
        doubleClickZoom={false}
      >
        {/* Базовий супутниковий шар */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri"
          zIndex={1}
        />

        {/* Напівпрозорий шар з білими підписами населених пунктів */}
        <TileLayer
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution=""
          opacity={0.9}
          zIndex={2}
        />

        <MapLogic />

        {points.length >= 3 ? (
          <Polygon positions={points} pathOptions={{ weight: 2 }} />
        ) : points.length > 1 ? (
          <Polyline positions={points} pathOptions={{ weight: 2 }} />
        ) : null}
      </MapContainer>

      <div className="modal__map-hint">
        Подвійний клік по мапі — додати вершину поля (мінімум 3 точки).
      </div>

      <button
        type="button"
        className="modal__map-reset"
        onClick={() => updateGeometry([])}
      >
        Очистити контур
      </button>
    </div>
  );
}

export default FieldMapEditor;
