export type StoryVisibility = "public" | "private";
export type StoryStatus = "open" | "completed";
export type RoundStatus = "open" | "closed";
export type ProposalStatus = "pending" | "canon" | "archived";
export type MemberRole = "owner" | "member";
export type NotificationType =
  | "round_started"
  | "vote_open"
  | "story_completed";

export interface Story {
  id: string;
  title: string;
  coverUrl: string | null;
  createdBy: string;
  visibility: StoryVisibility;
  status: StoryStatus;
  blindMode: boolean;
  revealLast: number;
  maxContributions: number;
  turnDurationSecs: number;
  writerLimitSecs: number | null;
  currentRound: number;
  currentRoundId: string;
  createdAt: any;
  completedAt: any;
}

export interface Round {
  id: string;
  roundNumber: number;
  status: RoundStatus;
  openedAt: any;
  closesAt: number;
  closedAt: any;
  winnerId: string | null;
}

export interface Proposal {
  authorId: string;
  content: string;
  createdAt: number;
  status: ProposalStatus;
  voteCount: number;
}

export interface Paragraph {
  id: string; // position, ex "0000", "0001"
  content: string;
  authorId: string;
  roundId: string | null;
  createdAt: any;
}

export interface Member {
  id: string;
  role: MemberRole;
  joinedAt: any;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  storyId: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: any;
}
