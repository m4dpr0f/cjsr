/**
 * Unified XP calculation system for CJSR
 * Ensures consistent XP awards across all race types and platforms
 */

export interface RaceResult {
  wpm: number;
  accuracy: number;
  position: number;
  totalPlayers: number;
  charactersTyped: number;
  isCampaignRace?: boolean;
  campaignRaceNumber?: number;
}

export class XPCalculator {
  /**
   * Universal XP calculation formula used across all race types
   * Base: 8 XP + (characters typed × position multiplier)
   * Campaign bonus: 25 + (10 × race number) for campaign races only
   */
  static calculateXP(result: RaceResult): number {
    const baseXP = 8;
    
    // Position multipliers: 1st=100%, 2nd=50%, 3rd=33%, others=25%
    const positionMultipliers: { [key: number]: number } = {
      1: 1.0,
      2: 0.5,
      3: 0.33
    };
    const multiplier = positionMultipliers[result.position] || 0.25;
    
    // Character-based XP
    const characterXP = Math.floor(result.charactersTyped * multiplier);
    
    // Campaign bonus (only for campaign races)
    let campaignBonus = 0;
    if (result.isCampaignRace && typeof result.campaignRaceNumber === 'number') {
      campaignBonus = 25 + (10 * result.campaignRaceNumber);
    }
    
    const totalXP = baseXP + characterXP + campaignBonus;
    
    console.log(`XP Calculation for position ${result.position}:
      Base XP: ${baseXP}
      Characters: ${result.charactersTyped} × ${multiplier} = ${characterXP}
      Campaign bonus: ${campaignBonus}
      Total XP: ${totalXP}`);
    
    return Math.max(1, totalXP); // Minimum 1 XP
  }

  /**
   * Standard character count for different race types
   */
  static getCharacterCount(raceType: 'matrix' | 'campaign' | 'quick'): number {
    switch (raceType) {
      case 'matrix':
        return 67; // Art of War passage length
      case 'campaign':
        return 100; // Standard campaign race length
      case 'quick':
        return 50; // Quick race length
      default:
        return 67;
    }
  }
}