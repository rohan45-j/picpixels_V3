import { Check, X } from 'lucide-react';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/homepage.module.css';
import type { WhyChooseItem } from '@/services/public-api';

const features = [
  { key: 'speed' as const, label: 'Speed' },
  { key: 'flexibility' as const, label: 'Flexibility' },
  { key: 'quality' as const, label: 'Quality' },
  { key: 'scalability' as const, label: 'Scalability' },
  { key: 'cost_effectiveness' as const, label: 'Cost-effectiveness' },
];

export default function WhyChooseUs({ items }: { items: WhyChooseItem[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container max-w-6xl mx-auto px-6">
        <Reveal variant="fadeUp" once={false}>
          <SectionHeading text="Why Choose Us" />
        </Reveal>

        <Reveal variant="fadeIn" delay={200}>
          <div className={styles.compareTableWrap}>
            <div className="overflow-x-auto">
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th className={styles.compareTh} />
                    {features.map((f) => (
                      <th key={f.key} className={styles.compareTh}>
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items
                    .filter((item) => item.company_name)
                    .map((item, idx) => {
                      const isFirst = idx === 0;
                      return (
                        <tr
                          key={item.id || idx}
                          className={`${styles.compareRow} ${isFirst ? styles.compareRowActive : ''}`}
                        >
                          <td className={styles.compareTdCompany}>
                            <div className={`${styles.compareCompanyName} ${isFirst ? styles.compareCompanyNameActive : ''}`}>
                              {item.company_name}
                            </div>
                            {item.description && (
                              <div className={styles.compareCompanyDesc}>
                                {item.description}
                              </div>
                            )}
                          </td>
                          {features.map((f) => (
                            <td key={f.key} className={styles.compareTdCenter}>
                              {item[f.key] ? (
                                <span className={`${styles.compareIconWrap} ${styles.compareIconCheck}`}>
                                  <Check className="w-[18px] h-[18px]" strokeWidth={3} />
                                </span>
                              ) : (
                                <span className={`${styles.compareIconWrap} ${styles.compareIconX}`}>
                                  <X className="w-[18px] h-[18px]" strokeWidth={3} />
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
