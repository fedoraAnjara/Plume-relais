// pushTokens.ts
import { Platform } from "react-native";
import { doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// expo-notifications est désactivé temporairement : le module natif plante
// à l'import même dans Expo Go sur Android (SDK 53+). À réactiver quand on
// passera sur un development build (voir semaine 4 / finition).

export async function registerForPushNotifications(uid: string) {
  console.warn(
    "Push notifications désactivées (Expo Go). " +
      "Nécessite un development build — voir pushTokens.ts.",
  );
  return;
}
