import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { setLogLevel } from "firebase/firestore";
setLogLevel("debug");

export function useMembership(
  storyId: string | undefined,
  uid: string | undefined,
) {
  const [isMember, setIsMember] = useState(false);
  const [role, setRole] = useState<"owner" | "member" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storyId || !uid) {
      setIsMember(false);
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    return onSnapshot(
      doc(db, "stories", storyId, "members", uid),
      (snap) => {
        setIsMember(snap.exists());
        setRole(
          snap.exists() ? (snap.data().role as "owner" | "member") : null,
        );
        setLoading(false);
      },
      (err) => {
        console.error("useMembership error:", err);
        setLoading(false);
      },
    );
  }, [storyId, uid]);

  return { isMember, role, loading };
}
