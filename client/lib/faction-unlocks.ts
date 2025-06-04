// Faction XP unlock system for special mounts and characters

export interface FactionUnlock {
  id: string;
  name: string;
  type: 'mount' | 'jockey';
  requiredXp: number;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Special faction XP unlocks
export const FACTION_UNLOCKS: FactionUnlock[] = [
  {
    id: 'death',
    name: 'Death',
    type: 'mount',
    requiredXp: 500,
    description: 'Faction Mount: Unlock with 500+ Faction XP in any element.',
    rarity: 'epic'
  },
  {
    id: 'golden_champion',
    name: 'Golden Champion',
    type: 'jockey',
    requiredXp: 900,
    description: 'Legendary Jockey: Unlock with 900+ Faction XP in any element.',
    rarity: 'legendary'
  },
  {
    id: 'peacock_champion',
    name: 'Peacock Champion',
    type: 'jockey',
    requiredXp: 1000,
    description: 'Elite Jockey: Dark blue skin with peacock feather. Unlock with 1000+ Faction XP.',
    rarity: 'legendary'
  },
  {
    id: 'peacock_mount',
    name: 'Peacock Mount',
    type: 'mount',
    requiredXp: 1000,
    description: 'Elite Mount: Vibrant peacock-colored Garu. Unlock with 1000+ Faction XP.',
    rarity: 'legendary'
  }
];

// Check what the player has unlocked based on their faction XP
export function checkFactionUnlocks(factionXpData: Record<string, number>): string[] {
  const unlockedIds: string[] = [];
  
  // Get the highest XP across all factions
  const maxXp = Math.max(...Object.values(factionXpData));
  
  // Check each unlock threshold
  for (const unlock of FACTION_UNLOCKS) {
    if (maxXp >= unlock.requiredXp) {
      unlockedIds.push(unlock.id);
    }
  }
  
  return unlockedIds;
}

// Get unlocks for a specific faction XP amount
export function getUnlocksForXp(xp: number): FactionUnlock[] {
  return FACTION_UNLOCKS.filter(unlock => xp >= unlock.requiredXp);
}

// Check if a specific unlock is available
export function isFactionUnlockAvailable(unlockId: string, factionXpData: Record<string, number>): boolean {
  const unlock = FACTION_UNLOCKS.find(u => u.id === unlockId);
  if (!unlock) return false;
  
  const maxXp = Math.max(...Object.values(factionXpData));
  return maxXp >= unlock.requiredXp;
}