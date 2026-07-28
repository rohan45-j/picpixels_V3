import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "@/styles/modules/company.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Press & Media",
  description: "PicPicxels in the news. Press releases, media coverage, and brand assets for journalists and media partners.",
  openGraph: {
    title: "PicPicxels Press & Media",
    description: "Find the latest press releases, media coverage, and brand assets.",
    type: "website",
  },
};

const articles = [
  {
    icon: "📰",
    tag: "TechCrunch",
    title: "PicPicxels raises $12M Series A to expand AI-powered photo editing platform",
    date: "May 2025",
  },
  {
    icon: "🏆",
    tag: "Forbes",
    title: "The Top 10 Photo Editing Services Transforming E-Commerce Imagery in 2025",
    date: "April 2025",
  },
  {
    icon: "🤖",
    tag: "Wired",
    title: "How AI is revolutionizing professional photo retouching — and what that means for brands",
    date: "March 2025",
  },
  {
    icon: "📊",
    tag: "Business Insider",
    title: "PicPicxels partners with Shopify to offer native image processing for 2M+ merchants",
    date: "February 2025",
  },
  {
    icon: "🌍",
    tag: "Reuters",
    title: "Photo editing market hits $8B: PicPicxels leads the charge with new Asia expansion",
    date: "January 2025",
  },
  {
    icon: "🎖️",
    tag: "Clutch",
    title: "PicPicxels named #1 Image Editing Service for E-Commerce for 3rd consecutive year",
    date: "December 2024",
  },
];

const mediaContacts = [
  { icon: "✉️", title: "Press Enquiries", value: "info@picpicxels.com" },
  { icon: "📞", title: "Media Hotline", value: "+880 1234-567890" },
  { icon: "🖼️", title: "Brand Assets", value: "Download Media Kit →" },
];

export default function Press() {
  return (
    <div className={styles.page}>
      <Header />

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>PicPicxels<br />in the News</h1>
        <p className={styles.heroSub}>
          Find the latest press releases, media coverage, and brand assets. Our team is
          here to help journalists and media partners tell the story of visual commerce.
        </p>
        <div className={styles.heroCta}>
          <a href="mailto:info@picpicxels.com" className="btn btn-primary">Contact Press Team</a>
          <a href="#media-kit" className="btn btn-secondary">Download Media Kit</a>
        </div>
      </section>

      {/* Articles */}
      <section className={styles.section}>
        <SectionHeading text="Latest Press &amp; News" />
        <div className={styles.pressGrid}>
          {articles.map((a) => (
            <div key={a.title} className={styles.pressCard}>
              <div className={styles.pressCardImg}>{a.icon}</div>
              <div className={styles.pressCardBody}>
                <div className={styles.pressCardTag}>{a.tag}</div>
                <div className={styles.pressCardTitle}>{a.title}</div>
                <div className={styles.pressCardDate}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Media Contact */}
      <section className={styles.sectionAlt} id="media-kit">
        <div className={styles.sectionAltInner}>
          <SectionHeading text="Media Contact" />
          <div className={styles.contactInfo} style={{ maxWidth: 600, marginTop: "2rem" }}>
            {mediaContacts.map((c) => (
              <div key={c.title} className={styles.contactItem}>
                <span className={styles.contactItemIcon}>{c.icon}</span>
                <div>
                  <div className={styles.contactItemTitle}>{c.title}</div>
                  <div className={styles.contactItemValue}>{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
