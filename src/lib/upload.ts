import * as ImagePicker from "expo-image-picker";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Sélection d'une image au format paysage (couverture d'histoire).
 */
export async function pickImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Permission d'accès aux photos refusée.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"], // SDK 54 : MediaTypeOptions est déprécié
    allowsEditing: true,
    aspect: [16, 9],
    quality: 0.7,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

/**
 * Sélection d'une image carrée (avatar).
 */
export async function pickAvatarImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error("Permission d'accès aux photos refusée.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (result.canceled) return null;
  return result.assets[0].uri;
}

export async function uploadCoverImage(
  localUri: string,
  storyId: string,
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Configuration Cloudinary manquante (EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME / EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET).",
    );
  }

  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    type: "image/jpeg",
    name: `${storyId}-cover.jpg`,
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `plume-relais/stories/${storyId}`);
  formData.append("public_id", "cover");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary upload error:", data);
    throw new Error(data.error?.message ?? "Échec de l'upload de l'image.");
  }

  return data.secure_url as string;
}

/**
 * Upload d'un avatar vers Cloudinary, rangé dans avatars/{uid}.
 */
export async function uploadAvatarImage(
  localUri: string,
  uid: string,
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Configuration Cloudinary manquante (EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME / EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET).",
    );
  }

  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    type: "image/jpeg",
    name: `${uid}-avatar.jpg`,
  } as any);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `plume-relais/avatars/${uid}`);
  formData.append("public_id", "avatar");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Cloudinary upload error:", data);
    throw new Error(data.error?.message ?? "Échec de l'upload de l'image.");
  }

  return data.secure_url as string;
}