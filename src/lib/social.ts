import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  type Unsubscribe,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Reaction {
  id: string;
  userId: string;
  emoji: string;
  createdAt: any;
}

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: any;
}

export async function toggleReaction(
  storyId: string,
  uid: string,
  emoji: string,
) {
  const reactionId = `${uid}_${emoji}`;
  const ref = doc(db, "stories", storyId, "reactions", reactionId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await deleteDoc(ref); // si deja réagi → on retire
  } else {
    await setDoc(ref, {
      userId: uid,
      emoji,
      createdAt: serverTimestamp(),
    });
  }
}

export function subscribeReactions(
  storyId: string,
  callback: (reactions: Reaction[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, "stories", storyId, "reactions"), (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reaction)),
  );
}

export async function addComment(storyId: string, uid: string, text: string) {
  await addDoc(collection(db, "stories", storyId, "comments"), {
    userId: uid,
    text,
    createdAt: serverTimestamp(),
  });
}

export function subscribeComments(
  storyId: string,
  callback: (comments: Comment[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "stories", storyId, "comments"),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment)),
  );
}
