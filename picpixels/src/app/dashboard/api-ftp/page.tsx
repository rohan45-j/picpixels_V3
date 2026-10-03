import type { Metadata } from 'next';
import ApiFtpClient from './ApiFtpClient';

export const metadata: Metadata = {
  title: 'API & FTP Integrations',
  description: 'Manage REST API keys, secure SFTP credentials, and automated bulk photo pipelines.',
};

export default function ApiFtpPage() {
  return <ApiFtpClient />;
}
