import React, { useState, useEffect } from 'react'
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup, useMap, } from "react-leaflet";

// Fix for missing Leaflet marker icons
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapAutoCenter({ position }) {
    const map = useMap();
    useEffect(() => {
      if (position && position.length === 2) {
        map.setView(position, 9); // zoom closer
      }
    }, [position, map]);
    return null;
  }

export default function ReservoirMap({ allStationMeta, setCurrReservoir, setShowMap }) {
  return (
    <div className="h-[500px] rounded-2xl overflow-hidden shadow-xl">
      <MapContainer center={[37.5, -120]} zoom={6} style={{ height: "100%", width: "100%" }}>
        {/* Base map layer */}
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Auto-center on selected marker */}
        {allStationMeta && allStationMeta?.[0].latitude && allStationMeta?.[0].longitude && (
          <MapAutoCenter position={[allStationMeta[0].latitude, allStationMeta[0].longitude]} />
        )}

        {/* Show ALL reservoir markers */}
        {allStationMeta && allStationMeta
          .filter((s) => s.latitude && s.longitude)
          .map((station) => (
            <Marker
              key={station.value}
              position={[Number(station.latitude), Number(station.longitude)]}
              eventHandlers={{
                click: () => {
                    setCurrReservoir(station);
                    setShowMap(false);
                    console.log(station);
                },
              }}
            >
              <Popup>
                <strong>{station.label}</strong>
                <br />
                {station.value || "Unknown Station Id"}
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
