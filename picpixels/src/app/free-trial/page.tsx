'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Send, Zap, Shield, RefreshCw, Users, ChevronDown, FileText, Link as LinkIcon, Upload } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FileUploadZone from '@/components/ui/FileUploadZone';
import { submitFreeTrial } from '@/services/public-api';
import styles from '@/styles/modules/free-trial.module.css';

interface FormData {
  full_name: string;
  company_name: string;
  email: string;
  phone_number: string;
  product_name: string;
  product_category: string;
  drive_link: string;
  project_requirements: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  product_name?: string;
  product_category?: string;
  project_requirements?: string;
  drive_link?: string;
}

const PRODUCT_CATEGORIES = [
  { value: '', label: 'Select a category' },
  { value: 'clothing', label: 'Clothing / Apparel' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'jewelry', label: 'Jewelry / Watches' },
  { value: 'home_garden', label: 'Home & Garden' },
  { value: 'beauty', label: 'Beauty / Cosmetics' },
  { value: 'food', label: 'Food & Beverage' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'other', label: 'Other' },
];

const trustBadges = [
  { icon: Zap, label: 'Fast Delivery', desc: '48-hour turnaround' },
  { icon: Shield, label: 'Professional Quality', desc: 'Industry-leading results' },
  { icon: RefreshCw, label: 'Unlimited Revisions', desc: 'Until you are satisfied' },
  { icon: Users, label: 'Expert 3D Artists', desc: '10+ years experience' },
];

