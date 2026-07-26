import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  width = 800,
  height = 600,
  loading = 'lazy',
  priority = false,
  sizes,
}: OptimizedImageProps) {
  const isExternal = src.startsWith('http') || src.startsWith('//');
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      priority={priority}
      loading={priority ? undefined : loading}
      sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
      unoptimized={isExternal}
    />
  );
}

