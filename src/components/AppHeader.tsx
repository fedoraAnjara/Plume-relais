import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS } from "../theme/colors";

export default function AppHeader({ title = "Plume Relais" }: { title?: string }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Ionicons name="book-outline" size={20} color={COLORS.gold} />
        <Text style={styles.brandText}>{title}</Text>
      </View>
      <Pressable onPress={() => router.push("/(app)/profile")} hitSlop={10}>
        <Ionicons name="settings-outline" size={22} color={COLORS.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
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
});