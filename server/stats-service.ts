import { db } from "./db";
import { playerStats, factionLeaderboards, raceHistory, users } from "@shared/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import type { PlayerStats, InsertPlayerStats, FactionLeaderboard, InsertRaceHistory } from "@shared/schema";

export class StatsService {
  /**
   * Update player stats after a race
   */
  static async updatePlayerStats(
    userId: number,
    raceData: {
      wpm: number;
      accuracy: number;
      position: number;
      totalPlayers: number;
      faction: string;
      charactersTyped?: number;
      campaignRaceNumber?: number;
      xpGained: number;
    }
  ): Promise<void> {
    console.log(`Recording race for user ${userId}: WPM=${raceData.wpm}, Accuracy=${raceData.accuracy}, Position=${raceData.position}, Faction=${raceData.faction}`);
    // Get existing player stats or create new ones
    let stats = await db.select().from(playerStats).where(eq(playerStats.user_id, userId)).limit(1);
    
    if (stats.length === 0) {
      // Create new player stats record
      await db.insert(playerStats).values({
        user_id: userId,
        top_wpm: raceData.wpm,
        top_accuracy: raceData.accuracy,
        total_xp: raceData.xpGained,
        races_completed: 1,
        races_won: raceData.position === 1 ? 1 : 0,
        current_faction: raceData.faction,
        faction_xp: {
          d2: raceData.faction === 'd2' ? raceData.xpGained : 0,
          d4: raceData.faction === 'd4' ? raceData.xpGained : 0,
          d6: raceData.faction === 'd6' ? raceData.xpGained : 0,
          d8: raceData.faction === 'd8' ? raceData.xpGained : 0,
          d10: raceData.faction === 'd10' ? raceData.xpGained : 0,
          d12: raceData.faction === 'd12' ? raceData.xpGained : 0,
          d20: raceData.faction === 'd20' ? raceData.xpGained : 0,
          d100: raceData.faction === 'd100' ? raceData.xpGained : 0,
        }
      });
    } else {
      // Update existing stats
      const currentStats = stats[0];
      const currentFactionXp = currentStats.faction_xp as any || {};
      
      // Update faction XP
      currentFactionXp[raceData.faction] = (currentFactionXp[raceData.faction] || 0) + raceData.xpGained;
      
      await db.update(playerStats)
        .set({
          top_wpm: Math.max(currentStats.top_wpm, raceData.wpm),
          top_accuracy: Math.max(currentStats.top_accuracy, raceData.accuracy),
          total_xp: currentStats.total_xp + raceData.xpGained,
          races_completed: currentStats.races_completed + 1,
          races_won: currentStats.races_won + (raceData.position === 1 ? 1 : 0),
          current_faction: raceData.faction,
          faction_xp: currentFactionXp,
          updated_at: new Date()
        })
        .where(eq(playerStats.user_id, userId));
    }

    // Also update the main users table for profile display
    const currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (currentUser.length > 0) {
      const user = currentUser[0];
      const newTotalRaces = (user.total_races || 0) + 1;
      const newRacesWon = (user.races_won || 0) + (raceData.position === 1 ? 1 : 0);
      
      // Calculate proper running averages
      const currentAvgWpm = user.avg_wpm || 0;
      const currentAccuracy = user.accuracy || 0;
      const newAvgWpm = newTotalRaces === 1 ? raceData.wpm : 
        Math.round(((currentAvgWpm * (newTotalRaces - 1)) + raceData.wpm) / newTotalRaces);
      const newAvgAccuracy = newTotalRaces === 1 ? raceData.accuracy :
        Math.round(((currentAccuracy * (newTotalRaces - 1)) + raceData.accuracy) / newTotalRaces);
      
      await db.update(users)
        .set({
          xp: (user.xp || 0) + raceData.xpGained,
          total_races: newTotalRaces,
          races_won: newRacesWon,
          avg_wpm: newAvgWpm,
          accuracy: newAvgAccuracy
        })
        .where(eq(users.id, userId));
    }

    // Record individual race in race_history table
    await db.insert(raceHistory).values({
      user_id: userId,
      prompt_id: 1, // Default prompt ID for now
      position: raceData.position,
      total_players: raceData.totalPlayers,
      wpm: raceData.wpm,
      accuracy: raceData.accuracy,
      time_taken: 0, // We'll need to add this data later
      xp_gained: raceData.xpGained,
      race_date: new Date(),
      faction: raceData.faction
    });

    // Update faction leaderboards
    await this.updateFactionLeaderboard(userId, raceData);
  }

  /**
   * Update faction leaderboard entry for a player
   */
  static async updateFactionLeaderboard(
    userId: number,
    raceData: {
      wpm: number;
      accuracy: number;
      position: number;
      faction: string;
      xpGained: number;
    }
  ): Promise<void> {
    // Get username
    const user = await db.select({ username: users.username })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    
    if (user.length === 0) return;
    
    const username = user[0].username;

    // Check if player already has a faction leaderboard entry
    const existing = await db.select()
      .from(factionLeaderboards)
      .where(and(
        eq(factionLeaderboards.user_id, userId),
        eq(factionLeaderboards.faction, raceData.faction)
      ))
      .limit(1);

    if (existing.length === 0) {
      // Create new faction leaderboard entry
      await db.insert(factionLeaderboards).values({
        faction: raceData.faction,
        user_id: userId,
        username: username,
        top_wpm: raceData.wpm,
        top_accuracy: raceData.accuracy,
        total_faction_xp: raceData.xpGained,
        races_won_in_faction: raceData.position === 1 ? 1 : 0
      });
    } else {
      // Update existing faction leaderboard entry
      const current = existing[0];
      await db.update(factionLeaderboards)
        .set({
          username: username,
          top_wpm: Math.max(current.top_wpm, raceData.wpm),
          top_accuracy: Math.max(current.top_accuracy, raceData.accuracy),
          total_faction_xp: current.total_faction_xp + raceData.xpGained,
          races_won_in_faction: current.races_won_in_faction + (raceData.position === 1 ? 1 : 0),
          updated_at: new Date()
        })
        .where(and(
          eq(factionLeaderboards.user_id, userId),
          eq(factionLeaderboards.faction, raceData.faction)
        ));
    }
  }

