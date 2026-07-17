import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../../theme/colors";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Histoires",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={22}
              color={color}
            />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color }]}>Histoires</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: "Créer",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.createBadge, focused && styles.createBadgeActive]}
            >
              <Ionicons name="add" size={26} color={COLORS.white} />
            </View>
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color, marginTop: 2 }]}>
              Créer
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[styles.tabLabel, { color }]}>Profil</Text>
          ),
        }}
      />
      {/* Écran de détail : caché de la tab bar */}
      <Tabs.Screen name="story/[id]" options={{ href: null }} />
      {/* Écran notifications : caché de la tab bar */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.bg,
    borderTopColor: COLORS.inputBorder,
    borderTopWidth: 1,
    height: 78,
    paddingTop: 10,
    paddingBottom: 20,
  },
  tabLabel: {
    fontFamily: FONTS.sans,
    fontSize: 11,
  },
  createBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -22,
    borderWidth: 3,
    borderColor: COLORS.bg,
  },
  createBadgeActive: {
    backgroundColor: COLORS.purple,
  },
});
