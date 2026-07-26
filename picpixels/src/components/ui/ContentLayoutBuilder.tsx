'use client';

import { useState, useRef, useEffect } from 'react';
import {
  GripVertical, Plus, Trash2, ChevronUp, ChevronDown,
  ChevronRight, ImageIcon, Bold, Italic, Link2, List, Heading, X, Check,
} from 'lucide-react';
import type { ContentBlock } from '@/services/public-api';

interface Props {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  label?: string;
}

/* ── Simple section categories (user-friendly, no technical names) ── */
const CATEGORIES: {
  label: string;
  types: { value: ContentBlock['type']; label: string; desc: string }[];
}[] = [
  {
    label: 'Basic Content',
    types: [
      { value: 'heading', label: 'Heading', desc: 'Section title or headline' },
      { value: 'text', label: 'Text', desc: 'Paragraph with rich formatting' },
      { value: 'quote', label: 'Quote', desc: 'Pull quote with author credit' },
    ],
  },
  {
    label: 'Media Content',
    types: [
      { value: 'image', label: 'Image', desc: 'Single image with caption' },
      { value: 'full_width_image', label: 'Full-Width Image', desc: 'Hero-style banner image' },
      { value: 'gallery', label: 'Gallery', desc: 'Grid of multiple images' },
    ],
  },
  {
    label: 'Layout Sections',
    types: [
      { value: 'image_with_text', label: 'Image with Text', desc: 'Image beside text column' },
      { value: 'divider', label: 'Divider', desc: 'Horizontal separator line' },
      { value: 'callout', label: 'Callout Box', desc: 'Highlighted info box' },
    ],
  },
  {
    label: 'Advanced Sections',
    types: [
      { value: 'faq', label: 'FAQ', desc: 'Question and answer pair' },
      { value: 'list', label: 'List', desc: 'Bullet or numbered items' },
      { value: 'step', label: 'Steps', desc: 'Numbered instruction step' },
      { value: 'stats', label: 'Stats', desc: 'Data highlight with value' },
      { value: 'cta', label: 'CTA', desc: 'Call-to-action button' },
      { value: 'code', label: 'Code', desc: 'Code snippet (advanced)' },
    ],
  },
];

const headingLevels = [
  { value: 2, label: 'H2' },
  { value: 3, label: 'H3' },
];

/* ── Helpers ── */
function createEmptyBlock(type: ContentBlock['type']): ContentBlock {
  const base = { type };
  switch (type) {
    case 'heading': return { ...base, content: '', level: 2 };
    case 'text': return { ...base, content: '' };
    case 'image': return { ...base, src: '', alt: '', caption: '' };
    case 'image_with_text': return { ...base, src: '', alt: '', caption: '', text: '', layout: 'left' };
    case 'gallery': return { ...base, images: [{ src: '', alt: '', caption: '' }] };
    case 'code': return { ...base, content: '', language: '' };
    case 'callout': return { ...base, style: 'info', title: '', content: '' };
    case 'faq': return { ...base, question: '', answer: '' };
    case 'list': return { ...base, items: [''], ordered: false };
    case 'table': return { ...base, headers: [''], rows: [['']] };
    case 'step': return { ...base, title: '', content: '' };
    case 'stats': return { ...base, stat_value: '', stat_label: '', stat_description: '' };
    case 'quote': return { ...base, content: '', quote_author: '', quote_role: '' };
    case 'cta': return { ...base, button_text: '', button_link: '', cta_description: '' };
    case 'full_width_image': return { ...base, src: '', alt: '', caption: '', alignment: 'full' };
    case 'divider': return base;
    default: return base;
  }
}

function getTypeLabel(type: string): string {
  for (const cat of CATEGORIES) {
    const found = cat.types.find(t => t.value === type);
    if (found) return found.label;
  }
  return type;
}

function stripHtml(v: string) { return v.replace(/<[^>]*>/g, ''); }
function short(v?: string | null, n = 55) { return v ? stripHtml(v).slice(0, n) : ''; }

