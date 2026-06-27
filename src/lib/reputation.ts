// Reporter Reputation Engine — Trust Engine Layer 5 (deck-aligned)
// Tracks per-device reporter activity: reports submitted, confirmations,
// denials and verified-ratio. Also tracks per-hazard confirm/deny votes.

const STORAGE_KEY = "wayfinder_reputation_v1";
const VOTES_KEY = "wayfinder_hazard_votes_v1";

export type ReputationTier = "Newcomer" | "Trusted" | "Veteran" | "Local Expert";

export interface ReputationState {
  reporterId: string;
  reportsSubmitted: number;
  confirmsGiven: number;
  deniesGiven: number;
  upvotesReceived: number; // simulated when others confirm your reports
  score: number; // composite 0–1000
}

export interface HazardVotes {
  [hazardId: string]: { confirms: number; denies: number; lastVoteAt: number };
}

const genId = () =>
  `rep_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

const defaultState = (): ReputationState => ({
  reporterId: genId(),
  reportsSubmitted: 0,
  confirmsGiven: 0,
  deniesGiven: 0,
  upvotesReceived: 0,
  score: 0,
});

export const getReputation = (): ReputationState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = defaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
};

const save = (s: ReputationState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {}
};

// Composite score: reports * 5 + confirms * 3 + upvotes * 4 − denies * 2 (clamped)
const recalcScore = (s: ReputationState): number => {
  const raw =
    s.reportsSubmitted * 5 +
    s.confirmsGiven * 3 +
    s.upvotesReceived * 4 -
    s.deniesGiven * 2;
  return Math.max(0, Math.min(1000, raw));
};

export const getTier = (score: number): ReputationTier => {
  if (score >= 250) return "Local Expert";
  if (score >= 100) return "Veteran";
  if (score >= 25) return "Trusted";
  return "Newcomer";
};

export const tierMeta: Record<
  ReputationTier,
  { color: string; bg: string; emoji: string }
> = {
  Newcomer: { color: "text-muted-foreground", bg: "bg-muted/40", emoji: "🌱" },
  Trusted: { color: "text-info", bg: "bg-info/15", emoji: "✓" },
  Veteran: { color: "text-warning", bg: "bg-warning/15", emoji: "★" },
  "Local Expert": { color: "text-success", bg: "bg-success/20", emoji: "🏆" },
};

export const recordReport = () => {
  const s = getReputation();
  s.reportsSubmitted += 1;
  // Simulate that other drivers confirm ~60% of your reports over time
  s.upvotesReceived += Math.random() < 0.6 ? 1 : 0;
  s.score = recalcScore(s);
  save(s);
  return s;
};

export const recordConfirm = (hazardId: string) => {
  const s = getReputation();
  s.confirmsGiven += 1;
  s.score = recalcScore(s);
  save(s);
  bumpHazardVote(hazardId, "confirm");
  return s;
};

export const recordDeny = (hazardId: string) => {
  const s = getReputation();
  s.deniesGiven += 1;
  s.score = recalcScore(s);
  save(s);
  bumpHazardVote(hazardId, "deny");
  return s;
};

const getVotes = (): HazardVotes => {
  try {
    const raw = localStorage.getItem(VOTES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getHazardVotes = (hazardId: string) => {
  const v = getVotes()[hazardId];
  return v ?? { confirms: 0, denies: 0, lastVoteAt: 0 };
};

const bumpHazardVote = (hazardId: string, kind: "confirm" | "deny") => {
  const all = getVotes();
  const cur = all[hazardId] ?? { confirms: 0, denies: 0, lastVoteAt: 0 };
  if (kind === "confirm") cur.confirms += 1;
  else cur.denies += 1;
  cur.lastVoteAt = Date.now();
  all[hazardId] = cur;
  try {
    localStorage.setItem(VOTES_KEY, JSON.stringify(all));
  } catch {}
};
