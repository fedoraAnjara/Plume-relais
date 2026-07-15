import {
  doc,
  collection,
  getDoc,
  getDocs,
  runTransaction,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Round, Proposal, Story } from "../types/models";
import { notifyMembers } from "./notifications";

export function subscribeRound(
  storyId: string,
  roundId: string,
  callback: (round: Round | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    doc(db, "stories", storyId, "rounds", roundId),
    (snap) =>
      callback(
        snap.exists() ? ({ id: snap.id, ...snap.data() } as Round) : null
      ),
    (err) => {
      console.error("subscribeRound error:", err);
      onError?.(err as unknown as Error);
    }
  );
}

type CanonParagraph = {
  paddedPosition: string;
  content: string;
  authorId: string;
};

export async function closeRoundIfExpired(storyId: string, roundId: string) {
  const storyRef = doc(db, "stories", storyId);
  const roundRef = doc(db, "stories", storyId, "rounds", roundId);
  const proposalsSnap = await getDocs(
    collection(db, "stories", storyId, "rounds", roundId, "proposals")
  );

  // La transaction RENVOIE le paragraphe à écrire (ou null). On évite ainsi
  // le bug de narrowing TS lié à une variable assignée dans une closure.
  const canonParagraph = await runTransaction(
    db,
    async (tx): Promise<CanonParagraph | null> => {
      const roundSnap = await tx.get(roundRef);
      const storySnap = await tx.get(storyRef);
      if (!roundSnap.exists() || !storySnap.exists()) return null;

      const round = roundSnap.data() as Round;
      const story = storySnap.data() as Story;

      if (round.status !== "open") return null;
      if (round.closesAt > Date.now()) return null;

      const proposals = proposalsSnap.docs.map((d) => ({
        authorId: d.id,
        ...(d.data() as Omit<Proposal, "authorId">),
      }));

      let winner: (typeof proposals)[number] | null = null;
      let winnerProfileSnap = null;

      if (proposals.length > 0) {
        winner = [...proposals].sort((a, b) => {
          if (b.voteCount !== a.voteCount) return b.voteCount - a.voteCount;
          return a.createdAt - b.createdAt;
        })[0];
        // Lecture du profil gagnant AVANT toute écriture.
        winnerProfileSnap = await tx.get(doc(db, "users", winner.authorId));
      }

      // Aucune proposition : le tour se ferme et l'histoire s'arrête là.
      if (!winner) {
        tx.update(roundRef, { status: "closed", closedAt: serverTimestamp() });
        tx.update(storyRef, {
          status: "completed",
          completedAt: serverTimestamp(),
        });
        return null;
      }

      // Statut des propositions : gagnante = canon, autres = archivées.
      for (const p of proposals) {
        const pRef = doc(
          db,
          "stories",
          storyId,
          "rounds",
          roundId,
          "proposals",
          p.authorId
        );
        tx.update(pRef, {
          status: p.authorId === winner.authorId ? "canon" : "archived",
        });
      }

      // Clôture du tour + désignation du gagnant.
      tx.update(roundRef, {
        status: "closed",
        closedAt: serverTimestamp(),
        winnerId: winner.authorId,
      });

      // Réputation : +1 au gagnant.
      const currentScore = winnerProfileSnap?.data()?.score ?? 0;
      tx.update(doc(db, "users", winner.authorId), {
        score: currentScore + 1,
      });

      // Histoire terminée, ou ouverture du tour suivant.
      const totalParagraphs = story.currentRound + 1;
      if (totalParagraphs >= story.maxContributions) {
        tx.update(storyRef, {
          status: "completed",
          completedAt: serverTimestamp(),
        });
      } else {
        const nextRoundRef = doc(collection(db, "stories", storyId, "rounds"));
        tx.set(nextRoundRef, {
          roundNumber: round.roundNumber + 1,
          status: "open",
          openedAt: serverTimestamp(),
          closesAt: Date.now() + story.turnDurationSecs * 1000,
          closedAt: null,
          winnerId: null,
        });
        tx.update(storyRef, {
          currentRound: round.roundNumber + 1,
          currentRoundId: nextRoundRef.id,
        });
      }

      // On renvoie le paragraphe à écrire APRÈS la transaction.
      return {
        paddedPosition: String(story.currentRound).padStart(4, "0"),
        content: winner.content,
        authorId: winner.authorId,
      };
    }
  );

  // Écriture du paragraphe canon HORS transaction : à cet instant winnerId
  // est en base, donc la règle du client passe.
  if (canonParagraph) {
    await setDoc(
      doc(db, "stories", storyId, "paragraphs", canonParagraph.paddedPosition),
      {
        content: canonParagraph.content,
        authorId: canonParagraph.authorId,
        roundId,
        createdAt: serverTimestamp(),
      }
    );
  }

  const finalStorySnap = await getDoc(storyRef);
  if (!finalStorySnap.exists()) return;
  const finalStory = finalStorySnap.data() as Story;

  if (finalStory.status === "completed") {
    await notifyMembers(
      storyId,
      "story_completed",
      "Histoire terminée",
      `"${finalStory.title}" est maintenant complète.`
    );
  } else {
    await notifyMembers(
      storyId,
      "round_started",
      "Nouveau tour",
      `Un nouveau tour a commencé pour "${finalStory.title}".`
    );
  }
}