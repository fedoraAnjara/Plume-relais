import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  useFonts,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_400Regular_Italic,
} from "@expo-google-fonts/playfair-display";
import { SpaceMono_400Regular } from "@expo-google-fonts/space-mono";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from "@expo-google-fonts/plus-jakarta-sans";
import { useAuth } from "../../contexts/AuthContext";

const COLORS = {
  bg: "#0d0b14",
  glow: "rgba(233, 198, 85, 0.10)",
  card: "#18152280",
  cardBorder: "#2a264055",
  input: "#0f0d18",
  inputBorder: "#252140",
  gold: "#e9c655",
  goldDark: "#211703",
  purple: "#a996f0",
  textMuted: "#9591a8",
  textLabel: "#7d7a8f",
  white: "#f2f0f7",
};

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    SpaceMono_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  async function handleSubmit() {
    if (!username || !email || !password) return;
    if (username.length < 2 || username.length > 30) {
      Alert.alert("Pseudo invalide", "Entre 2 et 30 caractères.");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, username);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      Alert.alert("Inscription impossible", message);
    } finally {
      setLoading(false);
    }
  }

  if (!fontsLoaded)
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[COLORS.glow, "transparent"]}
          style={styles.glowTop}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.badge}>
          <Ionicons name="reader-outline" size={26} color={COLORS.gold} />
          <View style={styles.badgePencil}>
            <Ionicons name="pencil" size={12} color={COLORS.gold} />
          </View>
        </View>

        <Text style={styles.title}>Plume Relais</Text>
        <Text style={styles.subtitle}>
          Rejoins le récit,{"\n"}une plume à la fois.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>PSEUDO</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <TextInput
              style={styles.input}
              placeholder="votre-pseudo"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>COURRIEL</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="at-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="votre@plume.com"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={[styles.label, { marginTop: 18 }]}>MOT DE PASSE</Text>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="lock-closed-outline"
              size={18}
              color={COLORS.textMuted}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.goldDark} />
            ) : (
              <>
                <Text style={styles.buttonText}>S'inscrire</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.goldDark}
                />
              </>
            )}
          </Pressable>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <Link href="/(auth)/login" style={styles.footerLink}>
              Connecte-toi
            </Link>
          </View>
        </View>

        <View style={styles.bottomDividerRow}>
          <View style={styles.bottomLine} />
          <Ionicons
            name="pencil-outline"
            size={14}
            color={COLORS.gold}
            style={{ marginHorizontal: 12 }}
          />
          <View style={styles.bottomLine} />
        </View>
        <Text style={styles.version}>NOCTURNAL MUSE v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  glowTop: {
    position: "absolute",
    top: -100,
    left: -100,
    right: -100,
    height: 350,
  },
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 40,
  },
  badge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#1c1828",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  badgePencil: {
    position: "absolute",
    bottom: 14,
    right: 14,
  },
  title: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 36,
    color: COLORS.gold,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: "PlayfairDisplay_400Regular_Italic",
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    padding: 24,
  },
  label: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.textLabel,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  input: {
    flex: 1,
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 15,
    color: COLORS.white,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    height: 56,
    marginTop: 24,
  },
  buttonText: {
    fontFamily: "PlayfairDisplay_700Bold",
    fontSize: 18,
    color: COLORS.goldDark,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontFamily: "PlusJakartaSans_400Regular",
    fontSize: 14,
    color: COLORS.textMuted,
  },
  footerLink: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: COLORS.purple,
  },
  bottomDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
  },
  bottomLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  version: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.textLabel,
    marginTop: 16,
  },
});
