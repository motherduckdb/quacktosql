import type { Metadata } from "next";
import { Inter, Geist, Geist_Mono, Cousine } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "./providers";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://motherduck.com'),
  title: "Quack To SQL - Translate Duck Sounds to SQL Queries",
  description: "The world's first duck-based SQL query generator. Convert your quacks into powerful SQL queries directly in your browser with no data leaving your device.",
  openGraph: {
    title: "Quack To SQL - Duck Sounds to SQL Queries",
    description: "The world's first duck-based SQL query generator. Convert quacks into powerful SQL queries in your browser.",
    images: [
      {
        url: "/quacktosql/website_card.png",
        width: 1200,
        height: 630,
        alt: "Quack To SQL"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quack To SQL - Duck Sounds to SQL Queries",
    description: "The world's first duck-based SQL query generator. Convert quacks into powerful SQL queries in your browser.",
    images: ["/quacktosql/website_card.png"],
    creator: "@Quack To SQL"
  },
  icons: {
    icon: [
      { url: '/quacktosql/favicon/favicon.ico' },
      { url: '/quacktosql/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' }
    ],
    apple: { url: '/quacktosql/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    other: [
      { rel: 'manifest', url: '/quacktosql/favicon/site.webmanifest' },
      { url: '/quacktosql/favicon/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/quacktosql/favicon/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }
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
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
