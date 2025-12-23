import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick?.(e.latlng);
    },
  });
  return null;
}

export default function MapPicker({ value, onChange }) {
  const defaultCenter = useMemo(() => ({ lat: -6.755316451902105, lng: 108.50968109451621 }), []);
  const [pos, setPos] = useState(value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : defaultCenter);

  useEffect(() => {
    if (value?.lat && value?.lng) setPos({ lat: value.lat, lng: value.lng });
  }, [value?.lat, value?.lng]);

  const handlePick = async (latlng) => {
    setPos(latlng);

    let address = "";
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`;
      const res = await fetch(url, { headers: { "Accept": "application/json" } });
      const json = await res.json();
      address = json?.display_name || "";
    } catch {
      address = "";
    }

    onChange?.({
      lat: latlng.lat,
      lng: latlng.lng,
      address,
    });
  };

  return (
    <div className="rounded-4 border p-2">
      <MapContainer center={pos} zoom={13} scrollWheelZoom className="shadow-sm">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        <Marker position={pos} />
      </MapContainer>

      <div className="mt-2 text-small">
        <div><b>Lat:</b> {pos.lat.toFixed(6)} &nbsp; <b>Lng:</b> {pos.lng.toFixed(6)}</div>
        {value?.address ? <div className="text-muted mt-1">{value.address}</div> : null}
      </div>
    </div>
  );
}
