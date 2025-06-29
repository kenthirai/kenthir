// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next";
// Hapus import ThemeProvider yang lama
// import { ThemeProvider } from "./components/ThemeProvider";

import { Providers } from './Providers'; // <-- Import Providers baru dari file providers.js

const inter = Inter({ subsets: ['latin'] });

// Metadata untuk SEO
export const metadata = {
  manifest: "/manifest.json",
  title: 'Kenthir AI Image Generator - Create Stunning Digital Art',
  description: 'Generate stunning AI art with multiple styles - from photorealistic to anime, cyberpunk to Studio Ghibli. Create professional photography, digital art, oil paintings and more with advanced AI image generation.',
  keywords: 'AI image generator, pembuat gambar AI, seni digital AI, generator gambar Indonesia, Kenthir, AI kreatif, text to image Indonesia, ai Indonesia, gambar AI realistis, ilustrasi AI, fotografi AI, seni AI Indonesia, gambar anime AI, AI artistik, teknologi kreatif, AI untuk desain, pembuat konten AI, AI lokal Indonesia, seni digital, gambar berkualitas tinggi, AI painting, generator gambar online, AI untuk UMKM, kreasi visual AI, AI untuk konten media sosial, gambar unik AI, AI untuk pemasaran, seni generatif, AI untuk bisnis, teknologi AI Indonesia, inovasi kreatif, AI untuk pengusaha',
  verification: {
    google: '3Mybm59m8--LyAZpVYIGHrVk1fSkYemj33bq5RBBdxA',
  },
  openGraph: {
    title: 'Kenthir AI Image Generator - Create Stunning Digital Art',
    description: 'Transform text into beautiful AI-generated artwork in various styles including photography, anime, digital painting and more.',
    url: 'https://Kenthir.my.id',
    type: 'website',
    images: [
      {
        url: 'https://www.ruangriung.my.id/assets/ruangriung.png',
        width: 1200,
        height: 630,
        alt: 'Kenthir AI Image Generator',
      },
    ],
  },
  icons: {
    icon: '/icon.ico',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  applicationName: 'Kenthir AI Image Generator',
  appleWebApp: {
    statusBarStyle: '#000000',
    capable: 'yes',
  },
  msapplication: {
    navbuttonColor: '#000000',
  },
};

export const viewport = {
  themeColor: '#000000',
};

// Variabel style tema kita letakkan di sini sebagai string
const themeStyles = `
  :root {
    --bg-color: #e0e0e0;
    --text-color: #313131;
    --shadow-light: #ffffff;
    --shadow-dark: #bebebe;
    --shadow-outset: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
    --shadow-inset: inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light);
  }
  .dark {
    --bg-color: #3a3a3a;
    --text-color: #e0e0e0;
    --shadow-light: #464646;
    --shadow-dark: #2e2e2e;
  }
  .neumorphic-input, .neumorphic-select, .neumorphic-card {
    background: var(--bg-color);
    color: var(--text-color);
    transition: background 0.3s ease, color 0.3s ease;
  }
  .neumorphic-card {
    box-shadow: var(--shadow-outset);
  }
  .neumorphic-input, .neumorphic-select {
    box-shadow: var(--shadow-inset);
    border: none;
  }
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject style Neumorphic langsung ke head */}
        <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body className={inter.className}>
        <Providers> {/* <-- Gunakan Providers baru di sini untuk membungkus children */}
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}