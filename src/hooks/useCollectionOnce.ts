import { useEffect, useState } from "react";
import type { Unsubscribe } from "firebase/firestore";

export function useCollectionOnce<T>(
  subscribe: (cb: (items: T[]) => void) => Unsubscribe,
): T[] {
  const [items, setItems] = useState<T[]>([]);
  useEffect(() => {
    const unsub = subscribe(setItems);
    return unsub;
  }, []);
  return items;
}
