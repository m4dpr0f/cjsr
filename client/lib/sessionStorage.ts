// Session-based storage system for CJSR
// Handles player data persistence without requiring login

// Player profile interface - matches the server schema for compatibility
export interface PlayerSessionProfile {
  username: string;
  level: number;
  xp: number;
  racesWon: number;
  totalRaces: number;
  avgWpm: number;
  accuracy: number;
  promptsAdded: number;
  chickenName: string;
  chickenType: string;
  jockeyType: string;
  trailType: string;
  // Session-specific fields
  sessionId: string;
  lastActive: number;
}

// Race stats interface
export interface SessionRaceStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  promptId: number;
  wonRace: boolean;
  timestamp: number;
}

// Default values for a new player
const DEFAULT_PLAYER: PlayerSessionProfile = {
  username: `Player${Math.floor(Math.random() * 10000)}`,
  level: 1,
  xp: 0,
  racesWon: 0,
  totalRaces: 0,
  avgWpm: 0,
  accuracy: 0,
  promptsAdded: 0,
  chickenName: "Dark Feathers",
  chickenType: "racer01",  // Use our new racer sprite as default
  jockeyType: "steve",
  trailType: "none",
  sessionId: generateSessionId(),
  lastActive: Date.now()
};

// Storage keys
const STORAGE_KEYS = {
  PLAYER_PROFILE: 'cjsr_player_profile',
  RACE_HISTORY: 'cjsr_race_history',
};

// Generate a unique session ID
function generateSessionId(): string {
  return 'session_' + Math.random().toString(36).substring(2, 15);
}

// Calculate level from XP
export function getLevelFromXp(xp: number): { level: number; progress: number } {
  // Simple level calculation formula (can be adjusted for game balance)
  // Each level requires level * 100 XP
  let remainingXp = xp;
  let level = 1;
  let xpForNextLevel = 100;
  
  while (remainingXp >= xpForNextLevel) {
    remainingXp -= xpForNextLevel;
    level++;
    xpForNextLevel = level * 100;
  }
  
  // Calculate progress to next level (0-100%)
  const progress = Math.floor((remainingXp / xpForNextLevel) * 100);
  
  return { level, progress };
}

// Get the player profile from storage
export function getPlayerProfile(): PlayerSessionProfile {
  try {
    const storedProfile = localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
    if (storedProfile) {
      const profile = JSON.parse(storedProfile) as PlayerSessionProfile;
      // Update last active timestamp
      profile.lastActive = Date.now();
      savePlayerProfile(profile);
      return profile;
    }
  } catch (error) {
    console.error('Error retrieving player profile from storage:', error);
  }
  
  // If no profile exists or there was an error, create a new one
  return createNewPlayerProfile();
}

// Create a new player profile
export function createNewPlayerProfile(): PlayerSessionProfile {
  const newProfile = { ...DEFAULT_PLAYER };
  savePlayerProfile(newProfile);
  return newProfile;
}

// Save the player profile to storage
export function savePlayerProfile(profile: PlayerSessionProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving player profile to storage:', error);
  }
}

// Update player customization
export function updatePlayerCustomization(
  chickenType: string,
  jockeyType: string,
  trailType: string,
  chickenName: string
): PlayerSessionProfile {
  const profile = getPlayerProfile();
  
  profile.chickenType = chickenType;
  profile.jockeyType = jockeyType;
  profile.trailType = trailType;
  profile.chickenName = chickenName;
  
  savePlayerProfile(profile);
  return profile;
}

// Update player stats after a race
export function updatePlayerStats(stats: SessionRaceStats): PlayerSessionProfile {
  const profile = getPlayerProfile();
  
  // Calculate new average WPM
  const totalWpm = profile.avgWpm * profile.totalRaces + stats.wpm;
  const newTotalRaces = profile.totalRaces + 1;
  
  // Update stats
  profile.totalRaces = newTotalRaces;
  profile.avgWpm = Math.round(totalWpm / newTotalRaces);
  profile.accuracy = Math.max(profile.accuracy, stats.accuracy);
  
  if (stats.wonRace) {
    profile.racesWon += 1;
  }
  
  // Award XP based on performance
  const baseXp = 50;
  const wpmBonus = Math.floor(stats.wpm / 10); // +1 XP for every 10 WPM
  const accuracyBonus = Math.floor(stats.accuracy / 10); // +1 XP for every 10% accuracy
  const winBonus = stats.wonRace ? 20 : 0; // +20 XP for winning
  
  const xpGained = baseXp + wpmBonus + accuracyBonus + winBonus;
  profile.xp += xpGained;
  
  // Update level
  const { level } = getLevelFromXp(profile.xp);
  profile.level = level;
  
  // Save the updated profile
  savePlayerProfile(profile);
  
  // Save race history
  saveRaceHistory(stats);
  
  return profile;
}

// Update player XP
export function addPlayerXp(xpAmount: number): PlayerSessionProfile {
  const profile = getPlayerProfile();
  
  profile.xp += xpAmount;
  
  // Update level
  const { level } = getLevelFromXp(profile.xp);
  profile.level = level;
  
  savePlayerProfile(profile);
  return profile;
}

// Increment prompts contributed count
export function incrementPromptsAdded(): PlayerSessionProfile {
  const profile = getPlayerProfile();
  
  profile.promptsAdded += 1;
  
  savePlayerProfile(profile);
  return profile;
}

// Get race history
export function getRaceHistory(): SessionRaceStats[] {
  try {
    const storedHistory = localStorage.getItem(STORAGE_KEYS.RACE_HISTORY);
    if (storedHistory) {
      return JSON.parse(storedHistory) as SessionRaceStats[];
    }
  } catch (error) {
    console.error('Error retrieving race history from storage:', error);
  }
  
  return [];
}

// Save race to history
export function saveRaceHistory(stats: SessionRaceStats): void {
  try {
    const history = getRaceHistory();
    history.unshift(stats); // Add to beginning of array
    
    // Limit history to 50 races
    const limitedHistory = history.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEYS.RACE_HISTORY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving race history to storage:', error);
  }
}

// Change player username
export function changeUsername(username: string): PlayerSessionProfile {
  const profile = getPlayerProfile();
  
  profile.username = username;
  
  savePlayerProfile(profile);
  return profile;
}

// Clear all player data
export function clearPlayerData(): void {
  localStorage.removeItem(STORAGE_KEYS.PLAYER_PROFILE);
  localStorage.removeItem(STORAGE_KEYS.RACE_HISTORY);
}

// Check if a player profile exists
export function hasPlayerProfile(): boolean {
  return !!localStorage.getItem(STORAGE_KEYS.PLAYER_PROFILE);
}