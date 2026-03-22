import "../styles/globals.css";
import { Inter, JetBrains_Mono } from 'next/font/google';
import Providers from "./providers";
import ThemeProvider from "@/components/ui/ThemeProvider";
import AnimatedBackground from "@/components/effects/AnimatedBackground";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shelby Drop — Decentralized File Storage on Aptos',
  description: 'Upload, browse, and share files on Shelby Network using only your wallet address. Built on Aptos blockchain.',
  keywords: 'Shelby, Aptos, blockchain, decentralized storage, Web3, file upload',
  openGraph: {
    title: 'Shelby Drop — Own Your Files. Power the Chain.',
    description: 'Decentralized file storage on Aptos blockchain via Shelby Network.',
    url: 'https://shelby-drop.vercel.app',
    siteName: 'Shelby Drop',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shelby Drop',
    description: 'Decentralized file storage on Aptos blockchain.',
    creator: 'Dani.xyz',
  },
};

import {
  NotificationProvider,
} from "@/components/notifications/useNotifications";
import NotificationCenterWrapper from "@/components/notifications/NotificationCenterWrapper";

import {
  ExplorerModalProvider,
} from "@/components/explorer/core/useExplorerModalController";
import ExplorerModalRoot from "@/components/explorer/ExplorerModalRoot";

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const mono = JetBrains_Mono({ 
  subsets: ['latin'], 
  variable: '--font-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('shelby-theme');
                  if (theme) {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <ThemeProvider>
          {/* Layer 1: Background — paling bawah */}
          <AnimatedBackground />
          <Providers>
            <NotificationProvider>
              {/* Layer 2: Semua konten — WAJIB z-index lebih tinggi */}
              <div style={{
                position: 'relative',
                zIndex: 10,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {children}
              </div>

              {/* Layer 3: Notifikasi dan overlay */}
              <div style={{ position: 'relative', zIndex: 100 }}>
                <NotificationCenterWrapper />
              </div>

              <ExplorerModalProvider>
                {/* =========================
                    EXPLORER MODAL ROOT
                ========================== */}
                <ExplorerModalRoot />

                {/* =========================
                    MODAL ROOT (IMPORTANT)
                    DO NOT REMOVE
                ========================== */}
                <div id="modal-root" />
              </ExplorerModalProvider>
            </NotificationProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
