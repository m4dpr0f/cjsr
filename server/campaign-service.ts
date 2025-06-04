import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface CampaignProgress {
  steve: { completed: number[], bestScores: Record<number, any>, unlocked: boolean };
  auto: { completed: number[], bestScores: Record<number, any>, unlocked: boolean };
  matikah: { completed: number[], bestScores: Record<number, any>, unlocked: boolean };
  iam: { completed: number[], bestScores: Record<number, any>, unlocked: boolean };
}

export interface UnlockedRewards {
  trails: { steve: boolean, auto: boolean, matikah: boolean, iam: boolean };
  jockeys: { steve: boolean, auto: boolean, matikah: boolean, iam: boolean };
  mounts: Record<string, boolean>;
}

export class CampaignService {
  /**
   * Get campaign progress for a user
   */
  static async getCampaignProgress(userId: string): Promise<CampaignProgress> {
    try {
      const [userStats] = await db
        .select({ campaign_progress: users.campaign_progress })
        .from(users)
        .where(eq(users.id, parseInt(userId)));

      if (!userStats?.campaign_progress) {
        // Return default progress structure - ALL CAMPAIGNS UNLOCKED
        return {
          steve: { completed: [], bestScores: {}, unlocked: true },
          auto: { completed: [], bestScores: {}, unlocked: true },
          matikah: { completed: [], bestScores: {}, unlocked: true },
          iam: { completed: [], bestScores: {}, unlocked: true }
        };
      }

      return JSON.parse(userStats.campaign_progress) as CampaignProgress;
    } catch (error) {
      console.error("Error fetching campaign progress:", error);
      // Return default structure on error - ALL CAMPAIGNS UNLOCKED
      return {
        steve: { completed: [], bestScores: {}, unlocked: true },
        auto: { completed: [], bestScores: {}, unlocked: true },
        matikah: { completed: [], bestScores: {}, unlocked: true },
        iam: { completed: [], bestScores: {}, unlocked: true }
      };
    }
  }

  /**
   * Save campaign progress for a user
   */
  static async saveCampaignProgress(userId: string, progress: CampaignProgress): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ 
          campaign_progress: JSON.stringify(progress)
        })
        .where(eq(users.id, parseInt(userId)));

      return true;
    } catch (error) {
      console.error("Error saving campaign progress:", error);
      return false;
    }
  }

  /**
   * Mark a specific race as completed
   */
  static async markRaceCompleted(
    userId: string, 
    character: string, 
    raceNumber: number, 
    stats: { wpm: number; accuracy: number; time: number }
  ): Promise<boolean> {
    try {
      const progress = await this.getCampaignProgress(userId);
      
      if (!progress[character as keyof CampaignProgress]) {
        console.error(`Invalid character: ${character}`);
        return false;
      }

      const characterProgress = progress[character as keyof CampaignProgress];
      
      // Add to completed races if not already there
      if (!characterProgress.completed.includes(raceNumber)) {
        characterProgress.completed.push(raceNumber);
      }

      // Update best score if this is better
      const existingBest = characterProgress.bestScores[raceNumber];
      if (!existingBest || stats.wpm > existingBest.wpm || 
          (stats.wpm === existingBest.wpm && stats.accuracy > existingBest.accuracy)) {
        characterProgress.bestScores[raceNumber] = stats;
      }

      // Check if campaign is complete and unlock rewards
      if (characterProgress.completed.length >= 9) { // Assuming 9 races per campaign
        await this.unlockCampaignRewards(userId, character);
      }

      return await this.saveCampaignProgress(userId, progress);
    } catch (error) {
      console.error("Error marking race completed:", error);
      return false;
    }
  }

  /**
   * Get unlocked rewards for a user
   */
  static async getUnlockedRewards(userId: string): Promise<UnlockedRewards> {
    try {
      // For now, return default rewards structure since we're not tracking this yet
      return {
        trails: { steve: false, auto: false, matikah: false, iam: false },
        jockeys: { steve: true, auto: false, matikah: false, iam: false },
        mounts: {}
      };

      if (!userStats?.unlocked_rewards) {
        return {
          trails: { steve: false, auto: false, matikah: false, iam: false },
          jockeys: { steve: true, auto: false, matikah: false, iam: false }, // Steve starts unlocked
          mounts: {}
        };
      }

      return userStats.unlocked_rewards as UnlockedRewards;
    } catch (error) {
      console.error("Error fetching unlocked rewards:", error);
      return {
        trails: { steve: false, auto: false, matikah: false, iam: false },
        jockeys: { steve: true, auto: false, matikah: false, iam: false },
        mounts: {}
      };
    }
  }

  /**
   * Unlock campaign rewards when a campaign is completed
   */
  static async unlockCampaignRewards(userId: string, character: string): Promise<boolean> {
    try {
      const rewards = await this.getUnlockedRewards(userId);
      
      // Unlock trail and jockey for completed character
      rewards.trails[character as keyof typeof rewards.trails] = true;
      rewards.jockeys[character as keyof typeof rewards.jockeys] = true;

      await db
        .update(playerStats)
        .set({ 
          unlocked_rewards: rewards,
          updated_at: new Date()
        })
        .where(eq(playerStats.user_id, parseInt(userId)));

      return true;
    } catch (error) {
      console.error("Error unlocking campaign rewards:", error);
      return false;
    }
  }

  /**
   * Check if a character is unlocked
   */
  static async isCharacterUnlocked(userId: string, character: string): Promise<boolean> {
    try {
      const progress = await this.getCampaignProgress(userId);
      return progress[character as keyof CampaignProgress]?.unlocked || character === 'steve';
    } catch (error) {
      console.error("Error checking character unlock status:", error);
      return character === 'steve'; // Steve is always unlocked by default
    }
  }
}