import styles from './SectionHeading.module.css';

interface SectionHeadingProps {
  tag?: string;
  text: string;
  subtitle?: string;
  brandRatio?: number;
  as?: React.ElementType;
  className?: string;
  center?: boolean;
}

export default function SectionHeading({
  tag,
  text = '',
  subtitle,
  brandRatio = 0.7,
  as: Tag = 'h2',
  className = '',
  center = true,
}: SectionHeadingProps) {
  if (!text) return null;

  const words = text.split(' ');
  const brandEnd = Math.round(words.length * brandRatio);
  const brandPart = words.slice(0, brandEnd).join(' ');
  const blackPart = words.slice(brandEnd).join(' ');

  const wrapperClass = `${styles.wrapper} ${center ? styles.center : styles.left} ${className}`;

  return (
    <div className={wrapperClass}>
      <Tag className={styles.title}>
        <span className={styles.brand}>{brandPart}</span>
        {blackPart && <span className={styles.black}>{' '}{blackPart}</span>}
      </Tag>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
