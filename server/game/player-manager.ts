import { IStorage } from "../storage";
import { RaceStats } from "@shared/schema";

export class PlayerManager {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  /**
   * Update a player's XP
   */
  async updatePlayerXp(userId: number, xpAmount: number): Promise<boolean> {
    try {
      const updatedUser = await this.storage.updateUserXp(userId, xpAmount);
      return !!updatedUser;
    } catch (error) {
      console.error("Error updating player XP:", error);
      return false;
    }
  }
  
  /**
   * Update a player's stats after a race
   */
  async updatePlayerStats(
    userId: number, 
    wpm: number, 
    accuracy: number, 
    position: number, 
    totalPlayers: number
  ): Promise<boolean> {
    try {
      // Determine if player won the race
      const wonRace = position === 1;
      
      // Update user stats
      const updatedUser = await this.storage.updateUserStats(
        userId,
        wpm,
        accuracy,
        wonRace
      );
      
      return !!updatedUser;
    } catch (error) {
      console.error("Error updating player stats:", error);
      return false;
    }
  }
  
  /**
   * Record a race in the player's history
   */
  async recordRaceHistory(
    userId: number,
    promptId: number,
    position: number,
    totalPlayers: number,
    stats: RaceStats,
    xpGained: number
  ): Promise<boolean> {
    try {
      await this.storage.createRaceHistory({
        user_id: userId,
        prompt_id: promptId,
        position,
        total_players: totalPlayers,
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        time_taken: stats.time,
        xp_gained: xpGained
      });
      
      return true;
    } catch (error) {
      console.error("Error recording race history:", error);
      return false;
    }
  }
  
  /**
   * Update a player's customization
   */
  async updatePlayerCustomization(
    userId: number,
    chickenName: string,
    chickenType: string,
    jockeyType: string,
    trailType: string
  ): Promise<boolean> {
    try {
      const updatedUser = await this.storage.updateUserCustomization(
        userId,
        chickenName,
        chickenType,
        jockeyType,
        trailType
      );
      
      return !!updatedUser;
    } catch (error) {
      console.error("Error updating player customization:", error);
      return false;
    }
  }
}
