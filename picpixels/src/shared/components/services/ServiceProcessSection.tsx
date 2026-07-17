import { ServiceProcessStep, mediaUrl } from '../../../services/public-api'
import styles from '../../../shared/styles/modules/services.module.css'
import SectionHeading from '../SectionHeading'

interface Props {
  steps: ServiceProcessStep[]
  title?: string
}

export default function ServiceProcessSection({ steps, title }: Props) {
  if (!steps?.length) return null
  return (
    <section className={styles.sectionPaddingLg} style={{ background: 'var(--bg-light-card)' }}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <SectionHeading text={title || 'Process & Workflow'} />
        </div>
        <div className={styles.processTimeline}>
          <div className={styles.processLine} />
          {steps.map((step, i) => (
            <div key={step.id || i} className={styles.processStep}
              style={{ flexDirection: i % 2 === 0 ? 'row' : 'row-reverse' } as React.CSSProperties}
            >
              <div className={styles.processStepContent}>
                <div className={styles.processStepNumber}>
                  {step.step_number || i + 1}
                </div>
                <h3 className={styles.processStepTitle}>{step.title}</h3>
                <p className={styles.processStepDesc}>{step.description}</p>
              </div>
              <div className={styles.processStepDot} />
              <div className={styles.processStepImage}>
                {step.image && (
                  <img src={mediaUrl(step.image)} alt={step.image_alt || step.title} className={styles.processStepImg} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
