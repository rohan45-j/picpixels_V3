import type { Metadata, Viewport } from "next";
import { SiteSettingsProvider } from "../shared/contexts/SiteSettingsContext";
import { DynamicFavicon } from "../shared/components/DynamicFavicon";
import FloatingActionButtons from "../shared/components/FloatingActionButtons";
import "./globals.css";
import "../shared/styles/animations.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF8A50",
};

export const metadata: Metadata = {
  title: "PicPicxels | Professional Photo Editing Services | Image & Photo Editing",
  description: "Get pixel-perfect photo editing services at affordable pricing. We offer clipping path, background removal, image masking, ghost mannequin, retouching, color correction & more. 5M+ images edited.",
  keywords: ["photo editing", "clipping path", "background removal", "image retouching", "ghost mannequin", "color correction", "ecommerce image editing", "PicPicxels"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/favicon.ico" }],
  },
  openGraph: {
    title: "PicPicxels | Professional Photo Editing Services at Affordable Pricing",
    description: "Get pixel-perfect photo editing services with quality as our top priority. We edited over 5m+ images for brands, retailers, media agencies, and commercial photographers.",
    url: "https://www.picpicxels.com",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <SiteSettingsProvider>
          <DynamicFavicon />
          {children}
          <FloatingActionButtons />
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
