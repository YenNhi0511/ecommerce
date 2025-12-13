import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { AnalyticsProvider } from "@/context/AnalyticsContext";
import LocaleProvider from '@/context/LocaleContext';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TechZone - Mua sắm công nghệ trực tuyến",
  description: "Nơi mua sắm điện thoại, laptop, máy tính bảng, phụ kiện công nghệ chính hãng với giá tốt nhất. Giao hàng nhanh toàn quốc.",
  keywords: "điện thoại, laptop, máy tính bảng, phụ kiện công nghệ, mua sắm online, techzone",
  authors: [{ name: "TechZone Team" }],
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased bg-gradient-to-br from-slate-50 via-white to-indigo-50 min-h-screen`}
      >
        <LocaleProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <CartProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </CartProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
