// app/providers.js
"use client"; // <-- Ini menandakan bahwa ini adalah Client Component

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import * as React from "react"; // Pastikan React diimpor

export function Providers({ children }) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </NextThemesProvider>
    </SessionProvider>
  );
}