'use client';

import { useState } from 'react';
import styles from '@/styles/modules/retoucher.module.css';

interface Annotation {
  id: string;
  x: number;
  y: number;
  comment: string;
}

interface Ticket {
  id: string;
  orderId: string;
  clientName: string;
  service: string;
  assetCount: number;
  priority: 'urgent' | 'high' | 'normal';
  slaPercent: number;
  slaRemaining: string;
  thumb: string;
  fullImage: string;
  claimed: boolean;
  annotations: Annotation[];
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'TK-4821',
    orderId: '#10928-1b',
    clientName: 'Nike Direct EU',
    service: 'Background Removal + Shadow',
    assetCount: 12,
    priority: 'urgent',
    slaPercent: 82,
    slaRemaining: '1h 24m left',
    thumb: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=300&auto=format&fit=crop',
    fullImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
    claimed: false,
    annotations: [
      { id: 'a1', x: 42.5, y: 35.0, comment: 'Slight white halo around shoe collar, needs smoothing.' },
      { id: 'a2', x: 68.2, y: 78.4, comment: 'Increase drop shadow intensity below the heel.' }
    ]
  },
  {
    id: 'TK-4822',
    orderId: '#10931-3a',
    clientName: 'Zalando Brand Studio',
    service: 'Color Correction + Retouching',
    assetCount: 8,
    priority: 'high',
    slaPercent: 45,
    slaRemaining: '4h 10m left',
    thumb: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop',
    fullImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200&auto=format&fit=crop',
    claimed: false,
    annotations: [
      { id: 'b1', x: 30.0, y: 50.0, comment: 'Color temperature too warm — shift to 5600K neutral daylight.' }
    ]
  },
  {
    id: 'TK-4823',
    orderId: '#10935-7c',
    clientName: 'ASOS Marketplace',
    service: 'Ghost Mannequin Composite',
    assetCount: 24,
    priority: 'normal',
    slaPercent: 20,
    slaRemaining: '11h 30m left',
    thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300&auto=format&fit=crop',
    fullImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop',
    claimed: false,
    annotations: []
  },
  {
    id: 'TK-4824',
    orderId: '#10937-2d',
    clientName: 'H&M Group',
    service: 'Multi-angle Pack Shot Editing',
    assetCount: 6,
    priority: 'normal',
    slaPercent: 10,
    slaRemaining: '23h 45m left',
    thumb: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=300&auto=format&fit=crop',
    fullImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=1200&auto=format&fit=crop',
    claimed: false,
    annotations: [
      { id: 'c1', x: 55.0, y: 40.0, comment: 'Remove dust specks on upper toe cap.' },
      { id: 'c2', x: 20.0, y: 65.0, comment: 'Align left edge with product grid template.' },
      { id: 'c3', x: 80.0, y: 25.0, comment: 'Smooth out wrinkle crease near the lace hole row.' }
    ]
  }
];

