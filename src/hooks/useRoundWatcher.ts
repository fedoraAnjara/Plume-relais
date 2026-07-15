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
storyId: string | undefined, roundId: string | undefined, uid: string | undefined, isMember: boolean,
): RoundWatcherResult {
  const [round, setRound] = useState<Round | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votedForAuthorId, setVotedForAuthorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Round + propositions
  useEffect(() => {
    if (!storyId || !roundId || !uid) return;
    setLoading(true);

    const unsubRound = subscribeRound(storyId, roundId, setRound);
    const unsubProposals = subscribeProposals(storyId, roundId, (p) => {
      setProposals(p);
      setLoading(false);
    });

    return () => {
      unsubRound();
      unsubProposals();
    };
  }, [storyId, roundId, uid]);

  // Mon vote pour ce tour : un seul abonnement au registre voters/{uid}.
  useEffect(() => {
    if (!storyId || !roundId || !uid) {
      setVotedForAuthorId(null);
      return;
    }
    return subscribeMyVote(storyId, roundId, uid, setVotedForAuthorId);
  }, [storyId, roundId, uid]);

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