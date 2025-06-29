// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import { SpeedInsights } from "@vercel/speed-insights/next";
// Hapus import ThemeProvider yang lama
// import { ThemeProvider } from "./components/ThemeProvider";

import { Providers } from './providers'; // <-- Import Providers baru dari file providers.js

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  manifest: "/manifest.json",
  title: 'RuangRuang AI Image Generator - Create Stunning Digital Art',
  description: 'Generate stunning AI art with multiple styles - from photorealistic to anime, cyberpunk to Studio Ghibli. Create professional photography, digital art, oil paintings and more with advanced AI image generation.',
  // ... (sisa metadata Anda tetap sama)
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