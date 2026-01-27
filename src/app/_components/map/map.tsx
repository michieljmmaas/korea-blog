'use client';

import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix the default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface GeoLocation {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  time: boolean;
  description: Date;
}

interface MapComponentProps {
  locations: GeoLocation[];
}

export default function MapComponent({ locations }: MapComponentProps) {
  if (locations.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        No locations to display
      </div>
    );
  }

  const pathCoordinates = locations.map(loc => [
    loc.coordinates.latitude,
    loc.coordinates.longitude
  ] as [number, number]);

  const centerLat = locations.reduce((sum, loc) => sum + loc.coordinates.latitude, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.coordinates.longitude, 0) / locations.length;

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <Polyline
          positions={pathCoordinates}
          color="blue"
          weight={3}
          opacity={0.7}
        />

        {locations.map((location, index) => (
          <Marker
            key={index}
            position={[location.coordinates.latitude, location.coordinates.longitude]}
          >
            <Popup>
              <div>
                <strong>Location {index + 1}</strong>
                <br />
                {location.description.toLocaleString()}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}