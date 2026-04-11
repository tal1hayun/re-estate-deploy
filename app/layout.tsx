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

export const metadata: Metadata = {
  title: "T ESTATE — פלטפורמת הנדל״ן המתקדמת",
  description: "מערכת פרימיום למשרדי נדל״ן וסוכנים — ניהול נכסים, לידים וחוויית לקוח ברמה הגבוהה ביותר",
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
