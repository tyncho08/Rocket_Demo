'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Home } from 'lucide-react';

interface PropertyImageProps {
  src?: string | null;
  alt: string;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
}

export function PropertyImage({ 
  src, 
  alt, 
  fill = false, 
  className = '', 
  priority = false,
  sizes,
  width,
  height 
}: PropertyImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // If no src provided or error occurred, show placeholder
  if (!src || hasError) {
    return (
      <div className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${className} ${fill ? 'absolute inset-0' : ''}`}>
        <div className="text-center">
          <Home className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">Property Image</p>
        </div>
      </div>
    );
  }

  const imageProps: any = {
    src,
    alt,
    className: `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`,
    priority,
    onError: () => setHasError(true),
    onLoad: () => setIsLoading(false),
  };

  if (fill) {
    imageProps.fill = true;
    if (sizes) imageProps.sizes = sizes;
  } else {
    if (width) imageProps.width = width;
    if (height) imageProps.height = height;
  }

  return (
    <>
      {isLoading && (
        <div className={`bg-gray-200 animate-pulse ${className} ${fill ? 'absolute inset-0' : ''}`} />
      )}
      <Image {...imageProps} />
    </>
  );
}