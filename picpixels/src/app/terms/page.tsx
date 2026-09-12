import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import styles from '@/styles/modules/legal.module.css';
import SectionHeading from '@/components/ui/SectionHeading';
import Reveal from '@/components/animations/Reveal';
import { fetchTermsConditions, fetchSiteSettings } from '@/services/public-api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'PicPicxels Terms and Conditions. Read about service usage, payments, intellectual property, data protection, and your legal rights.',
  openGraph: {
    title: 'Terms & Conditions | PicPicxels',
    description: 'Read the PicPicxels Terms and Conditions governing your use of our platform and services.',
    type: 'website',
  },
};

const defaultHighlights = [
  { num: '01', title: 'Fair Usage', desc: 'Transparent, fair usage policies that protect both our platform and our clients.' },
  { num: '02', title: 'Data Ownership', desc: 'You retain full ownership of all images and assets you upload to our platform.' },
  { num: '03', title: 'SLA Guarantee', desc: '99.9% uptime SLA with guaranteed turnaround times on all service tiers.' },
  { num: '04', title: 'Easy Cancellation', desc: 'Cancel or modify your plan anytime — no lock-in contracts, no hidden fees.' },
];

const defaultClauses = [
  {
    title: 'Acceptance of Terms',
    anchor_id: 'acceptance',
    content: `<p>By accessing or using PicPicxels services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of our platform immediately.</p>
<p>These terms constitute a legally binding agreement between you (&quot;User&quot; or &quot;Client&quot;) and PicPicxels Inc. (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By creating an account, submitting an order, or otherwise using our services, you accept these terms in full.</p>`,
  },
  {
    title: 'Use of Service',
    anchor_id: 'use-of-service',
    content: `<p>You agree to use PicPicxels platform and services only for lawful purposes and in accordance with these Terms. The following activities are strictly prohibited:</p>
<ul>
  <li>Uploading, editing, or distributing illegal, obscene, or infringing content</li>
  <li>Attempting to reverse engineer, decompile, or extract source code from our platform</li>
  <li>Scraping, crawling, or harvesting data from our platform without written permission</li>
  <li>Interfering with the security, integrity, or performance of our systems</li>
  <li>Using automated tools to create accounts or submit orders</li>
</ul>
<div class="highlight-box">
  <p><strong>Important:</strong> Violation of these usage terms may result in immediate account suspension, termination, and legal action. We reserve the right to remove any content that violates these provisions without prior notice.</p>
</div>`,
  },
  {
    title: 'Intellectual Property Rights',
    anchor_id: 'intellectual-property',
    content: `<p>All content, designs, trademarks, software, and proprietary technology displayed on this site are the exclusive property of PicPicxels Inc. You may not reproduce, distribute, modify, or create derivative works without our prior written consent.</p>
<p><strong>Client Content:</strong> You retain full ownership and intellectual property rights to all images, files, and content you upload to our platform. PicPicxels does not claim any ownership over your uploaded content. By uploading content, you grant us a limited license to process, edit, and store that content solely for the purpose of providing our services.</p>
<p><strong>Edited Output:</strong> Upon delivery, you own all rights to the edited images produced by our services. We will not use your edited images for marketing or promotional purposes without your explicit consent.</p>`,
  },
  {
    title: 'Payments, Billing & Subscriptions',
    anchor_id: 'payments-billing',
    content: `<p>All subscription fees, one-time charges, and service fees are billed according to your selected plan or order type. Payment terms are as follows:</p>
<ul>
  <li>Payments are due at the time of order placement or at the start of each billing cycle</li>
  <li>All fees are quoted in USD and do not include applicable taxes unless stated otherwise</li>
  <li>Subscription plans auto-renew unless canceled at least 24 hours before the renewal date</li>
  <li>Refunds are issued on a case-by-case basis as outlined in our Refund Policy</li>
</ul>
<div class="highlight-box">
  <p><strong>Note:</strong> You are responsible for maintaining accurate and current billing information. Failure to process payment may result in service interruption or account suspension.</p>
</div>`,
  },
  {
    title: 'Limitation of Liability',
    anchor_id: 'limitation-of-liability',
    content: `<p>To the fullest extent permitted by applicable law, PicPicxels Inc., its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to:</p>
<ul>
  <li>Your use or inability to use our services</li>
  <li>Any unauthorized access to or alteration of your data</li>
  <li>Any content obtained through our services</li>
  <li>Any bugs, viruses, or harmful components transmitted through our platform</li>
</ul>
<p>Our total liability to you for any claim arising from these terms or your use of our services shall not exceed the total amount paid by you to PicPicxels in the twelve (12) months preceding the event giving rise to the claim.</p>`,
  },
  {
    title: 'Data Protection & Privacy',
    anchor_id: 'data-protection',
    content: `<p>We take your privacy seriously. Our collection, use, and protection of your personal data is governed by our Privacy Policy, which is incorporated into these Terms by reference. Key commitments include:</p>
<ul>
  <li>We do not sell your personal data to third parties</li>
  <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
  <li>You can request access, correction, or deletion of your data at any time</li>
  <li>We comply with GDPR, CCPA, and applicable data protection regulations</li>
</ul>`,
  },
  {
    title: 'Service Level Agreement',
    anchor_id: 'sla',
    content: `<p>PicPicxels is committed to providing reliable, high-quality service. Our standard SLA commitments include:</p>
<ul>
  <li>99.9% platform uptime, measured monthly</li>
  <li>Guaranteed turnaround times based on your selected service tier</li>
  <li>Quality assurance review on all edited deliverables</li>
  <li>Free revisions within 48 hours of delivery for quality issues</li>
</ul>
<div class="highlight-box">
  <p><strong>SLA Credits:</strong> If we fail to meet our guaranteed turnaround time, you may be eligible for service credits as outlined in your service agreement.</p>
</div>`,
  },
  {
    title: 'Termination',
    anchor_id: 'termination',
    content: `<p>Either party may terminate this agreement at any time. You may cancel your account or subscription through your dashboard settings or by contacting our support team. We reserve the right to suspend or terminate access to our services immediately, without prior notice, for violations of these terms. Upon termination, your right to use our services ceases immediately, and we may retain your data as required by law or our data retention policy.</p>`,
  },
  {
    title: 'Governing Law',
    anchor_id: 'governing-law',
    content: `<p>These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
<p>If any provision of these terms is found to be unenforceable or invalid, the remaining provisions shall remain in full force and effect.</p>`,
  },
  {
    title: 'Changes to Terms',
    anchor_id: 'changes',
    content: `<p>We reserve the right to update or modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to our website, with a revised &quot;Last Updated&quot; date. We encourage you to review these terms periodically. Your continued use of our services after any changes constitutes acceptance of the updated terms. For material changes, we will notify you via email or through our platform.</p>`,
  },
];

