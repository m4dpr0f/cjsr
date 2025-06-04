import { 
  users, prompts, raceHistory, recoveryTokens, shrineOfferings, garuEggs, playerStats, loreSubmissions,
  type User, type Prompt, type RaceHistory, type RecoveryToken, 
  type InsertUser, type InsertPrompt, type InsertRaceHistory,
  type ShrineOffering, type InsertShrineOffering,
  type GaruEgg, type InsertGaruEgg
} from "@shared/schema";
import crypto from 'crypto';
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'fast-csv';

// Constants for the egg generation system
const GARU_EGG_TYPES = [
  "EtherGaru", "AirGaru", "FireGaru", "WaterGaru", 
  "EarthGaru", "ChaosGaru", "OrderGaru", "WealthGaru"
];

const NAME_TEMPLATES = {
  "EtherGaru": ["Aethera", "Skyweave", "Celestial", "Lumina"],
  "AirGaru": ["Zephyr", "Breeze", "Windcrest", "Galeforce"],
  "FireGaru": ["Ember", "Flame", "Pyra", "Inferno"],
  "WaterGaru": ["Ripple", "Cascade", "Tide", "Aquarius"],
  "EarthGaru": ["Terra", "Boulder", "Verdant", "Grove"],
  "ChaosGaru": ["Entropy", "Vortex", "Maelstrom", "Discord"],
  "OrderGaru": ["Harmony", "Balance", "Serenity", "Equanimity"],
  "WealthGaru": ["Aureus", "Treasure", "Fortune", "Prosper"]
};

const ELEMENTAL_AFFINITIES = {
  "EtherGaru": ["Sound", "Sky", "Dream", "Soul"],
  "AirGaru": ["Wind", "Lightning", "Cloud", "Storm"],
  "FireGaru": ["Flame", "Heat", "Spark", "Volcanic"],
  "WaterGaru": ["Ocean", "River", "Rain", "Ice"],
  "EarthGaru": ["Forest", "Mountain", "Quake", "Crystal"],
  "ChaosGaru": ["Void", "Shadow", "Fury", "Eldritch"],
  "OrderGaru": ["Light", "Diamond", "Law", "Peace"],
  "WealthGaru": ["Gold", "Silver", "Copper", "Jade"]
};

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXp(userId: number, xpAmount: number): Promise<User | undefined>;
  updateUserQLX(userId: number, qlxAmount: number): Promise<User | undefined>;
  updateUserProfile(userId: number, updates: Partial<User>): Promise<User | undefined>;
  getLeaderboard(): Promise<{ leaderboard: User[] }>;
  updateUserStats(userId: number, wpm: number, accuracy: number, wonRace: boolean): Promise<User | undefined>;
  updateUserCampaignProgress(userId: number, campaignProgress: string): Promise<User | undefined>;
  updateUserCustomization(
    userId: number, 
    chickenName: string,
    chickenType: string, 
    jockeyType: string, 
    trailType: string
  ): Promise<User | undefined>;
  incrementUserPromptCount(userId: number): Promise<User | undefined>;
  updateUserPassword(userId: number, newPassword: string): Promise<User | undefined>;
  
  // Recovery methods
  createRecoveryToken(userId: number, tokenType: string): Promise<string>;
  getRecoveryTokenByToken(token: string): Promise<RecoveryToken | undefined>;
  validateRecoveryToken(token: string): Promise<{valid: boolean, userId?: number, tokenType?: string}>;
  markTokenAsUsed(tokenId: number): Promise<void>;
  
  // Prompt methods
  getPrompt(id: number): Promise<Prompt | undefined>;
  getRandomPrompt(): Promise<Prompt | undefined>;
  getAllPrompts(): Promise<Prompt[]>;
  getPromptsByAuthorId(authorId: number): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  incrementPromptUsedCount(promptId: number): Promise<Prompt | undefined>;
  
  // SCRIBE Hall methods
  getUserLoreSubmissions(userId: number): Promise<any[]>;
  getFeaturedLoreSubmissions(): Promise<any[]>;
  createLoreSubmission(submission: {
    userId: number;
    title: string;
    content: string;
    category: string;
    promptId?: number;
    wordCount: number;
    characterCount: number;
    xpAwarded: number;
  }): Promise<any>;
  addUserXP(userId: number, xpAmount: number): Promise<void>;

  // Codex Crucible methods
  getRecentOfferings(): Promise<ShrineOffering[]>;
  getUserEggs(userId: number): Promise<GaruEgg[]>;
  createOffering(offering: { 
    userId: number; 
    petalId: string; 
    source: string; 
    type: string;
  }): Promise<ShrineOffering>;
  createGaruEgg(egg: {
    userId: number;
    petalId: string;
    name: string;
    timestamp: string;
  }): Promise<GaruEgg>;
  
  // Race history methods
  createRaceHistory(raceHistory: InsertRaceHistory): Promise<RaceHistory>;
  getRaceHistoryByUserId(userId: number, limit?: number): Promise<RaceHistory[]>;

  // Player stats methods
  getUserStats(userId: number): Promise<any>;
  
  // Stats export methods
  exportUserStatsToCSV(filePath: string): Promise<string>;
  exportLeaderboardToCSV(filePath: string): Promise<string>;
  exportRaceHistoryToCSV(filePath: string): Promise<string>;
  
  // Garu Egg collection methods
  getEgg(id: number): Promise<GaruEgg | undefined>;
  getUserEggs(userId: number): Promise<GaruEgg[]>;
  createGaruEgg(egg: { userId: number; petalId: string; name: string; timestamp: string }): Promise<GaruEgg>;
  updateEggStats(eggId: number, newStats: any): Promise<GaruEgg | undefined>;
  hatchEgg(eggId: number): Promise<GaruEgg | undefined>;
  upgradeEgg(eggId: number, xpToAdd: number): Promise<GaruEgg | undefined>;
  generateRandomEgg(userId: number, source?: string): Promise<GaruEgg>;
}

