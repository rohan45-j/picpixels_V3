// src/shared/components/PhotoEditingServices.tsx

import { type Service } from '@/services/public-api';
import './PhotoEditingServices.css';

interface PhotoEditingServicesProps {
  services: Service[];
}

export default function PhotoEditingServices({ services }: PhotoEditingServicesProps) {
  return (
    <section className="photo-services-section">
      <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Most Popular Photo Editing Services</h2>
            <p className="section-subtitle">Tap into the power of high‑end visual experiences.</p>
            <div className="divider" />
          </div>
          <div className="services-wrapper">
            <div className="services-left">
              <div className="services-grid">
                {services.map((service, idx) => (
                  <div key={service.id || idx} className="service-card">
                    <div className="icon-area">
                      {/* Placeholder for icon – can be replaced with actual SVG or image */}
                      {service.icon && (
                        <span dangerouslySetInnerHTML={{ __html: service.icon }} />
                      )}
                    </div>
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">
                      {service.short_description || service.description?.split(' ').slice(0, 12).join(' ') + '...'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="services-image">
              <img src="/services_illustration.png" alt="Photo editing illustration" />
            </div>
          </div>
      </div>
    </section>
  );
}
