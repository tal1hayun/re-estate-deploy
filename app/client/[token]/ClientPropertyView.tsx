'use client';

import { useEffect, useState, use } from 'react';
import dynamic from 'next/dynamic';
import type { PropertyDetails, PropertyImage } from '@/types';
import ImageLightbox from '@/components/ImageLightbox';
import type { MapProperty } from '@/components/PropertyMap';

const PropertyMap = dynamic(() => import('@/components/PropertyMap'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 240, borderRadius: 12, background: '#1a2d3a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b8a9a', fontSize: 14 }}>
      טוען מפה…
    </div>
  ),
});

type ClientProperty = {
  id: string;
  title: string;
  address: string;
  city: string;
  description?: string;
  current_price: number;
  status: string;
  latitude: number | null;
  longitude: number | null;
  property_details: PropertyDetails | null;
  property_images: PropertyImage[];
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export default function ClientPropertyView({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [property, setProperty] = useState<ClientProperty | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);


  // City-level geocoded coords (fallback when no exact coords)
  const [cityCoords, setCityCoords] = useState<[number, number] | null>(null);

  useEffect(() => {
    fetch(`/api/client/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); }
        else { setProperty(data.property); }
        setLoading(false);
      })
      .catch(() => { setError('שגיאה בטעינת הנכס'); setLoading(false); });
  }, [token]);

  // Geocode city when no exact coords are available
  useEffect(() => {
    if (!property) return;
    if (typeof property.latitude === 'number' && typeof property.longitude === 'number') return;
    if (!property.city) return;
    let cancelled = false;
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(property.city + ', Israel')}&format=json&limit=1`)
      .then(r => r.json())
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (!cancelled && data?.[0]) {
          setCityCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [property]);

  function formatPrice(p: number) {
    return '₪' + p.toLocaleString('he-IL');
  }


  function imageUrl(path: string) {
    return `${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-6">
        <div>
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-white text-xl font-semibold mb-2">קישור לא זמין</h1>
          <p className="text-gray-400">{error || 'הקישור שגוי או פג תוקפו'}</p>
        </div>
      </div>
    );
  }

  const images = [...(property.property_images || [])].sort((a, b) => (b.is_cover ? 1 : 0) - (a.is_cover ? 1 : 0));
  const d = property.property_details;

  const lightboxImages = images.map(img => ({ id: img.id, url: imageUrl(img.storage_path) }));

  const hasCoords = typeof property.latitude === 'number' && typeof property.longitude === 'number';
  const mapProperties: MapProperty[] = hasCoords
    ? [{
        id: property.id,
        title: property.title,
        city: property.city,
        address: property.address,
        current_price: property.current_price,
        latitude: property.latitude!,
        longitude: property.longitude!,
      }]
    : cityCoords
    ? [{
        id: property.id,
        title: property.title,
        city: property.city,
        address: property.city,
        current_price: property.current_price,
        latitude: cityCoords[0],
        longitude: cityCoords[1],
      }]
    : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">🏠</div>
        <span className="font-semibold text-white">T ESTATE</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Image Gallery */}
        {images.length > 0 ? (
          <div className="mb-6">
            {/* Main image — click to open lightbox */}
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="w-full rounded-2xl overflow-hidden aspect-video bg-gray-800 mb-3 block relative group"
              style={{ padding: 0, border: 'none', cursor: 'zoom-in' }}
              aria-label="פתח תמונה מוגדלת"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl(images[activeImage].storage_path)}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {/* Zoom hint overlay */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(1px)' }}
              >
                <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: 20 }}>
                  הגדל תמונה
                </span>
              </div>
              {images.length > 1 && (
                <span style={{
                  position: 'absolute', bottom: 10, left: 10,
                  background: 'rgba(0,0,0,0.6)',
                  color: '#fff', fontSize: 12, fontWeight: 600,
                  padding: '3px 10px', borderRadius: 14,
                }}>
                  {activeImage + 1} / {images.length}
                </span>
              )}
            </button>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl(img.storage_path)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-gray-900 aspect-video flex items-center justify-center text-6xl mb-6">🏠</div>
        )}

        {/* Lightbox */}
        {lightboxOpen && (
          <ImageLightbox
            images={lightboxImages}
            startIndex={activeImage}
            onClose={() => setLightboxOpen(false)}
          />
        )}

        {/* Title & Price */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{property.title}</h1>
              <p className="text-gray-400">{property.city} · {property.address}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ${
              property.status === 'active' ? 'bg-green-900/40 text-green-400' :
              property.status === 'sold' ? 'bg-blue-900/40 text-blue-400' : 'bg-gray-800 text-gray-500'
            }`}>
              {property.status === 'active' ? 'פעיל' : property.status === 'sold' ? 'נמכר' : 'לא פעיל'}
            </span>
          </div>
          <div className="text-3xl font-bold text-blue-400">{formatPrice(property.current_price)}</div>
        </div>

        {/* Specs */}
        {d && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="font-semibold text-white mb-4">מפרט הנכס</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'שטח מגרש', value: d.lot_size_sqm ? `${d.lot_size_sqm} מ"ר` : null },
                { label: 'שטח בנוי', value: d.built_size_sqm ? `${d.built_size_sqm} מ"ר` : null },
                { label: 'חדרים', value: d.bedrooms ? String(d.bedrooms) : null },
                { label: 'חדרי אמבטיה', value: d.bathrooms ? String(d.bathrooms) : null },
                { label: 'גיל הנכס', value: d.house_age_years ? `${d.house_age_years} שנים` : null },
                { label: 'חניות', value: d.parking_spaces ? String(d.parking_spaces) : null },
              ].filter(x => x.value).map(item => (
                <div key={item.label} className="bg-gray-800 rounded-xl p-3">
                  <div className="text-gray-500 text-xs mb-1">{item.label}</div>
                  <div className="text-white font-medium">{item.value}</div>
                </div>
              ))}
            </div>
            {(d.has_garden || d.has_balcony || d.has_pool) && (
              <div className="flex gap-2 flex-wrap mt-4">
                {d.has_garden && <span className="bg-green-900/30 text-green-400 text-xs px-3 py-1 rounded-full">🌿 גינה</span>}
                {d.has_balcony && <span className="bg-blue-900/30 text-blue-400 text-xs px-3 py-1 rounded-full">🏗 מרפסת</span>}
                {d.has_pool && <span className="bg-cyan-900/30 text-cyan-400 text-xs px-3 py-1 rounded-full">🏊 בריכה</span>}
              </div>
            )}
            {d.additional_features && (
              <p className="text-gray-400 text-sm mt-4 border-t border-gray-800 pt-4">{d.additional_features}</p>
            )}
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
            <h2 className="font-semibold text-white mb-3">תיאור</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{property.description}</p>
          </div>
        )}

        {/* Map */}
        {(hasCoords || cityCoords) && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="font-semibold text-white">מיקום הנכס</h2>
              {!hasCoords && (
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">מיקום אזורי</span>
              )}
            </div>
            <PropertyMap
              height={240}
              properties={mapProperties}
              singleZoom={hasCoords ? 16 : 12}
            />
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8">מופעל על ידי T ESTATE · מערכת ניהול נכסי נדל״ן</p>
      </div>
    </div>
  );
}
