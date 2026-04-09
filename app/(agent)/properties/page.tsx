'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProperties } from '@/hooks/useProperties';
import type { PropertyImage } from '@/types';

export default function PropertiesPage() {
  const { agent } = useAuth();
  const { properties, loading } = useProperties();
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold' | 'inactive'>('all');

  const filtered = properties.filter(p => {
    if (filter === 'mine' && p.agent_id !== agent?.id) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    return true;
  });

  function formatPrice(price: number) {
    return '₪' + price.toLocaleString('he-IL');
  }

  function getCoverImage(images: PropertyImage[]) {
    const cover = images?.find(i => i.is_cover) || images?.[0];
    if (!cover) return null;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/property-images/${cover.storage_path}`;
  }

  const statusLabel: Record<string, string> = {
    active: 'פעיל',
    sold: 'נמכר',
    inactive: 'לא פעיל',
  };

  const statusColor: Record<string, string> = {
    active: 'bg-green-900/50 text-green-400',
    sold: 'bg-blue-900/50 text-blue-400',
    inactive: 'bg-gray-800 text-gray-500',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">נכסים</h1>
          <p className="text-gray-400 text-sm mt-1">{filtered.length} נכסים</p>
        </div>
        <Link
          href="/properties/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span>+</span>
          <span>נכס חדש</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          {(['all', 'mine'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                filter === f ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {f === 'all' ? 'כל הנכסים' : 'הנכסים שלי'}
            </button>
          ))}
        </div>
        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-1">
          {(['all', 'active', 'sold', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                statusFilter === s ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {s === 'all' ? 'הכל' : statusLabel[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🏠</div>
          <h3 className="text-white font-medium mb-2">אין נכסים עדיין</h3>
          <p className="text-gray-500 text-sm mb-6">הוסף את הנכס הראשון שלך</p>
          <Link href="/properties/new" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors">
            הוסף נכס חדש
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(property => {
            const coverUrl = getCoverImage(property.property_images);
            const isOwn = property.agent_id === agent?.id;
            return (
              <Link
                key={property.id}
                href={`/properties/${property.id}`}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors group"
              >
                {/* Image */}
                <div className="h-48 bg-gray-800 relative overflow-hidden">
                  {coverUrl ? (
                    <img src={coverUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl text-gray-600">🏠</div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[property.status]}`}>
                      {statusLabel[property.status]}
                    </span>
                    {!isOwn && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-900/50 text-purple-400">
                        {property.agents?.full_name?.split(' ')[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-medium mb-1 truncate">{property.title}</h3>
                  <p className="text-gray-500 text-sm mb-3 truncate">{property.city} · {property.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-400 font-semibold">{formatPrice(property.current_price)}</span>
                    {isOwn && (
                      <span className="text-xs text-gray-600">ניתן לעריכה</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
