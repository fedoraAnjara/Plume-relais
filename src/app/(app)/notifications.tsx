import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../contexts/AuthContext";
import { useNotifications } from "../../hooks/useNotifications";
import {
    markAllNotificationsRead,
    markNotificationRead,
} from "../../lib/notifications";
import { COLORS, FONTS } from "../../theme/colors";
import type { AppNotification } from "../../types/models";

function iconForType(type: string): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case "vote_open":
      return "thumbs-up-outline";
    case "round_started":
      return "play-outline";
    case "story_completed":
      return "checkmark-circle-outline";
    default:
      return "notifications-outline";
  }
}

export default function NotificationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { notifications, unreadCount } = useNotifications(user?.uid);

  async function handleOpen(n: AppNotification) {
    if (!n.isRead) {
      try {
        await markNotificationRead(n.id);
      } catch {
        // silencieux : le marquage lu n'est pas critique
      }
    }
    if (n.storyId) {
      router.push(`/story/${n.storyId}`);
    }
  }

  async function handleMarkAll() {
    if (!user) return;
    try {
      await markAllNotificationsRead(user.uid);
    } catch {
      // silencieux
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <AppHeader title="Notifications" />

      {unreadCount > 0 && (
        <Pressable style={styles.markAll} onPress={handleMarkAll}>
          <Ionicons name="checkmark-done" size={16} color={COLORS.gold} />
          <Text style={styles.markAllText}>Tout marquer comme lu</Text>
        </Pressable>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="notifications-off-outline"
              size={40}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>Aucune notification.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.isRead && styles.cardUnread]}
            onPress={() => handleOpen(item)}
          >
            <View
              style={[
                styles.iconCircle,
                !item.isRead && styles.iconCircleUnread,
              ]}
            >
              <Ionicons
                name={iconForType(item.type)}
                size={18}
                color={!item.isRead ? COLORS.gold : COLORS.textMuted}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
            </View>
            {!item.isRead && <View style={styles.dot} />}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  markAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  markAllText: {
    fontFamily: FONTS.sansSemi,
    fontSize: 12,
    color: COLORS.gold,
  },
  empty: {
    alignItems: "center",
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontFamily: FONTS.serifItalic,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    padding: 14,
  },
  cardUnread: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.purpleSoft,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.input,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleUnread: {
    backgroundColor: "#3a301280",
  },
  cardTitle: {
    fontFamily: FONTS.sansBold,
    fontSize: 14,
    color: COLORS.white,
    marginBottom: 2,
  },
  cardBody: {
    fontFamily: FONTS.sans,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
});