import { useEffect, useState } from "react";
import type { Round, Proposal } from "../types/models";
import { subscribeRound } from "../lib/rounds";
import { subscribeProposals } from "../lib/proposals";
import { subscribeMyVote } from "../lib/votes";

interface RoundWatcherResult {
  round: Round | null;
  proposals: Proposal[];
  myProposal: Proposal | null;
  hasProposed: boolean;
  votedForAuthorId: string | null;
  loading: boolean;
}

export function useRoundWatcher(
  storyId: string | undefined,
  roundId: string | undefined,
  uid: string | undefined,
  isMember: boolean,
): RoundWatcherResult {
  const [round, setRound] = useState<Round | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votedForAuthorId, setVotedForAuthorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Le round est lisible par tous ceux qui voient l'histoire : pas de garde isMember.
  useEffect(() => {
    if (!storyId || !roundId) return;
    return subscribeRound(storyId, roundId, setRound);
  }, [storyId, roundId]);

  // Les propositions ne sont lisibles qu'aux membres.
  // On attend donc isMember pour s'abonner, sinon les règles refusent la lecture.
  useEffect(() => {
    if (!storyId || !roundId || !uid || !isMember) {
      setProposals([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubProposals = subscribeProposals(storyId, roundId, (p) => {
      setProposals(p);
      setLoading(false);
    });
    return () => unsubProposals();
  }, [storyId, roundId, uid, isMember]);

  // Mon vote pour ce tour : registre voters/{uid}, réservé aux membres.
  useEffect(() => {
    if (!storyId || !roundId || !uid || !isMember) {
      setVotedForAuthorId(null);
      return;
    }
    return subscribeMyVote(storyId, roundId, uid, setVotedForAuthorId);
  }, [storyId, roundId, uid, isMember]);

  const myProposal = proposals.find((p) => p.authorId === uid) ?? null;

  return {
    round,
    proposals,
    myProposal,
    hasProposed: myProposal !== null,
    votedForAuthorId,
    loading,
  };
}