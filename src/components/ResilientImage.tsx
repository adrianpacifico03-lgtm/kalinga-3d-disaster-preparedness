import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#0D213F] via-[#13325c] to-[#0E8A8F]/40 text-white p-4 ${className}`}
        role="img"
        aria-label={alt}
      >
        <ShieldAlert className="h-8 w-8 text-teal-400" aria-hidden="true" />
        {fallbackTitle && (
          <span className="text-xs font-semibold text-center text-slate-200">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
