import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const styles = {
  link: {
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-5)',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'var(--transition)',
  },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-6)',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: '6rem',
            fontWeight: 800,
            color: 'var(--color-primary)',
            lineHeight: 1,
            margin: '0 0 var(--spacing-4)',
          }}
        >
          404
        </h1>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: '0 0 var(--spacing-3)',
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            color: 'var(--color-muted)',
            maxWidth: 480,
            margin: '0 0 var(--spacing-6)',
          }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/" className="btn btn-primary">
          Back to Home
        </Link>
      </main>
      <Footer />
    </>
  );
}