export default function FreeTrialPage() {
  const [form, setForm] = useState<FormData>({
    full_name: '', company_name: '', email: '', phone_number: '',
    product_name: '', product_category: '', drive_link: '', project_requirements: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    document.title = 'Free Trial — PicPicxels';
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = 'Try our professional image editing services free. Upload your images and get high-quality edits within 24 hours. No credit card required.';
    return () => {
      document.title = 'PicPixels';
      if (created && meta) meta.remove();
    };
  }, []);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.full_name.trim()) e.full_name = 'Please enter your full name';
    if (!form.email.trim()) {
      e.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!form.product_name.trim()) e.product_name = 'Please enter your product name';
    if (!form.product_category) e.product_category = 'Please select a product category';
    if (!form.project_requirements.trim()) {
      e.project_requirements = 'Please tell us about your project';
    } else if (form.project_requirements.trim().length < 20) {
      e.project_requirements = 'Please provide at least 20 characters';
    } else if (form.project_requirements.length > 2000) {
      e.project_requirements = 'Maximum 2000 characters';
    }
    if (form.drive_link && !/^https?:\/\/(?:drive\.google\.com|dropbox\.com|1drv\.ms)/i.test(form.drive_link)) {
      e.drive_link = 'Please enter a valid Google Drive, Dropbox, or OneDrive link';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      const firstError = document.querySelector<HTMLElement>('[data-field-error]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setStatus('loading');
    try {
      const ok = await submitFreeTrial({
        full_name: form.full_name,
        company_name: form.company_name || undefined,
        email: form.email,
        phone_number: form.phone_number || undefined,
        product_name: form.product_name,
        product_category: form.product_category,
        drive_link: form.drive_link || undefined,
        project_requirements: form.project_requirements,
      }, files.length > 0 ? files : undefined);
      setStatus(ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  function resetForm() {
    setForm({ full_name: '', company_name: '', email: '', phone_number: '', product_name: '', product_category: '', drive_link: '', project_requirements: '' });
    setFiles([]);
    setErrors({});
    setStatus('idle');
  }

  const charCount = form.project_requirements.length;
  const charLimit = 2000;

  return (
    <>
      <Header />

      <main className={styles.page}>
        {/* ─── Hero ─── */}
        <section className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroInner}>
            <span className={styles.heroTag}>Free Trial</span>
            <h1 className={styles.heroTitle}>Try Our Professional Image Editing Free</h1>
            <p className={styles.heroDesc}>
              Upload your product photos and experience our premium editing quality firsthand.
              Your first 3–5 images are on us — no credit card required.
            </p>
            <div className={styles.heroTrust}>
              {trustBadges.map((badge) => {
                const Icon = badge.icon;
                return (
                  <div key={badge.label} className={styles.trustBadge}>
                    <Icon size={16} />
                    <span>{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ─── Form Section ─── */}
        <section className={styles.formSection}>
          <div className={styles.formInner}>
            {status === 'success' ? (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <CheckCircle size={48} />
                </div>
                <h2 className={styles.successTitle}>Thank You!</h2>
                <p className={styles.successDesc}>
                  Your free trial request has been submitted successfully.
                  Our team will review your images and get back to you within 24 hours with your edited samples.
                </p>
                <div className={styles.successDetails}>
                  <div className={styles.successDetail}>
                    <span className={styles.successLabel}>Name</span>
                    <span>{form.full_name}</span>
                  </div>
                  <div className={styles.successDetail}>
                    <span className={styles.successLabel}>Email</span>
                    <span>{form.email}</span>
                  </div>
                  <div className={styles.successDetail}>
                    <span className={styles.successLabel}>Product</span>
                    <span>{form.product_name}</span>
                  </div>
                </div>
                <button className={styles.successBtn} onClick={resetForm}>
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                {/* ─── Card 1: Project Information ─── */}
                <div className={styles.formCard}>
                  <div className={styles.cardHeader}>
                    <FileText size={20} />
                    <h2 className={styles.cardTitle}>Project Information</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={`${styles.label} ${styles.required}`} htmlFor="full_name">Full Name</label>
                        <input
                          id="full_name"
                          className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
                          type="text"
                          name="full_name"
                          value={form.full_name}
                          onChange={handleChange}
                          placeholder="John Doe"
                        />
                        {errors.full_name && <p className={styles.errorText} data-field-error>{errors.full_name}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="company_name">Company Name <span className={styles.optional}>(optional)</span></label>
                        <input
                          id="company_name"
                          className={styles.input}
                          type="text"
                          name="company_name"
                          value={form.company_name}
                          onChange={handleChange}
                          placeholder="Acme Inc."
                        />
                      </div>
                    </div>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={`${styles.label} ${styles.required}`} htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                        />
                        {errors.email && <p className={styles.errorText} data-field-error>{errors.email}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="phone_number">Phone Number <span className={styles.optional}>(optional)</span></label>
                        <input
                          id="phone_number"
                          className={styles.input}
                          type="tel"
                          name="phone_number"
                          value={form.phone_number}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Card 2: Project Details ─── */}
                <div className={styles.formCard}>
                  <div className={styles.cardHeader}>
                    <LinkIcon size={20} />
                    <h2 className={styles.cardTitle}>Project Details</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.fieldRow}>
                      <div className={styles.fieldGroup}>
                        <label className={`${styles.label} ${styles.required}`} htmlFor="product_name">Product Name</label>
                        <input
                          id="product_name"
                          className={`${styles.input} ${errors.product_name ? styles.inputError : ''}`}
                          type="text"
                          name="product_name"
                          value={form.product_name}
                          onChange={handleChange}
                          placeholder="e.g. Leather Handbag"
                        />
                        {errors.product_name && <p className={styles.errorText} data-field-error>{errors.product_name}</p>}
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={`${styles.label} ${styles.required}`} htmlFor="product_category">Product Category</label>
                        <div className={styles.selectWrap}>
                          <select
                            id="product_category"
                            className={`${styles.select} ${errors.product_category ? styles.inputError : ''}`}
                            name="product_category"
                            value={form.product_category}
                            onChange={handleChange}
                          >
                            {PRODUCT_CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={16} className={styles.selectChevron} />
                        </div>
                        {errors.product_category && <p className={styles.errorText} data-field-error>{errors.product_category}</p>}
                      </div>
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label} htmlFor="drive_link">
                        Google Drive / Dropbox / OneDrive Link <span className={styles.optional}>(optional)</span>
                      </label>
                      <input
                        id="drive_link"
                        className={`${styles.input} ${errors.drive_link ? styles.inputError : ''}`}
                        type="url"
                        name="drive_link"
                        value={form.drive_link}
                        onChange={handleChange}
                        placeholder="Paste your Google Drive, Dropbox, or OneDrive link here"
                      />
                      {errors.drive_link && <p className={styles.errorText} data-field-error>{errors.drive_link}</p>}
                    </div>
                  </div>
                </div>

                {/* ─── Card 3: File Attachments ─── */}
                <div className={styles.formCard}>
                  <div className={styles.cardHeader}>
                    <Upload size={20} />
                    <h2 className={styles.cardTitle}>File Attachments</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p className={styles.fieldHint}>
                      Upload your product images. Supported formats: JPG, PNG, TIFF, PSD, RAW. Max 25MB each.
                    </p>
                    <FileUploadZone
                      onFilesChange={setFiles}
                      maxFiles={10}
                      maxSizeMB={25}
                      accept="image/*,.psd,.raw"
                    />
                  </div>
                </div>

                {/* ─── Card 4: Project Requirements ─── */}
                <div className={styles.formCard}>
                  <div className={styles.cardHeader}>
                    <FileText size={20} />
                    <h2 className={styles.cardTitle}>Project Requirements</h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.fieldGroup}>
                      <label className={`${styles.label} ${styles.required}`} htmlFor="project_requirements">
                        Tell us about your project
                      </label>
                      <textarea
                        id="project_requirements"
                        className={`${styles.input} ${styles.textarea} ${errors.project_requirements ? styles.inputError : ''}`}
                        name="project_requirements"
                        value={form.project_requirements}
                        onChange={handleChange}
                        placeholder="Describe what you need edited, specific instructions, deadlines, or any other details that will help us deliver exactly what you&apos;re looking for..."
                        rows={5}
                      />
                      <div className={styles.charRow}>
                        {errors.project_requirements && <p className={styles.errorText} data-field-error>{errors.project_requirements}</p>}
                        <span className={`${styles.charCount} ${charCount > charLimit ? styles.charOver : ''}`}>
                          {charCount}/{charLimit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ─── Submit ─── */}
                <div className={styles.submitCard}>
                  {status === 'error' && (
                    <div className={styles.formError}>
                      <AlertCircle size={18} />
                      <span>Something went wrong. Please try again or email us directly.</span>
                    </div>
                  )}
                  <button
                    className={styles.submitBtn}
                    type="submit"
                    disabled={status === 'loading'}
                  >
                    {status === 'loading' ? (
                      <>
                        <span className={styles.spinner} />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Free Trial Request
                        <Send size={16} />
                      </>
                    )}
                  </button>
                  <p className={styles.submitNote}>
                    By submitting, you agree to our{' '}
                    <Link href="/privacy">Privacy Policy</Link> and{' '}
                    <Link href="/terms">Terms of Service</Link>.
                    Your first 3–5 images are edited free with no obligation.
                  </p>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
