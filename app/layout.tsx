import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const heebo = Heebo({
  subsets: ['latin', 'hebrew'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-heebo',
  display: 'swap',
});

const siteUrl = 'https://talestate.vercel.app';

export const metadata: Metadata = {
  title: "T ESTATE — פלטפורמת הנדל״ן המתקדמת",
  description: "מערכת פרימיום למשרדי נדל״ן וסוכנים — ניהול נכסים, לידים וחוויית לקוח ברמה הגבוהה ביותר",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'T ESTATE — פלטפורמת הנדל״ן המתקדמת',
    description: 'מערכת פרימיום למשרדי נדל״ן וסוכנים — ניהול נכסים, לידים וחוויית לקוח ברמה הגבוהה ביותר',
    siteName: 'T ESTATE',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'T ESTATE — פלטפורמת הנדל״ן המתקדמת',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'T ESTATE — פלטפורמת הנדל״ן המתקדמת',
    description: 'מערכת פרימיום למשרדי נדל״ן וסוכנים — ניהול נכסים, לידים וחוויית לקוח ברמה הגבוהה ביותר',
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className={heebo.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
