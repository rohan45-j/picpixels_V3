'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  ChevronLeft,
  Package,
  Clock,
  Shield,
  Headphones,
  Lock,
  Upload,
  File,
  X,
  Link as LinkIcon,
  Send,
  Globe,
  Mail,
  User,
  Building2,
  FileText,
  HardDrive,
  Loader2,
  Phone,
  HelpCircle,
} from 'lucide-react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import { mediaUrl, getOrderSummary, type OrderSummaryData } from '../../services/public-api';
import styles from '../../shared/styles/modules/order-summary.module.css';

/* ══════════════════════════════════════
   PROJECT REQUIREMENTS
   ══════════════════════════════════════ */

function ProjectRequirements({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className={styles.reqSection}>
      <label className={styles.fieldLabel}>
        Project Requirements <span className={styles.fieldRequired}>*</span>
      </label>
      <textarea
        className={styles.reqTextarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Describe your editing requirements...\n\nExamples:\n• Background Removal\n• Shadow Creation\n• Color Correction\n• Retouching\n• Clipping Path`}
        rows={6}
      />
    </div>
  );
}

/* ══════════════════════════════════════
   CLIENT INFO FORM
   ══════════════════════════════════════ */

interface ClientInfo {
  fullName: string;
  company: string;
  email: string;
  whatsapp: string;
  country: string;
}

const COUNTRY_OPTIONS = [
  'United States', 'Canada', 'United Kingdom', 'Australia',
  'Germany', 'France', 'India', 'Brazil', 'Japan', 'Other',
];

function ClientInfoForm({ value, onChange }: { value: ClientInfo; onChange: (v: ClientInfo) => void }) {
  const update = (k: keyof ClientInfo, v: string) => onChange({ ...value, [k]: v });

  return (
    <div className={styles.clientForm}>
      <div className={styles.clientGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            Full Name <span className={styles.fieldRequired}>*</span>
          </label>
          <div className={styles.fieldInputWrap}>
            <User size={15} className={styles.fieldIcon} />
            <input type="text" className={styles.fieldInput} value={value.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="John Doe" />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Company Name</label>
          <div className={styles.fieldInputWrap}>
            <Building2 size={15} className={styles.fieldIcon} />
            <input type="text" className={styles.fieldInput} value={value.company} onChange={(e) => update('company', e.target.value)} placeholder="Company (optional)" />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            Email Address <span className={styles.fieldRequired}>*</span>
          </label>
          <div className={styles.fieldInputWrap}>
            <Mail size={15} className={styles.fieldIcon} />
            <input type="email" className={styles.fieldInput} value={value.email} onChange={(e) => update('email', e.target.value)} placeholder="john@example.com" />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            WhatsApp Number <span className={styles.fieldRequired}>*</span>
          </label>
          <div className={styles.fieldInputWrap}>
            <Phone size={15} className={styles.fieldIcon} />
            <input type="tel" className={styles.fieldInput} value={value.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} placeholder="+1 (555) 000-0000" />
          </div>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>
            Country <span className={styles.fieldRequired}>*</span>
          </label>
          <div className={styles.fieldInputWrap}>
            <Globe size={15} className={styles.fieldIcon} />
            <select className={styles.fieldSelect} value={value.country} onChange={(e) => update('country', e.target.value)}>
              <option value="">Select country</option>
              {COUNTRY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   FILE UPLOAD
   ══════════════════════════════════════ */

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  preview?: string;
  status: 'uploading' | 'done' | 'error';
}

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.psd', '.tif', '.tiff', '.zip', '.rar'];
const MAX_FILE_SIZE = 500 * 1024 * 1024;

function FileUpload({ files, onFilesChange }: { files: UploadedFile[]; onFilesChange: React.Dispatch<React.SetStateAction<UploadedFile[]>> }) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndAdd = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];
    for (const f of Array.from(fileList)) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) continue;
      if (f.size > MAX_FILE_SIZE) continue;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined;
      newFiles.push({ id, file: f, progress: 0, preview, status: 'uploading' });
    }
    if (newFiles.length === 0) return;
    const updated = [...files, ...newFiles];
    onFilesChange(updated);
    newFiles.forEach((nf) => {
      let pct = 0;
      const iv = setInterval(() => {
        pct += Math.random() * 30 + 5;
        if (pct >= 100) { pct = 100; clearInterval(iv); }
        onFilesChange((prev: UploadedFile[]) =>
          prev.map((pf) => pf.id === nf.id ? { ...pf, progress: Math.min(pct, 100), status: pct >= 100 ? 'done' as const : 'uploading' as const } : pf)
        );
      }, 200);
    });
  }, [files, onFilesChange]);

  const removeFile = (id: string) => {
    onFilesChange((prev: UploadedFile[]) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) validateAndAdd(e.dataTransfer.files); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.fileUploadSection}>
      <div
        ref={dropRef}
        className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" multiple accept={ALLOWED_EXTS.join(',')} className={styles.fileInputHidden}
          onChange={(e) => { if (e.target.files) validateAndAdd(e.target.files); e.target.value = ''; }} />
        <Upload size={32} className={styles.dropIcon} />
        <p className={styles.dropText}><strong>Click to upload</strong> or drag and drop</p>
        <p className={styles.dropHint}>JPG, PNG, PSD, TIFF, ZIP, RAR &mdash; Max 500MB per file</p>
      </div>
      {files.length > 0 && (
        <div className={styles.fileList}>
          <div className={styles.fileListHeader}>
            <span className={styles.fileListCount}>{files.length} file{files.length > 1 ? 's' : ''}</span>
            <span className={styles.fileListSize}>{formatSize(totalSize)} total</span>
          </div>
          {files.map((f) => (
            <div key={f.id} className={styles.fileItem}>
              <div className={styles.fileItemIcon}>
                {f.preview ? <img src={f.preview} alt="" className={styles.filePreview} /> : <File size={20} />}
              </div>
              <div className={styles.fileItemInfo}>
                <span className={styles.fileItemName}>{f.file.name}</span>
                <span className={styles.fileItemSize}>{formatSize(f.file.size)}</span>
              </div>
              <div className={styles.fileItemStatus}>
                {f.status === 'uploading' && (
                  <div className={styles.fileProgress}><div className={styles.fileProgressBar} style={{ width: `${f.progress}%` }} /></div>
                )}
                {f.status === 'done' && <Check size={16} className={styles.fileStatusDone} />}
              </div>
              <button type="button" className={styles.fileRemoveBtn} onClick={() => removeFile(f.id)} aria-label="Remove file"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   DRIVE / CLOUD LINK
   ══════════════════════════════════════ */

function CloudLinkInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const isValid = value === '' || value.startsWith('http') || value.startsWith('https');

  return (
    <div className={styles.driveLinkSection}>
      <label className={styles.fieldLabel}>
        Google Drive / Dropbox / WeTransfer Link
        <span className={styles.fieldOptional}>Paste a shareable link to your files</span>
      </label>
      <div className={`${styles.fieldInputWrap} ${!isValid ? styles.fieldInputError : ''}`}>
        <LinkIcon size={15} className={styles.fieldIcon} />
        <input type="url" className={styles.fieldInput} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://drive.google.com/..." />
      </div>
      {!isValid && <p className={styles.fieldError}>Please enter a valid URL</p>}
      {value && isValid && <p className={styles.fieldSuccess}><Check size={12} /> Link provided</p>}
    </div>
  );
}

/* ══════════════════════════════════════
   ZIP FILE UPLOAD
   ══════════════════════════════════════ */

function ZipUpload({ file, onFileChange }: { file: File | null; onFileChange: (f: File | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={styles.zipSection}>
      <input ref={inputRef} type="file" accept=".zip,.rar" className={styles.fileInputHidden}
        onChange={(e) => { if (e.target.files?.length) onFileChange(e.target.files[0]); e.target.value = ''; }} />
      {!file ? (
        <div className={styles.zipDrop} onClick={() => inputRef.current?.click()}>
          <HardDrive size={24} className={styles.dropIcon} />
          <p className={styles.dropText}><strong>Upload ZIP / RAR</strong></p>
          <p className={styles.dropHint}>Compress all images into a single archive</p>
        </div>
      ) : (
        <div className={styles.zipFileCard}>
          <div className={styles.zipFileIcon}><File size={20} /></div>
          <div className={styles.zipFileInfo}>
            <span className={styles.zipFileName}>{file.name}</span>
            <span className={styles.zipFileSize}>{formatSize(file.size)}</span>
          </div>
          <span className={styles.zipFileStatus}><Check size={14} /> Ready</span>
          <button type="button" className={styles.fileRemoveBtn} onClick={() => onFileChange(null)} aria-label="Remove ZIP"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   FILE SUBMISSION TABS
   ══════════════════════════════════════ */

type FileTab = 'upload' | 'drive' | 'zip';

const FILE_TABS: { key: FileTab; label: string }[] = [
  { key: 'upload', label: 'Upload Files' },
  { key: 'drive', label: 'Drive Link' },
  { key: 'zip', label: 'ZIP Upload' },
];

function FileSubmission({
  activeTab, onTabChange, files, onFilesChange, driveLink, onDriveLinkChange, zipFile, onZipFileChange,
}: {
  activeTab: FileTab; onTabChange: (t: FileTab) => void;
  files: UploadedFile[]; onFilesChange: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  driveLink: string; onDriveLinkChange: (v: string) => void;
  zipFile: File | null; onZipFileChange: (f: File | null) => void;
}) {
  return (
    <div className={styles.fileSubmission}>
      <div className={styles.fileTabs}>
        {FILE_TABS.map((tab) => (
          <button key={tab.key} type="button" className={`${styles.fileTab} ${activeTab === tab.key ? styles.fileTabActive : ''}`} onClick={() => onTabChange(tab.key)}>
            {tab.key === 'upload' && <Upload size={14} />}
            {tab.key === 'drive' && <LinkIcon size={14} />}
            {tab.key === 'zip' && <HardDrive size={14} />}
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.fileTabContent}>
        {activeTab === 'upload' && <FileUpload files={files} onFilesChange={onFilesChange} />}
        {activeTab === 'drive' && <CloudLinkInput value={driveLink} onChange={onDriveLinkChange} />}
        {activeTab === 'zip' && <ZipUpload file={zipFile} onFileChange={onZipFileChange} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   SKELETON
   ══════════════════════════════════════ */

function SummarySkeleton() {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.skeleton}>
          <div className={styles.skelHead} />
          <div className={styles.skelBody}>
            <div className={styles.skelBlock} style={{ height: 28, width: '55%', marginBottom: 12 }} />
            <div className={styles.skelBlock} style={{ height: 16, width: '35%', marginBottom: 28 }} />
            <div className={styles.skelBlock} style={{ height: 160, marginBottom: 20 }} />
            <div className={styles.skelBlock} style={{ height: 14, width: '70%', marginBottom: 8 }} />
          </div>
          <div className={styles.skelSide}>
            <div className={styles.skelBlock} style={{ height: 22, width: '50%', marginBottom: 20 }} />
            <div className={styles.skelBlock} style={{ height: 16, marginBottom: 12 }} />
            <div className={styles.skelBlock} style={{ height: 16, marginBottom: 24 }} />
            <div className={styles.skelBlock} style={{ height: 48, marginBottom: 12 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════ */

function EmptyState() {
  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}><Package size={56} /></div>
          <h2 className={styles.emptyTitle}>No Package Selected</h2>
          <p className={styles.emptyDesc}>Browse our pricing plans and choose the one that fits your needs.</p>
          <div className={styles.emptyActions}>
            <Link href="/pricing" className={styles.emptyBtn}>View Pricing Plans <ArrowRight size={16} /></Link>
            <Link href="/services" className={styles.emptyBtnOutline}>Explore Services</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ══════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════ */

export default function OrderSummaryPage() {
  const [data, setData] = useState<OrderSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [instructions, setInstructions] = useState('');
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    fullName: '', company: '', email: '', whatsapp: '', country: '',
  });
  const [activeFileTab, setActiveFileTab] = useState<FileTab>('upload');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [driveLink, setDriveLink] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);

  useEffect(() => {
    const summary = getOrderSummary();
    setData(summary);
    setLoading(false);
  }, []);

  const imgSrc = data ? mediaUrl(data.image) : undefined;

  const hasFiles = files.length > 0 || driveLink !== '' || zipFile !== null;
  const hasClientInfo = clientInfo.fullName && clientInfo.email && clientInfo.whatsapp && clientInfo.country;
  const canSubmit = data && hasFiles && hasClientInfo && !submitting;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  if (loading) return <SummarySkeleton />;
  if (!data) return <EmptyState />;

  if (submitted) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.container}>
          <div className={styles.successCard}>
            <div className={styles.successIllustration}>
              <div className={styles.successIconWrap}><Check size={44} strokeWidth={3} /></div>
            </div>
            <h2 className={styles.successTitle}>Order Submitted!</h2>
            <p className={styles.successDesc}>
              Thank you <strong>{clientInfo.fullName || 'for your order'}</strong>. Your <strong>{data.title}</strong>{' '}
              project has been received. We&apos;ll contact you via WhatsApp within 24 hours to confirm and begin processing.
            </p>
            <div className={styles.successDetails}>
              <div className={styles.successDetailRow}>
                <span className={styles.successDetailLabel}>Service</span>
                <span className={styles.successDetailValue}>{data.title}</span>
              </div>
              {data.unitRange && (
                <div className={styles.successDetailRow}>
                  <span className={styles.successDetailLabel}>Package Range</span>
                  <span className={styles.successDetailValue}>{data.unitRange}</span>
                </div>
              )}
              <div className={styles.successDetailRow}>
                <span className={styles.successDetailLabel}>Total</span>
                <span className={styles.successDetailValue}>{data.price}</span>
              </div>
              <div className={styles.successDetailRow}>
                <span className={styles.successDetailLabel}>Delivery</span>
                <span className={styles.successDetailValue}>24-48 hours</span>
              </div>
            </div>
            <div className={styles.successActions}>
              <Link href="/" className={styles.successBtnPrimary}>Back to Home <ArrowRight size={16} /></Link>
              <Link href="/pricing" className={styles.successBtnSecondary}>View More Plans</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <div className={styles.container}>
        <nav className={styles.breadcrumb}>
          <Link href="/pricing" className={styles.breadcrumbLink}><ChevronLeft size={14} /> Pricing</Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Order Summary</span>
        </nav>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Order Summary</h1>
          <p className={styles.pageSubtitle}>Review your selected service, submit project files, and complete your order request.</p>
        </div>

        <div className={styles.grid}>
          {/* ═══ LEFT COLUMN ═══ */}
          <div className={styles.leftCol}>
            {/* ── Package Information ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <Package size={18} />
                <span>Package Information</span>
              </div>
              <div className={styles.serviceInfo}>
                <div className={styles.serviceInfoTop}>
                  {imgSrc ? (
                    <div className={styles.serviceThumb}><img src={imgSrc} alt={data.title} className={styles.serviceThumbImg} /></div>
                  ) : (
                    <div className={styles.serviceThumbPlaceholder}><Package size={24} /></div>
                  )}
                  <div className={styles.serviceInfoBody}>
                    <span className={styles.badge}>{data.source === 'configurator' ? 'Custom Package' : 'Standard Plan'}</span>
                    <h2 className={styles.serviceTitle}>{data.title}</h2>
                    <div className={styles.serviceMeta}>
                      {data.unitRange && (
                        <div className={styles.serviceMetaItem}><Package size={13} /> Images: <strong>{data.unitRange}</strong></div>
                      )}
                      <div className={styles.serviceMetaItem}><Clock size={13} /> Delivery: 24 Hours</div>
                    </div>
                  </div>
                  <div className={styles.servicePrice}>
                    <span className={styles.serviceUnitPrice}>{data.price}</span>
                    <span className={styles.serviceUnitLabel}>Package Price</span>
                  </div>
                </div>
                {data.description && <p className={styles.serviceDesc}>{data.description}</p>}
              </div>
            </div>

            {/* ── Project Requirements ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <FileText size={18} />
                <span>Project Requirements</span>
              </div>
              <ProjectRequirements value={instructions} onChange={setInstructions} />
            </div>

            {/* ── Client Information ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <User size={18} />
                <span>Client Information</span>
              </div>
              <ClientInfoForm value={clientInfo} onChange={setClientInfo} />
            </div>

            {/* ── File Submission ── */}
            <div className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <Upload size={18} />
                <span>File Submission</span>
              </div>
              <FileSubmission
                activeTab={activeFileTab}
                onTabChange={setActiveFileTab}
                files={files}
                onFilesChange={setFiles}
                driveLink={driveLink}
                onDriveLinkChange={setDriveLink}
                zipFile={zipFile}
                onZipFileChange={setZipFile}
              />
            </div>

            {/* ── Contact Notice ── */}
            <div className={styles.contactNotice}>
              <HelpCircle size={18} />
              <div className={styles.contactNoticeBody}>
                <strong>Need a larger quantity than this package?</strong>
                <p>Submit your project details and our team will review the request and provide a custom quotation.</p>
              </div>
            </div>

            {/* ── CTA ── */}
            <div className={styles.formActions}>
              <button type="button" className={styles.submitBtn} onClick={handleSubmit} disabled={!canSubmit}>
                {submitting ? <><Loader2 size={18} className={styles.spinner} /> Submitting...</> : <><Send size={18} /> Submit Order Request</>}
              </button>
            </div>
          </div>

          {/* ═══ SIDEBAR ═══ */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <h3 className={styles.sidebarTitle}>Order Summary</h3>
              <div className={styles.sidebarBody}>
                <div className={styles.sidebarRow}>
                  <span className={styles.sidebarLabel}>Service</span>
                  <span className={styles.sidebarValue}>{data.title}</span>
                </div>
                <div className={styles.sidebarRow}>
                  <span className={styles.sidebarLabel}>Package</span>
                  <span className={styles.sidebarValue}>{data.source === 'configurator' ? 'Custom' : 'Standard'}</span>
                </div>
                {data.unitRange && (
                  <div className={styles.sidebarRow}>
                    <span className={styles.sidebarLabel}>Package Range</span>
                    <span className={styles.sidebarValue}>{data.unitRange}</span>
                  </div>
                )}
                <div className={styles.sidebarRow}>
                  <span className={styles.sidebarLabel}>Delivery</span>
                  <span className={styles.sidebarValue}>24 Hours</span>
                </div>
                <hr className={styles.sidebarDivider} />
                <div className={styles.sidebarRowTotal}>
                  <span className={styles.sidebarLabelTotal}>Total</span>
                  <span className={styles.sidebarTotal}>{data.price}</span>
                </div>
              </div>

              <div className={styles.sidebarTrust}>
                <div className={styles.sidebarTrustItem}><Shield size={13} /> Secure File Submission</div>
                <div className={styles.sidebarTrustItem}><Lock size={13} /> Confidential Handling</div>
                <div className={styles.sidebarTrustItem}><User size={13} /> Professional Editors</div>
                <div className={styles.sidebarTrustItem}><Headphones size={13} /> 24/7 Support</div>
                <div className={styles.sidebarTrustItem}><Clock size={13} /> Fast Delivery</div>
              </div>

              <p className={styles.sidebarNote}>
                By submitting, you agree to our <Link href="/terms" className={styles.sidebarLink}>Terms of Service</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
