import type { Metadata } from 'next';
import MediaGalleryClient from './MediaGalleryClient';

export const metadata: Metadata = {
  title: 'Media Library',
  description: 'Central repository of your uploaded camera assets and final retouched deliverables.',
};

export default function MediaGalleryPage() {
  return <MediaGalleryClient />;
}