  /**
   * Get faction leaderboard for a specific faction
   */
  static async getFactionLeaderboard(faction: string, limit: number = 100): Promise<FactionLeaderboard[]> {
    return await db.select()
      .from(factionLeaderboards)
      .where(eq(factionLeaderboards.faction, faction))
      .orderBy(desc(factionLeaderboards.total_faction_xp))
      .limit(limit);
  }

  /**
   * Get top players across all factions
   */
  static async getGlobalLeaderboard(limit: number = 100): Promise<PlayerStats[]> {
    return await db.select()
      .from(playerStats)
      .orderBy(desc(playerStats.total_xp))
      .limit(limit);
  }

  /**
   * Get player's stats and faction rankings
   */
  static async getPlayerProfile(userId: number): Promise<{
    stats: PlayerStats | null;
    factionRankings: { faction: string; rank: number; totalPlayers: number }[];
  }> {
    // Get player stats
    const stats = await db.select()
      .from(playerStats)
      .where(eq(playerStats.user_id, userId))
      .limit(1);

    if (stats.length === 0) {
      return { stats: null, factionRankings: [] };
    }

    // Get faction rankings
    const factionRankings = [];
    const factions = ['d2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

    for (const faction of factions) {
      // Get player's rank in this faction
      const rankQuery = await db.execute(sql`
        SELECT 
          rank,
          total_players
        FROM (
          SELECT 
            user_id,
            ROW_NUMBER() OVER (ORDER BY total_faction_xp DESC) as rank,
            COUNT(*) OVER() as total_players
          FROM faction_leaderboards 
          WHERE faction = ${faction}
        ) ranked
        WHERE user_id = ${userId}
      `);

      if (rankQuery.rows.length > 0) {
        const row = rankQuery.rows[0] as any;
        factionRankings.push({
          faction,
          rank: Number(row.rank),
          totalPlayers: Number(row.total_players)
        });
      }
    }

    return {
      stats: stats[0],
      factionRankings
    };
  }

  /**
   * Get faction statistics (total XP, top players, etc.)
   */
  static async getFactionStats(): Promise<{
    faction: string;
    name: string;
    color: string;
    totalXp: number;
    topPlayer: string | null;
    topPlayerWpm: number;
    topPlayerAccuracy: number;
    topPlayerMount: string | null;
    topPlayerFactionXp: number;
    playerCount: number;
  }[]> {
    const factionInfo = [
      { faction: 'd2', name: 'Coin', color: 'silver' },
      { faction: 'd4', name: 'Fire', color: 'red' },
      { faction: 'd6', name: 'Earth', color: 'green' },
      { faction: 'd8', name: 'Air', color: 'white' },
      { faction: 'd10', name: 'Chaos', color: 'indigo' },
      { faction: 'd12', name: 'Ether', color: 'black' },
      { faction: 'd20', name: 'Water', color: 'blue' },
      { faction: 'd100', name: 'Order', color: 'gold' }
    ];

    const factionStats = [];

    for (const info of factionInfo) {
      // Calculate total XP and get top contributor stats using PostgreSQL JSON operators
      const statsQuery = await db.execute(sql`
        SELECT 
          COALESCE(SUM(CASE 
            WHEN faction_xp IS NOT NULL 
            THEN CAST((faction_xp->${info.faction}) AS INTEGER)
            ELSE 0 
          END), 0) as total_xp,
          COUNT(CASE 
            WHEN current_faction = ${info.faction} 
            THEN 1 
            ELSE NULL 
          END) as player_count
        FROM player_stats
      `);

      // Get top contributor with their stats and mount name using PostgreSQL JSON operators
      const topPlayerQuery = await db.execute(sql`
        SELECT 
          u.username,
          u.avg_wpm as top_wpm,
          u.accuracy as top_accuracy,
          u.chicken_name as mount_name,
          CAST((ps.faction_xp->${info.faction}) AS INTEGER) as faction_xp
        FROM player_stats ps 
        JOIN users u ON ps.user_id = u.id 
        WHERE ps.faction_xp IS NOT NULL 
        AND CAST((ps.faction_xp->${info.faction}) AS INTEGER) > 0
        ORDER BY CAST((ps.faction_xp->${info.faction}) AS INTEGER) DESC 
        LIMIT 1
      `);

      const row = statsQuery.rows[0] as any;
      const topPlayer = topPlayerQuery.rows[0] as any;
      
      factionStats.push({
        ...info,
        totalXp: Number(row.total_xp || 0),
        topPlayer: topPlayer?.username || null,
        topPlayerWpm: Number(topPlayer?.top_wpm || 0),
        topPlayerAccuracy: Number(topPlayer?.top_accuracy || 0),
        topPlayerMount: topPlayer?.mount_name || null,
        topPlayerFactionXp: Number(topPlayer?.faction_xp || 0),
        playerCount: Number(row.player_count || 0)
      });
    }

    return factionStats.sort((a, b) => b.totalXp - a.totalXp);
  }
}