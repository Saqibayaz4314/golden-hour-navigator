import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const hospitalMarker = new L.DivIcon({
  html: `<div style="
    width:12px;height:12px;
    background:#22c55e;
    border:2px solid rgba(255,255,255,0.8);
    border-radius:50%;
    box-shadow:0 0 0 4px rgba(34,197,94,0.25);
  "></div>`,
  iconSize: [12, 12], iconAnchor: [6, 6], className: '',
});

const driverMarker = new L.DivIcon({
  html: `<div style="
    width:14px;height:14px;
    background:#3b82f6;
    border:2px solid rgba(255,255,255,0.9);
    border-radius:50%;
    box-shadow:0 0 0 5px rgba(59,130,246,0.2);
  "></div>`,
  iconSize: [14, 14], iconAnchor: [7, 7], className: '',
});

function AutoFit({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions?.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [positions, map]);
  return null;
}

export default function MapView({ driverLocation, hospitals = [] }) {
  const center = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : [31.5204, 74.3188];

  const allPos = [
    ...(driverLocation ? [[driverLocation.lat, driverLocation.lng]] : []),
    ...hospitals
      .filter(h => h.location?.coordinates?.length === 2)
      .map(h => [h.location.coordinates[1], h.location.coordinates[0]]),
  ];

  return (
    <div className="map-wrap">
      <MapContainer center={center} zoom={13} zoomControl={false} attributionControl={false} style={{ height: '100%', width: '100%', background: '#13151e' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {allPos.length > 1 && <AutoFit positions={allPos} />}

        {driverLocation && (
          <>
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverMarker}>
              <Popup>Your location</Popup>
            </Marker>
            <Circle
              center={[driverLocation.lat, driverLocation.lng]}
              radius={300}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.06, weight: 1 }}
            />
          </>
        )}

        {hospitals.map((h, i) => {
          const c = h.location?.coordinates;
          if (!c) return null;
          return (
            <Marker key={h._id || i} position={[c[1], c[0]]} icon={hospitalMarker}>
              <Popup>
                <strong style={{ fontSize: '0.85rem' }}>{h.name}</strong>
                <br />
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Beds: {h.resources?.beds_status} · Reliability: {h.reliability_score}%
                </span>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
