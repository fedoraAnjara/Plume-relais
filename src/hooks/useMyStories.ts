import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { subscribeMembershipIds } from "../lib/stories";
import type { Story } from "../types/models";

export function useMyStories(uid: string | undefined) {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (!uid) return;
    const unsubStoryListeners: Record<string, () => void> = {};

    const unsubIds = subscribeMembershipIds(uid, (ids) => {
      // Nettoie les listeners des histoires quittées.
      Object.keys(unsubStoryListeners).forEach((id) => {
        if (!ids.includes(id)) {
          unsubStoryListeners[id]();
          delete unsubStoryListeners[id];
          setStories((prev) => prev.filter((s) => s.id !== id));
        }
      });
      // Ajoute un listener pour les nouvelles.
      ids.forEach((id) => {
        if (unsubStoryListeners[id]) return;
        unsubStoryListeners[id] = onSnapshot(doc(db, "stories", id), (snap) => {
          if (!snap.exists()) return;
          const story = { id: snap.id, ...snap.data() } as Story;
          setStories((prev) => {
            const others = prev.filter((s) => s.id !== story.id);
            return [...others, story].sort((a, b) => b.createdAt - a.createdAt);
          });
        });
      });
    });

    return () => {
      unsubIds();
      Object.values(unsubStoryListeners).forEach((fn) => fn());
    };
  }, [uid]);

  return stories;
}
