import type { Metadata, Viewport } from "next";
import { SiteSettingsProvider } from "@/store/SiteSettingsContext";
import { SharedDataProvider } from "@/store/SharedDataContext";
import { DynamicFavicon } from "@/components/media/DynamicFavicon";
import FloatingActionButtons from "@/components/ui/FloatingActionButtons";
import "./globals.css";
import "@/styles/animations.css";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.picpixels.com';

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF8A50",
};

export const metadata: Metadata = {
  title: "PicPicxels | Professional Photo Editing Services | Image & Photo Editing",
  description: "Get pixel-perfect photo editing services at affordable pricing. We offer clipping path, background removal, image masking, ghost mannequin, retouching, color correction & more. 5M+ images edited.",
  keywords: ["photo editing", "clipping path", "background removal", "image retouching", "ghost mannequin", "color correction", "ecommerce image editing", "PicPicxels"],
  icons: { icon: [], apple: [] },
  openGraph: {
    title: "PicPicxels | Professional Photo Editing Services at Affordable Pricing",
    description: "Get pixel-perfect photo editing services with quality as our top priority. We edited over 5m+ images for brands, retailers, media agencies, and commercial photographers.",
    url: "https://www.picpicxels.com",
    type: "website",
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch shared data server-side for SSR — enables instant header/footer on initial load
  const [siteSettings, navItems, services] = await Promise.all([
    fetch(`${BASE_URL}/api/v1/settings/site/`, { next: { revalidate: 60 } })
      .then(r => r.ok ? r.json() : null)
      .then(data => (data?.results && data.results.length > 0) ? data.results[0] : data)
      .catch(() => null),
    fetch(`${BASE_URL}/api/v1/navigation/?location=header`, { next: { revalidate: 60 } })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(data => Array.isArray(data) ? data : (data?.results ?? []))
      .catch(() => []),
    fetch(`${BASE_URL}/api/v1/cms/services/?mega_menu=true`, { next: { revalidate: 60 } })
      .then(r => r.ok ? r.json() : { results: [] })
      .then(data => Array.isArray(data) ? data : (data?.results ?? []))
      .catch(() => []),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
                  var originalMeasure = window.performance.measure;
                  window.performance.measure = function(name, startOrOptions, end) {
                    try {
                      if (startOrOptions && typeof startOrOptions === 'object') {
                        var options = Object.assign({}, startOrOptions);
                        if (typeof options.start === 'number' && (options.start < 0 || isNaN(options.start) || !isFinite(options.start))) {
                          options.start = 0;
                        }
                        if (typeof options.end === 'number' && (options.end < 0 || isNaN(options.end) || !isFinite(options.end) || options.end === -Infinity)) {
                          options.end = 0;
                        }
                        if (typeof options.start === 'number' && typeof options.end === 'number' && options.start > options.end) {
                          options.end = options.start;
                        }
                        return originalMeasure.call(window.performance, name, options);
                      }
                      return originalMeasure.apply(window.performance, arguments);
                    } catch (e) {
                      console.warn('Safe performance.measure caught error:', e);
                    }
                  };
                }
              })();
            `
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <SiteSettingsProvider initialSettings={siteSettings}>
          <SharedDataProvider initialNavItems={navItems} initialServices={services}>
            <DynamicFavicon />
            {children}
            <FloatingActionButtons />
          </SharedDataProvider>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
