'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Star, Send, CheckCircle2 } from 'lucide-react';

interface BlogFeedbackWidgetProps {
  postSlug: string;
  postTitle?: string;
}

export default function BlogFeedbackWidget({ postSlug, postTitle }: BlogFeedbackWidgetProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [isHelpful, setIsHelpful] = useState<boolean | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [formLoadedAt] = useState(() => Date.now() / 1000);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(`blog_feedback_${postSlug}`)) {
        setHasVoted(true);
        setSubmitted(true);
      }
    } catch {}
  }, [postSlug]);

  const handleVote = async (helpful: boolean) => {
    setIsHelpful(helpful);
    setRating(helpful ? 5 : 2);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isHelpful === null) return;

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';
      const resp = await fetch(`${apiBase}/api/v1/cms/blog/posts/${postSlug}/feedback/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_helpful: isHelpful,
          rating: rating || undefined,
          comment: comment.trim() || undefined,
          user_name: userName.trim() || undefined,
          user_email: userEmail.trim() || undefined,
          website_hp: honeypot || undefined,
          form_loaded_at: formLoadedAt,
        }),
      });

      if (resp.ok) {
        setSubmitted(true);
        setHasVoted(true);
        try {
          localStorage.setItem(`blog_feedback_${postSlug}`, '1');
        } catch {}
      }
    } catch {
      // In case of offline/network, show friendly thank-you
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        marginTop: '3rem',
        padding: '2rem',
        background: 'linear-gradient(135deg, rgba(255, 138, 80, 0.08) 0%, rgba(255, 107, 0, 0.04) 100%)',
        border: '1px solid rgba(255, 138, 80, 0.25)',
        borderRadius: '16px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          marginBottom: '1rem',
        }}>
          <CheckCircle2 size={26} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
          Thank you for your feedback!
        </h3>
        <p style={{ color: '#4b5563', fontSize: '0.925rem', maxWidth: '450px', margin: '0 auto' }}>
          Your input helps our photo editing team continuously improve the depth and accuracy of our industry tutorials.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      marginTop: '3.5rem',
      padding: '2.25rem',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      borderRadius: '20px',
    }}>
      <div style={{ textAlign: 'center', marginBottom: showForm ? '1.5rem' : '0' }}>
        <span style={{
          display: 'inline-block',
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: '#ff6b00',
          marginBottom: '0.5rem',
        }}>
          Reader Feedback
        </span>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: 0 }}>
          Was this article helpful to you?
        </h3>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.35rem' }}>
          Let us know so we can bring you more practical guides and actionable case studies.
        </p>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          marginTop: '1.25rem',
        }}>
          <button
            type="button"
            onClick={() => handleVote(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.5rem',
              borderRadius: '9999px',
              border: isHelpful === true ? '2px solid #10b981' : '1px solid #e5e7eb',
              background: isHelpful === true ? '#ecfdf5' : '#ffffff',
              color: isHelpful === true ? '#059669' : '#374151',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ThumbsUp size={18} />
            <span>Yes, helpful</span>
          </button>

          <button
            type="button"
            onClick={() => handleVote(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.5rem',
              borderRadius: '9999px',
              border: isHelpful === false ? '2px solid #ef4444' : '1px solid #e5e7eb',
              background: isHelpful === false ? '#fef2f2' : '#ffffff',
              color: isHelpful === false ? '#dc2626' : '#374151',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <ThumbsDown size={18} />
            <span>Could be better</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
          {/* Honeypot field for bot protection */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <label htmlFor="website_hp_feedback">Do not fill this</label>
            <input
              type="text"
              id="website_hp_feedback"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
              How would you rate this guide?
            </label>
            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: star <= (hoverRating || rating) ? '#f59e0b' : '#d1d5db',
                    transition: 'color 0.15s ease',
                  }}
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star size={24} fill={star <= (hoverRating || rating) ? '#f59e0b' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}>
              {isHelpful ? 'What did you find most valuable? (Optional)' : 'How can we improve this article? (Optional)'}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isHelpful ? 'Share what helped you or what you would like to read next...' : 'Tell us what was missing, unclear, or outdated...'}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '10px',
                fontSize: '0.9rem',
                color: '#111827',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                Your Name (Optional)
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Sarah"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#6b7280', marginBottom: '0.25rem' }}>
                Email (Optional, kept private)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="sarah@example.com"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.6rem',
                background: 'linear-gradient(135deg, #FF8A50 0%, #FF6B00 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(255, 107, 0, 0.25)',
              }}
            >
              <Send size={15} />
              <span>{loading ? 'Submitting...' : 'Send Feedback'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
