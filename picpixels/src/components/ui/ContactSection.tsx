'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useSiteSettings } from '@/store/SiteSettingsContext';
import { submitContactInquiry, type SiteSetting } from '@/services/public-api';
import SectionHeading from './SectionHeading';
import Reveal from '@/components/animations/Reveal';
import styles from '@/styles/modules/contact-section.module.css';

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactSection({ siteSettings: serverSettings }: { siteSettings?: SiteSetting | null }) {
  const ctx = useSiteSettings();
  const siteSettings = serverSettings || ctx.siteSettings;

  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) newErrors.name = 'Please enter your name';
    if (!form.email.trim()) {
      newErrors.email = 'Please enter your email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!form.subject.trim()) newErrors.subject = 'Please enter a subject';
    if (!form.message.trim()) {
      newErrors.message = 'Please enter your message';
    } else if (form.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus('loading');
    try {
      const ok = await submitContactInquiry(form);
      if (ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className={styles.bgDecorCircle1} aria-hidden="true" />
      <div className={styles.bgDecorCircle2} aria-hidden="true" />

      <div className={styles.inner}>
        <Reveal variant="fadeUp" once={false}>
        <header className={styles.header}>
          <SectionHeading
            text="Have a project in mind? We'd love to hear from you."
            subtitle="Contact us for custom 3D product visualization, pricing inquiries, or support."
          />
        </header>
        </Reveal>

        <div className={styles.grid}>
          {/* Left: Contact Info */}
          <div className={styles.infoCol}>
            <p className={styles.ctaText}>
              Let&apos;s bring your products to life with stunning 3D visuals.
            </p>

            <div className={styles.infoCards}>
              {siteSettings?.support_email && (
                <div className={styles.infoCard}>
                  <div className={styles.infoIconWrap}>
                    <Mail size={20} />
                  </div>
                  <div className={styles.infoContent}>
                    <div className={styles.infoLabel}>Email</div>
                    <div className={styles.infoValue}>
                      <a href={`mailto:${siteSettings.support_email}`}>{siteSettings.support_email}</a>
                    </div>
                  </div>
                </div>
              )}

              {siteSettings?.support_phone && (
                <div className={styles.infoCard}>
                  <div className={styles.infoIconWrap}>
                    <Phone size={20} />
                  </div>
                  <div className={styles.infoContent}>
                    <div className={styles.infoLabel}>Phone</div>
                    <div className={styles.infoValue}>
                      <a href={`tel:${siteSettings.support_phone}`}>{siteSettings.support_phone}</a>
                    </div>
                  </div>
                </div>
              )}

              {siteSettings?.address && (
                <div className={styles.infoCard}>
                  <div className={styles.infoIconWrap}>
                    <MapPin size={20} />
                  </div>
                  <div className={styles.infoContent}>
                    <div className={styles.infoLabel}>Address</div>
                    <div className={styles.infoValue}>{siteSettings.address}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className={styles.formCol}>
            <h3 className={styles.formTitle}>Send us a message</h3>
            <p className={styles.formSubtitle}>Fill out the form below and we&apos;ll get back to you shortly.</p>

            {status === 'success' ? (
              <div className={styles.successMsg}>
                <CheckCircle size={20} className={styles.successIcon} />
                <span>Your message has been sent successfully! We&apos;ll get back to you soon.</span>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.fieldGroupRow}>
                  <div className={styles.fieldGroup}>
                    <label className={`${styles.label} ${styles.labelRequired}`} htmlFor="contact-name">Full Name</label>
                    <input
                      id="contact-name"
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className={styles.errorText}>{errors.name}</p>}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={`${styles.label} ${styles.labelRequired}`} htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className={styles.errorText}>{errors.email}</p>}
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={`${styles.label} ${styles.labelRequired}`} htmlFor="contact-subject">Subject</label>
                  <input
                    id="contact-subject"
                    className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                  />
                  {errors.subject && <p className={styles.errorText}>{errors.subject}</p>}
                </div>

                <div className={styles.fieldGroup}>
                  <label className={`${styles.label} ${styles.labelRequired}`} htmlFor="contact-message">Message</label>
                  <textarea
                    id="contact-message"
                    className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project..."
                  />
                  {errors.message && <p className={styles.errorText}>{errors.message}</p>}
                </div>

                <div className={styles.submitWrap}>
                  <button
                    className={styles.submitBtn}
                    type="submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className={styles.spinner} />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>

                {status === 'error' && (
                  <div className={styles.errorMsg}>
                    <AlertCircle size={20} className={styles.errorIcon} />
                    <span>Something went wrong. Please try again later.</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
