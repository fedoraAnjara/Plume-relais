import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { doc, onSnapshot, type Timestamp } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  PlayfairDisplay_700Bold,
} from "@expo-google-fonts/playfair-display";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { Image } from "expo-image";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useMyStories } from "../../hooks/useMyStories";
import AppHeader from "../../components/AppHeader";
import { COLORS, FONTS } from "../../theme/colors";
import { updateAvatarUrl, updateProfile } from "../../lib/users";
import { pickAvatarImage, uploadAvatarImage } from "../../lib/upload";

const MAX_BIO_LENGTH = 160;

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<Timestamp | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftUsername, setDraftUsername] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [saving, setSaving] = useState(false);

  const myStories = useMyStories(user?.uid);
  const ongoingCount = myStories.filter((s) => s.status === "open").length;

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    SpaceMono_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setScore(data.score ?? 0);
        setUsername(data.username ?? null);
        setBio(data.bio ?? null);
        setCreatedAt(data.createdAt ?? null);
        setAvatarUrl(data.avatarUrl ?? null);
      }
    });
  }, [user]);

  if (!user || !fontsLoaded) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator color={COLORS.gold} />
      </View>
    );
  }

  const displayName = username ?? user.email?.split("@")[0] ?? "Utilisateur";
  const initial = displayName.charAt(0).toUpperCase();

  const s = score ?? 0;
  const badgeCount = (s >= 1 ? 1 : 0) + (s >= 5 ? 1 : 0) + (s >= 10 ? 1 : 0);

  const memberSince = createdAt
    ? createdAt.toDate().toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      })
    : null;

  async function handleChangeAvatar() {
    if (!user) return;
    try {
      const localUri = await pickAvatarImage();
      if (!localUri) return;
      setUploadingAvatar(true);
      const url = await uploadAvatarImage(localUri, user.uid);
      await updateAvatarUrl(user.uid, url);
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    } finally {
      setUploadingAvatar(false);
    }
  }

  function startEditing() {
    setDraftUsername(username ?? "");
    setDraftBio(bio ?? "");
    setEditing(true);
  }

  async function handleSaveProfile() {
    if (!user) return;
    const trimmedName = draftUsername.trim();
    if (trimmedName.length < 2) {
      Alert.alert("Pseudo trop court", "2 caractères minimum.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile(user.uid, {
        username: trimmedName,
        bio: draftBio.trim(),
      });
      setEditing(false);
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <AppHeader title="Mon Profil" />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            {uploadingAvatar ? (
              <View style={styles.avatarFallback}>
                <ActivityIndicator color={COLORS.gold} />
              </View>
            ) : avatarUrl ? (
              <View style={styles.avatarImageWrapper}>
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                  transition={200}
                />
              </View>
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{initial}</Text>
              </View>
            )}
          </View>
          <Pressable
            style={styles.avatarEditBadge}
            onPress={handleChangeAvatar}
            disabled={uploadingAvatar}
          >
            <Ionicons name="pencil" size={14} color={COLORS.goldDark} />
          </Pressable>
        </View>

        {editing ? (
          <View style={styles.editBlock}>
            <Text style={styles.editLabel}>PSEUDO</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={draftUsername}
                onChangeText={setDraftUsername}
                placeholder="Ton pseudo"
                placeholderTextColor={COLORS.textMuted}
                maxLength={30}
              />
            </View>

            <Text style={[styles.editLabel, { marginTop: 16 }]}>BIO</Text>
            <View style={[styles.inputWrapper, styles.bioWrapper]}>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={draftBio}
                onChangeText={setDraftBio}
                placeholder="Quelques mots sur toi..."
                placeholderTextColor={COLORS.textMuted}
                multiline
                maxLength={MAX_BIO_LENGTH}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCount}>
              {draftBio.length} / {MAX_BIO_LENGTH}
            </Text>

            <View style={styles.editActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setEditing(false)}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.goldDark} />
                ) : (
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.nameRow}>
              <Text style={styles.username}>{displayName}</Text>
              <Pressable onPress={startEditing} hitSlop={8}>
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={COLORS.gold}
                />
              </Pressable>
            </View>
            <Text style={styles.email}>{user.email}</Text>
            {memberSince && (
              <Text style={styles.memberSince}>Membre depuis {memberSince}</Text>
            )}
            {bio ? (
              <Text style={styles.bio}>{bio}</Text>
            ) : (
              <Text style={styles.bioEmpty}>Aucune bio pour l'instant.</Text>
            )}
          </>
        )}

        {/* Impact littéraire */}
        <View style={styles.impactCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.impactLabel}>IMPACT LITTÉRAIRE</Text>
            <View style={styles.impactValueRow}>
              <Text style={styles.impactNumber}>{score ?? 0}</Text>
              <Text style={styles.impactUnit}>Contributions</Text>
            </View>
          </View>
          <View style={styles.impactIconCircle}>
            <Ionicons name="create-outline" size={22} color={COLORS.purple} />
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>En cours</Text>
            <Text style={styles.statValue}>{ongoingCount}</Text>
            <Text style={styles.statSub}>Histoires actives</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Trophées</Text>
            <Text style={styles.statValue}>{badgeCount}</Text>
            <View style={styles.statSubRow}>
              <Ionicons name="star" size={11} color={COLORS.gold} />
              <Text style={styles.statSub}>Débloqués</Text>
            </View>
          </View>
        </View>

        {/* Trophées */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trophées</Text>
        </View>

        <View style={styles.badgeRow}>
          {s >= 1 && (
            <View style={styles.badge}>
              <Ionicons name="ribbon" size={20} color={COLORS.gold} />
              <Text style={styles.badgeLabel}>Première plume</Text>
            </View>
          )}
          {s >= 5 && (
            <View style={styles.badge}>
              <Ionicons name="star" size={20} color={COLORS.gold} />
              <Text style={styles.badgeLabel}>Conteur confirmé</Text>
            </View>
          )}
          {s >= 10 && (
            <View style={styles.badge}>
              <Ionicons name="trophy" size={20} color={COLORS.gold} />
              <Text style={styles.badgeLabel}>Maître du récit</Text>
            </View>
          )}
          {s === 0 && (
            <Text style={styles.trophyPlaceholderHint}>
              Fais retenir tes contributions pour débloquer des trophées.
            </Text>
          )}
        </View>

        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  avatarWrapper: {
    marginTop: 12,
    position: "relative",
  },
  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 3,
    borderColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  avatarImageWrapper: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    backgroundColor: COLORS.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: FONTS.serifBold,
    fontSize: 40,
    color: COLORS.white,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: COLORS.bg,
  },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  username: {
    fontFamily: FONTS.serifBold,
    fontSize: 24,
    color: COLORS.white,
  },
  email: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  memberSince: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: COLORS.textLabel,
    marginTop: 6,
  },
  bio: {
    fontFamily: FONTS.serifItalic,
    fontSize: 14,
    color: COLORS.white,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  bioEmpty: {
    fontFamily: FONTS.serifItalic,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 12,
  },

  editBlock: {
    width: "100%",
    marginTop: 20,
  },
  editLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.gold,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: "center",
  },
  bioWrapper: {
    height: 90,
    paddingVertical: 12,
  },
  input: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    color: COLORS.white,
  },
  bioInput: {
    flex: 1,
  },
  charCount: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textLabel,
    textAlign: "right",
    marginTop: 6,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.goldDark,
  },

  impactCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 18,
    padding: 18,
    marginTop: 28,
  },
  impactLabel: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.gold,
    marginBottom: 8,
  },
  impactValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  impactNumber: {
    fontFamily: FONTS.serifBold,
    fontSize: 30,
    color: COLORS.white,
  },
  impactUnit: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    color: COLORS.purple,
  },
  impactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#231d34",
    alignItems: "center",
    justifyContent: "center",
  },

  statsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 14,
    marginTop: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  statLabel: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 28,
    color: COLORS.white,
    marginVertical: 2,
  },
  statSub: {
    fontFamily: FONTS.sans,
    fontSize: 11,
    color: COLORS.textLabel,
  },
  statSubRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 32,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 24,
    color: COLORS.white,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    width: "100%",
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badgeLabel: {
    fontFamily: FONTS.sansSemi,
    fontSize: 13,
    color: COLORS.white,
  },
  trophyPlaceholderHint: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 8,
  },

  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    backgroundColor: "#2a141a",
    borderWidth: 1,
    borderColor: "#4a2530",
    borderRadius: 14,
    height: 54,
    marginTop: 20,
  },
  signOutText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 15,
    color: COLORS.danger,
  },
});