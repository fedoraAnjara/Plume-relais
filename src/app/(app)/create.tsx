import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
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
import { createStory } from "../../lib/stories";
import AppHeader from "../../components/AppHeader";
import { COLORS, FONTS } from "../../theme/colors";

export default function CreateStoryScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [opening, setOpening] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [blindMode, setBlindMode] = useState(true);
  const [maxContributions, setMaxContributions] = useState(10);
  const [turnDurationHours, setTurnDurationHours] = useState(24);
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
    if (!user) return;
    if (title.trim().length < 3) {
      Alert.alert("Titre trop court", "3 caractères minimum.");
      return;
    }
    if (opening.trim().length < 1) {
      Alert.alert("Paragraphe d'ouverture requis");
      return;
    }
    setLoading(true);
    try {
      const storyId = await createStory(user.uid, {
        title: title.trim(),
        opening: opening.trim(),
        visibility,
        blindMode,
        maxContributions,
        turnDurationSecs: turnDurationHours * 3600,
      });
      router.replace(`/story/${storyId}`);
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!fontsLoaded)
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Nouvel Écrin</Text>
        <Text style={styles.subtitle}>
          Démarrez un récit qui traversera les{"\n"}nuits.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>TITRE DE L'ŒUVRE</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Le nom de l'histoire..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <Text style={[styles.label, { marginTop: 20 }]}>
            PARAGRAPHE D'OUVERTURE
          </Text>
          <View style={[styles.inputWrapper, styles.textareaWrapper]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={opening}
              onChangeText={setOpening}
              placeholder="Il était une fois..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Mode à l'aveugle */}
          <Pressable
            style={styles.toggleRow}
            onPress={() => setBlindMode((v) => !v)}
          >
            <Ionicons
              name={blindMode ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={COLORS.purple}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Mode à l'aveugle</Text>
              <Text style={styles.toggleSubtitle}>
                CACHER LES TEXTES PRÉCÉDENTS
              </Text>
            </View>
            <Switch value={blindMode} onValueChange={setBlindMode} />
          </Pressable>

          {/* Histoire privée */}
          <Pressable
            style={styles.toggleRow}
            onPress={() =>
              setVisibility((v) => (v === "private" ? "public" : "private"))
            }
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.purple}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Histoire privée</Text>
              <Text style={styles.toggleSubtitle}>
                SUR INVITATION UNIQUEMENT
              </Text>
            </View>
            <Switch
              value={visibility === "private"}
              onValueChange={(v) => setVisibility(v ? "private" : "public")}
            />
          </Pressable>

          {/* Contributions slider */}
          <View style={styles.sliderBlock}>
            <View style={styles.sliderHeader}>
              <Text style={styles.label}>CONTRIBUTIONS</Text>
              <Text style={styles.sliderValue}>{maxContributions}</Text>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={maxContributions}
              onValueChange={setMaxContributions}
              minimumTrackTintColor={COLORS.gold}
              maximumTrackTintColor={COLORS.inputBorder}
              thumbTintColor={COLORS.gold}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>MIN: 1</Text>
              <Text style={styles.sliderLabelText}>MAX: 50</Text>
            </View>
          </View>

          {/* Turn duration slider */}
          <View style={styles.sliderBlock}>
            <View style={styles.sliderHeader}>
              <Text style={styles.label}>TEMPS / TOUR</Text>
              <Text style={styles.sliderValue}>{turnDurationHours}h</Text>
            </View>
            <Slider
              minimumValue={1}
              maximumValue={72}
              step={1}
              value={turnDurationHours}
              onValueChange={setTurnDurationHours}
              minimumTrackTintColor={COLORS.gold}
              maximumTrackTintColor={COLORS.inputBorder}
              thumbTintColor={COLORS.gold}
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>RAPIDE</Text>
              <Text style={styles.sliderLabelText}>DÉTENDU</Text>
            </View>
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
                <Text style={styles.buttonText}>Lancer l'histoire</Text>
                <Text style={{ fontSize: 16 }}>✨</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.quote}>
          « Chaque mot est un pas de plus dans{"\n"}l'obscurité partagée. »
        </Text>
      </ScrollView>
    </View>
  );
}

// Petit composant Switch stylé pour matcher le thème (piste sombre, pouce doré)
function Switch({
  value,
  onValueChange,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        switchStyles.track,
        { backgroundColor: value ? COLORS.gold : COLORS.inputBorder },
      ]}
    >
      <View
        style={[
          switchStyles.thumb,
          { alignSelf: value ? "flex-end" : "flex-start" },
        ]}
      />
    </Pressable>
  );
}

const switchStyles = StyleSheet.create({
  track: {
    width: 46,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: "center",
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
});

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 32,
    color: COLORS.gold,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    padding: 20,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.textLabel,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: "center",
  },
  textareaWrapper: {
    height: 130,
    paddingVertical: 12,
  },
  input: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    color: COLORS.white,
  },
  textarea: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  toggleTitle: {
    fontFamily: FONTS.sansSemi,
    fontSize: 15,
    color: COLORS.white,
  },
  toggleSubtitle: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: COLORS.textLabel,
    marginTop: 3,
  },
  sliderBlock: {
    marginTop: 24,
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  sliderValue: {
    fontFamily: FONTS.serifBold,
    fontSize: 18,
    color: COLORS.gold,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  sliderLabelText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textLabel,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    height: 56,
    marginTop: 28,
  },
  buttonText: {
    fontFamily: FONTS.serifBold,
    fontSize: 17,
    color: COLORS.goldDark,
  },
  quote: {
    fontFamily: FONTS.serifItalic,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: 32,
    lineHeight: 20,
  },
});