/* ── UI primitives ── */
const labelW = { fontWeight: 600, fontSize: '0.78rem', color: 'var(--admin-text-secondary)', marginBottom: 4, display: 'block' } as const;
function InlineLabel({ children }: { children: React.ReactNode }) { return <label style={labelW}>{children}</label>; }

function ImagePreview({ src, size = 240 }: { src?: string; size?: number }) {
  if (!src) return null;
  return (
    <div style={{
      marginTop: 6, borderRadius: 8, overflow: 'hidden',
      border: '1px solid var(--admin-border)',
      maxWidth: size, background: 'var(--admin-bg)',
    }}>
      <img src={src} alt="" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: size * 0.5, objectFit: 'cover' }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
    </div>
  );
}

/* ── Step group — numbered step in the guided form ── */
function StepGroup({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--admin-primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
        }}>{step}</span>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--admin-text)' }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ── Formatting toolbar ── */
function TextEditor({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const insertAtCursor = (before: string, after: string) => {
    const ta = textareaRef.current; if (!ta) return;
    const s = ta.selectionStart, e = ta.selectionEnd, sel = value.substring(s, e);
    const nv = value.substring(0, s) + before + sel + after + value.substring(e);
    onChange(nv);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(s + before.length, s + before.length + sel.length); });
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', padding: '4px 4px 0' }}>
        <FmtBtn icon={<Bold size={14} />} label="Bold" onClick={() => insertAtCursor('<strong>', '</strong>')} />
        <FmtBtn icon={<Italic size={14} />} label="Italic" onClick={() => insertAtCursor('<em>', '</em>')} />
        <FmtBtn icon={<Link2 size={14} />} label="Link" onClick={() => { const url = prompt('Enter URL:', 'https://'); if (url) insertAtCursor(`<a href="${url}">`, '</a>'); }} />
        <FmtBtn icon={<Heading size={14} />} label="H3" onClick={() => insertAtCursor('<h3>', '</h3>')} />
        <FmtBtn icon={<List size={14} />} label="List" onClick={() => insertAtCursor('<ul>\n  <li>', '</li>\n</ul>')} />
        <FmtBtn icon={<code style={{ fontSize: 12 }}>{'</>'}</code>} label="Code" onClick={() => insertAtCursor('<code>', '</code>')} />
      </div>
      <textarea ref={textareaRef} className="admin-form-textarea" rows={5}
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ fontFamily: 'monospace', fontSize: '0.82rem', borderTopLeftRadius: 0, borderTopRightRadius: 0 }} />
    </div>
  );
}

function FmtBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" title={label} onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 30, height: 30, border: '1px solid var(--admin-border)',
        borderRadius: 6, background: 'var(--admin-bg)', cursor: 'pointer',
        color: 'var(--admin-text-secondary)', fontSize: '0.78rem',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--admin-primary-subtle)'; e.currentTarget.style.color = 'var(--admin-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--admin-bg)'; e.currentTarget.style.color = 'var(--admin-text-secondary)'; }} />
  );
}

/* ── Step indicator ── */
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 16 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i === current ? 'var(--admin-primary)' : i < current ? 'var(--admin-primary-subtle)' : 'var(--admin-border)',
          transition: 'background 0.2s',
        }} />
      ))}
      <span style={{ fontSize: '0.7rem', color: 'var(--admin-text-secondary)', marginLeft: 6 }}>
        Step {current + 1} of {total}
      </span>
    </div>
  );
}

