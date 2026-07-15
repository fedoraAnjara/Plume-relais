import {
  doc,
  runTransaction,
  increment,
  serverTimestamp,
  onSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";

/**
 * Vote pour une proposition.
 *
 * Le registre `rounds/{roundId}/voters/{uid}` garantit structurellement
 * « un seul vote par tour » (§4.5) : un utilisateur = un document.
 * Changer de vote met simplement à jour ce document, en décrémentant
 * l'ancien compteur et en incrémentant le nouveau, le tout dans une
 * seule transaction atomique.
 */
export async function castVote(
  storyId: string,
  roundId: string,
  proposalAuthorId: string,
  voterId: string,
) {
  if (proposalAuthorId === voterId) {
    throw new Error("Impossible de voter pour sa propre proposition");
  }

  await runTransaction(db, async (tx) => {
    const voterRef = doc(
      db,
      "stories",
      storyId,
      "rounds",
      roundId,
      "voters",
      voterId,
    );
    const proposalRef = doc(
      db,
      "stories",
      storyId,
      "rounds",
      roundId,
      "proposals",
      proposalAuthorId,
    );

    // Toutes les lectures AVANT les écritures (contrainte Firestore).
    const voterSnap = await tx.get(voterRef);
    const proposalSnap = await tx.get(proposalRef);

    if (!proposalSnap.exists()) throw new Error("Proposition introuvable");

    const previousProposalId: string | null = voterSnap.exists()
      ? (voterSnap.data().proposalId ?? null)
      : null;

    // Rien à faire : l'utilisateur revote pour la même proposition.
    if (previousProposalId === proposalAuthorId) return;

    // Changement de vote : on décrémente l'ancienne proposition.
    if (previousProposalId) {
      const prevProposalRef = doc(
        db,
        "stories",
        storyId,
        "rounds",
        roundId,
        "proposals",
        previousProposalId,
      );
      const prevSnap = await tx.get(prevProposalRef);
      if (prevSnap.exists()) {
        tx.update(prevProposalRef, { voteCount: increment(-1) });
      }
    }

    tx.set(voterRef, {
      proposalId: proposalAuthorId,
      createdAt: serverTimestamp(),
    });
    tx.update(proposalRef, { voteCount: increment(1) });
  });
}

/**
 * Retire son vote du tour courant.
 */
export async function retractVote(
  storyId: string,
  roundId: string,
  voterId: string,
) {
  await runTransaction(db, async (tx) => {
    const voterRef = doc(
      db,
      "stories",
      storyId,
      "rounds",
      roundId,
      "voters",
      voterId,
    );
    const voterSnap = await tx.get(voterRef);
    if (!voterSnap.exists()) return;

    const proposalId: string = voterSnap.data().proposalId;
    const proposalRef = doc(
      db,
      "stories",
      storyId,
      "rounds",
      roundId,
      "proposals",
      proposalId,
    );
    const proposalSnap = await tx.get(proposalRef);

    tx.delete(voterRef);
    if (proposalSnap.exists()) {
      tx.update(proposalRef, { voteCount: increment(-1) });
    }
  });
}

/**
 * Écoute en direct le vote de l'utilisateur pour le tour courant.
 * Renvoie l'ID de la proposition votée, ou null s'il n'a pas encore voté.
 */
export function subscribeMyVote(
  storyId: string,
  roundId: string,
  voterId: string,
  callback: (proposalId: string | null) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(db, "stories", storyId, "rounds", roundId, "voters", voterId),
    (snap) => callback(snap.exists() ? (snap.data().proposalId ?? null) : null),
    (err) => {
      console.error("subscribeMyVote error:", err);
      onError?.(err as unknown as Error);
    },
  );
}