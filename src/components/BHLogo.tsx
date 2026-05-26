import React from 'react';
import Image from 'next/image';

interface BHLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function BHLogo({ size = 42, className = '', showText = true }: BHLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Image 
        src="/logo.png?v=3" 
        alt="BinghamHub Logo" 
        width={size} 
        height={size}
        className="flex-shrink-0"
        unoptimized
      />
      
      {showText && (
        <span className="text-2xl font-bold text-white tracking-tight">
          BinghamHub
        </span>
      )}
    </div>
  );
}
