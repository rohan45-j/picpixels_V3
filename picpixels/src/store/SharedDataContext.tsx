'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { NavigationItem, Service } from '@/services/public-api';

interface SharedDataContextValue {
  navItems: NavigationItem[];
  services: Service[];
}

const SharedDataContext = createContext<SharedDataContextValue>({
  navItems: [],
  services: [],
});

export function SharedDataProvider({
  children,
  initialNavItems,
  initialServices,
}: {
  children: ReactNode;
  initialNavItems: NavigationItem[];
  initialServices: Service[];
}) {
  return (
    <SharedDataContext.Provider
      value={{ navItems: initialNavItems, services: initialServices }}
    >
      {children}
    </SharedDataContext.Provider>
  );
}

export function useSharedData() {
  return useContext(SharedDataContext);
}
