import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from '@/styles/modules/legal.module.css';
import {
  Shield, Lock, Eye, Cookie, UserCheck, Mail, HelpCircle, FileText, LucideIcon,
} from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import { fetchPrivacyPolicy, fetchSiteSettings } from '@/services/public-api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'PicPicxels Privacy Policy. Learn how we collect, use, and protect your personal data. GDPR and CCPA compliant.',
  openGraph: {
    title: 'Privacy Policy | PicPicxels',
    description: 'Your privacy matters. Learn how PicPicxels protects your personal information.',
    type: 'website',
  },
};

const ICON_MAP: Record<string, LucideIcon> = {
  eye: Eye,
  lock: Lock,
  shield: Shield,
  usercheck: UserCheck,
  cookie: Cookie,
  mail: Mail,
  helpcircle: HelpCircle,
  filetext: FileText,
};

const defaultStats = [
  { value: 'AES-256', label: 'Encryption Standard' },
  { value: 'SOC 2', label: 'Type II Compliant' },
  { value: 'GDPR', label: 'Fully Compliant' },
  { value: '0', label: 'Data Sold — Ever' },
];

const defaultSections = [
  {
    title: 'Information We Collect',
    icon_name: 'Eye',
    content: `<p>We collect information you provide directly when you sign up for an account, use our services, or communicate with us. This includes:</p>
<ul>
  <li><strong>Account Information:</strong> Your name, email address, company name, and billing details</li>
  <li><strong>Uploaded Content:</strong> Images, files, and associated metadata you submit for editing</li>
  <li><strong>Communication Data:</strong> Messages, support tickets, and feedback you send to us</li>
</ul>
<p>We also automatically collect certain technical information when you use our platform, including your IP address, browser type, device information, and usage patterns. This data helps us improve our services, maintain security, and personalize your experience.</p>`,
  },
  {
    title: 'How We Use Your Data',
    icon_name: 'Lock',
    content: `<p>The data we collect is used exclusively to provide, maintain, and improve our services. Specifically, we use your information to:</p>
<ul>
  <li>Process and deliver your photo editing orders</li>
  <li>Communicate order updates, payment confirmations, and service announcements</li>
  <li>Provide customer support and respond to your inquiries</li>
  <li>Analyze usage patterns to improve platform performance and user experience</li>
  <li>Detect and prevent fraud, abuse, and security incidents</li>
  <li>Comply with legal obligations and enforce our terms of service</li>
</ul>
<div class="highlight-box">
  <p><strong>Your Privacy is Our Priority:</strong> We never use your uploaded images for training AI models, marketing materials, or any purpose beyond providing the specific editing services you request. We do not sell your personal data.</p>
</div>`,
  },
  {
    title: 'Data Sharing & Third Parties',
    icon_name: 'Shield',
    content: `<p>We do not sell, trade, or rent your personal information to third parties. We may share your data with carefully vetted service providers who assist us in operating our platform, such as cloud storage providers, payment processors, and customer support tools. All third-party providers are bound by strict confidentiality agreements, data processing contracts, and are required to maintain industry-standard security practices. We may also disclose information where required by law, to protect our rights, or in connection with a business transfer (merger, acquisition, or sale of assets).</p>`,
  },
  {
    title: 'Your Rights & Choices',
    icon_name: 'UserCheck',
    content: `<p>You have full control over your personal data. Under applicable privacy laws (including GDPR and CCPA), you have the following rights:</p>
<ul>
  <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
  <li><strong>Right to Rectification:</strong> Correct any inaccurate or incomplete data</li>
  <li><strong>Right to Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements</li>
  <li><strong>Right to Portability:</strong> Receive your data in a structured, machine-readable format</li>
  <li><strong>Right to Object:</strong> Object to processing of your data for specific purposes</li>
  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
</ul>
<p>To exercise any of these rights, contact us at <strong>info@picpicxels.com</strong>. We will respond to your request within 30 days, as required by applicable regulations.</p>`,
  },
  {
    title: 'Security Measures',
    icon_name: 'Lock',
    content: `<p>We implement industry-leading security measures to protect your data from unauthorized access, alteration, disclosure, or destruction:</p>
<ul>
  <li><strong>Encryption at Rest:</strong> All stored data is encrypted using AES-256 standard</li>
  <li><strong>Encryption in Transit:</strong> All data transmitted to and from our platform uses TLS 1.3</li>
  <li><strong>Access Controls:</strong> Strict role-based access controls with multi-factor authentication</li>
  <li><strong>Regular Audits:</strong> Weekly vulnerability scans and quarterly penetration testing</li>
  <li><strong>SOC 2 Compliance:</strong> We maintain SOC 2 Type II certification for our security controls</li>
</ul>
<div class="highlight-box">
  <p><strong>Important:</strong> While we implement robust security measures, no system can guarantee absolute security. We recommend that you also take steps to protect your account, such as using strong, unique passwords and enabling two-factor authentication.</p>
</div>`,
  },
  {
    title: 'Cookies & Tracking Technologies',
    icon_name: 'Cookie',
    content: `<p>PicPicxels uses cookies and similar tracking technologies to enhance your browsing experience, analyze platform usage, and support our marketing efforts. We use the following categories of cookies:</p>
<ul>
  <li><strong>Essential Cookies:</strong> Required for platform functionality — authentication, session management, and security</li>
  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform (e.g., page views, feature usage)</li>
  <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a personalized experience</li>
</ul>
<p>You can manage your cookie preferences at any time through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform. For more detailed information about our cookie practices, please contact our support team.</p>`,
  },
  {
    title: 'Contact Information',
    icon_name: 'Mail',
    content: `<p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at <strong>info@picpicxels.com</strong>.</p>`,
  },
];

