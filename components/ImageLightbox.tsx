'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  images: { id: string; url: string }[];
  startIndex?: number;
  onClose: () => void;
};

/**
 * Fullscreen image viewer:
 * - Arrow keys + swipe to navigate
 * - Click image to toggle zoom
 * - Esc to close
 * Accessible dialog with RTL support.
 */
export default function ImageLightbox({ images, startIndex = 0, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const go = (delta: number) => {
    if (!images.length) return;
    setZoomed(false);
    setIndex(i => (i + delta + images.length) % images.length);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      // RTL: ArrowRight = previous, ArrowLeft = next (visual consistency)
      if (e.key === 'ArrowRight') go(-1);
      if (e.key === 'ArrowLeft') go(1);
    };
    document.addEventListener('keydown', onKey);
    // Prevent body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  if (!images.length) return null;
  const current = images[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="גלריית תמונות"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchStartX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(dx) > 50) {
          // RTL: swipe right = previous, swipe left = next
          go(dx > 0 ? -1 : 1);
        }
        touchStartX.current = null;
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        background: 'rgba(0,0,0,0.95)',
        display: 'flex',
        flexDirection: 'column',
        direction: 'rtl',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          color: '#fff',
          fontSize: 14,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.55), transparent)',
        }}
      >
        <span style={{ opacity: 0.85 }}>
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="סגור גלריה"
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            width: 38,
            height: 38,
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      {/* Main image area */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '0 16px',
        }}
      >
        {/* Prev button */}
        {images.length > 1 && (
          <button
            onClick={() => go(-1)}
            aria-label="תמונה קודמת"
            style={{
              position: 'absolute',
              right: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            ›
          </button>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt=""
          onClick={() => setZoomed(z => !z)}
          style={{
            maxWidth: zoomed ? 'none' : '100%',
            maxHeight: zoomed ? 'none' : '100%',
            width: zoomed ? 'auto' : undefined,
            height: zoomed ? 'auto' : undefined,
            objectFit: 'contain',
            cursor: zoomed ? 'zoom-out' : 'zoom-in',
            transition: 'max-width 0.2s, max-height 0.2s',
            userSelect: 'none',
          }}
        />

        {/* Next button */}
        {images.length > 1 && (
          <button
            onClick={() => go(1)}
            aria-label="תמונה הבאה"
            style={{
              position: 'absolute',
              left: 20,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            ‹
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            padding: '12px 20px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.55), transparent)',
          }}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => { setZoomed(false); setIndex(i); }}
              aria-label={`תמונה ${i + 1}`}
              style={{
                flexShrink: 0,
                width: 72,
                height: 52,
                borderRadius: 6,
                overflow: 'hidden',
                border: `2px solid ${i === index ? '#2ea8df' : 'transparent'}`,
                padding: 0,
                background: 'none',
                cursor: 'pointer',
                opacity: i === index ? 1 : 0.6,
                transition: 'opacity 0.15s, border-color 0.15s',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
