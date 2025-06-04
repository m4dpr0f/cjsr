// Game constants
export const MAX_PLAYERS_PER_RACE = 8;
export const COUNTDOWN_SECONDS = 3;
export const MIN_PROMPT_LENGTH = 50;
export const MAX_PROMPT_LENGTH = 250;

// XP calculations
export function calculateRaceXP(
  position: number,
  wpm: number,
  accuracy: number,
  totalPlayers: number
): number {
  // Base XP for participation
  let xp = 20;
  
  // Position bonus (higher for better positions)
  const positionBonus = Math.max(0, totalPlayers - position + 1) * 10;
  
  // WPM bonus (higher for faster typing)
  const wpmBonus = Math.floor(wpm / 5);
  
  // Accuracy bonus (significantly higher for better accuracy)
  const accuracyBonus = Math.floor((accuracy / 100) * 50);
  
  // Total XP
  return xp + positionBonus + wpmBonus + accuracyBonus;
}

// Race status enum
export enum RaceStatus {
  WAITING_FOR_PLAYERS = "waiting_for_players",
  COUNTDOWN = "countdown",
  RACING = "racing",
  FINISHED = "finished",
}

// Player status enum
export enum PlayerStatus {
  WAITING = "waiting",
  READY = "ready",
  TYPING = "typing",
  FINISHED = "finished",
}

// Available customization options
export const CHICKEN_TYPES = [
  { id: "white", name: "White Leghorn", levelRequired: 1 },
  { id: "red", name: "Rhode Island Red", levelRequired: 1 },
  { id: "golden", name: "Golden Feather", levelRequired: 10 },
  { id: "diamond", name: "Diamond Chicken", levelRequired: 20 },
];

export const JOCKEY_TYPES = [
  { id: "steve", name: "Default Steve", levelRequired: 1 },
  { id: "alex", name: "Racer Alex", levelRequired: 1 },
  { id: "zombie", name: "Zombie", levelRequired: 8 },
  { id: "skeleton", name: "Skeleton", levelRequired: 15 },
];

export const TRAIL_EFFECTS = [
  { id: "none", name: "None", levelRequired: 1 },
  { id: "dust", name: "Dust", levelRequired: 1 },
  { id: "flames", name: "Flames", levelRequired: 12 },
  { id: "rainbow", name: "Rainbow", levelRequired: 18 },
];
