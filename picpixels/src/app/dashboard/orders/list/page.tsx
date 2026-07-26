'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/modules/dashboard.module.css';

export default function OrdersList() {
  const [filter, setFilter] = useState<'all' | 'progress' | 'review' | 'completed'>('all');
  const [orders] = useState([
    { id: '10928-1b', name: 'Summer Campaign Shoes', date: 'May 20, 2026', images: 12, total: '$27.00', status: 'review', statusLabel: 'Review Pending' },
    { id: '10915-4c', name: 'Ghost Mannequin Jackets', date: 'May 18, 2026', images: 8, total: '$20.00', status: 'progress', statusLabel: 'In Progress' },
    { id: '10887-8e', name: 'Jewelry Focus Stacks', date: 'May 14, 2026', images: 5, total: '$12.75', status: 'completed', statusLabel: 'Approved' },
    { id: '10812-2d', name: 'Winter Knits Clippings', date: 'May 10, 2026', images: 32, total: '$40.80', status: 'completed', statusLabel: 'Approved' }
  ]);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

  return (
    <div className={styles.sectionCard}>
      <div className={styles.dashboardHeader} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>My Production Batches</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-dark)', marginTop: '0.2rem' }}>Track turnaround speeds and download high-resolution completed assets.</p>
        </div>
        
        <Link href="/dashboard/new-order" className="btn btn-primary btn-sm">
          + Create Batch
        </Link>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Orders' },
          { id: 'progress', label: 'In Progress' },
          { id: 'review', label: 'Review Pending' },
          { id: 'completed', label: 'Approved' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className="btn btn-secondary btn-xs"
            style={{
              padding: '0.5rem 1.2rem',
              fontSize: '0.8rem',
              background: filter === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              borderColor: filter === tab.id ? 'var(--primary-light)' : 'var(--glass-border)',
              color: '#fff'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className={styles.tableWrapper}>
        {filteredOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted-dark)', fontSize: '0.9rem' }}>
            No orders found matching the filter selection.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Project Name</th>
                <th>Submitted Date</th>
                <th>Asset Qty</th>
                <th>Total Sum</th>
                <th>Work Status</th>
                <th>Interactive Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((item) => (
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
                      {item.status === 'review' ? '⚡ Review / Annotate' : 'View Assets'}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
