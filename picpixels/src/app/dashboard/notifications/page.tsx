'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, type NotificationItem } from '@/services/notifications-api';
import styles from '@/styles/modules/dashboard.module.css';

type FilterTab = 'all' | 'unread';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications(filter === 'unread' ? 'unread' : undefined);
    setNotifications(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = search
    ? notifications.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())
      )
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    await markAllNotificationsRead(unreadIds);
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
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
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Notifications</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted-dark)' }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-dark-card)',
              color: 'var(--primary-light)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Mark All as Read
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-dark-card)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--glass-border)' }}>
          {(['all', 'unread'] as FilterTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                border: 'none',
                background: filter === tab ? 'var(--primary-light)' : 'transparent',
                color: filter === tab ? '#000' : 'var(--text-muted-dark)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'all' ? 'All' : 'Unread'}
              {tab === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--glass-border)',
            background: 'var(--bg-dark-card)',
            color: 'var(--text-white)',
            fontSize: '0.85rem',
            flex: 1,
            minWidth: '200px',
            maxWidth: '400px',
          }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted-dark)' }}>
          Loading notifications...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted-dark)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            {search ? 'No notifications match your search.' : filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '1rem',
                padding: '1rem 1.25rem',
                borderRadius: '10px',
                background: item.is_read ? 'var(--bg-dark-card)' : 'var(--bg-dark-elevated)',
                border: `1px solid ${item.is_read ? 'var(--glass-border)' : 'rgba(255, 138, 80, 0.15)'}`,
                alignItems: 'flex-start',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
              }}
              onClick={() => !item.is_read && handleMarkRead(item.id)}
            >
              {!item.is_read && (
                <span style={{
                  position: 'absolute',
                  left: '0.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                }} />
              )}
              <div style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }}>
                {getTypeIcon(item.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: item.is_read ? 500 : 700, fontSize: '0.9rem', color: 'var(--text-white)' }}>
                      {item.title}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted-dark)', lineHeight: 1.4 }}>
                      {item.message}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted-dark)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {item.time_ago}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    padding: '2px 8px',
                    borderRadius: '100px',
                    background: 'rgba(255, 138, 80, 0.1)',
                    color: 'var(--primary-light)',
                    fontWeight: 600,
                  }}>
                    {item.type_display}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted-dark)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: '4px',
                    }}
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
