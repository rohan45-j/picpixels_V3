'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import styles from '../../../shared/styles/modules/dashboard.module.css';

interface DashboardOrder {
  id: string;
  name: string;
  date: string;
  images: number;
  total: string;
  status: string;
  statusLabel: string;
}

export default function DashboardOverview() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setLoading(false);
          return;
        }
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}/api/v1/orders/`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (resp.ok) {
          const data = await resp.json();
          setOrders(data.results || data || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <section className={styles.statsGrid}>
        {[1,2,3,4].map((i) => (
          <div key={i} className={styles.statCard}>
            <div style={{ height: 14, width: '60%', background: 'var(--color-border)', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 28, width: '40%', background: 'var(--color-border)', borderRadius: 6 }} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <>
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Orders</span>
          <span className={styles.statVal}>{orders.filter(o => o.status !== 'completed').length}</span>
          <span className={styles.statSubtext} style={{ color: '#60a5fa' }}>Orders in progress</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Orders</span>
          <span className={styles.statVal}>{orders.length}</span>
          <span className={styles.statSubtext}>All time</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Platform Plan</span>
          <span className={styles.statVal}>PRO</span>
          <span className={styles.statSubtext}>Manage in settings</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Production SLA</span>
          <span className={styles.statVal}>24h</span>
          <span className={styles.statSubtext}>Standard turnaround</span>
        </div>
      </section>

      <section className={styles.sectionCard}>
        <div className={styles.dashboardHeader}>
          <h3>Recent Orders</h3>
          <Link href="/dashboard/new-order" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            + Create New Order
          </Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
            <p>No orders yet. Create your first order to get started.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Project Name</th>
                  <th>Submitted Date</th>
                  <th>Asset Qty</th>
                  <th>Total Sum</th>
                  <th>Work Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary-light)' }}>#{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.date}</td>
                    <td>{item.images} assets</td>
                    <td>{item.total}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        item.status === 'completed' ? styles.statusCompleted :
                        item.status === 'progress' ? styles.statusProgress :
                        item.status === 'review' ? styles.statusReview : styles.statusDraft
                      }`}>
                        {item.statusLabel}
                      </span>
                    </td>
                    <td>
                      <Link 
                        href={`/dashboard/orders/${item.id}`} 
                        className="btn btn-secondary btn-xs"
                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem' }}
                      >
                        {item.status === 'review' ? 'Review / Annotate' : 'View Assets'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
