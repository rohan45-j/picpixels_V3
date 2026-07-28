"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "@/styles/modules/company.module.css";
import { useState } from "react";

const faqs = [
  { q: "What is the typical turnaround time?", a: "Most orders are completed within 4–24 hours depending on volume and complexity." },
  { q: "What file formats do you support?", a: "We accept JPEG, PNG, TIFF, PSD, RAW, and most common image formats. Output is delivered in your preferred format." },
  { q: "How do I submit images for editing?", a: "Upload directly via our dashboard, FTP, or API. You can also use our Dropbox and Google Drive integrations." },
  { q: "Is there a free trial available?", a: "Yes! Submit up to 3 images completely free with no credit card required to test our quality." },
  { q: "Do you offer SLA guarantees?", a: "Yes, enterprise clients receive dedicated SLA agreements with guaranteed turnaround times and 24/7 support." },
  { q: "How is pricing calculated?", a: "Pricing is per image, based on complexity. Volume discounts apply for monthly plans. See our pricing page for details." },
];

const contactMethods = [
  { icon: "💬", title: "Live Chat", desc: "Chat with our support team in real-time", value: "Start Chat →" },
  { icon: "✉️", title: "Email Support", desc: "Get a detailed response within 4 hours", value: "info@picpicxels.com" },
  { icon: "📞", title: "Phone", desc: "Speak directly with our team", value: "+1 (800) 123-4567" },
  { icon: "📅", title: "Book a Demo", desc: "Schedule a personalized walkthrough", value: "Book a Call →" },
];

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.page}>
      <Header />

      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.heroBadge}>Contact Support</span>
        <h1 className={styles.heroTitle}>We&apos;re Here to Help<br />Around the Clock</h1>
        <p className={styles.heroSub}>
          Our support team is available 24/7. Reach us via chat, email, or phone —
          however you prefer. Expect fast, expert help every time.
        </p>
      </section>

      {/* Contact Methods */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionAltInner}>
          <SectionHeading text="Contact Options" />
          <div className={styles.cardsGrid}>
            {contactMethods.map((c) => (
              <div key={c.title} className={styles.card}>
                <span className={styles.cardIcon}>{c.icon}</span>
                <div className={styles.cardTitle}>{c.title}</div>
                <div className={styles.cardDesc}>{c.desc}</div>
                <div style={{ marginTop: "0.8rem", color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                  {c.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className={styles.section}>
        <div className={styles.contactGrid}>
          <div>
            <SectionHeading text="Get in Touch" center={false} />
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.formRow}>
                <input
                  className={styles.input}
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                />
                <input
                  className={styles.input}
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <select className={styles.select} name="subject" value={form.subject} onChange={handleChange}>
                <option value="">Select a Topic</option>
                <option>Billing & Payments</option>
                <option>Technical Issue</option>
                <option>Account Settings</option>
                <option>Image Quality</option>
                <option>API Integration</option>
                <option>Other</option>
              </select>
              <textarea
                className={styles.textarea}
                name="message"
                placeholder="Describe your issue or question..."
                value={form.message}
                onChange={handleChange}
              />
              <button type="submit" className="btn btn-primary">Send Message</button>
            </form>
          </div>

          <div>
            <SectionHeading text="Support Details" center={false} />
            <div className={styles.contactInfo} style={{ marginTop: "1.5rem" }}>
              <div className={styles.contactItem}>
                <span className={styles.contactItemIcon}>🕐</span>
                <div>
                  <div className={styles.contactItemTitle}>Availability</div>
                  <div className={styles.contactItemValue}>24/7 — 365 days a year</div>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactItemIcon}>⚡</span>
                <div>
                  <div className={styles.contactItemTitle}>Response Time</div>
                  <div className={styles.contactItemValue}>Under 4 hours for all tickets</div>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactItemIcon}>🌐</span>
                <div>
                  <div className={styles.contactItemTitle}>Languages</div>
                  <div className={styles.contactItemValue}>English, Bengali, Spanish, French</div>
                </div>
              </div>
              <div className={styles.contactItem}>
                <span className={styles.contactItemIcon}>🏅</span>
                <div>
                  <div className={styles.contactItemTitle}>Customer Satisfaction</div>
                  <div className={styles.contactItemValue}>99.8% rated Excellent</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionAltInner}>
          <SectionHeading text="Frequently Asked Questions" />
          <div className={styles.faqList}>
            {faqs.map((f) => (
              <div key={f.q} className={styles.faqItem}>
                <div className={styles.faqQ}>❓ {f.q}</div>
                <div className={styles.faqA}>{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
