import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PersonalizationProvider } from "@/lib/PersonalizationContext";

export const metadata: Metadata = {
  title: "How to Flirt - Your AI Dating Coach",
  description: "Level up your flirting game with AI-powered text suggestions",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Build timestamp to force cache invalidation
  const buildTime = new Date().toISOString();
  return (
    <html lang="en" data-build-time={buildTime} data-version="1.2.0">
      <body className="antialiased">
        <PersonalizationProvider>
          {children}
        </PersonalizationProvider>
      </body>
    </html>
  );
}
