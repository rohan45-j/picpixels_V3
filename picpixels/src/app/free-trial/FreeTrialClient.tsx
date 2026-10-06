'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Send, Zap, Shield, RefreshCw, Users, ChevronDown, FileText, Link as LinkIcon, Upload, Loader2 } from 'lucide-react';
import FileUploadZone from '@/components/ui/FileUploadZone';
import { submitFreeTrial, getProductCategories } from '@/services/public-api';
import BotProtection from '@/components/ui/BotProtection';
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
  { icon: Users, label: 'Expert Retouchers', desc: '10+ years experience' },
];

export default function FreeTrialClient({ recaptchaSiteKey }: { recaptchaSiteKey?: string }) {
  const [form, setForm] = useState<FormData>({
    full_name: '',
    company_name: '',
    email: '',
    phone_number: '',
    product_name: '',
    product_category: '',
    drive_link: '',
    project_requirements: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverErrorMessage, setServerErrorMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [categories, setCategories] = useState<{ value: string; label: string }[]>(PRODUCT_CATEGORIES);

  useEffect(() => {
    getProductCategories().then((items) => {
      if (items && items.length > 0) {
        setCategories([
          { value: '', label: 'Select a category' },
          ...items.map((item) => ({ value: item.slug, label: item.name })),
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (status === 'success' && typeof window !== 'undefined') {
      setTimeout(() => {
        const successCard = document.getElementById('trial-submitted-card');
        if (successCard) {
          successCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 350, behavior: 'smooth' });
        }
      }, 80);
    }
  }, [status]);

  function getValidationErrors(): FormErrors {
    const errs: FormErrors = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.product_name.trim()) errs.product_name = 'Product name is required';
    if (!form.product_category) errs.product_category = 'Please select a product category';
    if (!form.project_requirements.trim()) {
      errs.project_requirements = 'Please describe your project requirements';
    } else if (form.project_requirements.trim().length < 20) {
      errs.project_requirements = 'Please provide a bit more detail (at least 20 characters)';
    }

    if (form.drive_link && form.drive_link.trim()) {
      try {
        new URL(form.drive_link.trim());
      } catch {
        errs.drive_link = 'Please enter a valid URL (including https://)';
      }
    }
    return errs;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = getValidationErrors();
    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstFieldKey = Object.keys(errs)[0];
      setTimeout(() => {
        const inputEl = document.querySelector<HTMLElement>(`[name="${firstFieldKey}"]`) || document.getElementById(firstFieldKey);
        if (inputEl) {
          inputEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          inputEl.focus();
        } else {
          const firstError = document.querySelector<HTMLElement>('[data-field-error]');
          firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
      return;
    }

    setStatus('loading');
    setServerErrorMessage('');
    try {
      const result = await submitFreeTrial(
        {
          full_name: form.full_name,
          company_name: form.company_name || undefined,
          email: form.email,
          phone_number: form.phone_number || undefined,
          product_name: form.product_name,
          product_category: form.product_category,
          drive_link: form.drive_link || undefined,
          project_requirements: form.project_requirements,
          website_hp: honeypot || undefined,
          recaptcha_token: recaptchaToken || undefined,
          cf_turnstile_response: recaptchaToken || undefined,
          captcha_token: recaptchaToken || undefined,
        },
        files.length > 0 ? files : undefined
      );
      if (result.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setServerErrorMessage(result.error || 'Something went wrong. Please check your inputs.');
      }
    } catch (err: any) {
      setStatus('error');
      setServerErrorMessage(err?.message || 'Something went wrong. Please check your network connection.');
    }
  }

  function resetForm() {
    setForm({
      full_name: '',
      company_name: '',
      email: '',
      phone_number: '',
      product_name: '',
      product_category: '',
      drive_link: '',
      project_requirements: '',
    });
    setFiles([]);
    setErrors({});
    setStatus('idle');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const charCount = form.project_requirements.length;
  const charLimit = 2000;

  return (
    <main className={styles.main}>
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.badge}>Risk-Free Trial</span>
            <h1 className={styles.title}>
              Get Your First <span className={styles.accentText}>3–5 Images</span> Edited Free
            </h1>
            <p className={styles.subtitle}>
              Experience our pixel-perfect quality with zero commitment. Upload your test images, describe your vision, and receive edited files in 24–48 hours.
            </p>
          </div>

          <div className={styles.trustGrid}>
            {trustBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.label} className={styles.trustCard}>
                  <div className={styles.trustIconWrap}>
                    <Icon size={20} className={styles.trustIcon} />
                  </div>
                  <div className={styles.trustText}>
                    <span className={styles.trustLabel}>{badge.label}</span>
                    <span className={styles.trustDesc}>{badge.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formCard}>
          {status === 'success' ? (
            <div className={styles.successState} id="trial-submitted-card">
              <div className={styles.successIconWrap}>
                <CheckCircle size={40} className={styles.successIcon} />
              </div>
              <h2 className={styles.successTitle}>Trial Request Submitted!</h2>
              <p className={styles.successText}>
                Thank you, <strong>{form.full_name}</strong>. We have received your images and requirements. Our production team will review your order and deliver your completed sample edits within 24–48 hours.
              </p>
              <div className={styles.successDetails}>
                <div className={styles.detailRow}>
                  <span>Product:</span>
                  <strong>{form.product_name}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Category:</span>
                  <strong>{categories.find((c) => c.value === form.product_category)?.label || form.product_category}</strong>
                </div>
                <div className={styles.detailRow}>
                  <span>Confirmation sent to:</span>
                  <strong>{form.email}</strong>
                </div>
              </div>
              <div className={styles.successActions}>
                <button className={styles.resetBtn} onClick={resetForm}>
                  Submit Another Request
                </button>
                <Link href="/" className={styles.homeLink}>
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.formHeader}>
                <h2 className={styles.formTitle}>Free Trial Application</h2>
                <p className={styles.formSubtitle}>
                  Fill in your details below. Fields marked with <span className={styles.required}>*</span> are required.
                </p>
              </div>

              <div className={styles.sectionDivider}>
                <span>Your Information</span>
              </div>

              <div className={styles.row}>
                <div className={styles.field} data-field-error={errors.full_name ? true : undefined}>
                  <label className={styles.label} htmlFor="full_name">
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    className={`${styles.input} ${errors.full_name ? styles.inputError : ''}`}
                    placeholder="e.g. John Doe"
                    value={form.full_name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                  {errors.full_name && <span className={styles.errorMsg}>{errors.full_name}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="company_name">Company / Brand Name</label>
                  <input
                    id="company_name"
                    name="company_name"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Acme Studio"
                    value={form.company_name}
                    onChange={handleChange}
                    autoComplete="organization"
                  />
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field} data-field-error={errors.email ? true : undefined}>
                  <label className={styles.label} htmlFor="email">
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone_number">Phone / WhatsApp Number</label>
                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    className={styles.input}
                    placeholder="+1 555 000 0000"
                    value={form.phone_number}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className={styles.sectionDivider}>
                <span>Project Details</span>
              </div>

              <div className={styles.row}>
                <div className={styles.field} data-field-error={errors.product_name ? true : undefined}>
                  <label className={styles.label} htmlFor="product_name">
                    Product / Project Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="product_name"
                    name="product_name"
                    type="text"
                    className={`${styles.input} ${errors.product_name ? styles.inputError : ''}`}
                    placeholder="e.g. Summer Leather Handbag Series"
                    value={form.product_name}
                    onChange={handleChange}
                  />
                  {errors.product_name && <span className={styles.errorMsg}>{errors.product_name}</span>}
                </div>

                <div className={styles.field} data-field-error={errors.product_category ? true : undefined}>
                  <label className={styles.label} htmlFor="product_category">
                    Product Category <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.selectWrap}>
                    <select
                      id="product_category"
                      name="product_category"
                      className={`${styles.select} ${errors.product_category ? styles.inputError : ''}`}
                      value={form.product_category}
                      onChange={handleChange}
                    >
                      {categories.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} className={styles.selectArrow} />
                  </div>
                  {errors.product_category && <span className={styles.errorMsg}>{errors.product_category}</span>}
                </div>
              </div>

              <div className={styles.field} data-field-error={errors.project_requirements ? true : undefined}>
                <div className={styles.labelRow}>
                  <label className={styles.label} htmlFor="project_requirements">
                    Editing Instructions & Requirements <span className={styles.required}>*</span>
                  </label>
                  <span className={`${styles.charCounter} ${charCount > charLimit ? styles.charLimitExceeded : ''}`}>
                    {charCount}/{charLimit}
                  </span>
                </div>
                <textarea
                  id="project_requirements"
                  name="project_requirements"
                  className={`${styles.input} ${styles.textarea} ${errors.project_requirements ? styles.inputError : ''}`}
                  rows={5}
                  placeholder="Specify: background removal (pure white/transparent), shadow type (drop shadow, reflection), retouching details, output formats (PSD, PNG, JPG), resolution, and color profiles."
                  value={form.project_requirements}
                  onChange={handleChange}
                  maxLength={charLimit}
                />
                {errors.project_requirements && (
                  <span className={styles.errorMsg}>{errors.project_requirements}</span>
                )}
              </div>

              <div className={styles.sectionDivider}>
                <span>Image Files</span>
              </div>

              <div className={styles.uploadSection}>
                <p className={styles.uploadTip}>
                  Upload up to <strong>5 test images</strong> directly, or provide a Google Drive / Dropbox link below.
                </p>
                <FileUploadZone
                  files={files}
                  onFilesChange={setFiles}
                  maxFiles={5}
                  maxSizeMB={50}
                  accept={'image/jpeg,image/png,image/tiff,image/webp,image/x-canon-cr2,image/x-adobe-dng'}
                />
              </div>

              <div className={styles.driveLinkSection}>
                <div className={styles.orDivider}>
                  <span>OR provide cloud storage link</span>
                </div>
                <div className={styles.field} data-field-error={errors.drive_link ? true : undefined}>
                  <label className={styles.label} htmlFor="drive_link">
                    <LinkIcon size={14} className={styles.inlineIcon} />
                    Google Drive, Dropbox, or WeTransfer Link
                  </label>
                  <input
                    id="drive_link"
                    name="drive_link"
                    type="url"
                    className={`${styles.input} ${errors.drive_link ? styles.inputError : ''}`}
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={form.drive_link}
                    onChange={handleChange}
                  />
                  {errors.drive_link && <span className={styles.errorMsg}>{errors.drive_link}</span>}
                  <span className={styles.hint}>
                    Make sure the link sharing setting is set to &ldquo;Anyone with the link can view/download&rdquo;.
                  </span>
                </div>
              </div>

              <div className={styles.submitSection}>
                {/* Bot Protection Honeypot & reCAPTCHA */}
                <div style={{ marginBottom: '1rem' }}>
                  <BotProtection
                    siteKey={recaptchaSiteKey}
                    onTokenChange={setRecaptchaToken}
                    honeypotValue={honeypot}
                    onHoneypotChange={setHoneypot}
                  />
                </div>

                {status === 'error' && (
                  <div className={styles.errorBanner}>
                    <AlertCircle size={18} />
                    <span>{serverErrorMessage || 'Something went wrong. Please check your inputs or email us directly at info@picpixels.com.'}</span>
                  </div>
                )}
                <button
                  className={styles.submitBtn}
                  type="submit"
                  disabled={status === 'loading'}
                  style={{ opacity: status === 'loading' ? 0.8 : 1, cursor: status === 'loading' ? 'wait' : 'pointer' }}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>{files.length > 0 ? 'Uploading Images & Submitting...' : 'Submitting Free Trial...'}</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Free Trial Request</span>
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
  );
}
