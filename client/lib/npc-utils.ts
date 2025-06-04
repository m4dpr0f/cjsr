/**
 * NPC behavior utilities for multiplayer races
 * Centralizes NPC movement patterns and behavior profiles
 */

/**
 * NPC speed profile defining movement characteristics
 */
export interface NpcSpeedProfile {
  baseSpeed: number;     // Base movement speed (progress per update)
  variability: number;   // Random variability in movement
  baseWpm: number;       // Base WPM value for this NPC
  wpmVariability: number; // WPM variability factor
}

/**
 * Racing difficulty levels for NPCs
 */
export enum NpcDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

/**
 * Get an NPC's speed profile based on its ID and difficulty
 * Ensures consistent behavior for NPCs with the same ID
 * 
 * @param id NPC identifier
 * @param difficulty Optional difficulty level
 * @returns Speed profile with movement characteristics
 */
export function getNpcSpeedProfile(id: number, difficulty?: NpcDifficulty): NpcSpeedProfile {
  // Use ID to create deterministic but varied profiles
  // This ensures NPCs behave consistently across races
  const idFactor = (id % 100) / 100; // 0.00 to 0.99 based on ID
  
  // Base profiles by difficulty
  const difficultyProfiles: Record<NpcDifficulty, NpcSpeedProfile> = {
    [NpcDifficulty.EASY]: {
      baseSpeed: 0.8,
      variability: 0.3,
      baseWpm: 35,
      wpmVariability: 5
    },
    [NpcDifficulty.MEDIUM]: {
      baseSpeed: 1.2,
      variability: 0.4,
      baseWpm: 50,
      wpmVariability: 8
    },
    [NpcDifficulty.HARD]: {
      baseSpeed: 1.6,
      variability: 0.5,
      baseWpm: 65,
      wpmVariability: 10
    },
    [NpcDifficulty.EXPERT]: {
      baseSpeed: 2.0,
      variability: 0.6,
      baseWpm: 80,
      wpmVariability: 12
    }
  };
  
  // Select base profile from difficulty or default to medium
  const baseProfile = difficulty 
    ? difficultyProfiles[difficulty] 
    : difficultyProfiles[NpcDifficulty.MEDIUM];
  
  // Apply ID-based variance for diverse but consistent NPC behavior
  return {
    baseSpeed: baseProfile.baseSpeed * (0.9 + idFactor * 0.2),
    variability: baseProfile.variability * (0.8 + idFactor * 0.4),
    baseWpm: Math.round(baseProfile.baseWpm * (0.9 + idFactor * 0.2)),
    wpmVariability: Math.round(baseProfile.wpmVariability * (0.8 + idFactor * 0.4))
  };
}

/**
 * Calculate NPC movement for a single update frame
 * 
 * @param currentProgress Current progress (0-100)
 * @param profile NPC speed profile
 * @returns New progress value (0-100)
 */
export function calculateNpcMovement(currentProgress: number, profile: NpcSpeedProfile): number {
  const movementAmount = profile.baseSpeed + (Math.random() * profile.variability);
  return Math.min(100, currentProgress + movementAmount);
}

/**
 * Calculate an NPC's current WPM based on its profile and recent movement
 * 
 * @param profile NPC speed profile
 * @param movementAmount Recent movement amount
 * @returns WPM value
 */
export function calculateNpcWpm(profile: NpcSpeedProfile, movementAmount: number): number {
  // Base WPM plus a factor based on recent movement
  const wpm = profile.baseWpm + Math.floor(movementAmount * profile.wpmVariability);
  return Math.max(1, Math.round(wpm));
}

/**
 * Get initial progress values for NPCs at race start
 * Ensures NPCs don't all start at exactly 0%
 * 
 * @param profile NPC speed profile
 * @returns Initial progress value (0-5%)
 */
export function getInitialProgress(profile: NpcSpeedProfile): number {
  // Small head start (0-5%) based on speed profile
  return Math.random() * 5 * (profile.baseSpeed / 1.5);
}