import {
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Story, StoryVisibility } from "../types/models";

interface CreateStoryInput {
  title: string;
  opening: string;
  maxContributions?: number;
  turnDurationSecs?: number;
  visibility?: StoryVisibility;
  blindMode?: boolean;
  revealLast?: number;
  writerLimitSecs?: number | null;
  coverUrl?: string | null;
}

export async function createStory(uid: string, input: CreateStoryInput) {
  const storyRef = doc(collection(db, "stories"));
  const roundRef = doc(collection(db, "stories", storyRef.id, "rounds"));
  const memberRef = doc(db, "stories", storyRef.id, "members", uid);
  const membershipMirrorRef = doc(db, "users", uid, "memberships", storyRef.id);
  const paragraphRef = doc(db, "stories", storyRef.id, "paragraphs", "0000");

  const turnDurationSecs = input.turnDurationSecs ?? 86400;

  // ⚠️ TEMPORAIRE — debug uniquement, à remplacer par les batches ensuite

  console.log("→ writing story", storyRef.id);
  try {
    await setDoc(storyRef, {
      title: input.title,
      coverUrl: input.coverUrl ?? null,
      createdBy: uid,
      visibility: input.visibility ?? "public",
      status: "open",
      blindMode: input.blindMode ?? true,
      revealLast: input.revealLast ?? 1,
      maxContributions: input.maxContributions ?? 10,
      turnDurationSecs,
      writerLimitSecs: input.writerLimitSecs ?? null,
      currentRound: 1,
      currentRoundId: roundRef.id,
      createdAt: serverTimestamp(),
      completedAt: null,
    });
    console.log("✓ story ok");
  } catch (e) {
    console.error("✗ FAILED at story:", e);
    throw e;
  }

  console.log("→ writing member (owner)");
  try {
    await setDoc(memberRef, { role: "owner", joinedAt: serverTimestamp() });
    console.log("✓ member ok");
  } catch (e) {
    console.error("✗ FAILED at member:", e);
    throw e;
  }

  console.log("→ writing membership mirror");
  try {
    await setDoc(membershipMirrorRef, { joinedAt: serverTimestamp() });
    console.log("✓ membership mirror ok");
  } catch (e) {
    console.error("✗ FAILED at membership mirror:", e);
    throw e;
  }

  console.log("→ writing paragraph 0000");
  try {
    await setDoc(paragraphRef, {
      content: input.opening,
      authorId: uid,
      roundId: null,
      createdAt: serverTimestamp(),
    });
    console.log("✓ paragraph ok");
  } catch (e) {
    console.error("✗ FAILED at paragraph:", e);
    throw e;
  }

  console.log("→ writing round");
  try {
    await setDoc(roundRef, {
      roundNumber: 1,
      status: "open",
      openedAt: serverTimestamp(),
      closesAt: Date.now() + turnDurationSecs * 1000,
      closedAt: null,
      winnerId: null,
    });
    console.log("✓ round ok");
  } catch (e) {
    console.error("✗ FAILED at round:", e);
    throw e;
  }

  return storyRef.id;
}

export async function joinStory(storyId: string, uid: string) {
  const storySnap = await getDoc(doc(db, "stories", storyId));
  if (!storySnap.exists()) throw new Error("Histoire introuvable");
  const story = storySnap.data();
  if (story.visibility !== "public" || story.status !== "open") {
    throw new Error("Cette histoire ne peut pas être rejointe");
  }
  const batch = writeBatch(db);
  batch.set(
    doc(db, "stories", storyId, "members", uid),
    { role: "member", joinedAt: serverTimestamp() },
    { merge: true },
  );
  batch.set(
    doc(db, "users", uid, "memberships", storyId),
    { joinedAt: serverTimestamp() },
    { merge: true },
  );
  await batch.commit();
}

export function subscribeMembershipIds(
  uid: string,
  callback: (storyIds: string[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, "users", uid, "memberships"), (snap) => {
    callback(snap.docs.map((d) => d.id));
  });
}

export function subscribeOpenStories(
  callback: (stories: Story[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "stories"),
    where("visibility", "==", "public"),
    where("status", "==", "open"),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Story)),
  );
}

export function subscribeCompletedStories(
  callback: (stories: Story[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "stories"),
    where("visibility", "==", "public"),
    where("status", "==", "completed"),
    orderBy("completedAt", "desc"),
  );
  return onSnapshot(q, (snap) =>
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Story)),
  );
}

export function subscribeStory(
  storyId: string,
  callback: (story: Story | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "stories", storyId),
    (snap) =>
      callback(
        snap.exists() ? ({ id: snap.id, ...snap.data() } as Story) : null,
      ),
    (err) => {
      console.error("subscribeStory error:", err);
      onError?.(err as unknown as Error);
    },
  );
}
