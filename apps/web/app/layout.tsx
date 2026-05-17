import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Match the parent portfolio (neryc.github.io/nery-cano-portfolio) font stack:
// Inter for body/UI, JetBrains Mono for code. Both are exposed as CSS vars so
// globals.css can wire them into Tailwind's --font-sans / --font-mono.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talk to my portfolio",
  description: "Chat with Nery Cano's CV, projects, and 164 Platzi certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
