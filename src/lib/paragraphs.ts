import {
  doc,
  collection,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Paragraph } from "../types/models";

/**
 * Lecture d'UN paragraphe précis (ex: "0000"). Toujours sûr à appeler,
 * même en mode aveugle, car les rules évaluent ce doc individuellement.
 */
export function subscribeParagraph(
  storyId: string,
  position: string,
  callback: (paragraph: Paragraph | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "stories", storyId, "paragraphs", position),
    (snap) =>
      callback(
        snap.exists() ? ({ id: snap.id, ...snap.data() } as Paragraph) : null,
      ),
    (err) => {
      console.error("subscribeParagraph error:", err);
      onError?.(err as unknown as Error);
    },
  );
}

export function subscribeAllParagraphs(
  storyId: string,
  callback: (paragraphs: Paragraph[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(db, "stories", storyId, "paragraphs"),
    (snap) => {
      const paragraphs = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as Paragraph)
        .sort((a, b) => a.id.localeCompare(b.id));
      callback(paragraphs);
    },
    (err) => {
      console.error("subscribeAllParagraphs error:", err);
      onError?.(err as unknown as Error);
    },
  );
}
