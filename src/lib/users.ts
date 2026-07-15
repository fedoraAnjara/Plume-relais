import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function updateAvatarUrl(uid: string, avatarUrl: string) {
  await updateDoc(doc(db, "users", uid), { avatarUrl });
}