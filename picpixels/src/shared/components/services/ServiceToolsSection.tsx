'use client';
import { ServiceTool, mediaUrl } from '../../../services/public-api';
import SectionHeading from '../SectionHeading';
import Reveal from '../Reveal';
import techStyles from '../TechExpertiseSection.module.css';

interface Props {
  tools: ServiceTool[]
  title?: string
}

export default function ServiceToolsSection({ tools, title }: Props) {
  if (!tools?.length) return null;

  const uniqueTools = [...new Map(tools.map(tool => [tool.id, tool])).values()];

  return (
    <section className={techStyles.section}>
      <div className={techStyles.container}>
        <Reveal variant="fadeUp" once={false}>
          <SectionHeading
            tag="Expertise"
            text={title || 'Our Technology Expertise in Photo Editing'}
            subtitle="Every image is processed using professional-grade tools trusted by industry leaders worldwide."
          />
        </Reveal>
        <div className={techStyles.slider}>
          <div className={techStyles.track}>
            {uniqueTools.map((tool) => (
              <div key={tool.id} className={techStyles.circle}>
                {tool.logo ? (
                  <img
                    src={mediaUrl(tool.logo)}
                    alt={tool.logo_alt || tool.name}
                    className={techStyles.logo}
                    loading="lazy"
                  />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={techStyles.fallbackIcon}>
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}