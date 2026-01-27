"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  ReactNode,
} from "react";

export type NotificationType =
  | "info"
  | "success"
  | "error";

export type Notification = {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
  txHash?: string;
  wallet?: string;
  error?: string;
};

type NotificationContextValue = {
  notifications: Notification[];
  notify: (options: {
    title?: string;
    message: string;
    type?: NotificationType;
    txHash?: string;
    wallet?: string;
    error?: string;
  }) => void;
  remove: (id: string) => void;
};

const NotificationContext =
  createContext<NotificationContextValue | null>(
    null
  );

export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const remove = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  }, []);

  const notify = useCallback(
    (options: {
      title?: string;
      message: string;
      type?: NotificationType;
      txHash?: string;
      wallet?: string;
      error?: string;
    }) => {
      const id = crypto.randomUUID();

      setNotifications((prev) => [
        ...prev,
        { 
          id, 
          title: options.title,
          message: options.message, 
          type: options.type || "info",
          txHash: options.txHash,
          wallet: options.wallet,
          error: options.error,
        },
      ]);

      // auto dismiss
      setTimeout(() => {
        remove(id);
      }, 5000); // Increased to 5s for transaction info reading
    },
    [remove]
  );

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, remove }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotificationContext must be used inside NotificationProvider"
    );
  }
  return ctx;
}
