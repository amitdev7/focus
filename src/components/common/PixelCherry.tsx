import React from 'react';

interface PixelCherryProps {
  size?: number;
  className?: string;
  showGrid?: boolean;
}

export const PixelCherry: React.FC<PixelCherryProps> = ({ size = 48, className = '', showGrid = false }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {showGrid && (
        <div className="absolute inset-0 border border-espresso/15 bg-grid-pattern bg-grid-24 opacity-60 rounded-md pointer-events-none" />
      )}
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className="shape-rendering-crispEdges drop-shadow-sm"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Stem knot / top joint */}
        <rect x="20" y="5" width="3" height="3" fill="#302729" />
        
        {/* Right Stem */}
        <rect x="18" y="7" width="2" height="2" fill="#302729" />
        <rect x="17" y="9" width="2" height="3" fill="#302729" />
        <rect x="16" y="12" width="2" height="3" fill="#302729" />

        {/* Left Stem */}
        <rect x="17" y="8" width="2" height="2" fill="#302729" />
        <rect x="15" y="9" width="2" height="2" fill="#302729" />
        <rect x="13" y="10" width="2" height="2" fill="#302729" />
        <rect x="11" y="11" width="2" height="2" fill="#302729" />

        {/* Left Cherry Outer Outline */}
        <path
          d="M8 12 h5 v2 h2 v5 h-1 v3 h-2 v2 h-4 v-2 h-2 v-3 h-1 v-5 h2 v-2 h1 z"
          fill="#302729"
        />
        {/* Left Cherry Body (Cherry Red #E53945) */}
        <path
          d="M9 13 h3 v1 h1 v4 h-1 v2 h-1 v2 h-3 v-1 h-1 v-2 h-1 v-4 h1 v-1 h1 z"
          fill="#E53945"
        />
        {/* Left Cherry Stem insertion point & green accent */}
        <rect x="11" y="13" width="2" height="3" fill="#92AA7B" />
        {/* Left Cherry Light highlight pixels */}
        <rect x="7" y="17" width="1" height="2" fill="#FCEBEC" />
        <rect x="8" y="19" width="2" height="1" fill="#FCEBEC" />

        {/* Right Cherry Outer Outline */}
        <path
          d="M18 15 h5 v2 h2 v5 h-1 v3 h-2 v2 h-4 v-2 h-2 v-3 h-1 v-5 h2 v-2 h1 z"
          fill="#302729"
        />
        {/* Right Cherry Body (Cherry Red #E53945) */}
        <path
          d="M19 16 h3 v1 h1 v4 h-1 v2 h-1 v2 h-3 v-1 h-1 v-2 h-1 v-4 h1 v-1 h1 z"
          fill="#E53945"
        />
        {/* Right Cherry Green Stem Accent */}
        <rect x="20" y="16" width="2" height="3" fill="#92AA7B" />
        {/* Right Cherry Light highlight pixels */}
        <rect x="17" y="20" width="1" height="2" fill="#FCEBEC" />
        <rect x="18" y="22" width="2" height="1" fill="#FCEBEC" />
      </svg>
    </div>
  );
};
