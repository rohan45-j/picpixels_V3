import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import ServicesClient from './ServicesClient';
import type { Service } from '../../services/public-api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export const dynamic = 'force-dynamic';

export default async function Services() {
  let services: Service[] = [];
  try {
    const resp = await fetch(`${BASE_URL}/api/v1/cms/services/?brief=1`, { cache: 'no-store' });
    if (resp.ok) {
      const data = await resp.json();
      services = data.results || data;
    }
  } catch {}

  return (
    <>
      <Header />
      <ServicesClient services={services} />
      <Footer />
    </>
  );
}
