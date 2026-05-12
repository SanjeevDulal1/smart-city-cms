import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_PIN_COLORS, getCategoryInfo, timeAgo } from '../../utils/helpers';
import StatusBadge from '../UI/StatusBadge';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl:       require('leaflet/dist/images/marker-icon.png'),
  shadowUrl:     require('leaflet/dist/images/marker-shadow.png'),
});

const createColoredPin = (color, size = 32) => L.divIcon({
  className: '',
  html: `<div style="
    width:${size}px;height:${size}px;
    background:${color};
    border:3px solid white;
    border-radius:50% 50% 50% 0;
    transform:rotate(-45deg);
    box-shadow:0 3px 10px rgba(0,0,0,0.25);
  "></div>`,
  iconSize:   [size, size],
  iconAnchor: [size / 2, size],
  popupAnchor:[0, -size],
});

const userPin = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;
    background:#6366f1;
    border:3px solid white;
    border-radius:50%;
    box-shadow:0 0 0 6px rgba(99,102,241,0.2);
  "></div>`,
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
});

const ClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

const CATEGORY_EMOJIS = {
  live_wire:'⚡', gas_leak:'💨', road_collapse:'🛣️',
  sewage_overflow:'🚰', flood:'🌊', pothole:'🕳️',
  broken_light:'💡', garbage:'🗑️', broken_footpath:'🚶',
  noise:'🔊', other:'📌',
};

const MapView = ({
  complaints = [],
  onLocationSelect,
  selectedLocation,
  interactive = false,
}) => {
  const KATHMANDU = [27.7172, 85.3240];

  return (
    <MapContainer
      center={KATHMANDU}
      zoom={13}
      className="w-full h-full rounded-2xl"
      style={{ minHeight: '400px' }}>

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />

      {interactive && onLocationSelect && (
        <ClickHandler onMapClick={onLocationSelect} />
      )}

      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={userPin}>
          <Popup>
            <div className="text-sm font-medium text-gray-700">
              Your report location
            </div>
          </Popup>
        </Marker>
      )}

      {complaints.map((c) => {
        const [lng, lat] = c.location.coordinates;
        const catInfo    = getCategoryInfo(c.category);
        const pinColor   = MAP_PIN_COLORS[c.status] || '#6b7280';
        const emoji      = CATEGORY_EMOJIS[c.category] || '📌';

        return (
          <Marker
            key={c._id}
            position={[lat, lng]}
            icon={createColoredPin(pinColor)}>
            <Popup maxWidth={260}>
              <div className="p-1 min-w-48">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                    <p className="text-xs text-gray-500">{catInfo.label}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={c.status} size="sm" />
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                </div>
                {c.priority?.score && (
                  <div className="mt-2 text-xs text-gray-500">
                    Priority score: <strong>{c.priority.score}</strong>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}

    </MapContainer>
  );
};

export default MapView;