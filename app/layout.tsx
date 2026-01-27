import "../styles/globals.css";
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="overflow-hidden">
      <body className="overflow-hidden">
        <Providers>
          <NotificationProvider>
            <ExplorerModalProvider>
              {/* =========================
                  MAIN APP CONTENT
              ========================== */}
              {children}

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
