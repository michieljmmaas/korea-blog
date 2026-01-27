"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { GeoLocation } from "@/app/types";

// Fix the default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapComponentProps {
  locations: GeoLocation[];
}

// Component to add animated path
function AnimatedPath({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || positions.length < 2) return;

    let antPath: any = null;

    // Load the ant-path library
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/leaflet-ant-path@1.3.0/dist/leaflet-ant-path.js";
    script.async = true;

    script.onload = () => {
      // Create animated ant path
      antPath = (L as any).polyline.antPath(positions, {
        color: "#0088ff",
        weight: 4,
        opacity: 0.6,
        delay: 3000,
        dashArray: [10, 20],
        pulseColor: "#FFFFFF",
      });

      antPath.addTo(map);
    };

    document.head.appendChild(script);

    return () => {
      if (antPath && map) {
        map.removeLayer(antPath);
      }
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, [map, positions]);

  return null;
}


export default function MapComponent({ locations }: MapComponentProps) {
  if (locations.length === 0) {
    return (
      <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        No locations to display
      </div>
    );
  }

  const pathCoordinates = locations.map(
    (loc) =>
      [loc.coordinates.latitude, loc.coordinates.longitude] as [number, number],
  );

  const centerLat =
    locations.reduce((sum, loc) => sum + loc.coordinates.latitude, 0) /
    locations.length;
  const centerLng =
    locations.reduce((sum, loc) => sum + loc.coordinates.longitude, 0) /
    locations.length;

  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={10}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AnimatedPath positions={pathCoordinates} />

        {locations.map(
          (location, index) =>
            location.description !== "" && 
          (
              <Marker
                key={index}
                position={[
                  location.coordinates.latitude,
                  location.coordinates.longitude,
                ]}
              >
                <Popup>
                  <div>
                    <strong>{location.description}</strong>
                    <br />
                    {location.time.toLocaleTimeString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>
    </div>
  );
}
