"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { GeoLocation } from "@/app/types";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapComponentProps {
  locations: GeoLocation[];
}

function createNumberedIcon(number: number, color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        background: ${color};
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        font-family: sans-serif;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
      ">${number}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 500);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
}

function AnimatedPath({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || positions.length < 2) return;

    let antPath: any = null;

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet-ant-path@1.3.0/dist/leaflet-ant-path.js";
    script.async = true;

    script.onload = () => {
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
      <div className="w-full h-[400px] md:h-[600px] bg-gray-200 rounded-lg flex items-center justify-center">
        No locations to display
      </div>
    );
  }


  const pathCoordinates = locations.map(
    (loc) => [loc.coordinates.latitude, loc.coordinates.longitude] as [number, number]
  );

  let count = 0;
  let debug = false;

  return (
    <div className="h-[400px] md:h-[600px] w-full">
      <MapContainer
        center={[locations[0].coordinates.latitude, locations[0].coordinates.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapResizer />
        <AnimatedPath positions={pathCoordinates} />

        {locations.map((location, index) => {
          if (!debug && !location.description) {
            return;
          }
          count++;

          if (debug) {
            count = location.index;
          }


          const color = "#0088ff";
          const icon = createNumberedIcon(count, color);

          return (
            <Marker
              key={index}
              position={[location.coordinates.latitude, location.coordinates.longitude]}
              icon={icon}
            >
              {location.description !== "" && (
                <Popup>
                  <div>
                    <strong>{location.description}</strong>
                    <br />
                    {new Date(location.time).toLocaleTimeString("nl-NL", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}