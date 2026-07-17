'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AnnotationCanvas from '../../../../shared/components/AnnotationCanvas';
import styles from '../../../../shared/styles/modules/dashboard.module.css';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetails({ params }: PageProps) {
  const { id } = await params;
  const [selectedAsset, setSelectedAsset] = useState<{ id: string; name: string; original: string; edited: string; status: string } | null>({
    id: 'asset-1',
    name: 'nike_air_max_red_side.jpg',
    original: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    edited: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop&sat=-100&contrast=120',
    status: 'review'
  });

  const [assets, setAssets] = useState([
    { id: 'asset-1', name: 'nike_air_max_red_side.jpg', original: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', edited: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop&sat=-100&contrast=120', status: 'review' },
    { id: 'asset-2', name: 'nike_air_max_red_sole.jpg', original: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', edited: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop&sat=-100&contrast=120', status: 'approved' },
    { id: 'asset-3', name: 'nike_air_max_red_back.jpg', original: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop', edited: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop&sat=-100&contrast=120', status: 'approved' }
  ]);

  const handleApprove = () => {
    if (!selectedAsset) return;
    const updated = assets.map((item) => {
      if (item.id === selectedAsset.id) {
        return { ...item, status: 'approved' };
      }
      return item;
    });
    setAssets(updated);
    setSelectedAsset({ ...selectedAsset, status: 'approved' });
    alert('Asset successfully approved!');
  };

  const handleRequestRevision = () => {
    if (!selectedAsset) return;
    const updated = assets.map((item) => {
      if (item.id === selectedAsset.id) {
        return { ...item, status: 'revision_pending' };
      }
      return item;
    });
    setAssets(updated);
    setSelectedAsset({ ...selectedAsset, status: 'revision_pending' });
    alert('Revision request and coordinate feedback pins submitted to the retoucher!');
  };

  return (
    <div>
      {/* Top Breadcrumb Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <Link href="/dashboard/overview" style={{ color: 'var(--primary-light)', fontSize: '0.85rem' }}>
            ◀ Back to Overview
          </Link>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>Order #{id || '10928-1b'}</h2>
          <p style={{ color: 'var(--text-muted-dark)', fontSize: '0.9rem' }}>Project: Summer Campaign Shoes • Submitted May 20, 2026</p>
        </div>

        <div>
          <span 
            className={styles.statusBadge} 
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.2)' }}
          >
            Review Pending (1 asset)
          </span>
        </div>
      </div>

      {/* Order Status Step Bar */}
      <div className={styles.stepBar}>
        {['Uploaded', 'Retouching', 'Quality Check', 'Review Pending', 'Approved'].map((label, idx) => (
          <div key={label} className={`${styles.stepItem} ${idx <= (selectedAsset ? (selectedAsset.status === 'approved' ? 4 : selectedAsset.status === 'revision_pending' ? 3 : selectedAsset.status === 'review' ? 2 : 1) : 0) ? styles.stepCompleted : ''} ${selectedAsset && selectedAsset.status === (label.toLowerCase().replace(' ', '_')) ? styles.stepActive : ''}`}
            >
            <div className={styles.stepCircle}>{idx + 1}</div>
            <div className={styles.stepLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Grid of Order Items */}
      <div className={styles.sectionCard} style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Batch Assets ({assets.length} items)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
          {assets.map((item) => (
            <div 
              key={item.id}
              onClick={() => setSelectedAsset(item)}
              style={{
                border: selectedAsset?.id === item.id ? '2px solid var(--primary-light)' : '1px solid var(--glass-border)',
                borderRadius: '8px',
                padding: '0.6rem',
                cursor: 'pointer',
                background: 'var(--bg-dark-elevated)',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <img 
                src={item.edited} 
                alt={item.name} 
                style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.6rem' }} 
              />
              <div style={{ fontSize: '0.75rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.4rem' }}>
                {item.name}
              </div>
              <span className={`${styles.statusBadge}`} style={{
                fontSize: '0.65rem',
                background: item.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: item.status === 'approved' ? 'var(--primary-light)' : '#fbbf24'
              }}>
                {item.status === 'approved' ? 'Approved' : 'Needs Review'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Review Portal / Selected Asset Viewer */}
      {selectedAsset && (
        <div className={styles.sectionCard} style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>Interactive Review Portal</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-dark)' }}>Viewing: {selectedAsset.name}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleRequestRevision}
                disabled={selectedAsset.status === 'approved'}
              >
                Submit Revision Request
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={handleApprove}
                disabled={selectedAsset.status === 'approved'}
              >
                {selectedAsset.status === 'approved' ? '✓ Approved' : 'Approve Asset'}
              </button>
            </div>
          </div>

          <AnnotationCanvas 
            originalImage={selectedAsset.original}
            editedImage={selectedAsset.edited}
          />
        </div>
      )}
    </div>
  );
}
