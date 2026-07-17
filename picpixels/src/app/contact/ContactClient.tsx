'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Reveal from '../../shared/components/Reveal';
import FAQAccordion from '../../shared/components/FAQAccordion';
import SectionHeading from '../../shared/components/SectionHeading';
import styles from '../../shared/styles/modules/contact.module.css';
import faqStyles from '../../shared/styles/modules/faq-accordion.module.css';
import { fetchContactFAQs, type FAQ } from '../../services/public-api';

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactClient() {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', service: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [contactFaqs, setContactFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    fetchContactFAQs().then(setContactFaqs).catch(() => {});
  }, []);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Please enter a valid email address';
    if (!formData.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}/api/v1/cms/contacts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, subject: formData.service || 'General Inquiry', message: formData.message }),
      });
      if (resp.ok) setSubmitted(true);
      else setErrorMessage('Failed to send. Please try again.');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Reveal variant="fadeDown">
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={`${styles.title} gradient-text`}>Get in Touch With Us</h1>
            <p className={styles.subtitle}>
              We are looking forward to hearing from you! Please upload your images via Wetransfer or Dropbox and send us the download link. Your first (3-5) images are free. No credit card required.
            </p>
            <div className={styles.ctaGroup}>
              <a href="https://wetransfer.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Wetransfer</a>
              <a href="https://www.dropbox.com/" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">Dropbox</a>
            </div>
          </div>
        </section>
      </Reveal>

      <section className={styles.section}>
        <div className="container">
          <SectionHeading
            tag="Contact"
            text="Send Us a Message"
            subtitle="Fill out the form below and our team will get back to you within 24 hours."
          />

          {!submitted ? (
            <div className={styles.grid}>
              <Reveal variant="fadeLeft">
                <div className={styles.formCard}>
                  <h3 className={styles.formTitle}>Tell Us About Your Project</h3>
                  {errorMessage && <div className={`${styles.alert} ${styles.alertError}`}>{errorMessage}</div>}
                  <form onSubmit={handleSubmit} noValidate>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="name">Your Name <span className={styles.required}>*</span></label>
                      <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className={`${styles.input} ${errors.name ? styles.inputError : ''}`} placeholder="Your Name" />
                      {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="email">Email Address <span className={styles.required}>*</span></label>
                      <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className={`${styles.input} ${errors.email ? styles.inputError : ''}`} placeholder="Email Address" />
                      {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="phone">Phone Number</label>
                      <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} className={styles.input} placeholder="+1 (555) 000-0000" />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="service">Service Interested In</label>
                      <select id="service" name="service" value={formData.service} onChange={handleChange} className={styles.select}>
                        <option value="">Select a service</option>
                        <option value="clipping-path">Clipping Path</option>
                        <option value="background-removal">Background Removal</option>
                        <option value="photo-retouching">Photo Retouching</option>
                        <option value="photo-masking">Photo Masking</option>
                        <option value="shadow-creation">Shadow Creation</option>
                        <option value="ghost-mannequin">Ghost Mannequin</option>
                        <option value="color-correction">Color Correction</option>
                        <option value="ecommerce">E-Commerce Editing</option>
                        <option value="jewelry">Jewelry Editing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label} htmlFor="message">Your Message <span className={styles.required}>*</span></label>
                      <textarea id="message" name="message" value={formData.message} onChange={handleChange} className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`} placeholder="Tell us about your project, upload links, and any specific requirements..." />
                      {errors.message && <span className={styles.errorText}>{errors.message}</span>}
                    </div>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>{loading ? 'Sending...' : 'Send Message →'}</button>
                  </form>
                </div>
              </Reveal>

              <Reveal variant="fadeRight">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>Contact Information</h3>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>✉️</div>
                      <div><div className={styles.infoLabel}>Email</div><div className={styles.infoValue}>info@picpicxels.com</div></div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>📞</div>
                      <div><div className={styles.infoLabel}>Call / WhatsApp</div><div className={styles.infoValue}>+880 1622915832</div></div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>💬</div>
                      <div><div className={styles.infoLabel}>Skype</div><div className={styles.infoValue}>live:.cid.b9307f3eb1bb585d</div></div>
                    </div>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>🕐</div>
                      <div><div className={styles.infoLabel}>Business Hours</div><div className={styles.infoValue}>Mon – Fri: 9:00 AM – 6:00 PM<br />Sat: 10:00 AM – 4:00 PM</div></div>
                    </div>
                  </div>
                  <div className={styles.infoCard}>
                    <h3 className={styles.infoTitle}>Production House</h3>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIcon}>📍</div>
                      <div><div className={styles.infoLabel}>Address</div><div className={styles.infoValue}>71&45, House, Road-28, Dhaka 1230, Bangladesh</div></div>
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <Link href="https://wa.me/+8801622915832" target="_blank" className="btn btn-secondary">WhatsApp</Link>
                      <Link href="tel:+8801622915832" className="btn btn-secondary">Call Now</Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          ) : (
            <div className={styles.successCard}>
              <span className={styles.successIcon}>✅</span>
              <h2 className={styles.successTitle}>Message Sent!</h2>
              <p className={styles.successDesc}>Thank you for reaching out! Our team will get back to you within 24 hours.</p>
              <Link href="/" className="btn btn-primary">Back to Home</Link>
            </div>
          )}
        </div>
      </section>

      <section className={styles.mapSection}>
        <div className="container">
          <SectionHeading
            tag="Location"
            text="Visit Our Studio"
          />
          <div className={styles.mapPlaceholder}>
            <span className={styles.mapIcon}>🗺️</span>
            <p className={styles.mapAddress}>71&45, House, Road-28<br />Dhaka 1230, Bangladesh</p>
          </div>
        </div>
      </section>

      {contactFaqs.length > 0 && (
        <section className={faqStyles.faqSection}>
          <div className={faqStyles.faqInner}>
            <SectionHeading
              tag="FAQ"
              text="Frequently Asked Questions"
              subtitle="Find answers to common questions about our services and support."
            />
            <FAQAccordion faqs={contactFaqs} />
          </div>
        </section>
      )}

      <Reveal variant="fadeUp">
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBanner}>
              <div className={styles.ctaBannerContent}>
                <h2 className={styles.ctaBannerTitle}>Need a Custom Solution?</h2>
                <p className={styles.ctaBannerDesc}>Contact us for bulk discounts and custom project requirements.</p>
                <div className={styles.ctaBannerGroup}>
                  <Link href="/free-trial" className="btn btn-primary">Try Free Trial</Link>
                  <Link href="/pricing" className="btn btn-secondary">View Pricing</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
