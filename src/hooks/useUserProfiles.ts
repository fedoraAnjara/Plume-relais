import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

interface UserProfile {
  username?: string;
  avatarUrl?: string;
}

export function useUserProfiles(uids: string[]) {
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    const missing = [...new Set(uids)].filter((id) => id && !profiles[id]);
    if (missing.length === 0) return;

    missing.forEach(async (uid) => {
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        setProfiles((prev) => ({ ...prev, [uid]: snap.data() as UserProfile }));
      }
    });
  }, [uids.join(",")]);

  return profiles;
}
