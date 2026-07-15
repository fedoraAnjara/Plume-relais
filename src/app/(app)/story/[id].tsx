import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
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
import { useAuth } from "../../../contexts/AuthContext";
import { useMembership } from "../../../hooks/useMembership";
import { useRoundWatcher } from "../../../hooks/useRoundWatcher";
import { useUserProfiles } from "../../../hooks/useUserProfiles";
import { subscribeStory, joinStory } from "../../../lib/stories";
import {
  subscribeParagraph,
  subscribeAllParagraphs,
} from "../../../lib/paragraphs";
import { submitProposal } from "../../../lib/proposals";
import { castVote } from "../../../lib/votes";
import { closeRoundIfExpired } from "../../../lib/rounds";
import {
  addReaction,
  subscribeReactions,
  addComment,
  subscribeComments,
  type Reaction,
  type Comment,
} from "../../../lib/social";
import type { Story, Paragraph } from "../../../types/models";
import AppHeader from "../../../components/AppHeader";
import { COLORS, FONTS } from "../../../theme/colors";

const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢"];
const MAX_PROPOSAL_LENGTH = 500;

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const uid = user?.uid;

  const [story, setStory] = useState<Story | null>(null);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [openingParagraph, setOpeningParagraph] = useState<Paragraph | null>(
    null,
  );
  const [allParagraphs, setAllParagraphs] = useState<Paragraph[] | null>(null);
  const [proposalText, setProposalText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [now, setNow] = useState(Date.now());

  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    SpaceMono_400Regular,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  const { isMember, role, loading: membershipLoading } = useMembership(id, uid);
  const {
    round,
    proposals,
    myProposal,
    hasProposed,
    votedForAuthorId,
    loading: roundLoading,
  } = useRoundWatcher(id, story?.currentRoundId, uid, isMember);

  useEffect(() => {
    if (!id) {
      setStoryError("Aucune histoire sélectionnée.");
      return;
    }
    setStoryError(null);
    return subscribeStory(id, setStory, (err) =>
      setStoryError(err.message || "Impossible de charger l'histoire."),
    );
  }, [id]);

  useEffect(() => {
    if (!id) return;
    return subscribeParagraph(id, "0000", setOpeningParagraph);
  }, [id]);

  const canSeeAll =
    !!story &&
    (story.status === "completed" || !story.blindMode || hasProposed);

  useEffect(() => {
    if (!id || !canSeeAll) {
      setAllParagraphs(null);
      return;
    }
    return subscribeAllParagraphs(id, setAllParagraphs);
  }, [id, canSeeAll]);

  useEffect(() => {
    if (!id || story?.status !== "completed") return;
    const unsubR = subscribeReactions(id, setReactions);
    const unsubC = subscribeComments(id, setComments);
    return () => {
      unsubR();
      unsubC();
    };
  }, [id, story?.status]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const authorIds = [
    ...(allParagraphs?.map((p) => p.authorId) ?? []),
    ...comments.map((c) => c.userId),
    ...proposals.map((p) => p.authorId),
  ];
  const profiles = useUserProfiles(authorIds);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: COLORS.bg }} />;
  }

  if (storyError) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bg }]}>
        <Text style={styles.errorText}>{storyError}</Text>
      </View>
    );
  }

  if (!story || membershipLoading) {
    return (
      <View style={[styles.center, { backgroundColor: COLORS.bg }]}>
        <ActivityIndicator color={COLORS.gold} />
      </View>
    );
  }

  async function handleJoin() {
    if (!uid || !id) return;
    setJoining(true);
    try {
      await joinStory(id, uid);
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    } finally {
      setJoining(false);
    }
  }

  async function handleSubmitProposal() {
    if (!uid || !id || !story?.currentRoundId) return;
    if (proposalText.trim().length < 1) {
      Alert.alert("Le paragraphe ne peut pas être vide");
      return;
    }
    setSubmitting(true);
    try {
      await submitProposal(
        id,
        story.currentRoundId,
        uid,
        proposalText.trim(),
        story.title,
      );
      setProposalText("");
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Option 2 (registre voters/) : castVote lit le registre lui-même,
  // plus besoin de passer le vote précédent.
  async function handleVote(authorId: string) {
    if (!uid || !id || !story?.currentRoundId) return;
    try {
      await castVote(id, story.currentRoundId, authorId, uid);
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    }
  }

  async function handleCloseRound() {
    if (!id || !story?.currentRoundId) return;
    try {
      await closeRoundIfExpired(id, story.currentRoundId);
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    }
  }

  async function handleReact(emoji: string) {
    if (!uid || !id) return;
    try {
      await addReaction(id, uid, emoji);
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    }
  }

  async function handleComment() {
    if (!uid || !id || commentText.trim().length === 0) return;
    try {
      await addComment(id, uid, commentText.trim());
      setCommentText("");
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    }
  }

  async function handleShare() {
    if (!story || !id) return;
    try {
      await Share.share({
        message:
          story.status === "completed"
            ? `Découvre "${story.title}" sur Plume Relais !`
            : `Rejoins l'histoire "${story.title}" sur Plume Relais !`,
        url: `https://plumerelais.app/story/${id}`,
      });
    } catch (err) {
      Alert.alert(
        "Erreur",
        err instanceof Error ? err.message : "Erreur inconnue",
      );
    }
  }

  const roundExpired = round ? round.closesAt <= now : false;

  const writerDeadline =
    story.writerLimitSecs && round
      ? (round.openedAt?.toMillis?.() ?? Date.now())
      : null;
  const writerSecondsLeft =
    writerDeadline && story.writerLimitSecs
      ? Math.max(
          0,
          Math.floor(
            (writerDeadline + story.writerLimitSecs * 1000 - now) / 1000,
          ),
        )
      : null;
  const writerTimeUp = writerSecondsLeft !== null && writerSecondsLeft <= 0;

  const showProposalContent = hasProposed || story.status === "completed";
  const topVoteCount = showProposalContent
    ? Math.max(0, ...proposals.map((p) => p.voteCount))
    : -1;

  const remainingChars = MAX_PROPOSAL_LENGTH - proposalText.length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <AppHeader />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Story id + titre */}
        <Text style={styles.storyId}>
          STORY ID: #{story.id?.slice(-4) ?? "----"}
        </Text>
        <Text style={styles.title}>{story.title}</Text>

        {/* Badges meta */}
        <View style={styles.metaRow}>
          <View style={styles.tourBadge}>
            <Text style={styles.tourBadgeText}>
              {story.status === "completed"
                ? "TERMINÉE"
                : `TOUR ${story.currentRound}`}
            </Text>
          </View>
          {story.blindMode && (
            <View style={styles.metaItem}>
              <Ionicons
                name="eye-off-outline"
                size={13}
                color={COLORS.textMuted}
              />
              <Text style={styles.metaItemText}>Mode Aveugle Actif</Text>
            </View>
          )}
          <Pressable style={styles.metaItem} onPress={handleShare}>
            <Ionicons
              name="share-social-outline"
              size={13}
              color={COLORS.purple}
            />
            <Text style={[styles.metaItemText, { color: COLORS.purple }]}>
              Partager
            </Text>
          </Pressable>
        </View>

        {!isMember &&
          story.visibility === "public" &&
          story.status === "open" && (
            <Pressable
              style={styles.primaryButton}
              onPress={handleJoin}
              disabled={joining}
            >
              {joining ? (
                <ActivityIndicator color={COLORS.goldDark} />
              ) : (
                <Text style={styles.primaryButtonText}>
                  Rejoindre cette histoire
                </Text>
              )}
            </Pressable>
          )}

        {/* Récit actuel */}
        <View style={styles.card}>
          <Text style={styles.label}>RÉCIT ACTUEL</Text>

          <View style={styles.quoteBlock}>
            <Text style={styles.quoteText}>
              "{openingParagraph?.content ?? "…"}"
            </Text>
          </View>

          {canSeeAll ? (
            allParagraphs === null ? (
              <ActivityIndicator
                color={COLORS.gold}
                style={{ marginTop: 16 }}
              />
            ) : (
              allParagraphs
                .filter((p) => p.id !== "0000")
                .map((p) => (
                  <View key={p.id} style={styles.paragraphBlock}>
                    <Text style={styles.paragraph}>{p.content}</Text>
                    {story.status === "completed" && (
                      <Text style={styles.authorTag}>
                        — {profiles[p.authorId]?.username ?? "Anonyme"}
                      </Text>
                    )}
                  </View>
                ))
            )
          ) : (
            <Text style={styles.hint}>
              Mode aveugle actif — propose ta suite pour débloquer la lecture
              complète.
            </Text>
          )}

          {isMember && story.status === "open" && (
            <>
              <View style={styles.divider} />

              <Text style={styles.label}>TA PROPOSITION</Text>

              {story.writerLimitSecs && !hasProposed && (
                <Text
                  style={[
                    styles.timerText,
                    writerTimeUp && styles.timerTextExpired,
                  ]}
                >
                  {writerTimeUp
                    ? "Temps écoulé"
                    : `Temps restant pour écrire : ${writerSecondsLeft}s`}
                </Text>
              )}

              <View style={styles.textareaWrapper}>
                <TextInput
                  style={styles.textarea}
                  value={hasProposed ? myProposal?.content : proposalText}
                  onChangeText={setProposalText}
                  editable={round?.status === "open" && !writerTimeUp}
                  multiline
                  maxLength={MAX_PROPOSAL_LENGTH}
                  placeholder="Poursuivez l'histoire..."
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={styles.charCount}>
                  {hasProposed
                    ? (myProposal?.content.length ?? 0)
                    : proposalText.length}{" "}
                  / {MAX_PROPOSAL_LENGTH}
                </Text>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleSubmitProposal}
                disabled={
                  submitting || round?.status !== "open" || writerTimeUp
                }
              >
                {submitting ? (
                  <ActivityIndicator color={COLORS.goldDark} />
                ) : (
                  <>
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color={COLORS.goldDark}
                    />
                    <Text style={styles.primaryButtonText}>
                      {hasProposed ? "MODIFIER MA PROPOSITION" : "PROPOSER"}
                    </Text>
                  </>
                )}
              </Pressable>
            </>
          )}
        </View>

        {/* Propositions en attente */}
        {isMember && story.status === "open" && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleLarge}>
                Propositions en{"\n"}attente
              </Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeNumber}>{proposals.length}</Text>
                <Text style={styles.countBadgeLabel}>Contributions</Text>
              </View>
            </View>

            {roundLoading ? (
              <ActivityIndicator color={COLORS.gold} />
            ) : (
              proposals.map((p) => {
                const isTop =
                  showProposalContent &&
                  topVoteCount > 0 &&
                  p.voteCount === topVoteCount;
                const username = profiles[p.authorId]?.username ?? "Anonyme";
                return (
                  <View key={p.authorId} style={styles.proposalCard}>
                    <View style={styles.proposalHeaderRow}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarInitial}>
                          {username.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.proposalAuthor}>{username}</Text>
                      {isTop && (
                        <View style={styles.topVoteBadge}>
                          <Ionicons name="star" size={11} color={COLORS.gold} />
                          <Text style={styles.topVoteBadgeText}>
                            MEILLEUR VOTE
                          </Text>
                        </View>
                      )}
                    </View>

                    <Text
                      style={styles.proposalContent}
                      numberOfLines={showProposalContent ? undefined : 2}
                    >
                      {showProposalContent
                        ? p.content
                        : "Contenu masqué jusqu'à la clôture du vote"}
                    </Text>

                    <View style={styles.proposalFooterRow}>
                      <View style={styles.voteCountRow}>
                        <Ionicons
                          name="thumbs-up-outline"
                          size={14}
                          color={COLORS.textMuted}
                        />
                        <Text style={styles.voteCountText}>{p.voteCount}</Text>
                      </View>

                      {p.authorId !== uid && (
                        <Pressable
                          style={[
                            styles.voteButton,
                            votedForAuthorId === p.authorId &&
                              styles.voteButtonActive,
                          ]}
                          onPress={() => handleVote(p.authorId)}
                          disabled={round?.status !== "open"}
                        >
                          <Text
                            style={[
                              styles.voteButtonText,
                              votedForAuthorId === p.authorId &&
                                styles.voteButtonTextActive,
                            ]}
                          >
                            {votedForAuthorId === p.authorId
                              ? "VOTÉ ✓"
                              : "VOTER POUR CELLE-CI"}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            {roundExpired && round?.status === "open" && (
              <Pressable
                style={styles.primaryButton}
                onPress={handleCloseRound}
              >
                <Text style={styles.primaryButtonText}>Clôturer le tour</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Réactions + commentaires (histoire terminée) */}
        {story.status === "completed" && (
          <>
            <View style={styles.reactionRow}>
              {REACTION_EMOJIS.map((emoji) => (
                <Pressable
                  key={emoji}
                  style={styles.reactionButton}
                  onPress={() => handleReact(emoji)}
                >
                  <Text style={styles.reactionText}>
                    {emoji} {reactions.filter((r) => r.emoji === emoji).length}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.sectionTitleLarge}>
              Commentaires ({comments.length})
            </Text>
            {comments.map((c) => (
              <Text key={c.id} style={styles.commentText}>
                <Text style={styles.commentAuthor}>
                  {profiles[c.userId]?.username ?? "Anonyme"}
                </Text>{" "}
                : {c.text}
              </Text>
            ))}

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Ajouter un commentaire..."
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
            <Pressable style={styles.primaryButton} onPress={handleComment}>
              <Text style={styles.primaryButtonText}>Envoyer</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 4,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontFamily: FONTS.sans,
    fontSize: 15,
    color: COLORS.danger,
    textAlign: "center",
  },

  storyId: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.textLabel,
    marginTop: 4,
  },
  title: {
    fontFamily: FONTS.serifBold,
    fontSize: 28,
    color: COLORS.white,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  tourBadge: {
    backgroundColor: COLORS.purpleSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tourBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: COLORS.white,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaItemText: {
    fontFamily: FONTS.serifItalic,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 20,
    padding: 20,
    marginTop: 4,
  },
  label: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1,
    color: COLORS.gold,
    marginBottom: 12,
  },
  quoteBlock: {
    borderLeftWidth: 2,
    borderLeftColor: COLORS.gold,
    paddingLeft: 14,
    marginBottom: 16,
  },
  quoteText: {
    fontFamily: FONTS.serifItalic,
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.white,
  },
  paragraphBlock: { marginBottom: 14 },
  paragraph: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  authorTag: {
    fontFamily: FONTS.serifItalic,
    fontSize: 12,
    color: COLORS.textLabel,
    marginTop: 4,
  },
  hint: {
    fontFamily: FONTS.serifItalic,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 20,
  },
  timerText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.purple,
    marginBottom: 8,
  },
  timerTextExpired: { color: COLORS.danger },
  textareaWrapper: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    padding: 14,
    minHeight: 120,
  },
  textarea: {
    flex: 1,
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.white,
    textAlignVertical: "top",
  },
  charCount: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.textLabel,
    textAlign: "right",
    marginTop: 6,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.gold,
    borderRadius: 14,
    height: 52,
    marginTop: 16,
  },
  primaryButtonText: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: COLORS.goldDark,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitleLarge: {
    fontFamily: FONTS.serifBold,
    fontSize: 24,
    color: COLORS.white,
    lineHeight: 30,
    flex: 1,
  },
  countBadge: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  countBadgeNumber: {
    fontFamily: FONTS.serifBold,
    fontSize: 16,
    color: COLORS.white,
  },
  countBadgeLabel: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    color: COLORS.textLabel,
  },

  proposalCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  proposalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontFamily: FONTS.sansBold,
    fontSize: 13,
    color: COLORS.white,
  },
  proposalAuthor: {
    fontFamily: FONTS.sansSemi,
    fontSize: 14,
    color: COLORS.white,
    flex: 1,
  },
  topVoteBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#3a301280",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  topVoteBadgeText: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 0.5,
    color: COLORS.gold,
  },
  proposalContent: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    lineHeight: 21,
    color: COLORS.textMuted,
    marginBottom: 12,
  },
  proposalFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  voteCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  voteCountText: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  voteButton: {
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  voteButtonActive: {
    backgroundColor: COLORS.gold,
  },
  voteButtonText: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: COLORS.gold,
  },
  voteButtonTextActive: {
    color: COLORS.goldDark,
  },

  reactionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 32,
  },
  reactionButton: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reactionText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.white,
  },
  commentText: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 8,
    lineHeight: 20,
  },
  commentAuthor: {
    fontFamily: FONTS.sansBold,
    color: COLORS.white,
  },
  inputWrapper: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    justifyContent: "center",
    marginTop: 8,
  },
  input: {
    fontFamily: FONTS.sans,
    fontSize: 14,
    color: COLORS.white,
  },
});