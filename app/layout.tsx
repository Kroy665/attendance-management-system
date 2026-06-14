import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PDF Scrape - Attendance Management System",
    template: "%s | PDF Scrape"
  },
  description: "A Next.js application for managing and viewing attendance data extracted from PDF files using E2B sandboxed scraping. View attendance records, filter by date/employee/branch, and export data to CSV.",
  keywords: ["attendance", "PDF scraping", "attendance management", "employee tracking", "Next.js", "E2B"],
  authors: [{ name: "Koushik Roy" }],
  creator: "Koushik Roy",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PDF Scrape - Attendance Management System",
    description: "Manage and view attendance data extracted from PDF files with advanced filtering and export capabilities.",
    siteName: "PDF Scrape",
  },
  twitter: {
    card: "summary_large_image",
    title: "PDF Scrape - Attendance Management System",
    description: "Manage and view attendance data extracted from PDF files with advanced filtering and export capabilities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
