import type { Metadata } from 'next';
import NewOrderClient from './NewOrderClient';

export const metadata: Metadata = {
  title: 'Create Order',
  description: 'Upload assets, specify editing requirements, and initiate a new production batch.',
};

export default function NewOrderPage() {
  return <NewOrderClient />;
}
