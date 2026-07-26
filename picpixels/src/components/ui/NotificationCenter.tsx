'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { fetchUnreadCount, fetchNotifications, markNotificationRead, markAllNotificationsRead, type NotificationItem } from '@/services/notifications-api';
import styles from './NotificationCenter.module.css';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadUnreadCount = useCallback(async () => {
    const count = await fetchUnreadCount();
    setUnreadCount(count);
  }, []);

  const loadNotifications = useCallback(async () => {
    const data = await fetchNotifications();
    setNotifications(data);
    loadUnreadCount();
  }, [loadUnreadCount]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications, loadUnreadCount]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      loadNotifications();
    }
    setIsOpen(!isOpen);
  };

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
    loadUnreadCount();
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await markAllNotificationsRead(unreadIds);
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
    setUnreadCount(0);
  };

  const handleViewAll = () => {
    setIsOpen(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_order': return '📦';
      case 'contact_inquiry': return '✉️';
      case 'quote_request': return '📋';
      case 'support_message': return '💬';
      case 'payment_completed': return '✅';
      case 'payment_failed': return '❌';
      case 'refund_requested': return '↩️';
      case 'user_registration': return '👤';
      case 'user_update': return '🔄';
      case 'settings_updated': return '⚙️';
      case 'backup_completed': return '💾';
      case 'security_alert': return '🔒';
      default: return '🔔';
    }
  };

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={handleToggle}
        aria-label="Toggle notifications center"
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>Notifications</h3>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAllBtn} onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>No notifications yet.</div>
            ) : (
              notifications.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  className={`${styles.item} ${item.is_read ? '' : styles.itemUnread}`}
                  onClick={() => handleMarkRead(item.id)}
                >
                  <div className={styles.iconWrapper}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div className={styles.content}>
                    <p className={styles.message}>{item.title}</p>
                    <span className={styles.time}>{item.time_ago}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={styles.footer}>
            <Link href="/dashboard/notifications" className={styles.viewAllBtn} onClick={() => setIsOpen(false)}>
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
