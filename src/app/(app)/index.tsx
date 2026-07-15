import { useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useMyStories } from "../../hooks/useMyStories";
import { useCollectionOnce } from "../../hooks/useCollectionOnce";
import {
  subscribeOpenStories,
  subscribeCompletedStories,
} from "../../lib/stories";
import AppHeader from "../../components/AppHeader";
import { COLORS, FONTS } from "../../theme/colors";

type Tab = "mine" | "open" | "completed";

export default function FeedScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("mine");

  const myStories = useMyStories(user?.uid);
  const openStories = useCollectionOnce(subscribeOpenStories);
  const completedStories = useCollectionOnce(subscribeCompletedStories);

  const data =
    tab === "mine"
      ? myStories
      : tab === "open"
        ? openStories
        : completedStories;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <AppHeader />

      <View style={styles.tabs}>
        {(["mine", "open", "completed"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === "mine"
                ? "Mes histoires"
                : t === "open"
                  ? "À rejoindre"
                  : "Terminées"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Rien à afficher pour l'instant.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/story/${item.id}`)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <View style={styles.cardMetaRow}>
              <Ionicons
                name={
                  item.status === "completed"
                    ? "checkmark-circle-outline"
                    : "time-outline"
                }
                size={13}
                color={COLORS.textMuted}
              />
              <Text style={styles.cardMeta}>
                {item.status === "completed"
                  ? "Terminée"
                  : `Tour ${item.currentRound}/${item.maxContributions}`}
                {item.blindMode ? " · À l'aveugle" : ""}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#18152280",
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.purpleSoft,
    borderColor: COLORS.purple,
  },
  tabText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  empty: {
    fontFamily: FONTS.serifItalic,
    textAlign: "center",
    color: COLORS.textMuted,
    marginTop: 60,
    fontSize: 14,
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  cardTitle: {
    fontFamily: FONTS.serifBold,
    fontSize: 17,
    color: COLORS.white,
  },
  cardMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardMeta: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
