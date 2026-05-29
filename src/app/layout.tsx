import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Campus Express - Giao Nhận Nội Khu Sinh Viên",
  description: "Nền tảng giao nhận đồ ăn, thức uống và in ấn tài liệu nội khu trường đại học & ký túc xá nhanh chóng, an toàn, tiết kiệm.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 text-slate-900`}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}

