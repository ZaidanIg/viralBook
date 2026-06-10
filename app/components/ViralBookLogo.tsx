import React, { useState } from 'react';
import { Book } from 'lucide-react';

export function ViralBookLogo({ className = "w-6 h-6", style }: { className?: string; style?: React.CSSProperties }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <Book className={className} style={style} />;
  }

  return (
    <img 
      src="/VIRALBOOK.png" 
      alt="Viral Book" 
      className={`rounded-full object-cover ${className}`}
      style={style}
      onError={() => setHasError(true)}
    />
  );
}
