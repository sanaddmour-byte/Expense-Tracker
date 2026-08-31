import { Competition, Match, MatchStatistics, Team } from '../types/models';

export const premierLeague: Competition = { id: 2021, name: 'Premier League', country: 'England' };
export const laLiga: Competition = { id: 2014, name: 'La Liga', country: 'Spain' };
export const championsLeague: Competition = { id: 2001, name: 'UEFA Champions League', country: 'Europe' };

export const arsenal: Team = { id: 57, name: 'Arsenal', shortName: 'ARS', venue: 'Emirates Stadium' };
export const chelsea: Team = { id: 61, name: 'Chelsea', shortName: 'CHE', venue: 'Stamford Bridge' };
export const liverpool: Team = { id: 64, name: 'Liverpool', shortName: 'LIV', venue: 'Anfield' };
export const manCity: Team = { id: 65, name: 'Manchester City', shortName: 'MCI', venue: 'Etihad Stadium' };
export const realMadrid: Team = { id: 86, name: 'Real Madrid', shortName: 'RMA', venue: 'Santiago Bernabéu' };
export const barcelona: Team = { id: 81, name: 'FC Barcelona', shortName: 'BAR', venue: 'Spotify Camp Nou' };
export const bayern: Team = { id: 5, name: 'Bayern Munich', shortName: 'BAY', venue: 'Allianz Arena' };
export const psg: Team = { id: 524, name: 'Paris Saint-Germain', shortName: 'PSG', venue: 'Parc des Princes' };

export const allTeams: Team[] = [arsenal, chelsea, liverpool, manCity, realMadrid, barcelona, bayern, psg];

const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3_600_000).toISOString();
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();

export const matches: Match[] = [
  {
    id: 1001,
    competition: premierLeague,
    homeTeam: arsenal,
    awayTeam: chelsea,
    status: 'live',
    score: { home: 2, away: 1 },
    minute: 67,
    kickoff: minutesAgo(67),
    events: [
      { id: 'e1', type: 'kickoff', minute: 0 },
      { id: 'e2', type: 'goal', minute: 12, teamId: arsenal.id, playerName: 'Bukayo Saka', assistName: 'Martin Ødegaard' },
      { id: 'e3', type: 'yellowCard', minute: 23, teamId: chelsea.id, playerName: 'Enzo Fernández' },
      { id: 'e4', type: 'goal', minute: 38, teamId: chelsea.id, playerName: 'Cole Palmer' },
      { id: 'e5', type: 'halfTime', minute: 45 },
      { id: 'e6', type: 'goal', minute: 58, teamId: arsenal.id, playerName: 'Gabriel Jesus', assistName: 'Declan Rice' },
      { id: 'e7', type: 'varReview', minute: 64, detail: 'Penalty check overturned' },
    ],
  },
  {
    id: 1002,
    competition: laLiga,
    homeTeam: realMadrid,
    awayTeam: barcelona,
    status: 'halfTime',
    score: { home: 1, away: 1 },
    minute: 45,
    kickoff: minutesAgo(50),
    events: [
      { id: 'e8', type: 'goal', minute: 15, teamId: realMadrid.id, playerName: 'Jude Bellingham' },
      { id: 'e9', type: 'goal', minute: 41, addedTime: 2, teamId: barcelona.id, playerName: 'Robert Lewandowski', assistName: 'Pedri' },
      { id: 'e10', type: 'halfTime', minute: 45 },
    ],
  },
  {
    id: 1003,
    competition: championsLeague,
    homeTeam: bayern,
    awayTeam: psg,
    status: 'scheduled',
    score: { home: 0, away: 0 },
    kickoff: hoursFromNow(4),
    events: [],
  },
  {
    id: 1004,
    competition: premierLeague,
    homeTeam: liverpool,
    awayTeam: manCity,
    status: 'scheduled',
    score: { home: 0, away: 0 },
    kickoff: daysFromNow(1),
    events: [],
  },
  {
    id: 1005,
    competition: premierLeague,
    homeTeam: manCity,
    awayTeam: liverpool,
    status: 'finished',
    score: { home: 3, away: 2 },
    minute: 90,
    kickoff: hoursAgo(5),
    events: [
      { id: 'e11', type: 'goal', minute: 5, teamId: manCity.id, playerName: 'Erling Haaland' },
      { id: 'e12', type: 'goal', minute: 34, teamId: liverpool.id, playerName: 'Mohamed Salah' },
      { id: 'e13', type: 'redCard', minute: 52, teamId: liverpool.id, playerName: 'Virgil van Dijk' },
      { id: 'e14', type: 'goal', minute: 61, teamId: manCity.id, playerName: 'Kevin De Bruyne' },
      { id: 'e15', type: 'goal', minute: 78, teamId: liverpool.id, playerName: 'Darwin Núñez' },
      { id: 'e16', type: 'goal', minute: 88, addedTime: 1, teamId: manCity.id, playerName: 'Phil Foden' },
      { id: 'e17', type: 'fullTime', minute: 90 },
    ],
  },
  {
    id: 1006,
    competition: laLiga,
    homeTeam: barcelona,
    awayTeam: realMadrid,
    status: 'postponed',
    score: { home: 0, away: 0 },
    kickoff: daysFromNow(2),
    events: [],
  },
];

export const statisticsByMatchId: Record<number, MatchStatistics> = {
  1001: {
    possessionHome: 58,
    possessionAway: 42,
    shotsHome: 14,
    shotsAway: 9,
    shotsOnTargetHome: 6,
    shotsOnTargetAway: 4,
    cornersHome: 7,
    cornersAway: 3,
    foulsHome: 8,
    foulsAway: 11,
  },
  1002: {
    possessionHome: 51,
    possessionAway: 49,
    shotsHome: 8,
    shotsAway: 7,
    shotsOnTargetHome: 3,
    shotsOnTargetAway: 3,
    cornersHome: 4,
    cornersAway: 5,
    foulsHome: 6,
    foulsAway: 6,
  },
};

export function findMatch(id: number): Match | undefined {
  return matches.find((m) => m.id === id);
}
