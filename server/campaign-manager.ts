import { storage } from './storage';

export interface CampaignProgress {
  steve: {
    currentChapter: number;
    completedChapters: number[];
    unlockedCharacters: string[];
    storylineFlags: Record<string, boolean>;
  };
  auto: {
    currentChapter: number;
    completedChapters: number[];
    unlockedCharacters: string[];
    storylineFlags: Record<string, boolean>;
  };
  matikah: {
    currentChapter: number;
    completedChapters: number[];
    unlockedCharacters: string[];
    storylineFlags: Record<string, boolean>;
  };
  iam: {
    currentChapter: number;
    completedChapters: number[];
    unlockedCharacters: string[];
    storylineFlags: Record<string, boolean>;
  };
}

export const defaultCampaignProgress: CampaignProgress = {
  steve: {
    currentChapter: 1,
    completedChapters: [],
    unlockedCharacters: ["html_steve"],
    storylineFlags: {}
  },
  auto: {
    currentChapter: 1,
    completedChapters: [],
    unlockedCharacters: [],
    storylineFlags: {}
  },
  matikah: {
    currentChapter: 1,
    completedChapters: [],
    unlockedCharacters: [],
    storylineFlags: {}
  },
  iam: {
    currentChapter: 1,
    completedChapters: [],
    unlockedCharacters: [],
    storylineFlags: {}
  }
};

export class CampaignManager {
  static async getCampaignProgress(userId: number): Promise<CampaignProgress> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.campaign_progress) {
        return defaultCampaignProgress;
      }
      
      const progress = JSON.parse(user.campaign_progress);
      // Merge with defaults to ensure all campaigns exist
      return {
        ...defaultCampaignProgress,
        ...progress
      };
    } catch (error) {
      console.error('Error getting campaign progress:', error);
      return defaultCampaignProgress;
    }
  }

  static async saveCampaignProgress(userId: number, progress: CampaignProgress): Promise<boolean> {
    try {
      await storage.updateUserCampaignProgress(userId, JSON.stringify(progress));
      return true;
    } catch (error) {
      console.error('Error saving campaign progress:', error);
      return false;
    }
  }

  static async completeChapter(userId: number, campaign: keyof CampaignProgress, chapter: number): Promise<boolean> {
    try {
      const progress = await this.getCampaignProgress(userId);
      
      if (!progress[campaign].completedChapters.includes(chapter)) {
        progress[campaign].completedChapters.push(chapter);
        progress[campaign].completedChapters.sort((a, b) => a - b);
      }
      
      // Advance to next chapter if this was the current one
      if (progress[campaign].currentChapter === chapter) {
        progress[campaign].currentChapter = chapter + 1;
      }
      
      // Award XP for chapter completion
      const xpReward = this.getChapterXpReward(campaign, chapter);
      await storage.updateUserXp(userId, xpReward);
      
      return await this.saveCampaignProgress(userId, progress);
    } catch (error) {
      console.error('Error completing chapter:', error);
      return false;
    }
  }

  static async unlockCharacter(userId: number, campaign: keyof CampaignProgress, character: string): Promise<boolean> {
    try {
      const progress = await this.getCampaignProgress(userId);
      
      if (!progress[campaign].unlockedCharacters.includes(character)) {
        progress[campaign].unlockedCharacters.push(character);
      }
      
      return await this.saveCampaignProgress(userId, progress);
    } catch (error) {
      console.error('Error unlocking character:', error);
      return false;
    }
  }

  static async setStorylineFlag(userId: number, campaign: keyof CampaignProgress, flag: string, value: boolean): Promise<boolean> {
    try {
      const progress = await this.getCampaignProgress(userId);
      progress[campaign].storylineFlags[flag] = value;
      return await this.saveCampaignProgress(userId, progress);
    } catch (error) {
      console.error('Error setting storyline flag:', error);
      return false;
    }
  }

  static getChapterXpReward(campaign: keyof CampaignProgress, chapter: number): number {
    const baseReward = {
      steve: 500,
      auto: 750,
      matikah: 1000,
      iam: 1500
    };
    
    return baseReward[campaign] * chapter;
  }

  static getCampaignInfo(campaign: keyof CampaignProgress) {
    const info = {
      steve: {
        title: "Steve's Heroic Journey",
        description: "Follow the brave adventures of Steve as he discovers his destiny",
        totalChapters: 12,
        difficulty: "Beginner",
        color: "blue"
      },
      auto: {
        title: "Auto's Technological Ascension",
        description: "Explore the fusion of magic and technology with Auto",
        totalChapters: 10,
        difficulty: "Intermediate",
        color: "green"
      },
      matikah: {
        title: "Matikah's Mystical Path",
        description: "Uncover ancient secrets with the enigmatic Matikah",
        totalChapters: 8,
        difficulty: "Advanced",
        color: "purple"
      },
      iam: {
        title: "The Mysterious Iam",
        description: "Delve into the deepest mysteries of the CJSR universe",
        totalChapters: 6,
        difficulty: "Expert",
        color: "red"
      }
    };
    
    return info[campaign];
  }
}