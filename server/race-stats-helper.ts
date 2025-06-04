/**
 * Helper to get actual XP values from database after race completion
 * Uses the same data source as the profile endpoint for consistency
 */

import { storage } from './storage';

export async function getActualRaceStats(username: string) {
  try {
    const user = await storage.getUserByUsername(username);
    if (!user) {
      throw new Error(`User not found: ${username}`);
    }

    const playerStats = await storage.getUserStats(user.id);
    
    // Parse faction XP data the same way the profile endpoint does
    let factionXpData = {};
    if (playerStats?.faction_xp) {
      if (typeof playerStats.faction_xp === 'string') {
        try {
          factionXpData = JSON.parse(playerStats.faction_xp);
        } catch (e) {
          console.error("Failed to parse faction_xp JSON:", e);
          factionXpData = {};
        }
      } else {
        factionXpData = playerStats.faction_xp;
      }
    }

    return {
      username: user.username,
      totalXp: user.xp || 0,
      currentFaction: playerStats?.current_faction || 'd4',
      factionXp: factionXpData,
      avgWpm: user.avg_wpm || 0,
      accuracy: user.accuracy || 0,
      totalRaces: user.total_races || 0,
      racesWon: user.races_won || 0
    };
  } catch (error) {
    console.error(`Failed to get race stats for ${username}:`, error);
    return null;
  }
}

export async function getXpGainedInRace(username: string, previousXp: number) {
  const currentStats = await getActualRaceStats(username);
  if (!currentStats) return 0;
  
  return Math.max(0, currentStats.totalXp - previousXp);
}