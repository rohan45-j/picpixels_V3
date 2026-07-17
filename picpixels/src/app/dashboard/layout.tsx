'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useSiteSettings } from '../../shared/contexts/SiteSettingsContext';
import NotificationCenter from '../../shared/components/NotificationCenter';
import styles from '../../shared/styles/modules/dashboard.module.css';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { siteSettings } = useSiteSettings();
  const [email, setEmail] = useState('guest@company.com');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    window.location.href = '/';
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar} data-open={sidebarOpen}>
        <button 
          className={styles.sidebarCloseBtn}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
        <Link href="/" className={styles.logo} onClick={() => setSidebarOpen(false)}>
          <span className={styles.logoIcon}>✦</span>
          <span>{siteSettings?.site_name || 'Photo Editor'}</span>
        </Link>

        <nav className={styles.nav}>
          <Link 
            href="/dashboard/overview" 
            className={`${styles.navLink} ${pathname === '/dashboard/overview' ? styles.navLinkActive : ''}`}
          >
            📊 Overview
          </Link>
          <Link 
            href="/dashboard/new-order" 
            className={`${styles.navLink} ${pathname === '/dashboard/new-order' ? styles.navLinkActive : ''}`}
          >
            ➕ Create Order
          </Link>
          <Link 
            href="/dashboard/orders/list" 
            className={`${styles.navLink} ${pathname?.includes('/orders') && pathname !== '/dashboard/new-order' ? styles.navLinkActive : ''}`}
          >
            📦 My Orders
          </Link>
          <Link 
            href="/dashboard/notifications" 
            className={`${styles.navLink} ${pathname === '/dashboard/notifications' ? styles.navLinkActive : ''}`}
          >
            🔔 Notifications
          </Link>
          <Link 
            href="/dashboard/media" 
            className={`${styles.navLink} ${pathname === '/dashboard/media' ? styles.navLinkActive : ''}`}
          >
            🖼️ Media Library
          </Link>
          <Link 
            href="/dashboard/api-ftp" 
            className={`${styles.navLink} ${pathname === '/dashboard/api-ftp' ? styles.navLinkActive : ''}`}
          >
            🔌 API & FTP Integrations
          </Link>
          <Link 
            href="/pricing" 
            className={styles.navLink}
          >
            💳 Purchase Credits
          </Link>
          <button 
            onClick={handleLogout} 
            className={styles.navLink}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', outline: 'none', marginTop: '2rem' }}
          >
            🚪 Log Out
          </button>
        </nav>

        {/* Credits Status Card */}
        <div className={styles.creditsCard}>
          <div className={styles.creditsTitle}>Available Credits</div>
          <div className={styles.creditsVal}>$245.50</div>
          <Link href="/pricing" className="btn btn-primary" style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}>
            Top-up Credits
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className={styles.backdrop} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Panel */}
      <main className={styles.main}>
        <header className={styles.topBar}>
          <button 
            className={styles.mobileMenuBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className={styles.topBarTitle}>
            {pathname?.includes('/dashboard/retoucher') ? 'Specialist Workspace' : 'Client Workstation'}
          </h2>
          <div className={styles.userMenu}>
            <Link 
              href={pathname?.includes('/dashboard/retoucher') ? '/dashboard/overview' : '/dashboard/retoucher'}
              style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--primary-light)',
                textDecoration: 'none',
                marginRight: '0.5rem',
                fontWeight: 600,
                transition: 'var(--transition-fast)'
              }}
              className="hover-opacity"
            >
              {pathname?.includes('/dashboard/retoucher') ? '🔄 Client Console' : '🛠️ Specialist Console'}
            </Link>
            <NotificationCenter />
            <span className={styles.email} style={{ marginLeft: '0.5rem' }}>{email}</span>
            <div className={styles.avatar}>
              {email.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>


        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}
