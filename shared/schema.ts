import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  avatar_url: text("avatar_url"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  xp: integer("xp").default(0).notNull(),
  races_won: integer("races_won").default(0).notNull(),
  total_races: integer("total_races").default(0).notNull(),
  avg_wpm: integer("avg_wpm").default(0).notNull(),
  accuracy: integer("accuracy").default(0).notNull(),
  prompts_added: integer("prompts_added").default(0).notNull(),
  chicken_name: text("chicken_name").default("GARU CHICK").notNull(),
  chicken_type: text("chicken_type").default("white").notNull(),
  jockey_type: text("jockey_type").default("steve").notNull(),
  trail_type: text("trail_type").default("none").notNull(),
  campaign_progress: text("campaign_progress").default("{}").notNull(),
  last_egg_claim: timestamp("last_egg_claim"),
  egg_inventory: text("egg_inventory").default("{}").notNull(),
  qlx_coins: integer("qlx_coins").default(0).notNull()
});

// Prompts table schema
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author_id: integer("author_id").references(() => users.id).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  used_count: integer("used_count").default(0).notNull(),
  is_active: boolean("is_active").default(true).notNull()
});

// Multiplayer race sessions table
export const raceSessions = pgTable("race_sessions", {
  id: serial("id").primaryKey(),
  room_code: text("room_code").notNull().unique(),
  prompt_text: text("prompt_text").notNull(),
  status: text("status").notNull(), // 'waiting', 'starting', 'active', 'finished'
  host_user_id: integer("host_user_id").references(() => users.id).notNull(),
  max_players: integer("max_players").default(8).notNull(),
  start_time: timestamp("start_time"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

// Race participants table
export const raceParticipants = pgTable("race_participants", {
  id: serial("id").primaryKey(),
  session_id: integer("session_id").references(() => raceSessions.id).notNull(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  is_ready: boolean("is_ready").default(false).notNull(),
  progress: integer("progress").default(0).notNull(), // characters typed
  wpm: integer("wpm").default(0).notNull(),
  accuracy: integer("accuracy").default(100).notNull(),
  position: integer("position"),
  finish_time: timestamp("finish_time"),
  xp_gained: integer("xp_gained").default(0).notNull(),
  joined_at: timestamp("joined_at").defaultNow().notNull()
});

// Race history table schema
export const raceHistory = pgTable("race_history", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  prompt_id: integer("prompt_id").references(() => prompts.id).notNull(),
  position: integer("position").notNull(),
  total_players: integer("total_players").notNull(),
  wpm: integer("wpm").notNull(),
  accuracy: integer("accuracy").notNull(),
  time_taken: integer("time_taken").notNull(), // in seconds
  xp_gained: integer("xp_gained").notNull(),
  faction: text("faction").notNull(), // elemental faction (d2, d4, d6, d8, d10, d12, d20, d100)
  race_date: timestamp("race_date").defaultNow().notNull()
});

// Multiplayer races table schema - for persistent multiplayer lobbies
export const multiplayerRaces = pgTable("multiplayer_races", {
  id: text("id").primaryKey(), // e.g., "quick_race_abc123" or "private_xyz789"
  name: text("name").notNull(), // Display name for the race
  mode: text("mode").notNull(), // "quick", "private", "tournament"
  status: text("status").notNull(), // "waiting", "countdown", "racing", "finished"
  host_id: integer("host_id").references(() => users.id), // Host player (null for quick races)
  prompt_text: text("prompt_text").notNull(), // The typing prompt
  max_players: integer("max_players").default(8).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  started_at: timestamp("started_at"),
  finished_at: timestamp("finished_at"),
  join_code: text("join_code"), // For private rooms
  is_password_protected: boolean("is_password_protected").default(false),
  settings: jsonb("settings").default("{}").notNull() // Custom race settings
});



// Lore submissions table for Scribe Hall
export const loreSubmissions = pgTable("lore_submissions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'epic', 'lore', 'story'
  prompt_id: text("prompt_id"), // optional, links to writing prompt
  word_count: integer("word_count").notNull(),
  character_count: integer("character_count").notNull(),
  typing_metrics: jsonb("typing_metrics"), // stores typing speed analysis for authenticity
  status: text("status").default("pending").notNull(), // 'pending', 'approved', 'featured', 'rejected'
  xp_awarded: integer("xp_awarded").default(0).notNull(),
  admin_notes: text("admin_notes"), // for reviewer comments
  submitted_at: timestamp("submitted_at").defaultNow().notNull(),
  reviewed_at: timestamp("reviewed_at"),
  featured_at: timestamp("featured_at")
});

// Player stats table for comprehensive tracking
export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull().unique(),
  top_wpm: integer("top_wpm").default(0).notNull(),
  top_accuracy: integer("top_accuracy").default(0).notNull(),
  total_xp: integer("total_xp").default(0).notNull(),
  races_completed: integer("races_completed").default(0).notNull(),
  races_won: integer("races_won").default(0).notNull(),
  current_faction: text("current_faction").default("d2").notNull(),
  faction_xp: jsonb("faction_xp").default({
    d2: 0, d4: 0, d6: 0, d8: 0, d10: 0, d12: 0, d20: 0, d100: 0
  }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  // Campaign progress tracking
  campaign_progress: jsonb("campaign_progress").default({
    steve: { completed: [], bestScores: {}, unlocked: false },
    auto: { completed: [], bestScores: {}, unlocked: false },
    matikah: { completed: [], bestScores: {}, unlocked: false },
    iam: { completed: [], bestScores: {}, unlocked: false }
  }).notNull(),
  // Unlocked rewards tracking
  unlocked_rewards: jsonb("unlocked_rewards").default({
    trails: { steve: false, auto: false, matikah: false, iam: false },
    jockeys: { steve: false, auto: false, matikah: false, iam: false },
    mounts: {}
  }).notNull(),
  chicken_name: text("chicken_name").default("GARU CHICK").notNull()
});

// Faction leaderboards table
export const factionLeaderboards = pgTable("faction_leaderboards", {
  id: serial("id").primaryKey(),
  faction: text("faction").notNull(), // d2, d4, d6, d8, d10, d12, d20, d100
  user_id: integer("user_id").references(() => users.id).notNull(),
  username: text("username").notNull(),
  top_wpm: integer("top_wpm").notNull(),
  top_accuracy: integer("top_accuracy").notNull(),
  total_faction_xp: integer("total_faction_xp").notNull(),
  races_won_in_faction: integer("races_won_in_faction").default(0).notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  created_at: true,
  xp: true,
  races_won: true,
  total_races: true,
  avg_wpm: true,
  accuracy: true,
  prompts_added: true,
  chicken_name: true,
  chicken_type: true,
  jockey_type: true,
  trail_type: true
}).extend({
  email: z.string().email().optional(),
  confirmPassword: z.string().optional()
});

// Registration schema with password confirmation
export const userRegistrationSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email").optional(),
  confirmPassword: z.string()
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  created_at: true,
  used_count: true,
  is_active: true
});

