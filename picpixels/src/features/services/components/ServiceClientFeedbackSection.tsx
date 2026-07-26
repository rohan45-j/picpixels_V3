import { ServiceClientFeedback, mediaUrl } from '@/services/public-api'
import styles from '@/styles/modules/services.module.css'
import SectionHeading from '@/components/ui/SectionHeading'

interface Props {
  feedbacks: ServiceClientFeedback[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className={styles.feedbackStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? styles.feedbackStar : styles.feedbackStarEmpty}>★</span>
      ))}
    </div>
  )
}

export default function ServiceClientFeedbackSection({ feedbacks }: Props) {
  if (!feedbacks?.length) return null
  return (
    <section className={styles.sectionPadding} style={{ background: 'var(--bg-light-card)' }}>
      <div className="container">
        <SectionHeading text="Client Feedback" />
        <div className={styles.feedbackGrid}>
          {feedbacks.map((fb, i) => (
            <div key={fb.id || i} className={styles.feedbackCard}>
              <div className={styles.feedbackHeader}>
                {fb.photo ? (
                  <img src={mediaUrl(fb.photo)} alt={fb.photo_alt || fb.client_name} className={styles.feedbackAvatar} />
                ) : (
                  <div className={styles.feedbackAvatarPlaceholder}>
                    {fb.client_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className={styles.feedbackName}>{fb.client_name}</h4>
                  {(fb.designation || fb.company) && (
                    <p className={styles.feedbackRole}>
                      {fb.designation}{fb.designation && fb.company ? ', ' : ''}{fb.company}
                    </p>
                  )}
                </div>
              </div>
              <StarRating rating={fb.rating} />
              {fb.review && <p className={styles.feedbackReview}>&ldquo;{fb.review}&rdquo;</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
