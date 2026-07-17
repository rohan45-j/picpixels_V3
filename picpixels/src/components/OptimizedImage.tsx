// src/components/OptimizedImage.tsx
"use client";
import Image from 'next/image';
import type { ImgHTMLAttributes } from 'react';

/**
 * A thin wrapper around Next.js Image component with sensible defaults.
 * Width and height fallback to 800x600 if not provided – Next.js requires
 * explicit dimensions for static optimization.
 */
export default function OptimizedImage({
  src,
  alt = '',
  className,
  width = 800,
  height = 600,
  loading = 'lazy',
  ...rest
}: ImgHTMLAttributes<HTMLImageElement> & { src: string; width?: number; height?: number }) {
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      {...rest}
    />
  );
}
