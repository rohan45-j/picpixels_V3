import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cms.models import (
    PrivacyPolicyPage, PrivacyPolicyStat, PrivacyPolicySection,
    TermsConditionPage, TermsHighlight, TermsClause
)

def seed_privacy():
    page, created = PrivacyPolicyPage.objects.get_or_create(
        id=1,
        defaults={
            'hero_title': 'Privacy Policy',
            'hero_subtitle': 'Your privacy matters to us. This policy explains how PicPicxels collects, uses, and protects your personal information when you use our platform and services.',
            'last_updated': 'August 2026',
            'intro_text': 'This Privacy Policy describes how PicPicxels Inc. collects, uses, and shares your personal information. By using our platform, you consent to the practices described in this policy.',
            'dpo_name': 'PicPicxels Privacy Team',
            'dpo_email': 'info@picpicxels.com',
            'dpo_response_time': 'We respond to all privacy inquiries within 30 days',
            'is_active': True,
        }
    )
    print(f"Privacy Policy Page: created={created}")

    stats = [
        {'value': 'AES-256', 'label': 'Encryption Standard', 'display_order': 1},
        {'value': 'SOC 2', 'label': 'Type II Compliant', 'display_order': 2},
        {'value': 'GDPR', 'label': 'Fully Compliant', 'display_order': 3},
        {'value': '0', 'label': 'Data Sold — Ever', 'display_order': 4},
    ]
    for s in stats:
        obj, c = PrivacyPolicyStat.objects.get_or_create(
            page=page,
            label=s['label'],
            defaults=s
        )
        print(f"Privacy Stat: {obj.value} {obj.label} (created={c})")

    sections = [
        {
            'title': 'Information We Collect',
            'icon_name': 'Eye',
            'display_order': 1,
            'content': """<p>We collect information you provide directly when you sign up for an account, use our services, or communicate with us. This includes:</p>
<ul>
  <li><strong>Account Information:</strong> Your name, email address, company name, and billing details</li>
  <li><strong>Uploaded Content:</strong> Images, files, and associated metadata you submit for editing</li>
  <li><strong>Communication Data:</strong> Messages, support tickets, and feedback you send to us</li>
</ul>
<p>We also automatically collect certain technical information when you use our platform, including your IP address, browser type, device information, and usage patterns. This data helps us improve our services, maintain security, and personalize your experience.</p>"""
        },
        {
            'title': 'How We Use Your Data',
            'icon_name': 'Lock',
            'display_order': 2,
            'content': """<p>The data we collect is used exclusively to provide, maintain, and improve our services. Specifically, we use your information to:</p>
<ul>
  <li>Process and deliver your photo editing orders</li>
  <li>Communicate order updates, payment confirmations, and service announcements</li>
  <li>Provide customer support and respond to your inquiries</li>
  <li>Analyze usage patterns to improve platform performance and user experience</li>
  <li>Detect and prevent fraud, abuse, and security incidents</li>
  <li>Comply with legal obligations and enforce our terms of service</li>
</ul>
<div class="highlight-box" style="background: rgba(255,138,80,0.05); border-left: 4px solid #FF8A50; padding: 1.25rem 1.5rem; border-radius: 0 10px 10px 0; margin: 1.5rem 0;">
  <p style="margin: 0; font-size: 0.95rem; line-height: 1.7;"><strong>Your Privacy is Our Priority:</strong> We never use your uploaded images for training AI models, marketing materials, or any purpose beyond providing the specific editing services you request. We do not sell your personal data.</p>
</div>"""
        },
        {
            'title': 'Data Sharing & Third Parties',
            'icon_name': 'Shield',
            'display_order': 3,
            'content': """<p>We do not sell, trade, or rent your personal information to third parties. We may share your data with carefully vetted service providers who assist us in operating our platform, such as cloud storage providers, payment processors, and customer support tools. All third-party providers are bound by strict confidentiality agreements, data processing contracts, and are required to maintain industry-standard security practices. We may also disclose information where required by law, to protect our rights, or in connection with a business transfer (merger, acquisition, or sale of assets).</p>"""
        },
        {
            'title': 'Your Rights & Choices',
            'icon_name': 'UserCheck',
            'display_order': 4,
            'content': """<p>You have full control over your personal data. Under applicable privacy laws (including GDPR and CCPA), you have the following rights:</p>
<ul>
  <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you</li>
  <li><strong>Right to Rectification:</strong> Correct any inaccurate or incomplete data</li>
  <li><strong>Right to Deletion:</strong> Request deletion of your personal data, subject to legal retention requirements</li>
  <li><strong>Right to Portability:</strong> Receive your data in a structured, machine-readable format</li>
  <li><strong>Right to Object:</strong> Object to processing of your data for specific purposes</li>
  <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
</ul>
<p>To exercise any of these rights, contact us at <strong>info@picpicxels.com</strong>. We will respond to your request within 30 days, as required by applicable regulations.</p>"""
        },
        {
            'title': 'Security Measures',
            'icon_name': 'Lock',
            'display_order': 5,
            'content': """<p>We implement industry-leading security measures to protect your data from unauthorized access, alteration, disclosure, or destruction:</p>
<ul>
  <li><strong>Encryption at Rest:</strong> All stored data is encrypted using AES-256 standard</li>
  <li><strong>Encryption in Transit:</strong> All data transmitted to and from our platform uses TLS 1.3</li>
  <li><strong>Access Controls:</strong> Strict role-based access controls with multi-factor authentication</li>
  <li><strong>Regular Audits:</strong> Weekly vulnerability scans and quarterly penetration testing</li>
  <li><strong>SOC 2 Compliance:</strong> We maintain SOC 2 Type II certification for our security controls</li>
</ul>
<div class="highlight-box" style="background: rgba(255,138,80,0.05); border-left: 4px solid #FF8A50; padding: 1.25rem 1.5rem; border-radius: 0 10px 10px 0; margin: 1.5rem 0;">
  <p style="margin: 0; font-size: 0.95rem; line-height: 1.7;"><strong>Important:</strong> While we implement robust security measures, no system can guarantee absolute security. We recommend that you also take steps to protect your account, such as using strong, unique passwords and enabling two-factor authentication.</p>
</div>"""
        },
        {
            'title': 'Cookies & Tracking Technologies',
            'icon_name': 'Cookie',
            'display_order': 6,
            'content': """<p>PicPicxels uses cookies and similar tracking technologies to enhance your browsing experience, analyze platform usage, and support our marketing efforts. We use the following categories of cookies:</p>
<ul>
  <li><strong>Essential Cookies:</strong> Required for platform functionality — authentication, session management, and security</li>
  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform (e.g., page views, feature usage)</li>
  <li><strong>Preference Cookies:</strong> Remember your settings and preferences for a personalized experience</li>
</ul>
<p>You can manage your cookie preferences at any time through your browser settings. Please note that disabling certain cookies may affect the functionality of our platform. For more detailed information about our cookie practices, please contact our support team.</p>"""
        },
        {
            'title': 'Contact Information',
            'icon_name': 'Mail',
            'display_order': 7,
            'content': """<p>If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at <strong>info@picpicxels.com</strong>.</p>"""
        },
    ]

    for sec in sections:
        obj, c = PrivacyPolicySection.objects.get_or_create(
            page=page,
            title=sec['title'],
            defaults={**sec, 'is_active': True}
        )
        print(f"Privacy Section: {obj.title} (created={c})")