export default async function TermsPage() {
  const [termsData, siteSettings] = await Promise.all([
    fetchTermsConditions(),
    fetchSiteSettings(),
  ]);

  const heroTitle = termsData?.hero_title || 'Terms & Conditions';
  const heroSub = termsData?.hero_subtitle || 'Please read these terms carefully before using our platform. They govern your relationship with PicPicxels and outline both your rights and responsibilities.';
  const lastUpdated = termsData?.last_updated || 'August 2026';

  const highlights = (termsData?.highlights && termsData.highlights.length > 0)
    ? termsData.highlights.map((h) => ({
        num: h.number,
        title: h.title,
        desc: h.description,
      }))
    : defaultHighlights;

  const clauses = (termsData?.clauses && termsData.clauses.length > 0)
    ? termsData.clauses
    : defaultClauses;

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

        {/* Key Highlights */}
        {highlights.length > 0 && (
          <Reveal variant="fadeUp">
            <section className={styles.contentSection}>
              <div className={styles.contentCard}>
                <SectionHeading text="Key Highlights" center={false} />
                <div className={styles.highlightsGrid}>
                  {highlights.map((h) => (
                    <div key={h.num} className={styles.highlightCard}>
                      <div className={styles.highlightNum}>{h.num}</div>
                      <div className={styles.highlightCardTitle}>{h.title}</div>
                      <div className={styles.highlightCardDesc}>{h.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </Reveal>
        )}

        {/* Detailed Terms */}
        <section className={styles.contentSection}>
          <div className={styles.contentCard}>
            {clauses.map((clause, idx) => (
              <Reveal key={clause.anchor_id || clause.title || idx} variant="fadeUp" delay={idx * 60}>
                <div>
                  <h2 id={clause.anchor_id || `clause-${idx}`} className={`${styles.sectionTitle} ${idx === 0 ? styles.sectionTitleFirst : ''}`}>
                    <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>{idx + 1}.</span>
                    {clause.title}
                  </h2>
                  <div
                    className={styles.richContent}
                    dangerouslySetInnerHTML={{ __html: clause.content }}
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer siteSettings={siteSettings} />
    </>
  );
}
