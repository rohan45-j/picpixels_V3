import styles from './SectionHeading.module.css';
import { renderHighlightedText } from '@/utils/textHighlight';

interface SectionHeadingProps {
  tag?: string;
  text: string;
  subtitle?: string;
  brandRatio?: number;
  color?: string;
  as?: React.ElementType;
  className?: string;
  center?: boolean;
}

export default function SectionHeading({
  tag,
  text = '',
  subtitle,
  color,
  as: Tag = 'h2',
  className = '',
  center = true,
}: SectionHeadingProps) {
  if (!text) return null;

  const wrapperClass = `${styles.wrapper} ${center ? styles.center : styles.left} ${className}`;
  const titleStyle: React.CSSProperties = {
    color: color || '#000000',
  };

  return (
    <div className={wrapperClass}>
      {tag && <span className={styles.tag}>{tag}</span>}
      <Tag className={styles.title} style={titleStyle}>
        {renderHighlightedText(text, color)}
      </Tag>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
