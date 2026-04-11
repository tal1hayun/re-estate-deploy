'use client';

export default function MapBackground() {
  const staticNodes = [
    [180, 120], [460, 95], [580, 200], [820, 145], [990, 260],
    [1240, 170], [270, 360], [680, 320], [900, 480], [1140, 420],
    [150, 520], [510, 570], [770, 640], [1300, 560], [400, 720],
    [640, 780], [1050, 700], [200, 800], [1380, 400], [1060, 140],
    [320, 500], [860, 580], [1220, 660], [480, 250], [730, 430],
  ];

  const pulsingNodes = [
    { cx: 340, cy: 200, dur: '3s', delay: '0s' },
    { cx: 720, cy: 160, dur: '4s', delay: '1s' },
    { cx: 960, cy: 300, dur: '3.5s', delay: '0.5s' },
    { cx: 480, cy: 440, dur: '5s', delay: '1.5s' },
    { cx: 1160, cy: 480, dur: '4s', delay: '2s' },
    { cx: 600, cy: 600, dur: '3s', delay: '0.8s' },
    { cx: 1020, cy: 580, dur: '4.5s', delay: '1.2s' },
    { cx: 260, cy: 660, dur: '3.5s', delay: '2.5s' },
    { cx: 880, cy: 700, dur: '4s', delay: '0.3s' },
    { cx: 1300, cy: 280, dur: '5s', delay: '1.8s' },
    { cx: 560, cy: 340, dur: '3.8s', delay: '0.6s' },
    { cx: 1080, cy: 360, dur: '4.2s', delay: '2.2s' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0 }}
        aria-hidden="true"
      >
        <defs>
          {/* Major grid - 80px cells */}
          <pattern id="grid-major" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(176,210,230,0.055)" strokeWidth="0.5"/>
          </pattern>
          {/* Minor grid - 20px cells */}
          <pattern id="grid-minor" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(176,210,230,0.02)" strokeWidth="0.3"/>
          </pattern>

          {/* Glow filter for pulsing nodes */}
          <filter id="node-glow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          {/* Soft glow for static nodes */}
          <filter id="node-glow-soft" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Depth gradients */}
          <linearGradient id="grad-bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="40%" stopColor="#060f14" stopOpacity="0"/>
            <stop offset="100%" stopColor="#060f14" stopOpacity="1"/>
          </linearGradient>
          <linearGradient id="grad-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060f14" stopOpacity="0.5"/>
            <stop offset="25%" stopColor="#060f14" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="grad-right-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="65%" stopColor="#060f14" stopOpacity="0"/>
            <stop offset="100%" stopColor="#060f14" stopOpacity="0.8"/>
          </linearGradient>
          <linearGradient id="grad-left-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#060f14" stopOpacity="0.6"/>
            <stop offset="25%" stopColor="#060f14" stopOpacity="0"/>
          </linearGradient>

          {/* Subtle center radial glow */}
          <radialGradient id="center-glow" cx="55%" cy="38%" r="45%">
            <stop offset="0%" stopColor="#2EA8DF" stopOpacity="0.035"/>
            <stop offset="100%" stopColor="#2EA8DF" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Background fill */}
        <rect width="1440" height="900" fill="#060f14"/>

        {/* Grids */}
        <rect width="1440" height="900" fill="url(#grid-minor)"/>
        <rect width="1440" height="900" fill="url(#grid-major)"/>

        {/* Subtle center radial glow */}
        <rect width="1440" height="900" fill="url(#center-glow)"/>

        {/* City blocks */}
        <rect x="120" y="80" width="180" height="100" fill="rgba(46,168,223,0.018)" stroke="rgba(46,168,223,0.045)" strokeWidth="0.5"/>
        <rect x="340" y="160" width="120" height="140" fill="rgba(46,168,223,0.015)" stroke="rgba(46,168,223,0.04)" strokeWidth="0.5"/>
        <rect x="500" y="60" width="200" height="80" fill="rgba(46,168,223,0.02)" stroke="rgba(46,168,223,0.045)" strokeWidth="0.5"/>
        <rect x="740" y="120" width="160" height="120" fill="rgba(46,168,223,0.015)" stroke="rgba(46,168,223,0.035)" strokeWidth="0.5"/>
        <rect x="920" y="200" width="240" height="160" fill="rgba(46,168,223,0.018)" stroke="rgba(46,168,223,0.04)" strokeWidth="0.5"/>
        <rect x="1180" y="80" width="180" height="200" fill="rgba(46,168,223,0.015)" stroke="rgba(46,168,223,0.035)" strokeWidth="0.5"/>
        <rect x="200" y="300" width="160" height="120" fill="rgba(46,168,223,0.012)" stroke="rgba(46,168,223,0.03)" strokeWidth="0.5"/>
        <rect x="600" y="280" width="200" height="100" fill="rgba(46,168,223,0.015)" stroke="rgba(46,168,223,0.03)" strokeWidth="0.5"/>
        <rect x="840" y="400" width="180" height="140" fill="rgba(46,168,223,0.012)" stroke="rgba(46,168,223,0.028)" strokeWidth="0.5"/>
        <rect x="1060" y="350" width="220" height="160" fill="rgba(46,168,223,0.015)" stroke="rgba(46,168,223,0.032)" strokeWidth="0.5"/>
        <rect x="100" y="480" width="280" height="120" fill="rgba(46,168,223,0.01)" stroke="rgba(46,168,223,0.025)" strokeWidth="0.5"/>
        <rect x="440" y="500" width="160" height="200" fill="rgba(46,168,223,0.01)" stroke="rgba(46,168,223,0.025)" strokeWidth="0.5"/>
        <rect x="650" y="560" width="240" height="140" fill="rgba(46,168,223,0.008)" stroke="rgba(46,168,223,0.02)" strokeWidth="0.5"/>
        <rect x="1200" y="500" width="200" height="180" fill="rgba(46,168,223,0.01)" stroke="rgba(46,168,223,0.022)" strokeWidth="0.5"/>
        <rect x="300" y="680" width="160" height="120" fill="rgba(46,168,223,0.008)" stroke="rgba(46,168,223,0.018)" strokeWidth="0.5"/>
        <rect x="960" y="620" width="200" height="160" fill="rgba(46,168,223,0.008)" stroke="rgba(46,168,223,0.018)" strokeWidth="0.5"/>

        {/* Diagonal avenues */}
        <line x1="0" y1="400" x2="600" y2="0" stroke="rgba(46,168,223,0.04)" strokeWidth="0.5"/>
        <line x1="200" y1="900" x2="900" y2="200" stroke="rgba(46,168,223,0.035)" strokeWidth="0.5"/>
        <line x1="800" y1="900" x2="1440" y2="300" stroke="rgba(46,168,223,0.04)" strokeWidth="0.5"/>
        <line x1="0" y1="650" x2="400" y2="900" stroke="rgba(46,168,223,0.03)" strokeWidth="0.5"/>
        <line x1="1100" y1="0" x2="1440" y2="500" stroke="rgba(46,168,223,0.035)" strokeWidth="0.5"/>

        {/* Main road highlights */}
        <line x1="0" y1="240" x2="1440" y2="240" stroke="rgba(46,168,223,0.065)" strokeWidth="0.8"/>
        <line x1="0" y1="480" x2="1440" y2="480" stroke="rgba(46,168,223,0.055)" strokeWidth="0.8"/>
        <line x1="0" y1="720" x2="1440" y2="720" stroke="rgba(46,168,223,0.04)" strokeWidth="0.8"/>
        <line x1="360" y1="0" x2="360" y2="900" stroke="rgba(46,168,223,0.055)" strokeWidth="0.8"/>
        <line x1="720" y1="0" x2="720" y2="900" stroke="rgba(46,168,223,0.065)" strokeWidth="0.8"/>
        <line x1="1080" y1="0" x2="1080" y2="900" stroke="rgba(46,168,223,0.055)" strokeWidth="0.8"/>

        {/* Static nodes */}
        {staticNodes.map(([cx, cy], i) => (
          <circle key={`static-${i}`} cx={cx} cy={cy} r="1.5" fill="#2EA8DF" opacity="0.45" filter="url(#node-glow-soft)"/>
        ))}

        {/* Pulsing nodes */}
        {pulsingNodes.map(({ cx, cy, dur, delay }, i) => (
          <g key={`pulse-${i}`} filter="url(#node-glow)">
            <circle cx={cx} cy={cy} r="2" fill="none" stroke="#2EA8DF" strokeWidth="0.6">
              <animate attributeName="r" values="2;7;2" dur={dur} begin={delay} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.5;0;0.5" dur={dur} begin={delay} repeatCount="indefinite"/>
            </circle>
            <circle cx={cx} cy={cy} r="2.2" fill="#2EA8DF">
              <animate attributeName="opacity" values="0.55;1;0.55" dur={dur} begin={delay} repeatCount="indefinite"/>
            </circle>
          </g>
        ))}

        {/* Depth overlays — applied last to create depth */}
        <rect width="1440" height="900" fill="url(#grad-top)"/>
        <rect width="1440" height="900" fill="url(#grad-bottom)"/>
        <rect width="1440" height="900" fill="url(#grad-left-fade)"/>
        <rect width="1440" height="900" fill="url(#grad-right-fade)"/>
      </svg>
    </div>
  );
}
