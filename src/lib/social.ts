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

export async function addReaction(storyId: string, uid: string, emoji: string) {
  await addDoc(collection(db, "stories", storyId, "reactions"), {
    userId: uid,
    emoji,
    createdAt: serverTimestamp(),
  });
}

export async function removeReaction(storyId: string, reactionId: string) {
  await deleteDoc(doc(db, "stories", storyId, "reactions", reactionId));
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
