'use client';

import { useState } from 'react';
import styles from '@/styles/modules/dashboard.module.css';

export default function MediaGallery() {
  const [filter, setFilter] = useState<'all' | 'raw' | 'edited'>('all');
  const [mediaItems] = useState([
    { id: 1, name: 'shoes_raw_01.jpg', size: '2.4 MB', type: 'raw', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop', status: 'Raw Original' },
    { id: 2, name: 'shoes_edited_01.png', size: '1.8 MB', type: 'edited', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop&sat=-100&contrast=120', status: 'Completed Output' },
    { id: 3, name: 'cosmetic_raw_22.tiff', size: '14.2 MB', type: 'raw', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop', status: 'Raw Original' },
    { id: 4, name: 'cosmetic_edited_22.png', size: '6.4 MB', type: 'edited', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop&hue=180&contrast=110', status: 'Completed Output' },
    { id: 5, name: 'apparel_raw_99.png', size: '8.1 MB', type: 'raw', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop', status: 'Raw Original' },
    { id: 6, name: 'apparel_edited_99.png', size: '4.2 MB', type: 'edited', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=600&auto=format&fit=crop&sat=-50&contrast=105', status: 'Completed Output' }
  ]);

  const filteredItems = mediaItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className={styles.sectionCard}>
      <div className={styles.dashboardHeader} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>Production Media Library</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-dark)', marginTop: '0.2rem' }}>Central repository of your uploaded camera assets and final retouched deliverables.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {[
          { id: 'all', label: 'All Files' },
          { id: 'raw', label: 'Original Raw' },
          { id: 'edited', label: 'Completed Deliverables' }
        ].map((tab) => (
          <button
            key={tab.id}
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

      {/* Visual Thumbnail Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
              <img src={item.url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <span 
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: item.type === 'raw' ? 'rgba(0,0,0,0.6)' : 'rgba(16,185,129,0.8)', color: '#fff', fontWeight: 600 }}
              >
                {item.status}
              </span>
            </div>
            
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', color: '#fff' }}>
                {item.name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted-dark)' }}>
                Size: {item.size}
              </span>
              
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.8rem' }}>
                <a 
                  href={item.url} 
                  download 
                  target="_blank"
                  className="btn btn-secondary btn-xs" 
                  style={{ flexGrow: 1, padding: '0.4rem', fontSize: '0.75rem', textAlign: 'center', textDecoration: 'none' }}
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
