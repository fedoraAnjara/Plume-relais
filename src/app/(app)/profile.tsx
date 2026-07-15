import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
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
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import AppHeader from "../../components/AppHeader";
import { COLORS, FONTS } from "../../theme/colors";
import { Image } from "expo-image";
import { Alert } from "react-native";
import { updateAvatarUrl } from "../../lib/users";
import { pickAvatarImage, uploadAvatarImage } from "../../lib/upload";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [score, setScore] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
        setAvatarUrl(data.avatarUrl ?? null); // suppose que ce champ existe déjà ou existera
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

  async function handleChangeAvatar() {
    if (!user) return;
    try {
      const localUri = await pickAvatarImage();
      if (!localUri) return; // annulé
      setUploadingAvatar(true);
      const url = await uploadAvatarImage(localUri, user.uid);
      await updateAvatarUrl(user.uid, url);
      // Pas besoin de setAvatarUrl : le onSnapshot du profil le met à jour tout seul.
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue"
      );
    } finally {
      setUploadingAvatar(false);
    }
  }
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <AppHeader title="Mon Profil" />

      <ScrollView contentContainerStyle={styles.container}>
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

        <Text style={styles.username}>{displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>

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
            <Text style={styles.statLabel}>Histoires</Text>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statSub}>Complétées avec succès</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Votes</Text>
            <Text style={styles.statValue}>—</Text>
            <View style={styles.statSubRow}>
              <Ionicons name="star" size={11} color={COLORS.gold} />
              <Text style={styles.statSub}>Reçus par la communauté</Text>
            </View>
          </View>
        </View>
        {/* TODO backend : ces deux stats nécessitent un compteur d'histoires
            complétées et un total de votes reçus, agrégés côté Firestore
            (ex. via une Cloud Function qui incrémente des champs sur /users/{uid}
            quand une histoire passe à "completed" ou qu'un vote est casté). */}

        {/* Trophées */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Trophées</Text>
        </View>

        <View style={styles.badgeRow}>
          {(score ?? 0) >= 1 && (
            <View style={styles.badge}>
              <Ionicons name="ribbon" size={20} color={COLORS.gold} />
              <Text style={styles.badgeLabel}>Première plume</Text>
            </View>
          )}
          {(score ?? 0) >= 5 && (
            <View style={styles.badge}>
              <Ionicons name="star" size={20} color={COLORS.gold} />
              <Text style={styles.badgeLabel}>Conteur confirmé</Text>
            </View>
          )}
          {(score ?? 0) >= 10 && (
            <View style={styles.badge}>
              <Ionicons name="trophy" size={20} color={COLORS.gold} />
              <Text style={styles.badgeLabel}>Maître du récit</Text>
            </View>
          )}
          {(score ?? 0) === 0 && (
            <Text style={styles.trophyPlaceholderHint}>
              Fais retenir tes contributions pour débloquer des trophées.
            </Text>
          )}
        </View>
        {/* Menu */}
        <View style={styles.menuGroup}>
          <MenuRow icon="person-circle-outline" label="Modifier le profil" />
          <MenuRow
            icon="notifications-outline"
            label="Paramètres de notification"
          />
          <MenuRow icon="shield-checkmark-outline" label="Confidentialité" />
        </View>

        <Pressable style={styles.signOutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function MenuRow({ icon, label }: { icon: any; label: string }) {
  return (
    <Pressable style={styles.menuRow}>
      <Ionicons name={icon} size={20} color={COLORS.white} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
    </Pressable>
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

  username: {
    fontFamily: FONTS.serifBold,
    fontSize: 24,
    color: COLORS.white,
    marginTop: 16,
  },
  email: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
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
  seeAll: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 0.5,
    color: COLORS.gold,
  },
  trophyPlaceholderHint: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 19,
    marginBottom: 8,
  },

  menuGroup: {
    width: "100%",
    gap: 10,
    marginTop: 28,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  menuLabel: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 15,
    color: COLORS.white,
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
