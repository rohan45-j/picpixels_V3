'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Check,
  ArrowRight,
  Package,
  Clock,
  Shield,
  Headphones,
  Lock,
  Upload,
  File as FileIcon,
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
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import BotProtection, { BotProtectionPayload } from '@/components/ui/BotProtection';
import {
  mediaUrl,
  getOrderSummary,
  storeOrderSummary,
  submitOrderRequest,
  fetchPricingServices,
  type OrderSummaryData,
  type PricingService,
} from '@/services/public-api';
import styles from '@/styles/modules/order-summary.module.css';

/* ══════════════════════════════════════
   CLIENT & FORM TYPES
   ══════════════════════════════════════ */
interface ClientInfo {
  fullName: string;
  company: string;
  email: string;
  whatsapp: string;
  country: string;
}

const COUNTRY_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Netherlands',
  'Italy',
  'Spain',
  'Sweden',
  'Switzerland',
  'India',
  'Bangladesh',
  'Brazil',
  'Japan',
  'Singapore',
  'United Arab Emirates',
  'Other',
];

const SUGGESTED_REQUIREMENTS = [
  'Clipping Path',
  'Pure White (#FFFFFF)',
  'Transparent Background',
  'Natural Shadow',
  'Product Retouching',
  'Color Correction',
  'Ghost Mannequin',
  'Crop & Margin Alignment',
  '300 DPI High-Resolution',
];

const OUTPUT_FORMAT_OPTIONS = [
  { id: 'JPG', label: 'JPG (Pure White Background)' },
  { id: 'PNG', label: 'PNG (Transparent Background)' },
  { id: 'PSD', label: 'PSD (Layered with Clipping Paths)' },
  { id: 'TIFF', label: 'TIFF (High-Res Print Ready)' },
  { id: 'WebP', label: 'WebP (E-commerce Web Ready)' },
];

const TURNAROUND_OPTIONS = [
  { id: 'standard', title: 'Standard Turnaround', time: '24 – 48 Hours', note: 'Recommended • No Extra Cost' },
  { id: 'express', title: 'Express Fast-Track', time: '12 – 24 Hours', note: 'Priority Queue Processing' },
  { id: 'rush', title: 'Super Rush Delivery', time: 'Under 12 Hours', note: 'Dedicated Senior Artist Squad' },
];

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  preview?: string;
  status: 'uploading' | 'done' | 'error';
}

const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.psd', '.tif', '.tiff', '.zip', '.rar'];
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

type FileTab = 'upload' | 'drive' | 'zip';

const DEFAULT_PACKAGE: OrderSummaryData = {
  source: 'pricing',
  title: 'Clipping Path Service - Basic',
  description: 'Precision hand-drawn Photoshop clipping path for clean product presentation.',
  image: null,
  price: '$2.00',
  features: [
    'Hand-drawn Clipping Path',
    'White or Transparent Output',
    '300 DPI High-Resolution Output',
    'Unlimited Free Revisions',
  ],
  unitRange: '1-25 images',
};

