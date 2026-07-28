'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionHeading from '@/components/ui/SectionHeading';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from '@/styles/modules/book-demo.module.css';

interface FormData {
  fullName: string;
  companyName: string;
  email: string;
  phone: string;
  service: string;
  budget: string;
  details: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
}

const faqData = [
  {
    q: 'What happens during the consultation?',
    a: 'We discuss your business goals, current challenges, and how our digital solutions can help. We\'ll review examples and provide a tailored recommendation.',
  },
  {
    q: 'How long is the demo session?',
    a: 'Typical demo sessions last 30–45 minutes. We cover your specific needs and walk through how our platform and services work.',
  },
  {
    q: 'Is there any cost for the demo?',
    a: 'No. The demo is completely free with no obligation. We believe in showing value before any commitment.',
  },
  {
    q: 'What do I need to prepare?',
    a: 'Just bring your ideas and any sample images or reference materials. We\'ll handle the rest.',
  },
  {
    q: 'Can I bring my team?',
    a: 'Absolutely. We encourage including stakeholders, designers, and decision-makers to get the most out of the session.',
  },
];

export default function BookDemo() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    service: '',
    budget: '',
    details: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Book a Free Demo | PicPicxels';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Schedule a free demo consultation with PicPicxels. Discover professional photo editing solutions tailored to your business.');
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [submitted]);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrorMessage('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>Book a Free Consultation</h1>
            <p className={styles.subtitle}>
              Let&apos;s discuss your goals and discover the best digital solution for your business.
            </p>
            <div className={styles.ctaGroup}>
              <a href="#form" className="btn btn-primary">
                Schedule Your Demo
              </a>
            </div>
          </div>
        </section>

        {/* Why Book A Demo */}
        <section className={styles.section}>
          <div className="container">
            <SectionHeading
              text="See the Difference We Make"
              subtitle="Discover how our professional photo editing services can transform your business."
            />
            <div className={styles.benefitGrid}>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon}>🎯</span>
                <h3 className={styles.benefitTitle}>Project Consultation</h3>
                <p className={styles.benefitDesc}>
                  We analyze your workflow and identify areas where professional editing can save time and elevate quality.
                </p>
              </div>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon}>📈</span>
                <h3 className={styles.benefitTitle}>Growth Strategy</h3>
                <p className={styles.benefitDesc}>
                  Get a custom roadmap for scaling your visual content production with efficient editing pipelines.
                </p>
              </div>
              <div className={styles.benefitCard}>
                <span className={styles.benefitIcon}>⚙️</span>
                <h3 className={styles.benefitTitle}>Custom Solution Planning</h3>
                <p className={styles.benefitDesc}>
                  We design a tailored editing solution that fits your brand, budget, and turnaround requirements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Request Form */}
        <section className={styles.formSection} id="form">
          <div className="container">
            <SectionHeading
              text="Request Your Demo"
              subtitle="Fill out the form below and our team will reach out to schedule your personalized demo."
            />

            {!submitted ? (
              <div className={styles.formGrid}>
                <div className={styles.formCard}>
                  <h3 className={styles.formTitle}>Tell Us About Yourself</h3>

                  {errorMessage && (
                    <div className={`${styles.alert} ${styles.alertError}`}>
                      {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.row}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="fullName">
                          Full Name <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={handleChange}
                          className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                          placeholder="John Doe"
                        />
                        {errors.fullName && <span className={styles.errorText}>{errors.fullName}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="companyName">
                          Company Name
                        </label>
                        <input
                          id="companyName"
                          name="companyName"
                          type="text"
                          value={formData.companyName}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="Acme Corp"
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="email">
                          Email Address <span className={styles.required}>*</span>
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                          placeholder="john@company.com"
                        />
                        {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="phone">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className={styles.input}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="service">
                          Service Interested In
                        </label>
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className={styles.select}
                        >
                          <option value="">Select a service</option>
                          <option value="clipping-path">Clipping Path</option>
                          <option value="background-removal">Background Removal</option>
                          <option value="photo-retouching">Photo Retouching</option>
                          <option value="shadow-creation">Shadow Creation</option>
                          <option value="ghost-mannequin">Ghost Mannequin</option>
                          <option value="color-correction">Color Correction</option>
                          <option value="ecommerce">E-Commerce Editing</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label} htmlFor="budget">
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className={styles.select}
                        >
                          <option value="">Select range</option>
                          <option value="under-500">Under $500/month</option>
                          <option value="500-1000">$500 - $1,000/month</option>
                          <option value="1000-5000">$1,000 - $5,000/month</option>
                          <option value="5000-plus">$5,000+/month</option>
                          <option value="not-sure">Not sure yet</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="details">
                        Project Details
                      </label>
                      <textarea
                        id="details"
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        className={`${styles.input} ${styles.textarea}`}
                        placeholder="Tell us about your project, goals, and any specific requirements..."
                      />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                      {loading ? 'Submitting...' : 'Schedule Your Free Demo'}
                    </button>
                  </form>
                </div>

                <div className={styles.infoCard}>
                  <h3 className={styles.infoTitle}>Contact Information</h3>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>✉️</div>
                    <div>
                      <div className={styles.infoLabel}>Email</div>
                      <div className={styles.infoValue}>support@picpicxels.com</div>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>📞</div>
                    <div>
                      <div className={styles.infoLabel}>Phone</div>
                      <div className={styles.infoValue}>+880 1234-567890</div>
                    </div>
                  </div>

                  <div className={styles.infoItem}>
                    <div className={styles.infoIcon}>🕐</div>
                    <div>
                      <div className={styles.infoLabel}>Business Hours</div>
                      <div className={styles.infoValue}>
                        Mon – Fri: 9:00 AM – 6:00 PM
                        <br />
                        Sat: 10:00 AM – 4:00 PM
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.successCard}>
                <span className={styles.successIcon}>✅</span>
                <h2 className={styles.successTitle}>Demo Request Received!</h2>
                <p className={styles.successDesc}>
                  Thank you for your interest! Our team will contact you within 24 hours to schedule your personalized demo session.
                </p>
                <Link href="/" className="btn btn-primary">
                  Back to Home
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.faqSection}>
          <div className="container">
            <SectionHeading
              text="Frequently Asked Questions"
              subtitle="Common questions about our demo and consultation process."
            />
            <div className={styles.faqList}>
              {faqData.map((faq, i) => (
                <div key={i} className={styles.faqItem}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className={`${styles.faqQuestion} ${openFaq === i ? styles.faqQuestionActive : ''}`}
                    aria-expanded={openFaq === i}
                  >
                    {faq.q}
                    <span className={`${styles.faqIcon} ${openFaq === i ? styles.faqIconOpen : ''}`}>▼</span>
                  </button>
                  {openFaq === i && (
                    <div className={styles.faqAnswer}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className={styles.section}>
          <div className="container">
            <div className={styles.ctaBanner}>
              <div className={styles.ctaBannerContent}>
                <h2 className={styles.ctaBannerTitle}>Ready to Transform Your Visuals?</h2>
                <p className={styles.ctaBannerDesc}>
                  Join hundreds of businesses that trust us for professional photo editing. Schedule your free demo today.
                </p>
                <div className={styles.ctaBannerGroup}>
                  <a href="#form" className="btn btn-primary">
                    Book a Free Demo
                  </a>
                  <Link href="/pricing" className="btn btn-secondary">
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
