import type { Metadata } from 'next';
import RetoucherClient from './RetoucherClient';

export const metadata: Metadata = {
  title: 'Retoucher Workspace',
  description: 'Specialist production console for reviewing tickets, inspecting asset annotations, and delivering completed edits.',
};

export default function RetoucherPage() {
  return <RetoucherClient />;
}