export default function OrderSummaryClient({
  initialData,
  availableServices: initialAvailableServices = [],
}: {
  initialData?: OrderSummaryData | null;
  availableServices?: PricingService[];
}) {
  const [availableServices, setAvailableServices] = useState<PricingService[]>(initialAvailableServices);

  // Fetch services client-side for the package configurator (non-blocking)
  useEffect(() => {
    if (initialAvailableServices.length === 0) {
      fetchPricingServices().then((svcs) => {
        if (Array.isArray(svcs) && svcs.length > 0) {
          setAvailableServices(svcs);
        }
      }).catch(() => {});
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Always initialize with the latest package the user clicked
  const [data, setData] = useState<OrderSummaryData | null>(() => {
    if (typeof window !== 'undefined') {
      const clientData = getOrderSummary();
      if (clientData) {
        if (!initialData || (clientData._timestamp && (!initialData._timestamp || clientData._timestamp >= initialData._timestamp))) {
          return clientData;
        }
      }
    }
    return initialData ?? null;
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Configurator drawer state
  const [isConfigDrawerOpen, setIsConfigDrawerOpen] = useState(false);
  const [activeServiceId, setActiveServiceId] = useState<number | null>(null);
  const [activeCardId, setActiveCardId] = useState<number | null>(null);
  const [activeUnitRangeId, setActiveUnitRangeId] = useState<number | null>(null);

  // Preferences
  const [selectedTurnaround, setSelectedTurnaround] = useState('standard');
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['JPG', 'PNG']);

  // Instructions & Client Details
  const [instructions, setInstructions] = useState('');
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    fullName: '',
    company: '',
    email: '',
    whatsapp: '',
    country: '',
  });

  // Assets
  const [activeFileTab, setActiveFileTab] = useState<FileTab>('upload');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [driveLink, setDriveLink] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsConfigDrawerOpen(false);
      }
    };
    if (isConfigDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isConfigDrawerOpen]);

  // Bot protection payload
  const [botPayload, setBotPayload] = useState<BotProtectionPayload>({
    website_hp: '',
    hp_company_url: '',
    form_loaded_at: Date.now(),
  });

  // On mount: sync the package data from localStorage / initialData / fallback default
  useEffect(() => {
    const syncLatestData = () => {
      let resolvedData: OrderSummaryData | null = null;
      if (typeof window !== 'undefined') {
        const clientData = getOrderSummary();
        if (clientData) {
          if (!initialData || (clientData._timestamp && (!initialData._timestamp || clientData._timestamp >= initialData._timestamp))) {
            resolvedData = clientData;
          }
        }
      }
      if (!resolvedData && initialData) {
        resolvedData = initialData;
      }
      if (!resolvedData && typeof window !== 'undefined') {
        resolvedData = getOrderSummary();
      }

      // Only use DEFAULT_PACKAGE as absolute last resort (services may not be loaded yet)
      if (!resolvedData) {
        resolvedData = DEFAULT_PACKAGE;
      }

      setData(resolvedData);
    };

    syncLatestData();

    window.addEventListener('storage', syncLatestData);
    return () => {
      window.removeEventListener('storage', syncLatestData);
    };
  }, [initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  // When availableServices become available (async load), sync active selection IDs for the configurator
  useEffect(() => {
    if (availableServices.length === 0) return;

    const currentData = data;
    if (!currentData && availableServices.length > 0) {
      // If still no data, set default from first available service
      const firstSvc = availableServices.find((s) => s.cards && s.cards.length > 0) || availableServices[0];
      const firstCard = firstSvc?.cards?.[0];
      const firstUnit = firstSvc?.unit_ranges?.[0];
      const priceObj = firstCard?.prices?.find((p) => p.unit_range === firstUnit?.id);
      const priceStr = priceObj ? `$${priceObj.price}` : firstCard?.prices?.[0]?.price ? `$${firstCard.prices[0].price}` : '$2.00';
      setData({
        source: 'pricing',
        title: `${firstSvc.name} - ${firstCard?.name || 'Standard'}`,
        description: firstCard?.description || firstSvc.description || '',
        image: firstCard?.image || null,
        price: priceStr,
        features: firstCard?.features || DEFAULT_PACKAGE.features,
        unitRange: firstUnit?.label || '1-25 images',
      });
    }

    // Always sync active IDs when services load
    const refData = currentData;
    if (refData) {
      const matchSvc = availableServices.find((s) => refData.title?.startsWith(s.name));
      const chosenSvc = matchSvc || availableServices[0];
      setActiveServiceId(chosenSvc.id);
      if (chosenSvc.cards?.length > 0) {
        const matchCard = chosenSvc.cards.find((c) => refData.title?.includes(c.name));
        setActiveCardId(matchCard?.id || chosenSvc.cards[0].id);
      }
      if (chosenSvc.unit_ranges?.length > 0) {
        const matchUnit = chosenSvc.unit_ranges.find((u) => u.label === refData.unitRange);
        setActiveUnitRangeId(matchUnit?.id || chosenSvc.unit_ranges[0].id);
      }
    } else {
      setActiveServiceId(availableServices[0]?.id || null);
      setActiveCardId(availableServices[0]?.cards?.[0]?.id || null);
      setActiveUnitRangeId(availableServices[0]?.unit_ranges?.[0]?.id || null);
    }
  }, [availableServices]); // eslint-disable-line react-hooks/exhaustive-deps


  const updateClientInfo = (k: keyof ClientInfo, v: string) => {
    setClientInfo((prev) => ({ ...prev, [k]: v }));
  };

  const handleAddRequirementChip = (chip: string) => {
    setInstructions((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return `• ${chip}`;
      if (trimmed.includes(chip)) return prev;
      return `${trimmed}\n• ${chip}`;
    });
  };

  const toggleOutputFormat = (fmt: string) => {
    setSelectedFormats((prev) =>
      prev.includes(fmt) ? prev.filter((item) => item !== fmt) : [...prev, fmt]
    );
  };

  /* ── Interactive Service & Package Switching ── */
  const handleServiceSelect = (svcId: number) => {
    setActiveServiceId(svcId);
    const svc = availableServices.find((s) => s.id === svcId);
    if (!svc) return;

    const firstCard = svc.cards?.[0];
    const unitRangeId = svc.unit_ranges?.[0]?.id || null;
    setActiveCardId(firstCard?.id || null);
    setActiveUnitRangeId(unitRangeId);

    const priceObj = firstCard?.prices?.find((p) => p.unit_range === unitRangeId);
    const priceStr = priceObj ? `$${priceObj.price}` : firstCard?.prices?.[0]?.price ? `$${firstCard.prices[0].price}` : '$2.00';
    const unitLabel = svc.unit_ranges?.find((u) => u.id === unitRangeId)?.label || '';

    const newOrderData: OrderSummaryData = {
      source: 'pricing',
      title: `${svc.name} - ${firstCard?.name || 'Standard'}`,
      description: firstCard?.description || svc.description || '',
      image: firstCard?.image || null,
      price: priceStr,
      features: firstCard?.features || DEFAULT_PACKAGE.features,
      unitRange: unitLabel,
    };
    setData(newOrderData);
    storeOrderSummary(newOrderData);
  };

  const handleCardSelect = (cardId: number) => {
    setActiveCardId(cardId);
    const svc = availableServices.find((s) => s.id === activeServiceId);
    if (!svc) return;
    const card = svc.cards?.find((c) => c.id === cardId);
    if (!card) return;

    const priceObj = card.prices?.find((p) => p.unit_range === activeUnitRangeId);
    const priceStr = priceObj ? `$${priceObj.price}` : card.prices?.[0]?.price ? `$${card.prices[0].price}` : '$2.00';
    const unitLabel = svc.unit_ranges?.find((u) => u.id === activeUnitRangeId)?.label || '';

    const newOrderData: OrderSummaryData = {
      source: 'pricing',
      title: `${svc.name} - ${card.name}`,
      description: card.description || svc.description || '',
      image: card.image || null,
      price: priceStr,
      features: card.features || DEFAULT_PACKAGE.features,
      unitRange: unitLabel,
    };
    setData(newOrderData);
    storeOrderSummary(newOrderData);
  };

  const handleUnitRangeSelect = (unitId: number) => {
    setActiveUnitRangeId(unitId);
    const svc = availableServices.find((s) => s.id === activeServiceId);
    if (!svc) return;
    const card = svc.cards?.find((c) => c.id === activeCardId) || svc.cards?.[0];
    const unitRange = svc.unit_ranges?.find((u) => u.id === unitId);

    const priceObj = card?.prices?.find((p) => p.unit_range === unitId);
    const priceStr = priceObj ? `$${priceObj.price}` : card?.prices?.[0]?.price ? `$${card.prices[0].price}` : '$2.00';

    const newOrderData: OrderSummaryData = {
      source: 'pricing',
      title: `${svc.name} - ${card?.name || 'Standard'}`,
      description: card?.description || svc.description || '',
      image: card?.image || null,
      price: priceStr,
      features: card?.features || DEFAULT_PACKAGE.features,
      unitRange: unitRange?.label || '',
    };
    setData(newOrderData);
    storeOrderSummary(newOrderData);
  };

  /* ── File validation & management ── */
  const validateAndAddFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];
    for (const f of Array.from(fileList)) {
      const ext = '.' + f.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTS.includes(ext)) continue;
      if (f.size > MAX_FILE_SIZE) continue;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const preview = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined;
      newFiles.push({ id, file: f, progress: 100, preview, status: 'done' });
    }
    if (newFiles.length === 0) return;
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      validateAndAddFiles(e.dataTransfer.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalFileSize = files.reduce((acc, f) => acc + f.file.size, 0);

  const hasFiles = files.length > 0 || driveLink.trim() !== '' || zipFile !== null;
  const hasClientInfo =
    clientInfo.fullName.trim() &&
    clientInfo.email.trim() &&
    clientInfo.whatsapp.trim() &&
    clientInfo.country.trim();

  const canSubmit = Boolean(data && hasFiles && hasClientInfo && !submitting);

  const handleSubmit = async () => {
    if (!canSubmit || !data) return;
    setSubmitting(true);

    try {
      const uploadFiles: File[] = [];
      files.forEach((f) => {
        if (f.file) uploadFiles.push(f.file);
      });
      if (zipFile) {
        uploadFiles.push(zipFile);
      }

      const pkgTitle = data.unitRange ? `${data.title} (${data.unitRange})` : data.title;
      const turnaroundLabel = TURNAROUND_OPTIONS.find((t) => t.id === selectedTurnaround)?.title || 'Standard Turnaround';
      const formatsSummary = selectedFormats.join(', ');

      const combinedNotes = [
        `[Turnaround]: ${turnaroundLabel}`,
        `[Output Formats]: ${formatsSummary || 'Standard'}`,
        instructions ? `[Instructions]:\n${instructions}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const ok = await submitOrderRequest(
        {
          full_name: clientInfo.fullName,
          company_name: clientInfo.company || undefined,
          email: clientInfo.email,
          phone_number: clientInfo.whatsapp,
          country: clientInfo.country,
          product_name: pkgTitle,
          package_price: data.price,
          project_requirements: combinedNotes || '',
          drive_link: driveLink || undefined,
          ...botPayload,
        },
        uploadFiles.length > 0 ? uploadFiles : undefined
      );

      if (ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('There was an issue submitting your order. Please verify your details and try again.');
      }
    } catch {
      alert('An unexpected error occurred while submitting your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ══════════════════════════════════════
     SUCCESS STATE
     ══════════════════════════════════════ */
  if (submitted && data) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.container}>
          <div className={styles.successCard}>
            <div className={styles.successIconWrap}>
              <Check size={42} />
            </div>
            <h1 className={styles.successTitle}>Order Successfully Submitted!</h1>
            <p className={styles.successDesc}>
              Thank you for trusting PicPicxels. Your project specifications and assets have been securely received. Our production team is reviewing your files and will send a confirmation receipt to <strong>{clientInfo.email}</strong> shortly.
            </p>

            <div className={styles.successDetailsCard}>
              <div className={styles.successDetailRow}>
                <span className={styles.successDetailLabel}>Selected Service &amp; Tier</span>
                <span className={styles.successDetailValue}>{data.title}</span>
              </div>
              {data.unitRange && (
                <div className={styles.successDetailRow}>
                  <span className={styles.successDetailLabel}>Volume Range</span>
                  <span className={styles.successDetailValue}>{data.unitRange}</span>
                </div>
              )}
              <div className={styles.successDetailRow}>
                <span className={styles.successDetailLabel}>Package Rate</span>
                <span className={styles.successDetailValue} style={{ color: '#ea580c' }}>
                  {data.price}
                </span>
              </div>
              <div className={styles.successDetailRow}>
                <span className={styles.successDetailLabel}>Turnaround Target</span>
                <span className={styles.successDetailValue}>
                  {TURNAROUND_OPTIONS.find((t) => t.id === selectedTurnaround)?.time || '24 – 48 Hours'}
                </span>
              </div>
              <div className={styles.successDetailRow}>
                <span className={styles.successDetailLabel}>Revision Guarantee</span>
                <span className={styles.successDetailValue} style={{ color: '#16a34a' }}>
                  Unlimited Free Revisions
                </span>
              </div>
            </div>

            <div className={styles.successActions}>
              <Link href="/" className={styles.emptyBtnPrimary}>
                Back to Home <ArrowRight size={16} />
              </Link>
              <Link href="/pricing" className={styles.emptyBtnSecondary}>
                View More Packages
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ══════════════════════════════════════
     MAIN STANDARD ORDER SUMMARY VIEW
     ══════════════════════════════════════ */
  const activePackage = data || DEFAULT_PACKAGE;
  const currentSvc = availableServices.find((s) => s.id === activeServiceId) || availableServices[0];
  const imgSrc = activePackage.image ? mediaUrl(activePackage.image) : undefined;
  const featuresList =
    Array.isArray(activePackage.features) && activePackage.features.length > 0
      ? activePackage.features
      : DEFAULT_PACKAGE.features;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.container}>
        {/* Top Breadcrumb & Stepper */}
        <div className={styles.topNav}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" className={styles.breadcrumbLink}>
              Home
            </Link>
            <span className={styles.breadcrumbSep}>/</span>
            <Link href="/pricing" className={styles.breadcrumbLink}>
              Pricing
            </Link>
            <span className={styles.breadcrumbSep}>/</span>
            <span className={styles.breadcrumbCurrent}>Order Summary</span>
          </nav>

          <div className={styles.stepsBar} aria-label="Progress">
            <div className={styles.stepItem}>
              <span className={`${styles.stepDot} ${styles.stepDotDone}`}>✓</span>
              <span>1. Choose Package</span>
            </div>
            <span className={styles.stepDivider} />
            <div className={`${styles.stepItem} ${styles.stepItemActive}`}>
              <span className={`${styles.stepDot} ${styles.stepDotActive}`}>2</span>
              <span>Project Details &amp; Upload</span>
            </div>
            <span className={styles.stepDivider} />
            <div className={styles.stepItem}>
              <span className={styles.stepDot}>3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* Page Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageHeaderBadge}>
            <Sparkles size={14} />
            <span>Order Specification</span>
          </div>
          <h1 className={styles.pageTitle}>Review &amp; Place Your Order</h1>
          <p className={styles.pageSubtitle}>
            Configure project specifications, upload your images or cloud links, and confirm instructions for our professional editing team.
          </p>
        </div>

        <div className={styles.grid}>
          {/* ═════════ LEFT COLUMN: FORM SECTIONS ═════════ */}
          <div className={styles.leftCol}>
            {/* 1. Selected Package Overview & Switcher */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <div className={styles.sectionCardTitleWrap}>
                  <div className={styles.sectionCardIconWrap}>
                    <Package size={20} />
                  </div>
                  <h2 className={styles.sectionCardTitle}>Selected Package &amp; Service</h2>
                </div>
                {availableServices.length > 0 && (
                  <div className={styles.changePlanDropdownWrap} ref={dropdownRef}>
                    <button
                      type="button"
                      className={styles.changePlanBtn}
                      onClick={() => setIsConfigDrawerOpen(!isConfigDrawerOpen)}
                      aria-expanded={isConfigDrawerOpen}
                    >
                      {isConfigDrawerOpen ? (
                        <>
                          Close Menu <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          Change Service / Tier <ChevronDown size={14} />
                        </>
                      )}
                    </button>

                    {isConfigDrawerOpen && (
                      <div className={styles.configDropdownMenu}>
                        <div>
                          <span className={styles.configSectionLabel}>1. Select Service Category</span>
                          <div className={styles.serviceTabsList}>
                            {availableServices.map((svc) => (
                              <button
                                key={svc.id}
                                type="button"
                                className={`${styles.serviceTabBtn} ${
                                  activeServiceId === svc.id ? styles.serviceTabBtnActive : ''
                                }`}
                                onClick={() => handleServiceSelect(svc.id)}
                              >
                                {svc.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {currentSvc && currentSvc.cards && currentSvc.cards.length > 0 && (
                          <div>
                            <span className={styles.configSectionLabel}>2. Select Complexity Plan</span>
                            <div className={styles.cardPickGrid}>
                              {currentSvc.cards.map((c) => {
                                const priceObj = c.prices?.find((p) => p.unit_range === activeUnitRangeId);
                                const priceStr = priceObj ? `$${priceObj.price}` : c.prices?.[0]?.price ? `$${c.prices[0].price}` : '';
                                const isSelected = activeCardId === c.id;

                                return (
                                  <div
                                    key={c.id}
                                    className={`${styles.cardPickItem} ${
                                      isSelected ? styles.cardPickItemActive : ''
                                    }`}
                                    onClick={() => handleCardSelect(c.id)}
                                  >
                                    <div className={styles.cardPickName}>{c.name}</div>
                                    {priceStr && <div className={styles.cardPickPrice}>{priceStr}</div>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {currentSvc && currentSvc.unit_ranges && currentSvc.unit_ranges.length > 0 && (
                          <div>
                            <span className={styles.configSectionLabel}>3. Select Volume Tier</span>
                            <div className={styles.volumeTierWrap}>
                              {currentSvc.unit_ranges.map((u) => {
                                const isSelected = activeUnitRangeId === u.id;
                                return (
                                  <button
                                    key={u.id}
                                    type="button"
                                    className={`${styles.volumeTierPill} ${
                                      isSelected ? styles.volumeTierPillActive : ''
                                    }`}
                                    onClick={() => handleUnitRangeSelect(u.id)}
                                  >
                                    {u.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.6rem', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            className={styles.changePlanBtn}
                            style={{ background: '#0f172a', color: '#ffffff', borderColor: '#0f172a' }}
                            onClick={() => setIsConfigDrawerOpen(false)}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Package Card */}
              <div className={styles.pkgOverview}>
                <div className={styles.pkgImgWrap}>
                  {imgSrc ? (
                    <img src={imgSrc} alt={activePackage.title} className={styles.pkgImg} />
                  ) : (
                    <div className={styles.pkgImgPlaceholder}>
                      <Layers size={36} />
                    </div>
                  )}
                </div>

                <div className={styles.pkgDetails}>
                  <div className={styles.pkgHeaderRow}>
                    <div>
                      <h3 className={styles.pkgTitle}>{activePackage.title}</h3>
                    </div>
                    <div className={styles.pkgPriceCol}>
                      <span className={styles.pkgPrice}>{activePackage.price}</span>
                      {activePackage.oldPrice && (
                        <span className={styles.pkgOldPrice}>{activePackage.oldPrice}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.pkgBadges}>
                    {activePackage.unitRange && (
                      <span className={`${styles.pkgBadge} ${styles.pkgBadgeTier}`}>
                        Volume: {activePackage.unitRange}
                      </span>
                    )}
                    <span className={`${styles.pkgBadge} ${styles.pkgBadgeTurnaround}`}>
                      <Clock size={12} /> 24-48h Standard
                    </span>
                    <span className={styles.pkgBadge}>
                      <Shield size={12} /> Unlimited Revisions
                    </span>
                  </div>

                  {activePackage.description && (
                    <p className={styles.pkgDesc}>{activePackage.description}</p>
                  )}

                  <div className={styles.pkgFeaturesList}>
                    {featuresList.map((feat, idx) => (
                      <span key={idx} className={styles.pkgFeatureItem}>
                        <Check size={14} className={styles.pkgFeatureCheck} />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Client & Contact Information */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <div className={styles.sectionCardTitleWrap}>
                  <div className={styles.sectionCardIconWrap}>
                    <User size={20} />
                  </div>
                  <h2 className={styles.sectionCardTitle}>Client &amp; Contact Details</h2>
                </div>
              </div>
              <p className={styles.sectionCardHint}>
                We will send project proofs, delivery download links, and invoice confirmations to these details.
              </p>

              <div className={styles.clientGrid}>
                {/* Full Name */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="client-fullname">
                    Full Name <span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <User size={16} className={styles.inputIcon} />
                    <input
                      id="client-fullname"
                      type="text"
                      className={styles.inputField}
                      value={clientInfo.fullName}
                      onChange={(e) => updateClientInfo('fullName', e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      required
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="client-company">
                    Company / Studio <span className={styles.fieldOptional}>(Optional)</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <Building2 size={16} className={styles.inputIcon} />
                    <input
                      id="client-company"
                      type="text"
                      className={styles.inputField}
                      value={clientInfo.company}
                      onChange={(e) => updateClientInfo('company', e.target.value)}
                      placeholder="e.g. Acme Studio LLC"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="client-email">
                    Email Address <span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <Mail size={16} className={styles.inputIcon} />
                    <input
                      id="client-email"
                      type="email"
                      className={styles.inputField}
                      value={clientInfo.email}
                      onChange={(e) => updateClientInfo('email', e.target.value)}
                      placeholder="alex@example.com"
                      required
                    />
                  </div>
                </div>

                {/* WhatsApp / Phone */}
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor="client-whatsapp">
                    Phone / WhatsApp <span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <Phone size={16} className={styles.inputIcon} />
                    <input
                      id="client-whatsapp"
                      type="tel"
                      className={styles.inputField}
                      value={clientInfo.whatsapp}
                      onChange={(e) => updateClientInfo('whatsapp', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      required
                    />
                  </div>
                </div>

                {/* Country */}
                <div className={`${styles.fieldGroup} ${styles.fieldGroupFull}`}>
                  <label className={styles.fieldLabel} htmlFor="client-country">
                    Country <span className={styles.fieldRequired}>*</span>
                  </label>
                  <div className={styles.inputWrap}>
                    <Globe size={16} className={styles.inputIcon} />
                    <select
                      id="client-country"
                      className={styles.selectField}
                      value={clientInfo.country}
                      onChange={(e) => updateClientInfo('country', e.target.value)}
                      required
                    >
                      <option value="">Select your country</option>
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Turnaround Speed & Output Format Preferences */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <div className={styles.sectionCardTitleWrap}>
                  <div className={styles.sectionCardIconWrap}>
                    <Zap size={20} />
                  </div>
                  <h2 className={styles.sectionCardTitle}>Turnaround &amp; Output Formats</h2>
                </div>
              </div>
              <p className={styles.sectionCardHint}>
                Choose your required delivery schedule and final file formats:
              </p>

              {/* Turnaround Options */}
              <span className={styles.configSectionLabel}>Delivery Turnaround</span>
              <div className={styles.deliveryGrid}>
                {TURNAROUND_OPTIONS.map((opt) => {
                  const isSelected = selectedTurnaround === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`${styles.deliveryCard} ${isSelected ? styles.deliveryCardActive : ''}`}
                    >
                      <input
                        type="radio"
                        name="turnaround"
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => setSelectedTurnaround(opt.id)}
                        className={styles.deliveryCardRadio}
                      />
                      <div>
                        <span className={styles.deliveryCardTitle}>{opt.title}</span>
                        <span className={styles.deliveryCardDesc}>
                          {opt.time} &bull; {opt.note}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Desired Output Formats */}
              <span className={styles.configSectionLabel}>Desired File Formats</span>
              <div className={styles.formatGrid}>
                {OUTPUT_FORMAT_OPTIONS.map((fmt) => {
                  const isChecked = selectedFormats.includes(fmt.id);
                  return (
                    <label
                      key={fmt.id}
                      className={`${styles.formatCard} ${isChecked ? styles.formatCardActive : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOutputFormat(fmt.id)}
                      />
                      <span>{fmt.label}</span>
                    </label>
                  );
                })}
              </div>
            </section>

            {/* 4. Project Requirements & Instructions */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <div className={styles.sectionCardTitleWrap}>
                  <div className={styles.sectionCardIconWrap}>
                    <FileText size={20} />
                  </div>
                  <h2 className={styles.sectionCardTitle}>Project Requirements &amp; Instructions</h2>
                </div>
              </div>
              <p className={styles.sectionCardHint}>
                Specify output dimensions, background color codes, shadow requirements, or click quick tags below:
              </p>

              {/* Quick Tags */}
              <div className={styles.chipsWrap}>
                <span className={styles.chipsLabel}>Quick tags:</span>
                {SUGGESTED_REQUIREMENTS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className={styles.chipBtn}
                    onClick={() => handleAddRequirementChip(chip)}
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea
                className={styles.reqTextarea}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Describe your editing instructions in detail... (e.g., Deliver images in transparent PNG at original dimensions, retain natural shadows, align all products centered with 10% white margin)."
                rows={5}
              />
            </section>

            {/* 5. Asset Upload Card */}
            <section className={styles.sectionCard}>
              <div className={styles.sectionCardHeader}>
                <div className={styles.sectionCardTitleWrap}>
                  <div className={styles.sectionCardIconWrap}>
                    <Upload size={20} />
                  </div>
                  <h2 className={styles.sectionCardTitle}>Project Assets &amp; Files</h2>
                </div>
              </div>
              <p className={styles.sectionCardHint}>
                Provide your sample images or full batch. You can upload directly, submit a compressed archive, or paste a Google Drive / Dropbox link.
              </p>

              {/* Upload Tabs */}
              <div className={styles.fileTabs}>
                <button
                  type="button"
                  className={`${styles.fileTab} ${activeFileTab === 'upload' ? styles.fileTabActive : ''}`}
                  onClick={() => setActiveFileTab('upload')}
                >
                  <Upload size={16} /> Direct Upload
                </button>
                <button
                  type="button"
                  className={`${styles.fileTab} ${activeFileTab === 'drive' ? styles.fileTabActive : ''}`}
                  onClick={() => setActiveFileTab('drive')}
                >
                  <LinkIcon size={16} /> Cloud Drive Link
                </button>
                <button
                  type="button"
                  className={`${styles.fileTab} ${activeFileTab === 'zip' ? styles.fileTabActive : ''}`}
                  onClick={() => setActiveFileTab('zip')}
                >
                  <HardDrive size={16} /> ZIP / RAR Archive
                </button>
              </div>

              {/* Tab 1: Direct File Upload */}
              {activeFileTab === 'upload' && (
                <div>
                  <div
                    ref={dropRef}
                    className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept={ALLOWED_EXTS.join(',')}
                      className={styles.fileInputHidden}
                      onChange={(e) => {
                        if (e.target.files) validateAndAddFiles(e.target.files);
                        e.target.value = '';
                      }}
                    />
                    <div className={styles.dropIconWrap}>
                      <Upload size={26} />
                    </div>
                    <p className={styles.dropText}>
                      <strong>Click to upload files</strong> or drag and drop here
                    </p>
                    <p className={styles.dropHint}>
                      Supports JPG, PNG, PSD, TIFF, RAW &mdash; Up to 500 MB per file
                    </p>
                  </div>

                  {files.length > 0 && (
                    <div className={styles.fileList}>
                      <div className={styles.fileListHeader}>
                        <span>
                          <strong>{files.length}</strong> file{files.length > 1 ? 's' : ''} attached
                        </span>
                        <span>Total: {formatFileSize(totalFileSize)}</span>
                      </div>
                      {files.map((f) => (
                        <div key={f.id} className={styles.fileItem}>
                          <div className={styles.fileItemIcon}>
                            {f.preview ? (
                              <img src={f.preview} alt="" className={styles.filePreviewImg} />
                            ) : (
                              <FileIcon size={18} />
                            )}
                          </div>
                          <div className={styles.fileItemInfo}>
                            <span className={styles.fileItemName}>{f.file.name}</span>
                            <span className={styles.fileItemSize}>{formatFileSize(f.file.size)}</span>
                          </div>
                          <button
                            type="button"
                            className={styles.fileItemRemove}
                            onClick={() => removeFile(f.id)}
                            aria-label={`Remove ${f.file.name}`}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Cloud Storage Link */}
              {activeFileTab === 'drive' && (
                <div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="cloud-link">
                      Google Drive / Dropbox / WeTransfer URL
                    </label>
                    <div className={styles.inputWrap}>
                      <LinkIcon size={16} className={styles.inputIcon} />
                      <input
                        id="cloud-link"
                        type="url"
                        className={styles.inputField}
                        value={driveLink}
                        onChange={(e) => setDriveLink(e.target.value)}
                        placeholder="https://drive.google.com/drive/folders/... or https://we.tl/..."
                      />
                    </div>
                  </div>
                  <p className={styles.dropHint} style={{ marginTop: '0.65rem' }}>
                    💡 Tip: Please ensure permissions are set to &quot;Anyone with the link can view/download&quot;.
                  </p>
                </div>
              )}

              {/* Tab 3: ZIP Archive */}
              {activeFileTab === 'zip' && (
                <div>
                  {!zipFile ? (
                    <div
                      className={styles.dropZone}
                      onClick={() => zipInputRef.current?.click()}
                    >
                      <input
                        ref={zipInputRef}
                        type="file"
                        accept=".zip,.rar"
                        className={styles.fileInputHidden}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) setZipFile(f);
                          e.target.value = '';
                        }}
                      />
                      <div className={styles.dropIconWrap}>
                        <HardDrive size={26} />
                      </div>
                      <p className={styles.dropText}>
                        <strong>Select a compressed ZIP or RAR archive</strong>
                      </p>
                      <p className={styles.dropHint}>
                        Bundle all project images into one convenient archive file (Max 500 MB)
                      </p>
                    </div>
                  ) : (
                    <div className={styles.fileItem}>
                      <div className={styles.fileItemIcon}>
                        <HardDrive size={20} />
                      </div>
                      <div className={styles.fileItemInfo}>
                        <span className={styles.fileItemName}>{zipFile.name}</span>
                        <span className={styles.fileItemSize}>{formatFileSize(zipFile.size)}</span>
                      </div>
                      <button
                        type="button"
                        className={styles.fileItemRemove}
                        onClick={() => setZipFile(null)}
                        aria-label="Remove archive"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ═════════ RIGHT COLUMN: STICKY ORDER SUMMARY ═════════ */}
          <aside className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                <span className={styles.pkgBadge}>Instant Review</span>
              </div>

              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Package</span>
                  <span className={styles.summaryValue}>{activePackage.title}</span>
                </div>
                {activePackage.unitRange && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>Volume Tier</span>
                    <span className={styles.summaryValue}>{activePackage.unitRange}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Turnaround</span>
                  <span className={styles.summaryValue}>
                    {TURNAROUND_OPTIONS.find((t) => t.id === selectedTurnaround)?.time || '24 – 48 Hours'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Output Format</span>
                  <span className={styles.summaryValue}>
                    {selectedFormats.length > 0 ? selectedFormats.join(', ') : 'Standard JPG'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Revisions</span>
                  <span className={styles.summaryValue} style={{ color: '#16a34a' }}>
                    Unlimited Free
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>Commercial Rights</span>
                  <span className={styles.summaryValue}>100% Included</span>
                </div>
              </div>

              <div className={styles.summaryDivider} />

              <div className={styles.summaryTotalRow}>
                <span className={styles.summaryTotalLabel}>Total Rate:</span>
                <div className={styles.summaryTotalCol}>
                  <span className={styles.summaryTotalAmount}>{activePackage.price}</span>
                  {activePackage.oldPrice && (
                    <div className={styles.summaryOldPrice}>{activePackage.oldPrice}</div>
                  )}
                </div>
              </div>

              <div style={{ margin: '0.75rem 0' }}>
                <BotProtection onChange={setBotPayload} />
              </div>

              <button
                type="button"
                className={styles.submitBtn}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="spin" /> Submitting Order...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Confirm &amp; Submit Order
                  </>
                )}
              </button>

              {!hasClientInfo && (
                <p className={styles.submitHelpText}>
                  Please fill in your name, email, phone, and country to proceed.
                </p>
              )}
              {hasClientInfo && !hasFiles && (
                <p className={styles.submitHelpText}>
                  Please upload images or attach a cloud link to continue.
                </p>
              )}

              {/* Guarantees Box */}
              <div className={styles.trustList}>
                <div className={styles.trustItem}>
                  <Shield size={16} className={styles.trustIcon} />
                  <div>
                    <strong>100% Satisfaction Guarantee</strong>
                    <div>Free revisions until you are completely satisfied with the images.</div>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <Lock size={16} className={styles.trustIcon} />
                  <div>
                    <strong>Confidential &amp; NDA Protected</strong>
                    <div>Your commercial assets are never shared, published, or repurposed.</div>
                  </div>
                </div>
                <div className={styles.trustItem}>
                  <Headphones size={16} className={styles.trustIcon} />
                  <div>
                    <strong>24/7 Dedicated Support</strong>
                    <div>Direct communication with senior retouchers and production managers.</div>
                  </div>
                </div>
              </div>

              <div className={styles.supportNote}>
                <HelpCircle size={15} />
                <span>
                  Need custom volume enterprise pricing?{' '}
                  <Link href="/contact" className={styles.supportLink}>
                    Contact our team
                  </Link>
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
