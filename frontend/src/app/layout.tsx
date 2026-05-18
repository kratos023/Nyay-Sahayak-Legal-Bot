// frontend/src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import AnimatedBackground from "@/components/AnimatedBackground";
import OfflineBanner from "@/components/OfflineBanner";
import LanguagePicker from "@/components/LanguagePicker";
import FloatingToasts from "@/components/FloatingToasts";

export const metadata: Metadata = {
  title: "Nyay-Sahayak — AI Legal Assistant",
  description: "Multilingual AI-powered legal assistance for India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="h-screen overflow-hidden relative" style={{ height: '100dvh' }}>
        <AnimatedBackground />
        <LanguageProvider>
          <AuthProvider>
            <div className="relative z-10 h-full">
              {children}
            </div>
            <LanguagePicker />
            <FloatingToasts />
            <OfflineBanner />
          </AuthProvider>
        </LanguageProvider>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').catch(function(e) {
                console.warn('SW registration failed:', e);
              });
            });
          }
        `}} />
      </body>
    </html>
  );
}
