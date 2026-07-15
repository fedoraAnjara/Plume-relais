import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";


export async function updateAvatarUrl(uid: string, avatarUrl: string) {
  await updateDoc(doc(db, "users", uid), { avatarUrl });
}

export async function updateProfile(
  uid: string,
  data: { username?: string; bio?: string },
) {
  await updateDoc(doc(db, "users", uid), data);
}