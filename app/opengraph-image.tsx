import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'T ESTATE — פלטפורמת הנדל״ן המתקדמת';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1a30 40%, #0a1628 100%)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'serif',
        }}
      >
        {/* Grid lines - architectural feel */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage:
              'linear-gradient(rgba(100,160,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(100,160,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top-right decorative arc */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            border: '1.5px solid rgba(100,180,255,0.12)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '380px',
            height: '380px',
            borderRadius: '50%',
            border: '1px solid rgba(100,180,255,0.08)',
            display: 'flex',
          }}
        />

        {/* Skyline silhouette — bottom */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '180px',
            display: 'flex',
            alignItems: 'flex-end',
            paddingLeft: '60px',
            gap: '6px',
          }}
        >
          {[80, 120, 100, 160, 90, 140, 110, 180, 95, 130, 70, 150, 85, 115].map(
            (h, i) => (
              <div
                key={i}
                style={{
                  width: '28px',
                  height: `${h}px`,
                  background: `rgba(30,60,120,${0.3 + (i % 3) * 0.1})`,
                  borderTop: '1px solid rgba(80,130,220,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '4px',
                  gap: '4px',
                }}
              >
                {Array.from({ length: Math.floor(h / 20) }).map((_, j) => (
                  <div
                    key={j}
                    style={{
                      width: '16px',
                      height: '6px',
                      background:
                        Math.random() > 0.5
                          ? 'rgba(180,220,255,0.15)'
                          : 'transparent',
                      display: 'flex',
                    }}
                  />
                ))}
              </div>
            ),
          )}
        </div>

        {/* Bottom gradient fade */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background:
              'linear-gradient(to top, rgba(10,15,30,0.9) 0%, transparent 100%)',
            display: 'flex',
          }}
        />

        {/* Accent line top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '80px',
            right: '80px',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent, rgba(80,160,255,0.6), transparent)',
            display: 'flex',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 100px',
            flex: 1,
            zIndex: 1,
          }}
        >
          {/* Logo / brand mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #1a4fa8, #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                boxShadow: '0 0 30px rgba(59,130,246,0.4)',
              }}
            >
              <div
                style={{
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 800,
                  fontFamily: 'sans-serif',
                  display: 'flex',
                }}
              >
                T
              </div>
            </div>
            <div
              style={{
                color: 'rgba(180,210,255,0.7)',
                fontSize: '18px',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                fontFamily: 'sans-serif',
                display: 'flex',
              }}
            >
              ESTATE
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              color: 'white',
              fontSize: '72px',
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontFamily: 'sans-serif',
              display: 'flex',
              flexDirection: 'column',
              gap: '0px',
              maxWidth: '760px',
            }}
          >
            <span style={{ display: 'flex' }}>Premium</span>
            <span
              style={{
                display: 'flex',
                background: 'linear-gradient(90deg, #60a5fa, #93c5fd)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Real Estate
            </span>
            <span style={{ display: 'flex' }}>Platform</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              color: 'rgba(150,190,255,0.65)',
              fontSize: '26px',
              marginTop: '28px',
              fontFamily: 'sans-serif',
              display: 'flex',
              letterSpacing: '0.01em',
            }}
          >
            Properties · Leads · Premium Client Experience
          </div>
        </div>

        {/* Bottom-right — URL tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            right: '80px',
            color: 'rgba(100,150,220,0.5)',
            fontSize: '18px',
            letterSpacing: '0.05em',
            fontFamily: 'sans-serif',
            display: 'flex',
          }}
        >
          talestate.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
