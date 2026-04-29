"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

/* ===============================
   TYPES
================================ */
export type NotificationType = "success" | "error" | "info" | "warning";

export type NotificationMeta = {
  /** Transaction hash — shown as a clickable short link */
  txHash?: string;
  /** Network the transaction was confirmed on — used to build the correct explorer URL */
  network?: "testnet" | "shelbynet";
  /** Custom link URL (overrides auto-generated tx explorer URL) */
  link?: string;
  /** Link label text */
  linkLabel?: string;
  /** Auto-dismiss duration in ms (default 10000) */
  duration?: number;
};

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  meta?: NotificationMeta;
};

type NotificationContextType = {
  notifications: Notification[];
  notify: (type: NotificationType, message: string, meta?: NotificationMeta) => void;
  remove: (id: string) => void;
};

/* ===============================
   CONTEXT
================================ */
const NotificationContext = createContext<NotificationContextType | null>(null);

/* ===============================
   PROVIDER
================================ */
export function NotificationProvider({ children }: { children: ReactNode }): JSX.Element {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = (type: NotificationType, message: string, meta?: NotificationMeta) => {
    const id = crypto.randomUUID();
    const duration = meta?.duration ?? 10000;

    setNotifications((prev) => [...prev, { id, type, message, meta }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  };

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notifications, notify, remove }}>
      {children}
    </NotificationContext.Provider>
  );
}

/* ===============================
   HOOK
================================ */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
