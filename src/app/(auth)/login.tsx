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

export default function LoginScreen() {
  const { signIn } = useAuth();
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
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      Alert.alert("Connexion impossible", message);
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
        {/* Header */}
        <View style={styles.badge}>
          <Ionicons name="reader-outline" size={26} color={COLORS.gold} />
          <View style={styles.badgePencil}>
            <Ionicons name="pencil" size={12} color={COLORS.gold} />
          </View>
        </View>

        <Text style={styles.title}>Plume Relais</Text>
        <Text style={styles.subtitle}>
          Le relais des récits éternels, à l'heure du{"\n"}minuit créatif.
        </Text>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.label}>COURRIEL</Text>
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

          <View style={styles.labelRow}>
            <Text style={styles.label}>MOT DE PASSE</Text>
            <Pressable>
              <Text style={styles.linkSmall}>Oublié ?</Text>
            </Pressable>
          </View>
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
                <Text style={styles.buttonText}>Se connecter</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.goldDark}
                />
              </>
            )}
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU CONTINUER AVEC</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialRow}>
            <Pressable style={styles.socialButton}>
              <Ionicons name="create-outline" size={20} color={COLORS.white} />
            </Pressable>
            <Pressable style={styles.socialButton}>
              <Ionicons name="book-outline" size={20} color={COLORS.white} />
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Pas de compte ? </Text>
            <Link href="/(auth)/register" style={styles.footerLink}>
              Inscris-toi
            </Link>
          </View>
        </View>

        {/* Bottom divider */}
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
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },
  linkSmall: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 12,
    color: COLORS.purple,
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
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  dividerText: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.textLabel,
  },
  socialRow: {
    flexDirection: "row",
    gap: 14,
  },
  socialButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignItems: "center",
    justifyContent: "center",
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
