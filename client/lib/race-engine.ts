/**
 * Simplified Race Engine
 * 
 * Core utilities for the CJSR race system that prioritize reliability
 * over complexity. This approach focuses on stable timing and consistent
 * calculation rather than complex abstractions.
 */

/**
 * Calculate WPM based on character count and elapsed time
 * This is a simplified version that works reliably
 * 
 * @param characterCount Number of characters typed
 * @param seconds Time elapsed in seconds
 * @returns Words per minute value
 */
export function calculateRaceWPM(characterCount: number, seconds: number): number {
  if (seconds === 0) return 0;
  
  // Standard WPM calculation (5 chars = 1 word)
  const wordCount = characterCount / 5;
  const minutes = seconds / 60;
  
  return Math.round(wordCount / minutes);
}

/**
 * Get the actual elapsed time from a start time
 * Uses high-precision Date.now() instead of state variables
 * 
 * @param startTimeMs Start time in milliseconds
 * @returns Elapsed time in seconds
 */
export function getElapsedTime(startTimeMs: number): number {
  return (Date.now() - startTimeMs) / 1000;
}

/**
 * Calculate progress percentage based on typed text length and prompt length
 * 
 * @param typedLength Number of characters typed
 * @param promptLength Total prompt length
 * @returns Progress percentage (0-100)
 */
export function calculateRaceProgress(typedLength: number, promptLength: number): number {
  if (promptLength === 0) return 100;
  return Math.min(100, Math.round((typedLength / promptLength) * 100));
}

/**
 * Generate consistent NPC movement
 * Simpler version that reliably moves NPCs
 * 
 * @param npcId NPC identifier
 * @param currentProgress Current progress percentage
 * @returns New progress percentage
 */
export function moveNPC(npcId: number, currentProgress: number): number {
  // Base speed depends on NPC ID to ensure consistent behavior
  const baseSpeed = 
    npcId % 4 === 0 ? 1.8 :  // Fast
    npcId % 3 === 0 ? 1.4 :  // Medium
    npcId % 2 === 0 ? 1.0 :  // Slow
    1.2;                     // Default
  
  // Add some randomness
  const randomFactor = Math.random() * 0.8 + 0.2; // 0.2 to 1.0
  const moveAmount = baseSpeed * randomFactor;
  
  // Ensure movement always happens (minimum progress)
  return Math.min(100, currentProgress + Math.max(0.2, moveAmount));
}

/**
 * Get WPM for an NPC based on its progress and ID
 * 
 * @param npcId NPC identifier
 * @param progress Current progress percentage
 * @returns WPM value
 */
export function getNpcWPM(npcId: number, progress: number): number {
  // Base WPM depends on NPC ID
  const baseWPM = 
    npcId % 4 === 0 ? 65 :  // Fast
    npcId % 3 === 0 ? 50 :  // Medium
    npcId % 2 === 0 ? 35 :  // Slow
    45;                     // Default
    
  // Adjust based on progress (NPCs tend to speed up slightly)
  const progressFactor = 1 + (progress / 200); // 1.0 to 1.5
  
  return Math.round(baseWPM * progressFactor);
}