export default async function PrivacyPage() {
  const [privacyData, siteSettings] = await Promise.all([
    fetchPrivacyPolicy(),
    fetchSiteSettings(),
  ]);

  const heroTitle = privacyData?.hero_title || 'Privacy Policy';
  const heroSub = privacyData?.hero_subtitle || 'Your privacy matters to us. This policy explains how PicPicxels collects, uses, and protects your personal information when you use our platform and services.';
  const lastUpdated = privacyData?.last_updated || 'August 2026';
  const introText = privacyData?.intro_text || 'This Privacy Policy describes how PicPicxels Inc. collects, uses, and shares your personal information. By using our platform, you consent to the practices described in this policy.';
  const stats = (privacyData?.stats && privacyData.stats.length > 0) ? privacyData.stats : defaultStats;
  const sections = (privacyData?.sections && privacyData.sections.length > 0) ? privacyData.sections : defaultSections;
  const dpoName = privacyData?.dpo_name || 'PicPicxels Privacy Team';
  const dpoEmail = privacyData?.dpo_email || 'info@picpicxels.com';
  const dpoResponseTime = privacyData?.dpo_response_time || 'We respond to all privacy inquiries within 30 days';

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <Reveal variant="fadeDown">
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>{heroTitle}</h1>
            <p className={styles.heroSub}>{heroSub}</p>
            <p className={styles.heroMeta}>Last updated: {lastUpdated}</p>
          </section>
        </Reveal>

        {/* Stats */}
        {stats.length > 0 && (
          <Reveal variant="fadeUp">
            <section className={styles.contentSection}>
              <div className={styles.statsRow}>
                {stats.map((s) => (
                  <div key={s.label} className={styles.statCard}>
                    <div className={styles.statValue}>{s.value}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>
        )}

        {/* Policy Sections */}
        <Reveal variant="fadeIn" delay={100}>
          <section className={styles.contentSection}>
            <div className={styles.contentCard}>
              {introText && (
                <p className={styles.bodyText} style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: '1rem' }}>
                  {introText}
                </p>
              )}

              {sections.map((sec, idx) => {
                const iconKey = (sec.icon_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const Icon = ICON_MAP[iconKey] || Shield;
                return (
                  <div key={sec.title || idx}>
                    <div className={styles.iconSection}>
                      <div className={styles.iconSectionIcon}>
                        <Icon size={20} />
                      </div>
                      <div className={`${styles.iconSectionBody} ${styles.richContent}`}>
                        <h2 className={styles.iconSectionTitle}>{sec.title}</h2>
                        <div dangerouslySetInnerHTML={{ __html: sec.content }} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Contact Details Box */}
              {(dpoName || dpoEmail) && (
                <div className={styles.highlight} style={{ marginTop: '2rem' }}>
                  <p>
                    {dpoName && <><strong>Data Protection Officer:</strong> {dpoName}<br /></>}
                    {dpoEmail && <><strong>Email:</strong> {dpoEmail}<br /></>}
                    {dpoResponseTime && <><strong>Response Time:</strong> {dpoResponseTime}</>}
                  </p>
                </div>
              )}
            </div>
          </section>
        </Reveal>
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
