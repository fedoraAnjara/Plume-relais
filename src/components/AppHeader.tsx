import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { COLORS, FONTS } from "../theme/colors";

export default function AppHeader({
  title = "Plume Relais",
}: {
  title?: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { unreadCount } = useNotifications(user?.uid);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <View style={styles.brand}>
        <Ionicons name="book-outline" size={20} color={COLORS.gold} />
        <Text style={styles.brandText}>{title}</Text>
      </View>

      <View style={styles.actions}>
        {/* Cloche de notifications */}
        <Pressable
          onPress={() => router.push("/(app)/notifications")}
          hitSlop={10}
          style={styles.iconButton}
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={COLORS.textMuted}
          />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </Pressable>

        {/* Paramètres / profil */}
        <Pressable onPress={() => router.push("/(app)/profile")} hitSlop={10}>
          <Ionicons
            name="settings-outline"
            size={22}
            color={COLORS.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontFamily: FONTS.serifBold,
    fontSize: 20,
    color: COLORS.gold,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  iconButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    fontFamily: FONTS.sansBold,
    fontSize: 9,
    color: COLORS.white,
  },
});