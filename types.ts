
export enum Weapon {
  Epee = 'Epee',
  Foil = 'Foil',
  Sabre = 'Sabre',
}

export interface Fencer {
  id: string;
  name: string;
}

export interface Bout {
  id: string;
  date: string; // ISO string format
  weapon: Weapon;
  fencer1Id: string;
  fencer2Id: string;
  refereeId: string;
  score1: number;
  score2: number;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  bouts: number;
  wins: number;
  rating: number;
  points: number;
  refereedBouts: number;
}

export type BoutsByWeapon = Record<Weapon, Bout[]>;