export class DatabaseStorage implements IStorage {
  // User password update
  async updateUserPassword(userId: number, newPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        password: newPassword
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }
  
  // Recovery token methods
  async createRecoveryToken(userId: number, tokenType: string): Promise<string> {
    // Generate a random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration time (1 hour from now)
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + 1);
    
    // Create the token in the database
    await db
      .insert(recoveryTokens)
      .values({
        user_id: userId,
        token,
        type: tokenType,
        expires_at,
        used: false
      });
    
    return token;
  }
  
  async getRecoveryTokenByToken(token: string): Promise<typeof recoveryTokens.$inferSelect | undefined> {
    const [recoveryToken] = await db
      .select()
      .from(recoveryTokens)
      .where(eq(recoveryTokens.token, token));
    
    return recoveryToken;
  }
  
  async validateRecoveryToken(token: string): Promise<{valid: boolean, userId?: number, tokenType?: string}> {
    const recoveryToken = await this.getRecoveryTokenByToken(token);
    
    if (!recoveryToken) {
      return { valid: false };
    }
    
    // Check if token is expired or already used
    const now = new Date();
    if (recoveryToken.expires_at < now || recoveryToken.used) {
      return { valid: false };
    }
    
    return { 
      valid: true, 
      userId: recoveryToken.user_id,
      tokenType: recoveryToken.type 
    };
  }
  
  async markTokenAsUsed(tokenId: number): Promise<void> {
    await db
      .update(recoveryTokens)
      .set({
        used: true
      })
      .where(eq(recoveryTokens.id, tokenId));
  }
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create initial player stats with the user's chosen faction
    const chosenFaction = insertUser.current_faction || 'd2';
    await db
      .insert(playerStats)
      .values({
        user_id: user.id,
        current_faction: chosenFaction,
        faction_xp: {
          d2: 0, d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0
        }
      });
    
    return user;
  }

  async updateUserXp(userId: number, xpAmount: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        xp: sql`${users.xp} + ${xpAmount}`
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserQLX(userId: number, qlxAmount: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        qlx_coins: sql`${users.qlx_coins} + ${qlxAmount}`
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStats(userId: number, wpm: number, accuracy: number, wonRace: boolean): Promise<User | undefined> {
    const currentUser = await this.getUser(userId);
    if (!currentUser) return undefined;

    // Safely handle null/undefined values with fallbacks
    const currentAvgWpm = currentUser.avg_wpm || 0;
    const currentAccuracy = currentUser.accuracy || 0;
    const currentTotalRaces = currentUser.total_races || 0;

    // Calculate new average WPM
    const totalWpm = currentAvgWpm * currentTotalRaces + wpm;
    const newTotalRaces = currentTotalRaces + 1;
    const newAvgWpm = Math.round(totalWpm / newTotalRaces);

    // Calculate new average accuracy
    const totalAccuracy = currentAccuracy * currentTotalRaces + accuracy;
    const newAvgAccuracy = Math.round(totalAccuracy / newTotalRaces);

    // Ensure we don't pass NaN values
    const safeAvgWpm = isNaN(newAvgWpm) ? wpm : newAvgWpm;
    const safeAccuracy = isNaN(newAvgAccuracy) ? accuracy : newAvgAccuracy;

    const [user] = await db
      .update(users)
      .set({
        total_races: sql`${users.total_races} + 1`,
        races_won: wonRace ? sql`${users.races_won} + 1` : users.races_won,
        avg_wpm: safeAvgWpm,
        accuracy: safeAccuracy
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async updateUserCustomization(
    userId: number,
    chickenName: string,
    chickenType: string,
    jockeyType: string,
    trailType: string,
    faction?: string
  ): Promise<User | undefined> {
    const updateData: any = {};
    
    // Only update fields that are provided
    if (chickenName) updateData.chicken_name = chickenName;
    if (chickenType) updateData.chicken_type = chickenType;
    if (jockeyType) updateData.jockey_type = jockeyType;
    if (trailType) updateData.trail_type = trailType;
    
    // Only update user table if there are fields to update
    let user;
    if (Object.keys(updateData).length > 0) {
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      user = updatedUser;
    } else {
      // Get current user if no updates needed
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      user = currentUser;
    }
    
    // Ensure playerStats record exists and update faction
    if (faction) {
      // Try to update existing record first
      const updateResult = await db
        .update(playerStats)
        .set({ current_faction: faction })
        .where(eq(playerStats.user_id, userId))
        .returning();
      
      // If no record exists, create one
      if (updateResult.length === 0) {
        await db
          .insert(playerStats)
          .values({
            user_id: userId,
            current_faction: faction,
            faction_xp: {}
          });
      }
    }
    
    return user;
  }

  // Campaign progress is now handled by CampaignService in campaign-service.ts

  async incrementUserPromptCount(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        prompts_added: sql`${users.prompts_added} + 1`
      })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async updateUserProfile(userId: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getLeaderboard(): Promise<{ leaderboard: User[] }> {
    const leaderboard = await db
      .select()
      .from(users)
      .orderBy(desc(users.avg_wpm))
      .limit(50);
    return { leaderboard };
  }

  async updateUserCampaignProgress(userId: number, campaignProgress: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        campaign_progress: campaignProgress
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt;
  }

  async getRandomPrompt(): Promise<Prompt | undefined> {
    // Get a random prompt that is active
    const allPrompts = await db
      .select()
      .from(prompts)
      .where(eq(prompts.is_active, true));
    
    if (allPrompts.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * allPrompts.length);
    return allPrompts[randomIndex];
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return db.select().from(prompts);
  }

  async getPromptsByAuthorId(authorId: number): Promise<Prompt[]> {
    return db
      .select()
      .from(prompts)
      .where(eq(prompts.author_id, authorId));
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const [prompt] = await db
      .insert(prompts)
      .values(insertPrompt)
      .returning();
    
    return prompt;
  }

  async incrementPromptUsedCount(promptId: number): Promise<Prompt | undefined> {
    const [prompt] = await db
      .update(prompts)
      .set({
        used_count: sql`${prompts.used_count} + 1`
      })
      .where(eq(prompts.id, promptId))
      .returning();
    
    return prompt;
  }

  async createRaceHistory(insertRaceHistory: InsertRaceHistory): Promise<RaceHistory> {
    const [raceHistoryEntry] = await db
      .insert(raceHistory)
      .values(insertRaceHistory)
      .returning();
    
    return raceHistoryEntry;
  }

  async getRaceHistoryByUserId(userId: number, limit?: number): Promise<RaceHistory[]> {
    const query = db
      .select()
      .from(raceHistory)
      .where(eq(raceHistory.user_id, userId))
      .orderBy(desc(raceHistory.race_date));
    
    if (limit) {
      return query.limit(limit);
    }
    
    return query;
  }

  async getUserStats(userId: number): Promise<any> {
    const [stats] = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.user_id, userId))
      .limit(1);
    
    return stats;
  }

  async updateCampaignProgress(userId: number, campaignProgress: string): Promise<void> {
    await db
      .update(users)
      .set({ campaign_progress: campaignProgress })
      .where(eq(users.id, userId));
  }

  // Export all user stats to CSV
  async exportUserStatsToCSV(filePath: string): Promise<string> {
    const userStats = await db.select().from(users);
    
    return new Promise((resolve, reject) => {
      const csvStream = csv.format({ headers: true });
      const writeStream = fs.createWriteStream(filePath);

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

      csvStream.pipe(writeStream);

      // Transform and write each user
      for (const user of userStats) {
        csvStream.write({
          id: user.id,
          username: user.username,
          created_at: user.created_at.toISOString(),
          xp: user.xp,
          races_won: user.races_won,
          total_races: user.total_races,
          avg_wpm: user.avg_wpm,
          accuracy: user.accuracy,
          prompts_added: user.prompts_added,
          chicken_name: user.chicken_name,
          chicken_type: user.chicken_type,
          jockey_type: user.jockey_type,
          trail_type: user.trail_type
        });
      }

      csvStream.end();
    });
  }

  // Export leaderboard (top players by WPM, races won)
  async exportLeaderboardToCSV(filePath: string): Promise<string> {
    const leaderboard = await db
      .select()
      .from(users)
      .orderBy(desc(users.avg_wpm))
      .limit(100);
    
    return new Promise((resolve, reject) => {
      const csvStream = csv.format({ headers: true });
      const writeStream = fs.createWriteStream(filePath);

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

      csvStream.pipe(writeStream);

      // Transform and write each user
      for (const user of leaderboard) {
        csvStream.write({
          rank: leaderboard.indexOf(user) + 1,
          username: user.username,
          avg_wpm: user.avg_wpm,
          accuracy: user.accuracy,
          races_won: user.races_won,
          total_races: user.total_races,
          win_rate: user.total_races > 0 ? (user.races_won / user.total_races * 100).toFixed(2) + '%' : '0%',
          xp: user.xp
        });
      }

      csvStream.end();
    });
  }

  // Export all race history to CSV
  async exportRaceHistoryToCSV(filePath: string): Promise<string> {
    // Get race history with joined user and prompt data
    const raceData = await db
      .select({
        race_id: raceHistory.id,
        username: users.username,
        prompt_text: prompts.text,
        position: raceHistory.position,
        total_players: raceHistory.total_players,
        wpm: raceHistory.wpm,
        accuracy: raceHistory.accuracy,
        time_taken: raceHistory.time_taken,
        xp_gained: raceHistory.xp_gained,
        race_date: raceHistory.race_date
      })
      .from(raceHistory)
      .innerJoin(users, eq(raceHistory.user_id, users.id))
      .innerJoin(prompts, eq(raceHistory.prompt_id, prompts.id))
      .orderBy(desc(raceHistory.race_date));
    
    return new Promise((resolve, reject) => {
      const csvStream = csv.format({ headers: true });
      const writeStream = fs.createWriteStream(filePath);

      writeStream.on('finish', () => {
        resolve(filePath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

      csvStream.pipe(writeStream);

      // Write each race record
      for (const race of raceData) {
        csvStream.write({
          race_id: race.race_id,
          username: race.username,
          prompt_text: race.prompt_text,
          position: race.position,
          total_players: race.total_players,
          wpm: race.wpm,
          accuracy: race.accuracy,
          time_taken: race.time_taken + 's',
          xp_gained: race.xp_gained,
          race_date: race.race_date.toISOString()
        });
      }

      csvStream.end();
    });
  }

  // Garu Egg collection methods
  async getEgg(id: number): Promise<GaruEgg | undefined> {
    const [egg] = await db.select().from(garuEggs).where(eq(garuEggs.id, id));
    return egg;
  }
  
  async getUserEggs(userId: number): Promise<GaruEgg[]> {
    return db.select().from(garuEggs).where(eq(garuEggs.user_id, userId));
  }
  
  // Get eggs created after a specific date (for daily limit checking)
  async getUserEggsAfterDate(userId: number, date: Date): Promise<GaruEgg[]> {
    return db.select()
      .from(garuEggs)
      .where(and(
        eq(garuEggs.user_id, userId),
        sql`${garuEggs.timestamp} >= ${date.toISOString()}`
      ));
  }
  
  async createGaruEgg(egg: { userId: number; petalId: string; name: string; timestamp: string }): Promise<GaruEgg> {
    // Import TEK8 petal system constants
    const { TEK8_PETALS, ELEMENTAL_AFFINITIES } = require('./routes/tek8');
    
    // Get petal data based on the selected petal ID
    const petal = TEK8_PETALS[egg.petalId];
    if (!petal) {
      throw new Error("Invalid petal ID");
    }
    
    // Get a random color for the egg based on its elemental affinity
    const colors = ELEMENTAL_AFFINITIES[petal.element].colors;
    const eggColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Create the new egg in the database
    const [newEgg] = await db.insert(garuEggs).values({
      user_id: egg.userId,
      name: egg.name,
      type: petal.eggType,
      petal_id: egg.petalId,
      elemental_affinity: petal.element,
      color: eggColor,
      timestamp: new Date(egg.timestamp)
    }).returning();
    
    return newEgg;
  }
  
  // Helper method to get petal data using the TEK8 petal system
  private getPetalData(petalId: string): { element: string; eggType: string } {
    const { TEK8_PETALS } = require('./routes/tek8');
    
    // Convert the key to lowercase to ensure case-insensitive matching
    const normalizedId = petalId.toLowerCase();
    
    // Try to find the petal by its ID
    if (TEK8_PETALS[normalizedId]) {
      return {
        element: TEK8_PETALS[normalizedId].element,
        eggType: TEK8_PETALS[normalizedId].eggType
      };
    }
    
    // If not found, default to a random petal
    const petalKeys = Object.keys(TEK8_PETALS);
    const randomKey = petalKeys[Math.floor(Math.random() * petalKeys.length)];
    
    return {
      element: TEK8_PETALS[randomKey].element,
      eggType: TEK8_PETALS[randomKey].eggType
    };
  }
  
  // Helper method to get egg color based on elemental affinity
  private getEggColor(element: string): string {
    const { ELEMENTAL_AFFINITIES } = require('./routes/tek8');
    
    // Normalize the element name to lowercase for case-insensitive matching
    const normalizedElement = element.toLowerCase();
    
    if (ELEMENTAL_AFFINITIES[normalizedElement]) {
      const colors = ELEMENTAL_AFFINITIES[normalizedElement].colors;
      return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Default color if element not found
    return "#888888"; // gray
  }
  
  // Shrine offering methods
  async getRecentOfferings(): Promise<ShrineOffering[]> {
    return await db.select().from(shrineOfferings).orderBy(desc(shrineOfferings.timestamp)).limit(10);
  }
  
  async createOffering(offering: { userId: number; petalId: string; source: string; type: string }): Promise<ShrineOffering> {
    const [result] = await db.insert(shrineOfferings).values({
      user_id: offering.userId,
      petal_id: offering.petalId,
      source: offering.source,
      type: offering.type,
      timestamp: new Date()
    }).returning();
    
    return result;
  }
  
  async createEgg(egg: InsertGaruEgg): Promise<GaruEgg> {
    const [newEgg] = await db.insert(garuEggs).values(egg).returning();
    return newEgg;
  }
  
  // Update egg metadata without requiring schema changes
  async updateEggStats(eggId: number, newStats: any): Promise<GaruEgg | undefined> {
    // Get the current egg
    const egg = await this.getEgg(eggId);
    if (!egg) return undefined;
    
    // Keep the existing egg properties, only update if needed
    const [updatedEgg] = await db
      .update(garuEggs)
      .set({
        name: newStats.name || egg.name,
        type: newStats.type || egg.type,
        elemental_affinity: newStats.elementalAffinity || egg.elemental_affinity,
        color: newStats.color || egg.color
      })
      .where(eq(garuEggs.id, eggId))
      .returning();
    
    return updatedEgg;
  }
  
  async hatchEgg(eggId: number): Promise<GaruEgg | undefined> {
    const [egg] = await db
      .update(garuEggs)
      .set({
        hatched: true
      })
      .where(eq(garuEggs.id, eggId))
      .returning();
    
    return egg;
  }
  
  // Since we don't have xp or level fields in the current schema, 
  // we'll implement a simplified version that just modifies the egg name
  async upgradeEgg(eggId: number, xpToAdd: number): Promise<GaruEgg | undefined> {
    const egg = await this.getEgg(eggId);
    if (!egg) return undefined;
    
    // Simple upgrade - just add a star to the name to indicate level
    const newName = `${egg.name}★`;
    
    const [updatedEgg] = await db
      .update(garuEggs)
      .set({
        name: newName
      })
      .where(eq(garuEggs.id, eggId))
      .returning();
    
    return updatedEgg;
  }
  
  async generateRandomEgg(userId: number, petalId: string = "D20"): Promise<GaruEgg> {
    // Get a random egg type
    const eggType = GARU_EGG_TYPES[Math.floor(Math.random() * GARU_EGG_TYPES.length)];
    
    // Generate a unique name for the egg
    const nameBase = NAME_TEMPLATES[eggType as keyof typeof NAME_TEMPLATES][
      Math.floor(Math.random() * NAME_TEMPLATES[eggType as keyof typeof NAME_TEMPLATES].length)
    ];
    const nameSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    const name = `${nameBase}-${nameSuffix}`;
    
    // Get a random elemental affinity for this egg type
    const affinities = ELEMENTAL_AFFINITIES[eggType as keyof typeof ELEMENTAL_AFFINITIES];
    const elementalAffinity = affinities[Math.floor(Math.random() * affinities.length)];
    
    // Set egg color based on type
    let color = "#7e57c2"; // Default purple
    
    switch(eggType) {
      case "EtherGaru": color = "#000000"; break; // Black (changed from Purple)
      case "AirGaru": color = "#ffffff"; break; // White (changed from Light blue)
      case "FireGaru": color = "#f44336"; break; // Red
      case "WaterGaru": color = "#2196f3"; break; // Blue
      case "EarthGaru": color = "#4caf50"; break; // Green
      case "ChaosGaru": color = "#212121"; break; // Black
      case "OrderGaru": color = "#f9a825"; break; // Saffron/Amber (changed from White)
      case "WealthGaru": color = "#ffc107"; break; // Gold (Money element, formerly Coin)
    }
    
    // Create the egg data
    const eggData: InsertGaruEgg = {
      user_id: userId,
      name: name,
      type: eggType,
      elemental_affinity: elementalAffinity,
      color: color,
      petal_id: petalId,
      hatched: false
    };
    
    // Insert the egg into the database
    const [newEgg] = await db.insert(garuEggs).values(eggData).returning();
    return newEgg;
  }

  // Seed initial prompts if needed
  async seedPrompts(): Promise<void> {
    // Check if we have any prompts
    const existingPrompts = await this.getAllPrompts();
    
    if (existingPrompts.length === 0) {
      console.log("Seeding initial prompts...");
      
      // Create a system user for default prompts if it doesn't exist
      let systemUser = await this.getUserByUsername("system");
      
      if (!systemUser) {
        systemUser = await this.createUser({
          username: "system",
          password: "not_used_" + Math.random().toString(36).substring(2)
        });
      }
      
      // Add some default prompts
      const defaultPrompts = [
        "The quick brown fox jumps over the lazy dog. This pangram contains all letters of the English alphabet.",
        "Typing speed is measured in words per minute (WPM). Practice regularly to improve your typing skills.",
        "Minecraft is a game about placing blocks and going on adventures. Explore randomly generated worlds!",
        "In the world of Minecraft, chicken jockeys are baby zombies or skeletons riding chickens.",
        "Practice makes perfect. The more you type, the faster and more accurate you will become.",
        "Focus on accuracy first, then speed. It's better to type slowly and correctly than quickly with errors.",
        "Keep your fingers positioned over the home row keys: A, S, D, F for the left hand and J, K, L, ; for the right.",
        "Minecraft has sold over 238 million copies across all platforms, making it the best-selling video game of all time."
      ];
      
      for (const text of defaultPrompts) {
        await this.createPrompt({
          text,
          author_id: systemUser.id
        });
      }
      
      console.log("Seed prompts created successfully!");
    }
  }

  // SCRIBE Hall methods implementation
  async getUserLoreSubmissions(userId: number): Promise<any[]> {
    try {
      const submissions = await db
        .select()
        .from(loreSubmissions)
        .where(eq(loreSubmissions.user_id, userId))
        .orderBy(desc(loreSubmissions.submitted_at));
      return submissions;
    } catch (error) {
      console.error("Error fetching user lore submissions:", error);
      return [];
    }
  }

  async getFeaturedLoreSubmissions(): Promise<any[]> {
    try {
      const featured = await db
        .select()
        .from(loreSubmissions)
        .where(eq(loreSubmissions.status, 'featured'))
        .orderBy(desc(loreSubmissions.submitted_at))
        .limit(10);
      return featured;
    } catch (error) {
      console.error("Error fetching featured lore submissions:", error);
      return [];
    }
  }

  async createLoreSubmission(submission: {
    userId: number;
    title: string;
    content: string;
    category: string;
    promptId?: number;
    wordCount: number;
    characterCount: number;
    xpAwarded: number;
  }): Promise<any> {
    const [newSubmission] = await db
      .insert(loreSubmissions)
      .values({
        user_id: submission.userId,
        title: submission.title,
        content: submission.content,
        category: submission.category,
        prompt_id: submission.promptId,
        word_count: submission.wordCount,
        character_count: submission.characterCount,
        xp_awarded: submission.xpAwarded,
        status: 'pending',
        is_featured: false
      })
      .returning();
    return newSubmission;
  }

  async addUserXP(userId: number, xpAmount: number): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          xp: sql`${users.xp} + ${xpAmount}`
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error adding user XP:", error);
    }
  }
}

export const storage = new DatabaseStorage();

// Seed prompts when needed
storage.seedPrompts().catch(console.error);