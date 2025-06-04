import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Egg collection table schema
export const garuEggs = pgTable("garu_eggs", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // EtherGaru, AirGaru, FireGaru, etc.
  elemental_affinity: text("elemental_affinity").notNull(),
  color: text("color").notNull(),
  rarity: text("rarity").default("common").notNull(), // common, uncommon, rare, epic, legendary
  hatched: integer("hatched").default(0).notNull(), // 0 = egg, 1 = hatched
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  stats: jsonb("stats").default({
    speed: 1,
    endurance: 1,
    luck: 1,
    intellect: 1
  }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  source: text("source").default("shrine").notNull() // shrine, race_reward, event, trade
});

// Insert schemas
export const insertGaruEggSchema = createInsertSchema(garuEggs).omit({
  id: true,
  created_at: true
});

// Exported types
export type GaruEgg = typeof garuEggs.$inferSelect;
export type InsertGaruEgg = z.infer<typeof insertGaruEggSchema>;

// Egg constants - for reference in code
export const GARU_EGG_TYPES = [
  'EtherGaru', 'AirGaru', 'FireGaru', 'WaterGaru', 
  'EarthGaru', 'ChaosGaru', 'OrderGaru', 'WealthGaru'
];

export const GARU_RARITIES = [
  'common', 'uncommon', 'rare', 'epic', 'legendary'
];

export const ELEMENTAL_AFFINITIES = {
  EtherGaru: ['Radiance', 'Sound', 'Light', 'Dream'],
  AirGaru: ['Wind', 'Lightning', 'Voice', 'Flight'],
  FireGaru: ['Flame', 'Forge', 'Passion', 'Destruction'],
  WaterGaru: ['Ocean', 'Ice', 'Healing', 'Reflection'],
  EarthGaru: ['Mountain', 'Forest', 'Growth', 'Stability'],
  ChaosGaru: ['Void', 'Chance', 'Change', 'Disruption'],
  OrderGaru: ['Pattern', 'Logic', 'Clockwork', 'Structure'],
  WealthGaru: ['Prosperity', 'Balance', 'Trade', 'Fortune']
};

export const EGG_COLORS = {
  EtherGaru: 'Indigo',
  AirGaru: 'Sky Blue',
  FireGaru: 'Crimson',
  WaterGaru: 'Deep Blue',
  EarthGaru: 'Forest Green',
  ChaosGaru: 'Black Prism',
  OrderGaru: 'White Chrome',
  WealthGaru: 'Gold'
};

export const NAME_TEMPLATES = {
  EtherGaru: ['Aura', 'Echo', 'Whisper', 'Shimmer', 'Harmony'],
  AirGaru: ['Breeze', 'Zephyr', 'Gale', 'Sky', 'Thunder'],
  FireGaru: ['Ember', 'Blaze', 'Spark', 'Scorch', 'Fury'],
  WaterGaru: ['Ripple', 'Tide', 'Wave', 'Stream', 'Frost'],
  EarthGaru: ['Terra', 'Stone', 'Root', 'Leaf', 'Mountain'],
  ChaosGaru: ['Glitch', 'Void', 'Enigma', 'Riddle', 'Shadow'],
  OrderGaru: ['Vector', 'Logic', 'Axiom', 'Theorem', 'Rule'],
  WealthGaru: ['Fortune', 'Bounty', 'Gift', 'Prosperity', 'Coin']
};