export default function RetoucherDashboard() {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'high' | 'normal'>('all');
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string[]>>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const filtered = filter === 'all'
    ? tickets
    : tickets.filter((t) => t.priority === filter);

  const handleClaim = (ticketId: string) => {
    setTickets(tickets.map((t) =>
      t.id === ticketId ? { ...t, claimed: true } : t
    ));
  };

  const handleDownload = (ticketId: string) => {
    alert(`Downloading source files for ticket ${ticketId}…`);
  };

  const handleDropFiles = (ticketId: string, e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const fileNames = Array.from(e.dataTransfer.files).map((f) => f.name);
    if (fileNames.length > 0) {
      setUploadedFiles((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), ...fileNames]
      }));
    }
  };

  const handleFileInput = (ticketId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name);
      setUploadedFiles((prev) => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), ...fileNames]
      }));
    }
  };

  const handleDeliverFiles = (ticketId: string) => {
    const files = uploadedFiles[ticketId];
    if (!files || files.length === 0) {
      alert('Please upload at least one edited file before delivering.');
      return;
    }
    alert(`${files.length} edited file(s) delivered for ticket ${ticketId}. Moving to Quality Check.`);
    setUploadedFiles((prev) => ({ ...prev, [ticketId]: [] }));
  };

  const getSlaColor = (pct: number) => {
    if (pct >= 70) return styles.slaRed;
    if (pct >= 40) return styles.slaYellow;
    return styles.slaGreen;
  };

  const getPriorityClass = (p: string) => {
    switch (p) {
      case 'urgent': return styles.priorityUrgent;
      case 'high': return styles.priorityHigh;
      default: return styles.priorityNormal;
    }
  };

  // Stats
  const totalOpen = tickets.filter((t) => !t.claimed).length;
  const totalClaimed = tickets.filter((t) => t.claimed).length;
  const totalAssets = tickets.reduce((sum, t) => sum + t.assetCount, 0);
  const urgentCount = tickets.filter((t) => t.priority === 'urgent' && !t.claimed).length;

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Retoucher Workspace</h1>
        <p className={styles.pageSubtitle}>
          Claim tickets, review client coordinate feedback, and deliver retouched assets.
        </p>
      </div>

      {/* Stats Strip */}
      <div className={styles.statsStrip}>
        <div className={styles.miniStat}>
          <span className={styles.miniStatLabel}>Open Queue</span>
          <span className={`${styles.miniStatValue} ${styles.miniStatAccent}`}>{totalOpen}</span>
        </div>
        <div className={styles.miniStat}>
          <span className={styles.miniStatLabel}>My Claimed</span>
          <span className={`${styles.miniStatValue} ${styles.miniStatInfo}`}>{totalClaimed}</span>
        </div>
        <div className={styles.miniStat}>
          <span className={styles.miniStatLabel}>Total Assets</span>
          <span className={styles.miniStatValue} style={{ color: 'var(--text-white)' }}>{totalAssets}</span>
        </div>
        <div className={styles.miniStat}>
          <span className={styles.miniStatLabel}>Urgent Tickets</span>
          <span className={`${styles.miniStatValue} ${styles.miniStatWarn}`}>{urgentCount}</span>
        </div>
      </div>

      {/* Queue Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.dashboardHeader}>📋 Ticket Queue</h2>
          <div className={styles.filterGroup}>
            {(['all', 'urgent', 'high', 'normal'] as const).map((f) => (
              <button
                key={f}
                type="button"
                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.queueGrid}>
          {filtered.length === 0 ? (
            <div className={styles.emptyQueue}>
              <div className={styles.emptyIcon}>📭</div>
              No tickets match the selected filter.
            </div>
          ) : (
            filtered.map((ticket) => (
              <div key={ticket.id}>
                {/* Ticket Row Card */}
                <div
                  className={styles.ticketCard}
                  onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <img
                    src={ticket.thumb}
                    alt={ticket.orderId}
                    className={styles.ticketThumb}
                  />
                  <div className={styles.ticketInfo}>
                    <span className={styles.ticketId}>
                      {ticket.id} — {ticket.orderId}
                      {ticket.claimed && (
                        <span style={{ marginLeft: '0.6rem', fontSize: '0.7rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                          ✓ CLAIMED
                        </span>
                      )}
                    </span>
                    <div className={styles.ticketMeta}>
                      <span className={styles.ticketMetaItem}>👤 {ticket.clientName}</span>
                      <span className={styles.ticketMetaItem}>🎨 {ticket.service}</span>
                      <span className={styles.ticketMetaItem}>📸 {ticket.assetCount} assets</span>
                      <span className={`${styles.ticketPriority} ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    {/* SLA Progress Bar */}
                    <div className={styles.slaBar}>
                      <span className={styles.slaLabel}>SLA</span>
                      <div className={styles.slaTrack}>
                        <div
                          className={`${styles.slaFill} ${getSlaColor(ticket.slaPercent)}`}
                          style={{ width: `${ticket.slaPercent}%` }}
                        />
                      </div>
                      <span
                        className={styles.slaTime}
                        style={{ color: ticket.slaPercent >= 70 ? '#f87171' : ticket.slaPercent >= 40 ? '#fbbf24' : 'var(--primary-light)' }}
                      >
                        {ticket.slaRemaining}
                      </span>
                    </div>
                  </div>
                  <div className={styles.ticketActions} onClick={(e) => e.stopPropagation()}>
                    {!ticket.claimed ? (
                      <button
                        type="button"
                        className={styles.claimBtn}
                        onClick={() => handleClaim(ticket.id)}
                      >
                        Claim Ticket
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.downloadBtn}
                        onClick={() => handleDownload(ticket.id)}
                      >
                        ⬇ Download Source
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Review Panel */}
                {expandedTicket === ticket.id && (
                  <div className={styles.reviewOverlay}>
                    <h3 className={styles.reviewTitle}>
                      🎯 Client Feedback for {ticket.id}
                      {ticket.annotations.length > 0 && (
                        <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted-dark)' }}>
                          — {ticket.annotations.length} pinpoint{ticket.annotations.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </h3>

                    {/* Canvas with coordinate annotation pins */}
                    <div className={styles.reviewCanvas}>
                      <img
                        src={ticket.fullImage}
                        alt={`Review canvas for ${ticket.id}`}
                        className={styles.reviewImage}
                        draggable={false}
                      />
                      {ticket.annotations.map((pin, idx) => (
                        <div
                          key={pin.id}
                          className={styles.reviewPin}
                          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                          onMouseEnter={() => setHoveredPin(pin.id)}
                          onMouseLeave={() => setHoveredPin(null)}
                        >
                          {idx + 1}
                          {hoveredPin === pin.id && (
                            <div className={styles.reviewPinTooltip}>
                              {pin.comment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Feedback list underneath */}
                    {ticket.annotations.length > 0 ? (
                      <div className={styles.feedbackList}>
                        {ticket.annotations.map((pin, idx) => (
                          <div key={pin.id} className={styles.feedbackItem}>
                            <div className={styles.feedbackBadge}>{idx + 1}</div>
                            <div>
                              <div className={styles.feedbackText}>{pin.comment}</div>
                              <div className={styles.feedbackCoords}>
                                Coordinates: X {pin.x.toFixed(1)}%, Y {pin.y.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted-dark)', fontSize: '0.85rem', marginTop: '1rem', textAlign: 'center' }}>
                        No client feedback annotations on this ticket yet. Proceed with standard retouching guidelines.
                      </p>
                    )}

                    {/* Delivery Dropzone */}
                    {ticket.claimed && (
                      <div className={styles.dropzoneSection}>
                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📤 Deliver Edited Files</h4>
                        <div
                          className={styles.dropzone}
                          style={isDragOver ? { borderColor: 'var(--primary-light)', background: 'rgba(16, 185, 129, 0.08)' } : {}}
                          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                          onDragLeave={() => setIsDragOver(false)}
                          onDrop={(e) => handleDropFiles(ticket.id, e)}
                          onClick={() => {
                            const inp = document.getElementById(`file-input-${ticket.id}`);
                            if (inp) inp.click();
                          }}
                        >
                          <span className={styles.dropzoneIcon}>📁</span>
                          <span className={styles.dropzoneLabel}>
                            Drop edited files here or click to browse
                          </span>
                          <span className={styles.dropzoneHint}>
                            Supports PSD, TIFF, PNG, JPG — max 200MB per file
                          </span>
                          <input
                            id={`file-input-${ticket.id}`}
                            type="file"
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => handleFileInput(ticket.id, e)}
                          />
                        </div>

                        {/* Show uploaded files */}
                        {uploadedFiles[ticket.id] && uploadedFiles[ticket.id].length > 0 && (
                          <div style={{ marginTop: '1rem' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-dark)', marginBottom: '0.5rem' }}>
                              Staged files ({uploadedFiles[ticket.id].length}):
                            </p>
                            {uploadedFiles[ticket.id].map((fname, i) => (
                              <div key={i} style={{
                                fontSize: '0.8rem',
                                padding: '0.4rem 0.6rem',
                                background: 'rgba(16, 185, 129, 0.06)',
                                border: '1px solid rgba(16, 185, 129, 0.15)',
                                borderRadius: '4px',
                                marginBottom: '0.4rem',
                                color: 'var(--text-white)'
                              }}>
                                📄 {fname}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className={styles.submitDelivery}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '0.6rem 2rem' }}
                            onClick={() => handleDeliverFiles(ticket.id)}
                          >
                            ✓ Deliver to Quality Check
                          </button>
                        </div>
                      </div>
                    )}

                    {!ticket.claimed && (
                      <p style={{ color: 'var(--text-muted-dark)', fontSize: '0.8rem', marginTop: '1.5rem', textAlign: 'center', fontStyle: 'italic' }}>
                        Claim this ticket to unlock the delivery dropzone and begin retouching.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
