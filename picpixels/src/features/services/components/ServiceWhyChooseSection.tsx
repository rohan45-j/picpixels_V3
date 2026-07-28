'use client';
import { ServiceWhyChooseCard, mediaUrl } from '@/services/public-api';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/animations/Reveal';
import wcuStyles from '@/components/ui/HomeWhyChooseUsNew.module.css';

interface Props {
  cards: ServiceWhyChooseCard[]
  title?: string
}

export default function ServiceWhyChooseSection({ cards, title }: Props) {
  if (!cards?.length) return null

  const uniqueCards = [...new Map(cards.map(card => [card.id, card])).values()];

  return (
    <section className={wcuStyles.section}>
      <div className={wcuStyles.container}>
        <Reveal variant="fadeUp" once={false}>
          <div className={wcuStyles.header}>
            <SectionHeading text={title || 'Why Choose Us'} />
          </div>
        </Reveal>

        <div className={wcuStyles.grid} style={{ gridTemplateColumns: '1fr' }}>
          <div className={wcuStyles.cardsCol}>
            {uniqueCards.map((card, index) => (
              <Reveal key={card.id || index} variant="fadeUp" delay={index * 100}>
                <article className={wcuStyles.card}>
                  <div className={wcuStyles.iconWrap}>
                    {card.icon_image ? (
                      <img
                        src={mediaUrl(card.icon_image)}
                        alt={card.title}
                        className={wcuStyles.iconImg}
                        loading="lazy"
                      />
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF8A50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className={wcuStyles.cardContent}>
                    <h3 className={wcuStyles.cardTitle}>{card.title}</h3>
                    <p className={wcuStyles.cardDesc}>{card.description}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}