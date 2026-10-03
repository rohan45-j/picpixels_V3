import React from 'react';

interface JsonLdProps {
  data?: Record<string, any> | Array<Record<string, any>> | null | undefined;
  schema?: Record<string, any> | Array<Record<string, any>> | null | undefined;
}

export default function JsonLd({ data, schema }: JsonLdProps) {
  const payload = schema || data;
  if (!payload) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
