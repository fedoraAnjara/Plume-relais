import {
  collection,
  getDocs,
  writeBatch,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { AppNotification, NotificationType } from "../types/models";

export async function notifyMembers(
  storyId: string,
  type: NotificationType,
  title: string,
  body: string,
  excludeUid?: string,
) {
  const membersSnap = await getDocs(
    collection(db, "stories", storyId, "members"),
  );
  const batch = writeBatch(db);
  membersSnap.docs.forEach((m) => {
    if (m.id === excludeUid) return;
    const ref = doc(collection(db, "notifications"));
    batch.set(ref, {
      userId: m.id,
      type,
      storyId,
      title,
      body,
      isRead: false,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export function subscribeNotifications(
  uid: string,
  callback: (notifs: AppNotification[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
  });
}

/**
 * Marque une notification comme lue.
 */
export async function markNotificationRead(notifId: string) {
  await updateDoc(doc(db, "notifications", notifId), { isRead: true });
}

/**
 * Marque toutes les notifications non lues de l'utilisateur comme lues.
 */
export async function markAllNotificationsRead(uid: string) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", uid),
    where("isRead", "==", false),
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.update(d.ref, { isRead: true }));
  await batch.commit();
}