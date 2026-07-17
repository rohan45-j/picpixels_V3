import Reveal from './Reveal';
import Link from 'next/link';
import './HeroSection.css';

export default function HeroSection() {
  return (
    <section className="hero-section">
      <Reveal variant="fadeUp">
        <div className="hero-content">
          <h1 className="hero-title">The one‑stop 3D Rendering Company for all your 3D needs!</h1>
          <p className="hero-tagline">High‑end visual experiences, crafted with precision and speed.</p>
          <Link href="/services" className="hero-cta">
            Explore Our Services
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
