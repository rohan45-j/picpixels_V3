'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSiteSettings } from '@/store/SiteSettingsContext';
import styles from '@/styles/modules/login.module.css';

export default function Login() {
  const { siteSettings } = useSiteSettings();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com'}/api/v1/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (!resp.ok) {
        setErrorMsg('Invalid email or password.');
        return;
      }

      const data = await resp.json();
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('user_email', formData.email);

      router.push('/dashboard/overview');
    } catch (err) {
      setErrorMsg('Unable to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* Brand Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span>{siteSettings?.site_name || 'Photo Editor'}</span>
        </Link>

        <h1 className={styles.title}>
          {isRegister ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className={styles.subtitle}>
          {isRegister 
            ? 'Start your specialist-assisted workflow trial today' 
            : 'Access your secure visual production dashboard'
          }
        </p>

        {errorMsg && (
          <div style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={styles.input} 
                  required 
                  placeholder="John Doe"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Company Name</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className={styles.input} 
                  placeholder="Acme Corp"
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input} 
              required 
              placeholder="john@company.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.input} 
              required 
              placeholder="••••••••"
            />
          </div>

          {!isRegister && (
            <div className={styles.actions}>
              <label className={styles.remember}>
                <input type="checkbox" className={styles.checkbox} />
                <span>Remember me</span>
              </label>
              <a href="#" className={styles.forgot}>Forgot Password?</a>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary styles submitBtn"
            disabled={loading}
            style={{ width: '100%', height: '48px', marginBottom: '2rem' }}
          >
            {loading 
              ? (isRegister ? 'Creating Account...' : 'Logging in...') 
              : (isRegister ? 'Get Started Free ➔' : 'Sign In ➔')
            }
          </button>
        </form>

        <p className={styles.footerText}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className={styles.footerLink}
            style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}
          >
            {isRegister ? 'Sign In' : 'Sign Up Free'}
          </button>
        </p>
      </div>
    </div>
  );
}
