import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
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

function FlyToPosition({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (!pos) return;
    map.flyTo([pos.lat, pos.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [pos?.lat, pos?.lng]);
  return null;
}

function useDebounce(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function nominatimReverse(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Idealnya ganti dengan domain/app kamu untuk produksi
      "User-Agent": "MapPicker/1.0 (yourdomain.com)",
    },
  });
  if (!res.ok) throw new Error("Reverse geocode failed");
  return res.json();
}

async function nominatimSearch(q, { limit = 7, countrycodes = "id", acceptLanguage = "id" } = {}) {
  const params = new URLSearchParams({
    format: "jsonv2",
    q,
    addressdetails: "1",
    limit: String(limit),
  });
  if (countrycodes) params.set("countrycodes", countrycodes);
  if (acceptLanguage) params.set("accept-language", acceptLanguage);

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "MapPicker/1.0 (yourdomain.com)",
    },
  });
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export default function MapPicker({ value, onChange }) {
  const defaultCenter = useMemo(
    () => ({ lat: -6.755316451902105, lng: 108.50968109451621 }),
    []
  );

  const [pos, setPos] = useState(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : defaultCenter
  );

  // --- SEARCH STATE ---
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 450);
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (value?.lat && value?.lng) setPos({ lat: value.lat, lng: value.lng });
  }, [value?.lat, value?.lng]);

  // Close dropdown when click outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Fetch autocomplete results
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoading(true);

        // countrycodes: "id" => Indonesia saja, set "" jika mau global
        const data = await nominatimSearch(q, { limit: 8, countrycodes: "id", acceptLanguage: "id" });

        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
          setOpen(true);
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setOpen(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const commitChange = (lat, lng, address) => {
    setPos({ lat, lng });
    onChange?.({ lat, lng, address: address || "" });
  };

  const handlePick = async (latlng) => {
    setPos(latlng);

    let address = "";
    try {
      const json = await nominatimReverse(latlng.lat, latlng.lng);
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

  const handleSelectResult = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const address = item.display_name || "";

    commitChange(lat, lng, address);

    // set input & close
    setQuery(address);
    setOpen(false);
  };

  const handleSubmitSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3) return;

    try {
      setLoading(true);
      const data = await nominatimSearch(q, { limit: 1, countrycodes: "id", acceptLanguage: "id" });
      if (data?.length) handleSelectResult(data[0]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-4 border p-2" ref={rootRef} style={{ position: "relative" }}>
      {/* SEARCH BAR */}
      <form onSubmit={handleSubmitSearch} className="d-flex gap-2 mb-2">
        <input
          className="form-control"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Cari tempat… (min 3 huruf)"
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "..." : "Search"}
        </button>
      </form>

      {/* DROPDOWN RESULTS */}
      {open && (results.length > 0 || loading) ? (
        <div
          className="shadow-sm"
          style={{
            position: "absolute",
            top: 54,
            left: 8,
            right: 8,
            zIndex: 9999,
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            overflow: "hidden",
            maxHeight: 260,
          }}
        >
          {loading ? (
            <div style={{ padding: 12, fontSize: 13 }}>Mencari…</div>
          ) : (
            results.map((r) => (
              <button
                key={`${r.place_id}-${r.lat}-${r.lon}`}
                type="button"
                onClick={() => handleSelectResult(r)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: 12,
                  border: "0",
                  borderBottom: "1px solid #f1f1f1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{ fontSize: 13, lineHeight: 1.3 }}
                  dangerouslySetInnerHTML={{ __html: escapeHtml(r.display_name) }}
                />
              </button>
            ))
          )}
        </div>
      ) : null}

      <MapContainer center={pos} zoom={13} scrollWheelZoom className="shadow-sm">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onPick={handlePick} />
        <FlyToPosition pos={pos} />
        <Marker position={pos} />
      </MapContainer>

      <div className="mt-2 text-small">
        <div>
          <b>Lat:</b> {pos.lat.toFixed(6)} &nbsp; <b>Lng:</b> {pos.lng.toFixed(6)}
        </div>
        {value?.address ? <div className="text-muted mt-1">{value.address}</div> : null}
      </div>
    </div>
  );
}
 