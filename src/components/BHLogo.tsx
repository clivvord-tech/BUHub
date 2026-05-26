import React from 'react';

interface BHLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function BHLogo({ size = 40, className = '', showText = true }: BHLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Gradient Definition - Must be before use */}
        <defs>
          <linearGradient id="bhGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#F59E0B', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#D97706', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="url(#bhGradient)" />
        
        {/* BH Text */}
        <text
          x="50"
          y="50"
          fontSize="42"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          BH
        </text>
      </svg>
      
      {/* Text */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold text-white">BinghamHub</span>
          <span className="text-[10px] text-secondary-text tracking-wider">UNIVERSITY NETWORK</span>
        </div>
      )}
    </div>
  );
}