/* ── Section type picker modal ── */
function SectionPicker({ onSelect, onClose }: { onSelect: (type: ContentBlock['type']) => void; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div ref={overlayRef} style={{
        background: 'var(--admin-bg-card)',
        borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        maxWidth: 680, width: '92%',
        maxHeight: '88vh', overflowY: 'auto',
        padding: 32,
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, paddingBottom: 18,
          borderBottom: '1px solid var(--admin-border)',
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Add Section</h3>
          <button type="button" onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--admin-text-secondary)', padding: 6, borderRadius: 8,
          }}><X size={20} /></button>
        </div>

        <StepDots current={1} total={4} />

        <p style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginBottom: 18 }}>
          Choose a section type:
        </p>

        {CATEGORIES.map((cat, ci) => (
          <div key={cat.label} style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.06em', color: 'var(--admin-text-secondary)',
              }}>{cat.label}</span>
              {ci === CATEGORIES.length - 1 && (
                <span style={{
                  fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase',
                  background: 'var(--admin-border)', color: 'var(--admin-text-secondary)',
                  padding: '1px 7px', borderRadius: 4, letterSpacing: '0.03em',
                }}>For experienced users</span>
              )}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 8,
            }}>
              {cat.types.map((t) => (
                <button key={t.value} type="button" onClick={() => onSelect(t.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    border: '1px solid var(--admin-border)',
                    borderRadius: 10,
                    background: 'var(--admin-bg)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-primary)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(255,138,80,0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--admin-border)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: ci === CATEGORIES.length - 1 ? 'var(--admin-border)' : 'var(--admin-primary-subtle)',
                    color: ci === CATEGORIES.length - 1 ? 'var(--admin-text-secondary)' : 'var(--admin-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', flexShrink: 0, fontWeight: 700,
                  }}>
                    {t.label.charAt(0)}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--admin-text)' }}>{t.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: 2 }}>{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Collapsed preview components (mini rendered look) ── */
function CollapsedPreview({ block, summaryText }: { block: ContentBlock; summaryText?: string | null }) {
  switch (block.type) {
    case 'quote':
      return (
        <span style={{
          fontSize: '0.76rem', color: 'var(--admin-text-light)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontStyle: 'italic', opacity: 0.7, marginLeft: 2,
        }}>
          &ldquo;{summaryText}&rdquo;
        </span>
      );
    case 'cta':
      return block.button_text ? (
        <span style={{
          display: 'inline-flex', fontSize: '0.7rem', fontWeight: 600,
          padding: '1px 10px', borderRadius: 4,
          background: 'var(--admin-primary-subtle)', color: 'var(--admin-primary)',
          marginLeft: 4, letterSpacing: '0.02em',
        }}>
          {block.button_text}
        </span>
      ) : null;
    case 'stats':
      return block.stat_value ? (
        <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--admin-text)', marginLeft: 2 }}>
          {block.stat_value}{block.stat_label ? ` ${block.stat_label}` : ''}
        </span>
      ) : null;
    default:
      return summaryText ? (
        <span style={{
          fontSize: '0.76rem', color: 'var(--admin-text-light)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginLeft: 2,
        }}>
          {summaryText}
        </span>
      ) : null;
  }
}

/* ── Individual section editor ── */
function BlockEditor({ block, index, onChange, onRemove, autoExpand }: {
  block: ContentBlock;
  index: number;
  onChange: (block: ContentBlock) => void;
  onRemove: () => void;
  autoExpand?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(block.type === 'divider' ? false : !autoExpand);
  const [justAdded, setJustAdded] = useState(autoExpand);

  useEffect(() => {
    if (justAdded) {
      const t = setTimeout(() => setJustAdded(false), 1200);
      return () => clearTimeout(t);
    }
  }, [justAdded]);

  const update = (f: string, v: any) => onChange({ ...block, [f]: v });

  const label = getTypeLabel(block.type);
  const summaryText = block.type === 'heading' ? block.content
    : block.type === 'text' ? short(block.content, 60)
    : block.type === 'image' ? short(block.alt || block.src, 50)
    : block.type === 'stats' ? `${block.stat_value || ''} ${block.stat_label || ''}`.trim()
    : block.type === 'quote' ? short(block.content, 50)
    : block.type === 'cta' ? block.button_text
    : block.type === 'full_width_image' ? short(block.alt || block.src, 50)
    : block.type === 'image_with_text' ? short(block.alt || block.src, 50)
    : '';

  const hasImageSrc = 'src' in block && block.src;

  /* ── Field renderers ── */
  const renderFields = () => {
    switch (block.type) {
      case 'heading':
        return (
          <StepGroup step={1} title="Heading Text">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div className="admin-form-group" style={{ flex: 1, marginBottom: 0 }}>
                <input className="admin-form-input" value={block.content || ''} onChange={(e) => update('content', e.target.value)} placeholder="Enter heading..." />
              </div>
              <div className="admin-form-group" style={{ width: 100, marginBottom: 0 }}>
                <InlineLabel>Level</InlineLabel>
                <select className="admin-form-select" value={block.level || 2} onChange={(e) => update('level', Number(e.target.value))}>
                  {headingLevels.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                </select>
              </div>
            </div>
          </StepGroup>
        );

      case 'text':
        return (
          <StepGroup step={1} title="Enter Content">
            <TextEditor value={block.content || ''} onChange={(v) => update('content', v)}
              placeholder="<p>Write your content here with HTML tags...</p>" />
          </StepGroup>
        );

      case 'image':
        return (
          <>
            <StepGroup step={1} title="Upload Image">
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <input className="admin-form-input" value={block.src || ''} onChange={(e) => update('src', e.target.value)} placeholder="Image URL (https://...)" />
                <ImagePreview src={block.src} />
              </div>
            </StepGroup>
            <StepGroup step={2} title="Add Caption (optional)">
              <input className="admin-form-input" value={block.caption || ''} onChange={(e) => update('caption', e.target.value)} placeholder="Image caption" />
            </StepGroup>
          </>
        );

      case 'image_with_text':
        return (
          <>
            {hasImageSrc && short(block.text) && (
              <div style={{
                marginBottom: 14, borderRadius: 10, overflow: 'hidden',
                border: '1px solid var(--admin-border)', background: 'var(--admin-bg)',
                display: 'flex', alignItems: 'center', gap: 16, padding: 16,
              }}>
                <div style={{ width: 100, height: 70, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: '#eee' }}>
                  <img src={block.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-secondary)', lineHeight: 1.5 }}>
                  {short(block.text, 120) || 'Text will appear here'}
                </div>
              </div>
            )}
            <StepGroup step={1} title="Upload Image">
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <input className="admin-form-input" value={block.src || ''} onChange={(e) => update('src', e.target.value)} placeholder="Image URL (https://...)" />
                <ImagePreview src={block.src} />
              </div>
            </StepGroup>
            <StepGroup step={2} title="Enter Text Content">
              <TextEditor value={block.text || ''} onChange={(v) => update('text', v)}
                placeholder="<p>Descriptive text that appears beside the image...</p>" />
            </StepGroup>
            <StepGroup step={3} title="Choose Layout">
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                <button type="button" onClick={() => update('layout', 'left')}
                  style={{
                    padding: '8px 16px', borderRadius: 6,
                    border: `1px solid ${block.layout === 'left' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                    background: block.layout === 'left' ? 'var(--admin-primary-subtle)' : 'var(--admin-bg)',
                    color: block.layout === 'left' ? 'var(--admin-primary)' : 'var(--admin-text)',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                  }}
                >
                  Image Left ← Text Right
                </button>
                <button type="button" onClick={() => update('layout', 'right')}
                  style={{
                    padding: '8px 16px', borderRadius: 6,
                    border: `1px solid ${block.layout === 'right' ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
                    background: block.layout === 'right' ? 'var(--admin-primary-subtle)' : 'var(--admin-bg)',
                    color: block.layout === 'right' ? 'var(--admin-primary)' : 'var(--admin-text)',
                    cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
                  }}
                >
                  Text Left → Image Right
                </button>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <InlineLabel>Caption <span style={{ fontWeight: 400, color: 'var(--admin-text-light)' }}>(optional)</span></InlineLabel>
                <input className="admin-form-input" value={block.caption || ''} onChange={(e) => update('caption', e.target.value)} placeholder="Image caption" />
              </div>
            </StepGroup>
          </>
        );

      case 'quote':
        return (
          <>
            <StepGroup step={1} title="Enter Quote Text">
              <textarea className="admin-form-textarea" rows={3} value={block.content || ''}
                onChange={(e) => update('content', e.target.value)} placeholder="The quoted text..." />
            </StepGroup>
            <StepGroup step={2} title="Add Attribution">
              <div className="admin-form-group" style={{ marginBottom: 8 }}>
                <InlineLabel>Author <span style={{ fontWeight: 400, color: 'var(--admin-text-light)' }}>(optional)</span></InlineLabel>
                <input className="admin-form-input" value={block.quote_author || ''} onChange={(e) => update('quote_author', e.target.value)} placeholder="Jane Doe" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <InlineLabel>Role <span style={{ fontWeight: 400, color: 'var(--admin-text-light)' }}>(optional)</span></InlineLabel>
                <input className="admin-form-input" value={block.quote_role || ''} onChange={(e) => update('quote_role', e.target.value)} placeholder="CEO, Company Inc." />
              </div>
            </StepGroup>
          </>
        );

      case 'list':
        return (
          <>
            <StepGroup step={1} title="Choose List Style">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem' }}>
                <input type="checkbox" checked={block.ordered || false} onChange={(e) => update('ordered', e.target.checked)} />
                Numbered list
              </label>
            </StepGroup>
            <StepGroup step={2} title="Add Items">
              {(block.items || ['']).map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <input className="admin-form-input" value={item}
                    onChange={(e) => { const items = [...(block.items || [''])]; items[i] = e.target.value; update('items', items); }}
                    placeholder={`Item ${i + 1}`} style={{ flex: 1 }} />
                  <button type="button" className="admin-btn admin-btn-danger admin-btn-xs" onClick={() => {
                    const items = (block.items || ['']).filter((_, j) => j !== i);
                    update('items', items.length ? items : ['']);
                  }} disabled={(block.items || ['']).length <= 1}>×</button>
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => {
                update('items', [...(block.items || ['']), '']);
              }}>+ Add Item</button>
            </StepGroup>
          </>
        );

      case 'cta':
        return (
          <>
            <StepGroup step={1} title="Configure Button">
              <div className="admin-form-group" style={{ marginBottom: 8 }}>
                <InlineLabel>Button Text <span className="required">*</span></InlineLabel>
                <input className="admin-form-input" value={block.button_text || ''} onChange={(e) => update('button_text', e.target.value)} placeholder="Get Started Free" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <InlineLabel>Button Link <span className="required">*</span></InlineLabel>
                <input className="admin-form-input" value={block.button_link || ''} onChange={(e) => update('button_link', e.target.value)} placeholder="/free-trial or https://..." />
              </div>
            </StepGroup>
            <StepGroup step={2} title="Add Supporting Text (optional)">
              <textarea className="admin-form-textarea" rows={2} value={block.cta_description || ''}
                onChange={(e) => update('cta_description', e.target.value)} placeholder="Text that appears above the button..." />
            </StepGroup>
          </>
        );

      case 'gallery':
        return (
          <>
            <StepGroup step={1} title="Add Gallery Images">
              {(block.images || []).map((img, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', padding: 10, background: 'var(--admin-bg)', borderRadius: 10, marginBottom: 6 }}>
                  <div className="admin-form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <input className="admin-form-input" value={img.src} onChange={(e) => { const imgs = [...(block.images || [])]; imgs[i] = { ...imgs[i], src: e.target.value }; update('images', imgs); }} placeholder="https://..." />
                    <ImagePreview src={img.src} size={120} />
                  </div>
                  <div className="admin-form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <InlineLabel>Alt</InlineLabel>
                    <input className="admin-form-input" value={img.alt || ''} onChange={(e) => { const imgs = [...(block.images || [])]; imgs[i] = { ...imgs[i], alt: e.target.value }; update('images', imgs); }} placeholder="Alt text" />
                  </div>
                  <button type="button" className="admin-btn admin-btn-danger admin-btn-xs" onClick={() => { const imgs = (block.images || []).filter((_, j) => j !== i); update('images', imgs.length ? imgs : [{ src: '', alt: '', caption: '' }]); }} disabled={(block.images || []).length <= 1}>×</button>
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => update('images', [...(block.images || []), { src: '', alt: '', caption: '' }])}>+ Add Image</button>
            </StepGroup>
          </>
        );

      case 'full_width_image':
        return (
          <>
            <StepGroup step={1} title="Upload Hero Image">
              <div className="admin-form-group" style={{ marginBottom: 8 }}>
                <input className="admin-form-input" value={block.src || ''} onChange={(e) => update('src', e.target.value)} placeholder="Image URL (https://...)" />
                <ImagePreview src={block.src} />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <InlineLabel>Alt Text</InlineLabel>
                <input className="admin-form-input" value={block.alt || ''} onChange={(e) => update('alt', e.target.value)} placeholder="Describe the image" />
              </div>
            </StepGroup>
            <StepGroup step={2} title="Choose Display Style">
              <div className="admin-form-group" style={{ marginBottom: 8 }}>
                <InlineLabel>Alignment</InlineLabel>
                <select className="admin-form-select" value={block.alignment || 'full'} onChange={(e) => update('alignment', e.target.value as any)}>
                  <option value="full">Full Width</option>
                  <option value="centered">Centered (max-width)</option>
                  <option value="small">Small (constrained)</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <InlineLabel>Caption <span style={{ fontWeight: 400, color: 'var(--admin-text-light)' }}>(optional)</span></InlineLabel>
                <input className="admin-form-input" value={block.caption || ''} onChange={(e) => update('caption', e.target.value)} placeholder="Image caption" />
              </div>
            </StepGroup>
          </>
        );

      case 'code':
        return (
          <>
            <StepGroup step={1} title="Select Language">
              <input className="admin-form-input" value={block.language || ''} onChange={(e) => update('language', e.target.value)} placeholder="javascript, python, bash..." />
            </StepGroup>
            <StepGroup step={2} title="Paste Your Code">
              <textarea className="admin-form-textarea" rows={6} value={block.content || ''}
                onChange={(e) => update('content', e.target.value)} placeholder="Write your code here..."
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }} />
            </StepGroup>
          </>
        );

      case 'callout':
        return (
          <>
            <StepGroup step={1} title="Choose Style">
              <select className="admin-form-select" value={block.style || 'info'} onChange={(e) => update('style', e.target.value)}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
            </StepGroup>
            <StepGroup step={2} title="Write Callout Content">
              <div className="admin-form-group" style={{ marginBottom: 8 }}>
                <InlineLabel>Title <span style={{ fontWeight: 400, color: 'var(--admin-text-light)' }}>(optional)</span></InlineLabel>
                <input className="admin-form-input" value={block.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Callout title" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <InlineLabel>Message</InlineLabel>
                <textarea className="admin-form-textarea" rows={3} value={block.content || ''} onChange={(e) => update('content', e.target.value)} placeholder="Callout message..." />
              </div>
            </StepGroup>
          </>
        );

      case 'faq':
        return (
          <>
            <StepGroup step={1} title="Enter Question">
              <input className="admin-form-input" value={block.question || ''} onChange={(e) => update('question', e.target.value)} placeholder="FAQ question..." />
            </StepGroup>
            <StepGroup step={2} title="Enter Answer">
              <textarea className="admin-form-textarea" rows={3} value={block.answer || ''} onChange={(e) => update('answer', e.target.value)} placeholder="FAQ answer..." />
            </StepGroup>
          </>
        );

      case 'table':
        return (
          <>
            <StepGroup step={1} title="Define Columns">
              <input className="admin-form-input" value={(block.headers || []).join(', ')} onChange={(e) => {
                const h = e.target.value.split(',').map(x => x.trim()).filter(Boolean);
                const r = (block.rows || []).length ? block.rows : [h.map(() => '')];
                update('headers', h); update('rows', r);
              }} placeholder="Column 1, Column 2, Column 3" />
            </StepGroup>
            <StepGroup step={2} title="Add Table Data">
              {(block.rows || []).map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  {row.map((cell, j) => (
                    <input key={j} className="admin-form-input" value={cell} onChange={(e) => { const rows = [...(block.rows || [])]; rows[i] = [...rows[i]]; rows[i][j] = e.target.value; update('rows', rows); }} placeholder={`R${i + 1}C${j + 1}`} style={{ flex: 1 }} />
                  ))}
                  <button type="button" className="admin-btn admin-btn-danger admin-btn-xs" onClick={() => { const rows = (block.rows || []).filter((_, k) => k !== i); update('rows', rows.length ? rows : [(block.headers || []).map(() => '')]); }} disabled={(block.rows || []).length <= 1}>×</button>
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => { const cols = (block.headers || []).length || 1; update('rows', [...(block.rows || []), Array(cols).fill('')]); }}>+ Add Row</button>
            </StepGroup>
          </>
        );

      case 'stats':
        return (
          <>
            <StepGroup step={1} title="Enter Value &amp; Label">
              <div className="admin-form-group" style={{ marginBottom: 8 }}>
                <InlineLabel>Value <span style={{ fontWeight: 400, color: 'var(--admin-text-light)' }}>(e.g. 35%, 10x, 500+)</span></InlineLabel>
                <input className="admin-form-input" value={block.stat_value || ''} onChange={(e) => update('stat_value', e.target.value)} placeholder="35%" />
              </div>
              <div className="admin-form-group" style={{ marginBottom: 0 }}>
                <InlineLabel>Label</InlineLabel>
                <input className="admin-form-input" value={block.stat_label || ''} onChange={(e) => update('stat_label', e.target.value)} placeholder="Return Reduction" />
              </div>
            </StepGroup>
            <StepGroup step={2} title="Add Context (optional)">
              <textarea className="admin-form-textarea" rows={2} value={block.stat_description || ''} onChange={(e) => update('stat_description', e.target.value)} placeholder="Brief context for this stat..." />
            </StepGroup>
          </>
        );

      case 'step':
        return (
          <>
            <StepGroup step={1} title="Enter Step Title">
              <input className="admin-form-input" value={block.title || ''} onChange={(e) => update('title', e.target.value)} placeholder="Step title..." />
            </StepGroup>
            <StepGroup step={2} title="Enter Description">
              <textarea className="admin-form-textarea" rows={2} value={block.content || ''} onChange={(e) => update('content', e.target.value)} placeholder="Step description..." />
            </StepGroup>
          </>
        );

      case 'divider':
        return (
          <div style={{ padding: '12px 0', textAlign: 'center', color: 'var(--admin-text-light)', fontSize: '0.85rem' }}>
            — Horizontal Divider —
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'var(--admin-bg-card)',
      borderRadius: 12, overflow: 'hidden',
      ...(collapsed
        ? { border: '1px solid var(--admin-border)' }
        : { boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid var(--admin-border)' }),
      transition: 'box-shadow 0.3s',
      ...(justAdded ? { boxShadow: '0 0 0 2px var(--admin-primary), 0 4px 16px rgba(255,138,80,0.2)' } : {}),
    }}>
      <div
        onClick={() => block.type !== 'divider' && setCollapsed(!collapsed)}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px',
          cursor: block.type === 'divider' ? 'default' : 'pointer',
          background: collapsed ? 'transparent' : 'var(--admin-bg)',
          borderBottom: collapsed ? 'none' : '1px solid var(--admin-border)',
          userSelect: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { if (block.type !== 'divider') e.currentTarget.style.background = 'var(--admin-primary-subtle)'; }}
        onMouseLeave={(e) => { if (block.type !== 'divider') e.currentTarget.style.background = collapsed ? 'transparent' : 'var(--admin-bg)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {block.type !== 'divider' && (
            <span style={{ color: 'var(--admin-text-light)', flexShrink: 0 }}>
              {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
          {justAdded && (
            <span style={{ color: 'var(--admin-primary)', flexShrink: 0 }}>
              <Check size={14} />
            </span>
          )}
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 6,
            fontSize: '0.68rem', fontWeight: 600,
            background: 'var(--admin-primary-subtle)', color: 'var(--admin-primary)',
            flexShrink: 0,
          }}>
            {label}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--admin-text-secondary)', flexShrink: 0 }}>
            #{index + 1}
          </span>
          {collapsed && (summaryText || hasImageSrc) && (
            <CollapsedPreview block={block} summaryText={summaryText} />
          )}
          {collapsed && hasImageSrc && (
            <ImageIcon size={12} style={{ color: 'var(--admin-text-light)', flexShrink: 0, marginLeft: 2 }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button type="button" className="admin-btn admin-btn-danger admin-btn-xs" onClick={onRemove} title="Remove section">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
      {!collapsed && (
        <div style={{ padding: 16 }}>
          {renderFields()}
        </div>
      )}
    </div>
  );
}

/* ── Main builder component ── */
export default function ContentLayoutBuilder({ blocks, onChange, label = 'Content Layout' }: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [newBlockIndex, setNewBlockIndex] = useState<number | null>(null);

  const addBlock = (type: ContentBlock['type']) => {
    const idx = blocks.length;
    onChange([...blocks, createEmptyBlock(type)]);
    setNewBlockIndex(idx);
    setShowPicker(false);
  };

  const updateBlock = (index: number, block: ContentBlock) => {
    const updated = [...blocks];
    updated[index] = block;
    onChange(updated);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (from: number, to: number) => {
    if (to < 0 || to >= blocks.length) return;
    const updated = [...blocks];
    [updated[from], updated[to]] = [updated[to], updated[from]];
    onChange(updated);
  };

  const handleDragStart = (idx: number) => { setDragIndex(idx); setIsDragOver(false); };
  const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); if (dragIndex !== idx) { dragOverIndex.current = idx; setIsDragOver(true); } };
  const handleDrop = (e: React.DragEvent, toIdx: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIdx) moveBlock(dragIndex, toIdx);
    setDragIndex(null); dragOverIndex.current = null; setIsDragOver(false);
  };
  const handleDragEnd = () => { setDragIndex(null); dragOverIndex.current = null; setIsDragOver(false); };

  return (
    <div className="admin-card" style={{ overflow: 'visible' }}>
      {showPicker && <SectionPicker onSelect={addBlock} onClose={() => setShowPicker(false)} />}
      <div className="admin-card-header">
        <h2>
          {label}{' '}
          <span style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--admin-text-secondary)' }}>
            ({blocks.length} section{blocks.length !== 1 ? 's' : ''})
          </span>
        </h2>
        <button type="button" className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => setShowPicker(true)}>
          <Plus size={16} style={{ marginRight: 6 }} /> Add Section
        </button>
      </div>
      <div className="admin-card-body" style={{ padding: blocks.length === 0 ? 0 : undefined }}>
        {blocks.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--admin-text)', marginBottom: 8 }}>
              Start building your page
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--admin-text-secondary)', marginBottom: 24 }}>
              Click &quot;Add Section&quot; to create your first content section.
            </div>
            <button type="button" className="admin-btn admin-btn-primary" onClick={() => setShowPicker(true)}
              style={{ padding: '10px 28px', fontSize: '0.9rem' }}>
              <Plus size={18} style={{ marginRight: 8 }} /> Add Content Section
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {blocks.map((block, index) => {
              const isOver = isDragOver && dragOverIndex.current === index && dragIndex !== index;
              return (
                <div key={index} style={{ position: 'relative' }}>
                  {isOver && (
                    <div style={{ position: 'absolute', inset: '0 -2px', border: '2px dashed var(--admin-primary)', borderRadius: 14, zIndex: 5, pointerEvents: 'none', opacity: 0.7 }} />
                  )}
                  <div draggable onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    style={{ opacity: dragIndex === index ? 0.35 : 1, transition: 'opacity 0.15s', position: 'relative' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      marginBottom: 0, cursor: 'grab',
                      userSelect: 'none', color: 'var(--admin-text-light)',
                      fontSize: '0.72rem', padding: '2px 6px 2px 32px',
                    }}>
                      <div style={{ position: 'absolute', left: 4, top: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <GripVertical size={13} />
                        <div style={{ display: 'flex', gap: 1 }}>
                          <button type="button" className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => moveBlock(index, index - 1)} disabled={index === 0} style={{ padding: '1px 3px', lineHeight: 1 }}><ChevronUp size={10} /></button>
                          <button type="button" className="admin-btn admin-btn-secondary admin-btn-xs" onClick={() => moveBlock(index, index + 1)} disabled={index === blocks.length - 1} style={{ padding: '1px 3px', lineHeight: 1 }}><ChevronDown size={10} /></button>
                        </div>
                      </div>
                    </div>
                    <BlockEditor
                      block={block}
                      index={index}
                      onChange={(b) => updateBlock(index, b)}
                      onRemove={() => removeBlock(index)}
                      autoExpand={newBlockIndex === index}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
