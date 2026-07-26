'use client';

import { useState } from 'react';
import styles from '@/styles/modules/dashboard.module.css';

export default function ApiFtpPortal() {
  const [activeTab, setActiveTab] = useState<'curl' | 'python' | 'node'>('curl');
  const [apiKey, setApiKey] = useState('pzt_live_51h9xKa2890JsbYTw88301Lksa');
  const [regenerated, setRegenerated] = useState(false);

  const handleRegenerate = () => {
    setApiKey('pzt_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    setRegenerated(true);
    setTimeout(() => setRegenerated(false), 2000);
  };

  const codeBlocks = {
    curl: `curl -X POST "https://api.picpicxels.com/v1/orders" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflow_id": "shopify_white_preset_33a",
    "turnaround_hours": 24,
    "images": [
      "https://your-bucket.s3.amazonaws.com/raw-shoes-01.jpg"
    ]
  }'`,
    python: `import requests

url = "https://api.picpicxels.com/v1/orders"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "workflow_id": "shopify_white_preset_33a",
    "turnaround_hours": 24,
    "images": [
        "https://your-bucket.s3.amazonaws.com/raw-shoes-01.jpg"
    ]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    node: `const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://api.picpicxels.com/v1/orders',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  data: {
    workflow_id: 'shopify_white_preset_33a',
    turnaround_hours: 24,
    images: ['https://your-bucket.s3.amazonaws.com/raw-shoes-01.jpg']
  }
};

axios.request(options)
  .then(res => console.log(res.data))
  .catch(err => console.error(err));`
  };

  return (
    <div className={styles.sectionCard}>
      <div className={styles.dashboardHeader} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem' }}>Developer Integrations</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-dark)', marginTop: '0.2rem' }}>Configure automated bulk assets submission using signed URL REST API keys or secure FTP folders.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* API Credentials */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '1rem' }}>Signed API Tokens</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-dark)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Use this bearer token in the HTTP Authorization headers to programmatically authenticate your visual assets pipeline.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              readOnly 
              value={apiKey} 
              style={{ flexGrow: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)', padding: '0.8rem 1rem', borderRadius: '6px', color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.85rem', outline: 'none' }}
            />
            <button 
              onClick={handleRegenerate}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              {regenerated ? '✓ Done' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* FTP Credentials */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', padding: '2rem', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '1rem' }}>Secure FTP (sFTP) folders</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted-dark)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Direct folder uploads. Drop raw images inside `/uploads/raw/` and fetch completed outputs inside `/downloads/completed/`.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '0.7fr 1.3fr', gap: '0.8rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted-dark)' }}>Server Host:</span>
            <span style={{ fontWeight: 700 }}>ftp.picpicxels.com</span>

            <span style={{ color: 'var(--text-muted-dark)' }}>Port Number:</span>
            <span>22 (SFTP Protocol)</span>

            <span style={{ color: 'var(--text-muted-dark)' }}>Username:</span>
            <span style={{ fontFamily: 'monospace' }}>ftp_client_10928</span>

            <span style={{ color: 'var(--text-muted-dark)' }}>Key Creds:</span>
            <span style={{ color: '#60a5fa' }}>Same as your API token</span>
          </div>
        </div>
      </div>

      {/* Code Snippet Tabs */}
      <div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem' }}>REST API Usage Examples</h4>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {[
            { id: 'curl', label: 'cURL Command' },
            { id: 'python', label: 'Python Script' },
            { id: 'node', label: 'NodeJS Script' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className="btn btn-secondary btn-xs"
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                borderColor: activeTab === tab.id ? 'var(--primary-light)' : 'var(--glass-border)',
                color: '#fff',
                fontSize: '0.8rem',
                padding: '0.5rem 1rem'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <pre style={{ background: '#090d16', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '8px', color: '#e2e8f0', overflowX: 'auto', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
          <code>{codeBlocks[activeTab]}</code>
        </pre>
      </div>
    </div>
  );
}