def seed_terms():
    page, created = TermsConditionPage.objects.get_or_create(
        id=1,
        defaults={
            'hero_title': 'Terms & Conditions',
            'hero_subtitle': 'Please read these terms carefully before using our platform. They govern your relationship with PicPicxels and outline both your rights and responsibilities.',
            'last_updated': 'August 2026',
            'is_active': True,
        }
    )
    print(f"Terms & Conditions Page: created={created}")

    highlights = [
        {'number': '01', 'title': 'Fair Usage', 'description': 'Transparent, fair usage policies that protect both our platform and our clients.', 'display_order': 1},
        {'number': '02', 'title': 'Data Ownership', 'description': 'You retain full ownership of all images and assets you upload to our platform.', 'display_order': 2},
        {'number': '03', 'title': 'SLA Guarantee', 'description': '99.9% uptime SLA with guaranteed turnaround times on all service tiers.', 'display_order': 3},
        {'number': '04', 'title': 'Easy Cancellation', 'description': 'Cancel or modify your plan anytime — no lock-in contracts, no hidden fees.', 'display_order': 4},
    ]
    for h in highlights:
        obj, c = TermsHighlight.objects.get_or_create(
            page=page,
            number=h['number'],
            defaults=h
        )
        print(f"Terms Highlight: {obj.number} {obj.title} (created={c})")

    clauses = [
        {
            'title': 'Acceptance of Terms',
            'anchor_id': 'acceptance',
            'display_order': 1,
            'content': """<p>By accessing or using PicPicxels services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must discontinue use of our platform immediately.</p>
<p>These terms constitute a legally binding agreement between you ("User" or "Client") and PicPicxels Inc. ("Company," "we," "us," or "our"). By creating an account, submitting an order, or otherwise using our services, you accept these terms in full.</p>"""
        },
        {
            'title': 'Use of Service',
            'anchor_id': 'use-of-service',
            'display_order': 2,
            'content': """<p>You agree to use PicPicxels platform and services only for lawful purposes and in accordance with these Terms. The following activities are strictly prohibited:</p>
<ul>
  <li>Uploading, editing, or distributing illegal, obscene, or infringing content</li>
  <li>Attempting to reverse engineer, decompile, or extract source code from our platform</li>
  <li>Scraping, crawling, or harvesting data from our platform without written permission</li>
  <li>Interfering with the security, integrity, or performance of our systems</li>
  <li>Using automated tools to create accounts or submit orders</li>
</ul>
<div class="highlight-box" style="background: rgba(255,138,80,0.05); border-left: 4px solid #FF8A50; padding: 1.25rem 1.5rem; border-radius: 0 10px 10px 0; margin: 1.5rem 0;">
  <p style="margin: 0; font-size: 0.95rem; line-height: 1.7;"><strong>Important:</strong> Violation of these usage terms may result in immediate account suspension, termination, and legal action. We reserve the right to remove any content that violates these provisions without prior notice.</p>
</div>"""
        },
        {
            'title': 'Intellectual Property Rights',
            'anchor_id': 'intellectual-property',
            'display_order': 3,
            'content': """<p>All content, designs, trademarks, software, and proprietary technology displayed on this site are the exclusive property of PicPicxels Inc. You may not reproduce, distribute, modify, or create derivative works without our prior written consent.</p>
<p><strong>Client Content:</strong> You retain full ownership and intellectual property rights to all images, files, and content you upload to our platform. PicPicxels does not claim any ownership over your uploaded content. By uploading content, you grant us a limited license to process, edit, and store that content solely for the purpose of providing our services.</p>
<p><strong>Edited Output:</strong> Upon delivery, you own all rights to the edited images produced by our services. We will not use your edited images for marketing or promotional purposes without your explicit consent.</p>"""
        },
        {
            'title': 'Payments, Billing & Subscriptions',
            'anchor_id': 'payments-billing',
            'display_order': 4,
            'content': """<p>All subscription fees, one-time charges, and service fees are billed according to your selected plan or order type. Payment terms are as follows:</p>
<ul>
  <li>Payments are due at the time of order placement or at the start of each billing cycle</li>
  <li>All fees are quoted in USD and do not include applicable taxes unless stated otherwise</li>
  <li>Subscription plans auto-renew unless canceled at least 24 hours before the renewal date</li>
  <li>Refunds are issued on a case-by-case basis as outlined in our Refund Policy</li>
</ul>
<div class="highlight-box" style="background: rgba(255,138,80,0.05); border-left: 4px solid #FF8A50; padding: 1.25rem 1.5rem; border-radius: 0 10px 10px 0; margin: 1.5rem 0;">
  <p style="margin: 0; font-size: 0.95rem; line-height: 1.7;"><strong>Note:</strong> You are responsible for maintaining accurate and current billing information. Failure to process payment may result in service interruption or account suspension.</p>
</div>"""
        },
        {
            'title': 'Limitation of Liability',
            'anchor_id': 'limitation-of-liability',
            'display_order': 5,
            'content': """<p>To the fullest extent permitted by applicable law, PicPicxels Inc., its officers, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from or related to:</p>
<ul>
  <li>Your use or inability to use our services</li>
  <li>Any unauthorized access to or alteration of your data</li>
  <li>Any content obtained through our services</li>
  <li>Any bugs, viruses, or harmful components transmitted through our platform</li>
</ul>
<p>Our total liability to you for any claim arising from these terms or your use of our services shall not exceed the total amount paid by you to PicPicxels in the twelve (12) months preceding the event giving rise to the claim.</p>"""
        },
        {
            'title': 'Data Protection & Privacy',
            'anchor_id': 'data-protection',
            'display_order': 6,
            'content': """<p>We take your privacy seriously. Our collection, use, and protection of your personal data is governed by our Privacy Policy, which is incorporated into these Terms by reference. Key commitments include:</p>
<ul>
  <li>We do not sell your personal data to third parties</li>
  <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
  <li>You can request access, correction, or deletion of your data at any time</li>
  <li>We comply with GDPR, CCPA, and applicable data protection regulations</li>
</ul>"""
        },
        {
            'title': 'Service Level Agreement',
            'anchor_id': 'sla',
            'display_order': 7,
            'content': """<p>PicPicxels is committed to providing reliable, high-quality service. Our standard SLA commitments include:</p>
<ul>
  <li>99.9% platform uptime, measured monthly</li>
  <li>Guaranteed turnaround times based on your selected service tier</li>
  <li>Quality assurance review on all edited deliverables</li>
  <li>Free revisions within 48 hours of delivery for quality issues</li>
</ul>
<div class="highlight-box" style="background: rgba(255,138,80,0.05); border-left: 4px solid #FF8A50; padding: 1.25rem 1.5rem; border-radius: 0 10px 10px 0; margin: 1.5rem 0;">
  <p style="margin: 0; font-size: 0.95rem; line-height: 1.7;"><strong>SLA Credits:</strong> If we fail to meet our guaranteed turnaround time, you may be eligible for service credits as outlined in your service agreement.</p>
</div>"""
        },
        {
            'title': 'Termination',
            'anchor_id': 'termination',
            'display_order': 8,
            'content': """<p>Either party may terminate this agreement at any time. You may cancel your account or subscription through your dashboard settings or by contacting our support team. We reserve the right to suspend or terminate access to our services immediately, without prior notice, for violations of these terms. Upon termination, your right to use our services ceases immediately, and we may retain your data as required by law or our data retention policy.</p>"""
        },
        {
            'title': 'Governing Law',
            'anchor_id': 'governing-law',
            'display_order': 9,
            'content': """<p>These Terms and Conditions shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.</p>
<p>If any provision of these terms is found to be unenforceable or invalid, the remaining provisions shall remain in full force and effect.</p>"""
        },
        {
            'title': 'Changes to Terms',
            'anchor_id': 'changes',
            'display_order': 10,
            'content': """<p>We reserve the right to update or modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to our website, with a revised "Last Updated" date. We encourage you to review these terms periodically. Your continued use of our services after any changes constitutes acceptance of the updated terms. For material changes, we will notify you via email or through our platform.</p>"""
        },
    ]

    for cl in clauses:
        obj, c = TermsClause.objects.get_or_create(
            page=page,
            title=cl['title'],
            defaults={**cl, 'is_active': True}
        )
        print(f"Terms Clause: {obj.title} (created={c})")

if __name__ == '__main__':
    seed_privacy()
    seed_terms()
    print("Legal pages seeded successfully!")
