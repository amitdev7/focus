import React from 'react';

interface RetroCrtSmileyProps {
  size?: number;
  className?: string;
  glow?: boolean;
  animated?: boolean;
}

export const RetroCrtSmiley: React.FC<RetroCrtSmileyProps> = ({
  size = 64,
  className = '',
  glow = false,
  animated = false,
}) => {
  return (
    <div
      className={`relative inline-block select-none ${animated ? 'animate-float' : ''} ${className}`}
      style={{ width: size, height: size * 0.9 }}
    >
      {/* Outer CRT Case */}
      <div
        className={`w-full h-full rounded-2xl bg-espresso p-1.5 flex flex-col items-center justify-between shadow-pixel-sm transition-transform duration-300 ${
          glow ? 'shadow-crt-glow' : ''
        }`}
      >
        {/* Antenna subtle decoration */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 pointer-events-none">
          <div className="w-1 h-3 bg-espresso -rotate-12 rounded-t" />
          <div className="w-1 h-3 bg-espresso rotate-12 rounded-t" />
        </div>

        {/* Inner Bezel with Rainbow CRT Screen */}
        <div className="relative w-full flex-1 rounded-xl overflow-hidden bg-gradient-to-tr from-amber-400 via-rose-400 via-purple-400 to-cyan-400 p-0.5 crt-screen flex items-center justify-center shadow-inner">
          {/* Subtle phosphor scanlines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-70" />

          {/* Pixel Smiley Face SVG */}
          <svg
            viewBox="0 0 24 24"
            className="w-4/5 h-4/5 z-20 shape-rendering-crispEdges drop-shadow"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ imageRendering: 'pixelated' }}
          >
            {/* Left Eye */}
            <rect x="6" y="8" width="3" height="3" fill="#302729" />
            
            {/* Right Eye */}
            <rect x="15" y="8" width="3" height="3" fill="#302729" />

            {/* Pixel Smile */}
            <rect x="6" y="14" width="2" height="2" fill="#302729" />
            <rect x="8" y="16" width="8" height="2" fill="#302729" />
            <rect x="16" y="14" width="2" height="2" fill="#302729" />

            {/* Cheek blush (optional sweet touch) */}
            <rect x="4" y="12" width="2" height="1" fill="#E53945" opacity="0.6" />
            <rect x="18" y="12" width="2" height="1" fill="#E53945" opacity="0.6" />
          </svg>
        </div>

        {/* Bottom Vintage Hardware Dials / LED */}
        <div className="w-full flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-cherry animate-pulse-subtle" />
            <div className="w-1.5 h-1.5 rounded-full bg-sage" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-1 rounded bg-muted/40" />
            <div className="w-2.5 h-1 rounded bg-muted/40" />
          </div>
        </div>
      </div>
    </div>
  );
};
