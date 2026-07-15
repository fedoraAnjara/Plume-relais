import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Proposal } from "../types/models";
import { notifyMembers } from "./notifications";

export async function submitProposal(
  storyId: string,
  roundId: string,
  uid: string,
  content: string,
  storyTitle?: string,
) {
  const ref = doc(db, "stories", storyId, "rounds", roundId, "proposals", uid);
  await setDoc(
    ref,
    {
      content,
      status: "pending",
      voteCount: 0,
      createdAt: Date.now(),
    },
    { merge: true },
  );

  if (storyTitle) {
    const proposalsSnap = await getDocs(
      collection(db, "stories", storyId, "rounds", roundId, "proposals"),
    );
    // Notifie une seule fois, au moment où une 2e proposition rend le vote pertinent.
    if (proposalsSnap.size === 2) {
      await notifyMembers(
        storyId,
        "vote_open",
        "Vote ouvert",
        `Plusieurs suites ont été proposées pour "${storyTitle}", à toi de voter !`,
        uid,
      );
    }
  }
}

export function subscribeProposals(
  storyId: string,
  roundId: string,
  callback: (proposals: Proposal[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, "stories", storyId, "rounds", roundId, "proposals"),
    (snap) => {
      callback(
        snap.docs.map((d) => ({ authorId: d.id, ...(d.data() as any) })),
      );
    },
    (err) => {
      console.error("subscribeProposals error:", err);
      onError?.(err as unknown as Error);
    },
  );
}
