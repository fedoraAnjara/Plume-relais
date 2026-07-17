import { useEffect, useState } from "react";
import { subscribeNotifications } from "../lib/notifications";
import type { AppNotification } from "../types/models";

export function useNotifications(uid: string | undefined) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!uid) {
      setNotifications([]);
      return;
    }
    return subscribeNotifications(uid, setNotifications);
  }, [uid]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount };
}