'use client';

import { useState, useRef, MouseEvent } from 'react';
import styles from './AnnotationCanvas.module.css';

interface Annotation {
  id: string;
  x: number; // percentage
  y: number; // percentage
  comment: string;
}

interface AnnotationCanvasProps {
  originalImage: string;
  editedImage: string;
  onAnnotationsChanged?: (annotations: Annotation[]) => void;
}

export default function AnnotationCanvas({
  originalImage,
  editedImage,
  onAnnotationsChanged
}: AnnotationCanvasProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>([
    { id: '1', x: 42.5, y: 35.0, comment: 'Slight white halo around shoe collar, needs smoothing.' },
    { id: '2', x: 68.2, y: 78.4, comment: 'Increase drop shadow intensity below the heel.' }
  ]);
  const [viewMode, setViewMode] = useState<'edited' | 'original'>('edited');
  const [tempPin, setTempPin] = useState<{ x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    if (viewMode === 'original' || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setTempPin({ x, y });
    setSelectedPinId(null);
  };

  const handleAddPin = () => {
    if (!tempPin || !commentText.trim()) return;

    const newPin: Annotation = {
      id: Date.now().toString(),
      x: Number(tempPin.x.toFixed(2)),
      y: Number(tempPin.y.toFixed(2)),
      comment: commentText
    };

    const updated = [...annotations, newPin];
    setAnnotations(updated);
    setTempPin(null);
    setCommentText('');
    
    if (onAnnotationsChanged) {
      onAnnotationsChanged(updated);
    }
  };

  const handleCancelPin = () => {
    setTempPin(null);
    setCommentText('');
  };

  const handleDeletePin = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const updated = annotations.filter((pin) => pin.id !== id);
    setAnnotations(updated);
    if (selectedPinId === id) setSelectedPinId(null);

    if (onAnnotationsChanged) {
      onAnnotationsChanged(updated);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Left Column: Image Canvas & Compare controls */}
      <div>
        <div className={styles.toggleHeader}>
          <h4 style={{ margin: 0 }}>Review Finished Asset</h4>
          
          <div className={styles.toggleGroup}>
            <button 
              type="button" 
              className={`${styles.toggleBtn} ${viewMode === 'edited' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setViewMode('edited'); setTempPin(null); }}
            >
              Edited View
            </button>
            <button 
              type="button" 
              className={`${styles.toggleBtn} ${viewMode === 'original' ? styles.toggleBtnActive : ''}`}
              onClick={() => { setViewMode('original'); setTempPin(null); }}
            >
              Original Raw
            </button>
          </div>
        </div>

        <div 
          ref={containerRef}
          className={styles.canvasContainer} 
          onClick={handleCanvasClick}
        >
          <img 
            src={viewMode === 'edited' ? editedImage : originalImage} 
            alt="Product canvas" 
            className={styles.image}
            draggable={false}
          />

          {viewMode === 'edited' && (
            <>
              {/* Render Saved Pins */}
              {annotations.map((pin, idx) => (
                <div 
                  key={pin.id}
                  className={`${styles.pin} ${selectedPinId === pin.id ? styles.pinActive : ''}`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPinId(pin.id);
                    setTempPin(null);
                  }}
                >
                  {idx + 1}
                </div>
              ))}

              {/* Render temporary click pin */}
              {tempPin && (
                <div 
                  className={styles.tempPin} 
                  style={{ left: `${tempPin.x}%`, top: `${tempPin.y}%` }}
                />
              )}
            </>
          )}
        </div>
        
        {viewMode === 'edited' && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted-dark)', marginTop: '0.8rem', textAlign: 'center' }}>
            💡 Hover and click directly on the image to place a feedback pin at exact coordinates.
          </p>
        )}
      </div>

      {/* Right Column: Feedback List & Pin Creation Form */}
      <div className={styles.sidebar}>
        <h3 className={styles.sidebarTitle}>Feedback Pins</h3>

        {/* Pin Creation Form */}
        {tempPin && (
          <div className={styles.formCard}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted-dark)', marginBottom: '0.5rem', fontWeight: 600 }}>
              PLACING PIN #{annotations.length + 1} (X: {tempPin.x.toFixed(1)}%, Y: {tempPin.y.toFixed(1)}%)
            </div>
            <textarea 
              className={styles.textarea}
              placeholder="What should the retoucher fix here? (e.g. Smooth edges, color matching...)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className={styles.formActions}>
              <button 
                type="button" 
                className="btn btn-secondary btn-xs"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                onClick={handleCancelPin}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-xs"
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                onClick={handleAddPin}
              >
                Save Pin
              </button>
            </div>
          </div>
        )}

        {/* Annotation List */}
        {annotations.length === 0 ? (
          <div className={styles.emptyState}>
            No feedback pins placed yet. The asset looks perfect! Click the image if revisions are needed.
          </div>
        ) : (
          <div className={styles.pinList}>
            {annotations.map((pin, idx) => (
              <div 
                key={pin.id}
                className={`${styles.pinItem} ${selectedPinId === pin.id ? styles.pinItemActive : ''}`}
                onClick={() => { setSelectedPinId(pin.id); setTempPin(null); }}
              >
                <div className={styles.pinItemHeader}>
                  <span className={styles.pinBadge}>{idx + 1}</span>
                  <span className={styles.pinCoords}>X: {pin.x}%, Y: {pin.y}%</span>
                  <button 
                    type="button" 
                    className={styles.deleteBtn}
                    onClick={(e) => handleDeletePin(pin.id, e)}
                  >
                    Delete
                  </button>
                </div>
                <p className={styles.pinComment}>{pin.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
