'use client';

import { useState } from 'react';
import { Info, AlertTriangle, CheckCircle, Copy, Check, ChevronDown, ArrowRight } from 'lucide-react';
import { mediaUrl, type ContentBlock } from '@/services/public-api';
import styles from '@/styles/modules/blog.module.css';

function CalloutIcon({ style }: { style?: string }) {
  switch (style) {
    case 'warning': return <AlertTriangle size={18} />;
    case 'success': return <CheckCircle size={18} />;
    default: return <Info size={18} />;
  }
}

function CodeBlock({ language, content }: { language?: string; content?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (content) {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };
  return (
    <div className={styles.codeBlock}>
      <div className={styles.codeHeader}>
        <span className={styles.codeLang}>{language || 'code'}</span>
        <button className={styles.codeCopyBtn} onClick={handleCopy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.codePre}>
        <code>{content}</code>
      </pre>
    </div>
  );
}

function StepBlock({ title, content, index }: { title?: string; content?: string; index: number }) {
  return (
    <div className={styles.stepBlock}>
      <div className={styles.stepNumber}>{index + 1}</div>
      <div className={styles.stepBody}>
        {title && <h4 className={styles.stepTitle}>{title}</h4>}
        {content && <p className={styles.stepContent}>{content}</p>}
      </div>
    </div>
  );
}

function toArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  return Array.isArray(val) ? val : val.split(',').map((x) => x.trim()).filter(Boolean);
}

function injectHeadingIds(html: string) {
  if (!html) return html;
  return html.replace(/<(h[2-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, content) => {
    const textLabel = content.replace(/<[^>]*>/g, '').trim();
    const id = textLabel.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    if (/id=/i.test(attrs)) {
      return match;
    }
    const existingId = attrs.match(/id\s*=\s*["']([^"']+)["']/i);
    if (existingId) {
      return match;
    }
    return `<${tag}${attrs} id="${id}">${content}</${tag}>`;
  });
}


export default function BlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  const headings = blocks.filter((b) => b.type === 'heading');

  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            const id = (block.content || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            if (block.level === 3) {
              return <h3 key={i} id={id} className={styles.contentH3}>{block.content}</h3>;
            }
            return <h2 key={i} id={id} className={styles.contentH2}>{block.content}</h2>;

          case 'text':
            return <div key={i} className={styles.contentP} dangerouslySetInnerHTML={{ __html: injectHeadingIds(block.content || '') }} />;

          case 'image':
            return (
              <figure key={i} className={styles.contentFigure}>
                <img src={mediaUrl(block.src || '')} alt={block.alt || ''} className={styles.contentImage} loading="lazy" />
                {block.caption && <figcaption className={styles.imageCaption}>{block.caption}</figcaption>}
              </figure>
            );

          case 'image_with_text':
            return (
              <div key={i} className={`${styles.imageWithTextBlock} ${block.layout === 'right' ? styles.imageWithTextReverse : ''}`}>
                <figure className={styles.contentFigure}>
                  <img src={mediaUrl(block.src || '')} alt={block.alt || ''} className={styles.contentImage} loading="lazy" />
                  {block.caption && <figcaption className={styles.imageCaption}>{block.caption}</figcaption>}
                </figure>
                {block.text && <div className={styles.imageWithTextContent} dangerouslySetInnerHTML={{ __html: block.text }} />}
              </div>
            );

          case 'gallery':
            return (
              <div key={i} className={styles.galleryBlock}>
                <div className={styles.galleryGrid}>
                  {(block.images || []).map((img, j) => (
                    <figure key={j} className={styles.galleryItem}>
                      <img src={mediaUrl(img.src || '')} alt={img.alt || ''} className={styles.galleryBlockImage} loading="lazy" />
                      {img.caption && <figcaption className={styles.imageCaption}>{img.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              </div>
            );

          case 'code':
            return <CodeBlock key={i} language={block.language} content={block.content} />;

          case 'callout':
            return (
              <div key={i} className={`${styles.callout} ${styles[`callout_${block.style || 'info'}`] || styles.callout_info}`}>
                <div className={styles.calloutIcon}><CalloutIcon style={block.style} /></div>
                <div className={styles.calloutBody}>
                  {block.title && <strong className={styles.calloutTitle}>{block.title}</strong>}
                  {block.content && <p>{block.content}</p>}
                </div>
              </div>
            );

          case 'faq':
            return (
              <details key={i} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  <ChevronDown size={14} className={styles.faqChevron} />
                  {block.question}
                </summary>
                <p className={styles.faqAnswer}>{block.answer}</p>
              </details>
            );

          case 'list':
            const ListTag = block.ordered ? 'ol' : 'ul';
            return (
              <ListTag key={i} className={styles.contentList}>
                {toArray(block.items).map((item, j) => (
                  <li key={j} className={styles.contentLi}>{item}</li>
                ))}
              </ListTag>
            );

          case 'table':
            return (
              <div key={i} className={styles.tableWrap}>
                {block.title && <div className={styles.tableTitle}>{block.title}</div>}
                <div className={styles.tableContainer}>
                  <table className={styles.contentTable}>
                    {toArray(block.headers).length > 0 && (
                      <thead>
                        <tr>{toArray(block.headers).map((h, j) => <th key={j}>{h}</th>)}</tr>
                      </thead>
                    )}
                    <tbody>
                      {(Array.isArray(block.rows) ? block.rows : []).map((row, j) => (
                        <tr key={j}>{(Array.isArray(row) ? row : []).map((cell, k) => <td key={k}>{cell}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );

          case 'step':
            return <StepBlock key={i} title={block.title} content={block.content} index={i} />;

          case 'stats':
            return (
              <div key={i} className={styles.statsBlock}>
                <div className={styles.statValue}>{block.stat_value}</div>
                <div className={styles.statLabel}>{block.stat_label}</div>
                {block.stat_description && <p className={styles.statDescription}>{block.stat_description}</p>}
              </div>
            );

          case 'quote':
            return (
              <blockquote key={i} className={styles.quoteBlock}>
                <p className={styles.quoteText}>{block.content}</p>
                {(block.quote_author || block.quote_role) && (
                  <footer className={styles.quoteFooter}>
                    {block.quote_author && <strong className={styles.quoteAuthor}>{block.quote_author}</strong>}
                    {block.quote_role && <span className={styles.quoteRole}>{block.quote_role}</span>}
                  </footer>
                )}
              </blockquote>
            );

          case 'cta':
            return (
              <div key={i} className={styles.ctaBlockWrap}>
                <div className={styles.ctaBlockCard}>
                  {block.cta_description && <p className={styles.ctaBlockDesc}>{block.cta_description}</p>}
                  <a href={block.button_link || '#'} className={styles.ctaBlockBtn}>
                    {block.button_text || 'Get Started'} <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            );

          case 'full_width_image':
            const alignClass = block.alignment === 'centered' ? styles.fwiCentered : block.alignment === 'small' ? styles.fwiSmall : styles.fwiFull;
            return (
              <figure key={i} className={`${styles.fwiBlock} ${alignClass}`}>
                <img src={mediaUrl(block.src || '')} alt={block.alt || ''} className={styles.fwiImage} loading="lazy" />
                {block.caption && <figcaption className={styles.imageCaption}>{block.caption}</figcaption>}
              </figure>
            );

          case 'divider':
            return <hr key={i} className={styles.contentDivider} />;

          default:
            return null;
        }
      })}
    </>
  );
}
