'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, type MouseEvent } from 'react';

interface HomeLinkProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function HomeLink({ children, className, style, onClick: externalClick }: HomeLinkProps) {
  const pathname = usePathname();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    externalClick?.(e);
  };

  return (
    <Link href="/" onClick={handleClick} className={className} style={style} scroll={false}>
      {children}
    </Link>
  );
}
