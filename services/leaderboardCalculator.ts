
import { Bout, Fencer, LeaderboardEntry } from '../types';
import {
  INITIAL_RATING,
  CURVE_CONSTANT,
  BASE_CHANGE,
  WIN_BONUS,
  MAX_SCORE,
  LEADERBOARD_MONTHS_EXPIRE,
  MULTIPLIER_AMOUNT,
  POINTS_BOUT,
  POINTS_WIN,
  POINTS_TOUCH,
} from '../constants';

export function calculateLeaderboard(bouts: Bout[], fencers: Fencer[]): LeaderboardEntry[] {
  if (fencers.length === 0) return [];

  const fencerStats = new Map<string, LeaderboardEntry>();
  fencers.forEach(fencer => {
    fencerStats.set(fencer.id, {
      id: fencer.id,
      name: fencer.name,
      bouts: 0,
      wins: 0,
      rating: INITIAL_RATING,
      points: 0,
      refereedBouts: 0,
    });
  });

  const sortedBouts = [...bouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let lastBoutDate: string | null = null;
  const dailyBoutsCount = new Map<string, number>();

  sortedBouts.forEach(bout => {
    const boutDate = new Date(bout.date);
    const boutDateString = boutDate.toDateString();
    
    // Reset daily counts if date changes
    if (boutDateString !== lastBoutDate) {
      dailyBoutsCount.clear();
      lastBoutDate = boutDateString;
    }

    const fencer1 = fencerStats.get(bout.fencer1Id);
    const fencer2 = fencerStats.get(bout.fencer2Id);
    const referee = fencerStats.get(bout.refereeId);

    if (!fencer1 || !fencer2) return; // Skip if a fencer doesn't exist

    // --- Bout Count ---
    fencer1.bouts += 1;
    fencer2.bouts += 1;
    if(referee) referee.refereedBouts += 1;
    
    const winnerId = bout.score1 > bout.score2 ? bout.fencer1Id : bout.fencer2Id;
    const winner = fencerStats.get(winnerId);
    if(winner) winner.wins += 1;

    // --- Rating Change ---
    const winChance1 = 1 / (1 + Math.pow(10, (fencer2.rating - fencer1.rating) / CURVE_CONSTANT));
    
    let ratingChange;
    if (winnerId === fencer1.id) {
        ratingChange = BASE_CHANGE * (1 - winChance1);
    } else {
        ratingChange = BASE_CHANGE * (0 - winChance1);
    }

    const scoreDiff = Math.abs(bout.score1 - bout.score2);
    ratingChange *= (scoreDiff + WIN_BONUS) / (MAX_SCORE + WIN_BONUS);

    fencer1.rating += ratingChange;
    fencer2.rating -= ratingChange;

    // --- Points Change ---
    const now = new Date();
    const monthsOld = (now.getFullYear() - boutDate.getFullYear()) * 12 + (now.getMonth() - boutDate.getMonth());

    if (monthsOld >= LEADERBOARD_MONTHS_EXPIRE) return; // Skip old bouts

    const ageScale = (LEADERBOARD_MONTHS_EXPIRE - monthsOld) / LEADERBOARD_MONTHS_EXPIRE;

    const fencer1DailyBouts = dailyBoutsCount.get(fencer1.id) || 0;
    const fencer2DailyBouts = dailyBoutsCount.get(fencer2.id) || 0;
    dailyBoutsCount.set(fencer1.id, fencer1DailyBouts + 1);
    dailyBoutsCount.set(fencer2.id, fencer2DailyBouts + 1);

    const multiplier1 = 1.0 + fencer1DailyBouts * MULTIPLIER_AMOUNT;
    const multiplier2 = 1.0 + fencer2DailyBouts * MULTIPLIER_AMOUNT;

    let pointsGained1 = POINTS_BOUT + (bout.score1 * POINTS_TOUCH);
    let pointsGained2 = POINTS_BOUT + (bout.score2 * POINTS_TOUCH);

    if (winnerId === fencer1.id) {
        pointsGained1 += POINTS_WIN;
    } else {
        pointsGained2 += POINTS_WIN;
    }

    const finalPoints1 = pointsGained1 * ageScale * multiplier1 * (1 - winChance1);
    const finalPoints2 = pointsGained2 * ageScale * multiplier2 * winChance1;
    
    fencer1.points += finalPoints1;
    fencer2.points += finalPoints2;
  });

  return Array.from(fencerStats.values()).sort((a, b) => b.points - a.points);
}
