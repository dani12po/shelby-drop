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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
