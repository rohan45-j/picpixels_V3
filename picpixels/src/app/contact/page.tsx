import type { Metadata } from 'next';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | PicPicxels',
  description: 'Get in touch with PicPicxels. Send us your images via Wetransfer or Dropbox and get a free trial.',
};

export default function Contact() {
  return (
    <>
      <Header />
      <ContactClient />
      <Footer />
    </>
  );
}
