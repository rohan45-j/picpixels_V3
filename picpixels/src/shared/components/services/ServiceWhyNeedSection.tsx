import { ServiceWhyNeedFeature, mediaUrl } from '../../../services/public-api'
import styles from '../../../shared/styles/modules/services.module.css'
import SectionHeading from '../SectionHeading'

interface Props {
  features: ServiceWhyNeedFeature[]
  title?: string
  description?: string
}

export default function ServiceWhyNeedSection({ features, title, description }: Props) {
  if (!features?.length) return null
  return (
    <section className={styles.sectionPadding} style={{ background: 'var(--tint-bg)' }}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <SectionHeading text={title || 'Why Should You Need Our Service'} />
        </div>
        <div className={styles.whyNeedGrid}>
          {features.map((f, i) => (
            <div key={f.id || i} className={styles.whyNeedCard}>
              {f.icon_image && (
                <img src={mediaUrl(f.icon_image)} alt={f.title} className={styles.whyNeedIcon} />
              )}
              <h3 className={styles.whyNeedCardTitle}>{f.title}</h3>
              <p className={styles.whyNeedCardDesc}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
