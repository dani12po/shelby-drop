import "../styles/globals.css";
import { Inter, JetBrains_Mono } from 'next/font/google';
import Providers from "./providers";

import {
  NotificationProvider,
} from "@/components/notifications/useNotifications";
import NotificationCenterWrapper from "@/components/notifications/NotificationCenterWrapper";

import {
  ExplorerModalProvider,
} from "@/components/explorer/core/useExplorerModalController";
import ExplorerModalRoot from "@/components/explorer/ExplorerModalRoot";

import { SocialMediaIcons } from "@/components/ui/SocialMediaIcons";

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
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Providers>
          <NotificationProvider>
            <ExplorerModalProvider>
              {/* =========================
                  MAIN APP CONTENT
              ========================== */}
              <div style={{ flex: 1 }}>
                {children}
              </div>

              {/* =========================
                  GLOBAL NOTIFICATIONS
              ========================== */}
              <NotificationCenterWrapper />

              {/* =========================
                  EXPLORER MODAL ROOT
              ========================== */}
              <ExplorerModalRoot />

              {/* =========================
                  SOCIAL MEDIA ICONS
              ========================== */}
              <SocialMediaIcons />

              {/* =========================
                  MODAL ROOT (IMPORTANT)
                  DO NOT REMOVE
              ========================== */}
              <div id="modal-root" />
            </ExplorerModalProvider>
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