export const insertRaceHistorySchema = createInsertSchema(raceHistory).omit({
  id: true,
  race_date: true
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  created_at: true,
  updated_at: true
});

export const insertFactionLeaderboardSchema = createInsertSchema(factionLeaderboards).omit({
  id: true,
  updated_at: true
});

// Recovery token table schema (for password/username recovery)
export const recoveryTokens = pgTable("recovery_tokens", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull(),
  type: text("type").notNull(), // "password" or "username"
  created_at: timestamp("created_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull()
});

// Validation schemas for recovery
export const passwordRecoveryRequestSchema = z.object({
  email: z.string().email()
});

export const usernameRecoveryRequestSchema = z.object({
  email: z.string().email()
});

export const passwordResetSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }
);

// Custom validation schemas
export const customizationSchema = z.object({
  chickenName: z.string().min(1).max(20),
  chickenType: z.string(),
  jockeyType: z.string(),
  trailType: z.string(),
  faction: z.string().optional()
});

export const raceStatsSchema = z.object({
  wpm: z.number().int().min(0),
  accuracy: z.number().int().min(0).max(100),
  time: z.number().int().min(0)
});

// Exported types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;

export type Prompt = typeof prompts.$inferSelect;
export type InsertPrompt = z.infer<typeof insertPromptSchema>;

export type RaceHistory = typeof raceHistory.$inferSelect;
export type InsertRaceHistory = z.infer<typeof insertRaceHistorySchema>;

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;

export type FactionLeaderboard = typeof factionLeaderboards.$inferSelect;
export type InsertFactionLeaderboard = z.infer<typeof insertFactionLeaderboardSchema>;

export type RecoveryToken = typeof recoveryTokens.$inferSelect;
export type PasswordRecoveryRequest = z.infer<typeof passwordRecoveryRequestSchema>;
export type UsernameRecoveryRequest = z.infer<typeof usernameRecoveryRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;

// Shrine offerings table schema
export const shrineOfferings = pgTable("shrine_offerings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  petal_id: text("petal_id").notNull(),
  source: text("source").default("Anonymous").notNull(),
  type: text("type").default("personal").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Garu eggs table schema
export const garuEggs = pgTable("garu_eggs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  elemental_affinity: text("elemental_affinity").notNull(),
  color: text("color").notNull(),
  petal_id: text("petal_id").notNull(),
  hatched: boolean("hatched").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

// Insert schemas for Codex Crucible
export const insertShrineOfferingSchema = createInsertSchema(shrineOfferings).omit({
  id: true,
  timestamp: true
});

export const insertGaruEggSchema = createInsertSchema(garuEggs).omit({
  id: true,
  timestamp: true
});

export type Customization = z.infer<typeof customizationSchema>;
export type RaceStats = z.infer<typeof raceStatsSchema>;

export type ShrineOffering = typeof shrineOfferings.$inferSelect;
export type InsertShrineOffering = z.infer<typeof insertShrineOfferingSchema>;

export type GaruEgg = typeof garuEggs.$inferSelect;
export type InsertGaruEgg = z.infer<typeof insertGaruEggSchema>;
