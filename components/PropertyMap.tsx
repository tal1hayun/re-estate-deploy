'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapProperty = {
  id: string;
  title: string;
  city: string;
  address: string;
  current_price: number;
  latitude: number | null;
  longitude: number | null;
  cover_url?: string | null;
};

type Props = {
  properties: MapProperty[];
  onSelect?: (id: string) => void;
  height?: number | string;
  /** Optional focused property — map flies to it */
  focusId?: string | null;
  /** Use a static center when there are no properties with coords */
  fallbackCenter?: [number, number];
};

// Fix default marker icons for Leaflet when bundled (Next/Webpack)
const accentIcon = L.divIcon({
  className: 'property-map-pin',
  html: `
    <div style="
      width: 34px; height: 34px;
      background: #2ea8df;
      border: 3px solid #fff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      display: flex; align-items: center; justify-content: center;
    ">
      <div style="
        width: 10px; height: 10px; background: #fff; border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 34],
  popupAnchor: [0, -30],
});

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, points]);
  return null;
}

function FlyToFocus({ focusId, map }: { focusId?: string | null; map: Record<string, [number, number]> }) {
  const m = useMap();
  useEffect(() => {
    if (focusId && map[focusId]) {
      m.flyTo(map[focusId], 16, { duration: 0.6 });
    }
  }, [focusId, map, m]);
  return null;
}

export default function PropertyMap({
  properties,
  onSelect,
  height = 480,
  focusId = null,
  fallbackCenter = [32.0853, 34.7818], // Tel Aviv
}: Props) {
  const ref = useRef<L.Map | null>(null);

  const withCoords = useMemo(
    () => properties.filter(p => typeof p.latitude === 'number' && typeof p.longitude === 'number') as (MapProperty & { latitude: number; longitude: number })[],
    [properties]
  );

  const points: [number, number][] = withCoords.map(p => [p.latitude, p.longitude]);
  const focusMap: Record<string, [number, number]> = Object.fromEntries(
    withCoords.map(p => [p.id, [p.latitude, p.longitude]])
  );

  if (withCoords.length === 0) {
    return (
      <div
        style={{
          height,
          borderRadius: 12,
          background: 'var(--color-surface-2)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-muted)',
          fontSize: 'var(--text-sm)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🗺️</div>
          <div>אין נכסים עם מיקום במפה בתוצאות הנוכחיות</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
      <MapContainer
        ref={instance => { if (instance) ref.current = instance; }}
        center={points[0] || fallbackCenter}
        zoom={13}
        scrollWheelZoom
        style={{ height, width: '100%', background: 'var(--color-surface-2)' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        <FlyToFocus focusId={focusId} map={focusMap} />
        {withCoords.map(p => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={accentIcon}>
            <Popup>
              <div style={{ direction: 'rtl', minWidth: 200, fontFamily: 'inherit' }}>
                {p.cover_url && (
                  <div style={{ width: '100%', aspectRatio: '16/10', borderRadius: 8, overflow: 'hidden', marginBottom: 8, background: '#0e2530' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.cover_url} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#0a1a20' }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#38688a', marginBottom: 4 }}>{p.city} · {p.address}</div>
                <div style={{ fontWeight: 700, color: '#1e7cac', fontSize: 14, marginBottom: 8 }}>
                  {'₪' + p.current_price.toLocaleString('he-IL')}
                </div>
                {onSelect && (
                  <button
                    type="button"
                    onClick={() => onSelect(p.id)}
                    style={{
                      width: '100%', padding: '6px 10px', cursor: 'pointer',
                      background: '#2ea8df', color: '#fff', border: 'none',
                      borderRadius: 6, fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                    }}
                  >
                    לצפייה בנכס
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
