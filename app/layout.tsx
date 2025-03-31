import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono, Cousine } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cousine = Cousine({
  variable: "--font-cousine",
  weight: ['400', '700'],
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quack2SQL - Translate Duck Sounds to SQL Queries",
  description: "The world's first duck-based SQL query generator. Convert your quacks into powerful SQL queries directly in your browser with no data leaving your device.",
  openGraph: {
    title: "Quack2SQL - Duck Sounds to SQL Queries",
    description: "The world's first duck-based SQL query generator. Convert quacks into powerful SQL queries in your browser.",
    images: [
      {
        url: "/website_card.png",
        width: 1200,
        height: 630,
        alt: "Quack2SQL"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quack2SQL - Duck Sounds to SQL Queries",
    description: "The world's first duck-based SQL query generator. Convert quacks into powerful SQL queries in your browser.",
    images: ["/website_card.png"],
    creator: "@quack2sql"
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    other: [
      { rel: 'manifest', url: '/favicon/site.webmanifest' },
      { url: '/favicon/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cousine.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
