'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu, X, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HomeLink from '@/components/layout/HomeLink';
import MegaMenu from './MegaMenu';
import { useSiteSettings } from '@/store/SiteSettingsContext';
import styles from './styles.module.css';
import { fetchNavigationItems, fetchMegaMenuServices, mediaUrl, type Service, type NavigationItem } from '@/services/public-api';

export default function Header() {
  const pathname = usePathname();
  const { siteSettings, loading: settingsLoading } = useSiteSettings();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [navItems, setNavItems] = useState<NavigationItem[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchNavigationItems('header').then(setNavItems).catch(() => {});
    fetchMegaMenuServices().then(setServices).catch(() => {});
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setMobileOpen(false);
    setMobileAccordion(null);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  const handleClick = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  const isExternal = (url: string) => url?.startsWith('http://') || url?.startsWith('https://');
  const hasChildren = (item: NavigationItem) => item.children && item.children.length > 0;
  const isMegaMenu = (item: NavigationItem) => item.css_class?.includes('mega-menu');

  const renderDesktopLink = (item: NavigationItem) => {
    if (isExternal(item.url)) {
      return (
        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className={styles.navLink}>
          {item.label}
        </a>
      );
    }
    return (
      <a key={item.id} href={item.url} className={styles.navLink}>
        {item.label}
      </a>
    );
  };

  const renderDesktopDropdown = (item: NavigationItem) => {
    const children = item.children || [];
    const isOpen = activeDropdown === item.label;
    return (
      <div
        key={item.id}
        className={styles.navItem}
        onMouseEnter={() => handleMouseEnter(item.label)}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={() => handleClick(item.label)}
          className={`${styles.navLink} ${isOpen ? styles.navLinkActive : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {item.label}
          <span
            className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
          >
            <ChevronDown />
          </span>
        </button>
        <div className={`${styles.dropdownWrapper} ${isOpen ? styles.dropdownVisible : ''}`}>
          {isMegaMenu(item) ? (
            <MegaMenu services={services} />
          ) : (
            <div className={styles.simpleDropdown}>
              {children.map((child) => {
                if (isExternal(child.url)) {
                  return (
                    <a key={child.id} href={child.url} target="_blank" rel="noopener noreferrer" className={styles.simpleDropdownItem}>
                      {child.label}
                    </a>
                  );
                }
                return (
                  <a key={child.id} href={child.url} className={styles.simpleDropdownItem}>
                    {child.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMobileLink = (item: NavigationItem) => {
    if (isExternal(item.url)) {
      return (
        <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className={styles.mobileNavBtn} onClick={() => setMobileOpen(false)}>
          {item.label}
        </a>
      );
    }
    return (
      <a key={item.id} href={item.url} className={styles.mobileNavBtn} onClick={() => setMobileOpen(false)}>
        {item.label}
      </a>
    );
  };

  const renderMobileAccordion = (item: NavigationItem) => {
    const children = item.children || [];
    const isOpen = mobileAccordion === item.label;
    return (
      <div key={item.id} className={styles.mobileNavItem}>
        <button
          onClick={() => setMobileAccordion(isOpen ? null : item.label)}
          className={`${styles.mobileNavBtn} ${isOpen ? styles.mobileNavBtnActive : ''}`}
        >
          {item.label}
          {hasChildren(item) && (
            <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
              <ChevronDown />
            </span>
          )}
        </button>
        <div className={`${styles.mobileSubItems} ${isOpen ? styles.mobileSubItemsOpen : ''}`}>
          {isMegaMenu(item) ? (
            <>
              {services.map((svc) => (
                <a
                  key={svc.id}
                  href={`/services/${svc.slug}`}
                  className={styles.mobileSubItem}
                  onClick={() => setMobileOpen(false)}
                >
                  {svc.title}
                </a>
              ))}
              <a
                href="/services"
                className={styles.mobileSubItem}
                style={{ fontWeight: 600, color: 'var(--color-primary)' }}
                onClick={() => setMobileOpen(false)}
              >
                View All Services →
              </a>
            </>
          ) : (
            children.map((child) => {
              if (isExternal(child.url)) {
                return (
                  <a key={child.id} href={child.url} target="_blank" rel="noopener noreferrer" className={styles.mobileSubItem} onClick={() => setMobileOpen(false)}>
                    {child.label}
                  </a>
                );
              }
              return (
                <a key={child.id} href={child.url} className={styles.mobileSubItem} onClick={() => setMobileOpen(false)}>
                  {child.label}
                </a>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <header className={styles.header}>
        <HomeLink className={styles.logo}>
          {settingsLoading ? (
            <div className={styles.logoSkeleton} />
          ) : siteSettings?.logo ? (
            <img
              src={mediaUrl(siteSettings.logo) ?? undefined}
              alt={siteSettings.site_name}
              className={styles.logoImage}
            />
          ) : siteSettings?.site_name ? (
            <span className={styles.logoText}>{siteSettings.site_name}</span>
          ) : null}
        </HomeLink>

        <nav className={styles.desktopNav} aria-label="Main navigation">
          {navItems.map((item) =>
            hasChildren(item) ? renderDesktopDropdown(item) : renderDesktopLink(item)
          )}
        </nav>

        <div className={styles.desktopActions}>
          <a
            href="/book-demo"
            className={styles.demoCta}
          >
            <Phone />
            Book a Free Demo
          </a>
        </div>

        <button
          className={styles.mobileTrigger}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </header>

      <div className={`${styles.backdrop} ${mobileOpen ? styles.backdropVisible : ''}`} onClick={() => setMobileOpen(false)} aria-hidden="true" />

      <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`} role="dialog" aria-modal="true" aria-label="Mobile navigation">
        <div className={styles.mobileNavList}>
          {navItems.map((item) =>
            hasChildren(item) ? renderMobileAccordion(item) : renderMobileLink(item)
          )}
          <div className={styles.mobileDivider} />
        </div>
        <div className={styles.mobileActions}>
          <a
            href="/book-demo"
            className={`${styles.mobileActionBtn} ${styles.mobileActionBtnPrimary}`}
          >
            <Phone />
            Book a Free Demo
          </a>
        </div>
      </div>
    </>
  );
}
