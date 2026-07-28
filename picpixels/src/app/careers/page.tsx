import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "@/styles/modules/company.module.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the PicPicxels team. We're hiring Senior AI Engineers, UI/UX Designers, Image Retouching Specialists, and more. Remote-friendly culture.",
  openGraph: {
    title: "Careers at PicPicxels | Join Our Team",
    description: "Join the team that's redefining visual commerce. Remote-first culture, competitive pay, and growth opportunities.",
    type: "website",
  },
};

const openRoles = [
  { title: "Senior AI Engineer", dept: "Engineering", type: "Full-time", location: "Remote" },
  { title: "Senior UI/UX Designer", dept: "Design", type: "Full-time", location: "Remote" },
  { title: "Image Retouching Specialist", dept: "Operations", type: "Full-time", location: "Hybrid" },
  { title: "Account Manager", dept: "Sales", type: "Full-time", location: "On-site" },
  { title: "Product Manager", dept: "Product", type: "Full-time", location: "Remote" },
  { title: "QA Engineer", dept: "Engineering", type: "Contract", location: "Remote" },
];

const perks = [
  { icon: "🌍", title: "Remote-First", desc: "Work from anywhere in the world with flexible hours." },
  { icon: "📈", title: "Fast Growth", desc: "Join a hyper-growth studio with real ownership opportunities." },
  { icon: "🎓", title: "Learning Budget", desc: "Annual budget for courses, books, and conferences." },
  { icon: "🏥", title: "Health Coverage", desc: "Comprehensive health, dental, and vision insurance." },
  { icon: "🎉", title: "Team Retreats", desc: "Annual company retreat in an exciting destination." },
  { icon: "💰", title: "Competitive Pay", desc: "Market-leading salaries with performance bonuses." },
];

export default function Careers() {
  return (
    <div className={styles.page}>
      <Header />

      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.heroBadge}>Careers</span>
        <h1 className={styles.heroTitle}>Join the Team That's<br />Redefining Visual Commerce</h1>
        <p className={styles.heroSub}>
          We&apos;re a passionate team of photo editors, engineers, and designers crafting
          world-class imagery. If you love visual perfection, PicPicxels is for you.
        </p>
        <div className={styles.heroCta}>
          <a href="#open-roles" className="btn btn-primary">See Open Roles</a>
          <a href="mailto:info@picpicxels.com" className="btn btn-secondary">Send Your CV</a>
        </div>
      </section>

      {/* Perks */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionAltInner}>
          <SectionHeading text="Perks &amp; Benefits" />
          <div className={styles.cardsGrid}>
            {perks.map((p) => (
              <div key={p.title} className={styles.card}>
                <span className={styles.cardIcon}>{p.icon}</span>
                <div className={styles.cardTitle}>{p.title}</div>
                <div className={styles.cardDesc}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section className={styles.section} id="open-roles">
        <SectionHeading text="Open Positions" />
        <div className={styles.jobsGrid}>
          {openRoles.map((job) => (
            <div key={job.title} className={styles.jobCard}>
              <div className={styles.jobMeta}>
                <div className={styles.jobTitle}>{job.title}</div>
                <div className={styles.jobTags}>
                  <span className={styles.jobTag}>{job.dept}</span>
                  <span className={styles.jobTag}>{job.type}</span>
                  <span className={styles.jobTag}>{job.location}</span>
                </div>
              </div>
              <a href="mailto:info@picpicxels.com" className="btn btn-primary">Apply Now</a>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
