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
export type NotificationType =
  | "success"
  | "error"
  | "info"
  | "warning";

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
};

type NotificationContextType = {
  notifications: Notification[];
  notify: (type: NotificationType, message: string) => void;
  remove: (id: string) => void;
};

/* ===============================
   CONTEXT
================================ */
const NotificationContext =
  createContext<NotificationContextType | null>(null);

/* ===============================
   PROVIDER
================================ */
export function NotificationProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const notify = (
    type: NotificationType,
    message: string
  ) => {
    const id = crypto.randomUUID();

    setNotifications((prev) => [
      ...prev,
      { id, type, message },
    ]);

    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== id)
      );
    }, 4000);
  };

  const remove = (id: string) => {
    setNotifications((prev) =>
      prev.filter((n) => n.id !== id)
    );
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, notify, remove }}
    >
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
    throw new Error(
      "useNotifications must be used within NotificationProvider"
    );
  }

  return context;
}
