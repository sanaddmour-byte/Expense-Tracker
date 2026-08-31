export type MatchStatus =
  | 'scheduled'
  | 'live'
  | 'halfTime'
  | 'finished'
  | 'postponed'
  | 'suspended'
  | 'cancelled';

export interface Competition {
  id: number;
  name: string;
  country: string;
}

export interface Team {
  id: number;
  name: string;
  shortName: string;
  venue?: string;
}

export interface Score {
  home: number;
  away: number;
}

export type MatchEventType =
  | 'goal'
  | 'ownGoal'
  | 'penaltyGoal'
  | 'penaltyMissed'
  | 'yellowCard'
  | 'redCard'
  | 'secondYellowCard'
  | 'substitution'
  | 'varReview'
  | 'kickoff'
  | 'halfTime'
  | 'fullTime';

export interface MatchEvent {
  id: string;
  type: MatchEventType;
  minute: number;
  addedTime?: number;
  teamId?: number;
  playerName?: string;
  assistName?: string;
  detail?: string;
}

export interface Match {
  id: number;
  competition: Competition;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  score: Score;
  minute?: number;
  kickoff: string; // ISO date string
  events: MatchEvent[];
}

export interface MatchStatistics {
  possessionHome: number;
  possessionAway: number;
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
}

export type FeedFilter = 'All' | 'Live' | 'Today' | 'Upcoming' | 'Finished';

export const FEED_FILTERS: FeedFilter[] = ['All', 'Live', 'Today', 'Upcoming', 'Finished'];

export function isLive(status: MatchStatus): boolean {
  return status === 'live' || status === 'halfTime';
}

export function matchesFilter(match: Match, filter: FeedFilter, now: Date = new Date()): boolean {
  const kickoff = new Date(match.kickoff);
  switch (filter) {
    case 'All':
      return true;
    case 'Live':
      return isLive(match.status);
    case 'Today':
      return kickoff.toDateString() === now.toDateString();
    case 'Upcoming':
      return match.status === 'scheduled' && kickoff.getTime() > now.getTime();
    case 'Finished':
      return match.status === 'finished';
  }
}

export function statusLabel(match: Match): string {
  switch (match.status) {
    case 'live':
      return match.minute != null ? `${match.minute}'` : 'Live';
    case 'halfTime':
      return 'HT';
    case 'finished':
      return 'FT';
    case 'scheduled':
      return new Date(match.kickoff).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'postponed':
      return 'Postponed';
    case 'suspended':
      return 'Suspended';
    case 'cancelled':
      return 'Cancelled';
  }
}
