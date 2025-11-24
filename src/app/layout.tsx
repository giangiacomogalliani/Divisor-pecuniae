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
  title: "Divisor pecuniae",
  description: "Pecunia Marii omnia emit, eam sapienter expende et cum amicis tuis communica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary/30`}
      >
        <div className="mx-auto max-w-4xl min-h-screen flex flex-col shadow-2xl shadow-black/50 bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
