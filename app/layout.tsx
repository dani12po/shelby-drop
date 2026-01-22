import "../styles/globals.css";
import Providers from "./providers";
import {
  NotificationProvider,
} from "@/components/notifications/useNotifications";
import NotificationCenter from "@/components/notifications/NotificationCenter";

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
            {children}
            <NotificationCenter />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}
