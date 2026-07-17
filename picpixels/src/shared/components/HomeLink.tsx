'use client';

import { useRouter, usePathname } from 'next/navigation';
import { type ReactNode, type MouseEvent } from 'react';

interface HomeLinkProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function HomeLink({ children, className, style, onClick: externalClick }: HomeLinkProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/';
      setTimeout(() => window.scrollTo(0, 0), 50);
    }
    externalClick?.(e);
  };

  return (
    <a href="/" onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}
