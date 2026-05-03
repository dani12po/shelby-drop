import "../styles/globals.css";
import { Inter, JetBrains_Mono } from 'next/font/google';
import Providers from "./providers";
import ThemeProvider from "@/components/ui/ThemeProvider";
import AnimatedBackground from "@/components/effects/AuroraBackground";
import ThemeTransition from "@/components/effects/ThemeTransition";
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
                  var saved = localStorage.getItem('shelby-theme');
                  // Map old theme keys to new ones
                  var map = { 'space': 'dark', 'aurora': 'light' };
                  var theme = map[saved] || saved;
                  // Validate: only 'dark' or 'light' are valid
                  if (theme !== 'dark' && theme !== 'light') theme = 'dark';
                  // Fix stale value in localStorage
                  if (saved !== theme) localStorage.setItem('shelby-theme', theme);
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          {/* Layer 1: Background — z-index 0 */}
          <AnimatedBackground />
          <ThemeTransition />

          {/* Layer 2: Content — z-index 10 */}
          <Providers>
            <NotificationProvider>
              <ExplorerModalProvider>
                <div className="relative z-10 min-h-screen flex flex-col">
                  {children}
                </div>

                {/* Layer 3: Notifikasi dan overlay */}
                <div className="relative z-[100]">
                  <NotificationCenterWrapper />
                </div>

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
