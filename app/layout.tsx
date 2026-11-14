import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Bricolage_Grotesque, Caveat, Geist_Mono } from "next/font/google";
import "./globals.css";

// Body text: a typeface drawn for legibility (clear I / l / 1 and 0 / O), which matters when the
// content is dense technical prose. The study guides load the same families (scripts/study/theme.css).
const body = Atkinson_Hyperlegible_Next({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  adjustFontFallback: false, // next/font has no fallback metrics for this family yet
});

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

// Handwriting, used only for the whiteboard sketch on the homepage.
const hand = Caveat({
  variable: "--font-hand",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "./components/ThemeProvider";

export const metadata: Metadata = {
  title: "DevSpar",
  description: "Full-stack interview prep you can explain on a whiteboard: study guides, diagrams, flashcards and an AI mock interviewer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${body.variable} ${display.variable} ${hand.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
