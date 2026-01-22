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
  message: string;
  type: NotificationType;
};

type NotificationContextValue = {
  notifications: Notification[];
  notify: (
    message: string,
    type?: NotificationType
  ) => void;
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
    (
      message: string,
      type: NotificationType = "info"
    ) => {
      const id = crypto.randomUUID();

      setNotifications((prev) => [
        ...prev,
        { id, message, type },
      ]);

      // auto dismiss
      setTimeout(() => {
        remove(id);
      }, 3000);
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
