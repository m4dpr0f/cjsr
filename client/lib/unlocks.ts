// Character unlock system for campaign completion rewards

export interface UnlockedContent {
  characters: string[];
  mounts: string[];
  jockeys: string[];
  trails: string[];
  titles: string[];
  badges: string[];
}

// Get unlocked content from localStorage
export function getUnlockedContent(): UnlockedContent {
  const stored = localStorage.getItem('cjsr_unlocks');
  if (!stored) {
    return {
      characters: [], // No characters unlocked by default
      mounts: ['html_white', 'html_brown', 'html_black'], // Basic mounts always available
      jockeys: ['generic'], // Only generic jockey available by default
      trails: [], // No trails unlocked by default
      titles: [],
      badges: []
    };
  }
  return JSON.parse(stored);
}

// Save unlocked content to localStorage
export function saveUnlockedContent(content: UnlockedContent): void {
  localStorage.setItem('cjsr_unlocks', JSON.stringify(content));
}

// Check if specific content is unlocked
export function isUnlocked(type: keyof UnlockedContent, id: string): boolean {
  const unlocks = getUnlockedContent();
  return unlocks[type].includes(id);
}

// Unlock rewards for completing a campaign
export function unlockCampaignRewards(campaignId: string): void {
  const unlocks = getUnlockedContent();
  
  switch (campaignId) {
    case 'steve':
      // Steve campaign completion unlocks
      if (!unlocks.characters.includes('steve')) unlocks.characters.push('steve');
      if (!unlocks.mounts.includes('html_steve')) unlocks.mounts.push('html_steve');
      if (!unlocks.jockeys.includes('steve')) unlocks.jockeys.push('steve');
      if (!unlocks.trails.includes('steve')) unlocks.trails.push('steve');
      if (!unlocks.titles.includes('Garuheart Legacy')) unlocks.titles.push('Garuheart Legacy');
      if (!unlocks.badges.includes('First Feather')) unlocks.badges.push('First Feather');
      break;
      
    case 'auto':
      // Auto campaign completion unlocks
      if (!unlocks.characters.includes('auto')) unlocks.characters.push('auto');
      if (!unlocks.mounts.includes('html_auto')) unlocks.mounts.push('html_auto'); // Timaru
      if (!unlocks.mounts.includes('html_ember')) unlocks.mounts.push('html_ember'); // Ember
      if (!unlocks.jockeys.includes('auto')) unlocks.jockeys.push('auto');
      if (!unlocks.trails.includes('auto')) unlocks.trails.push('auto');
      if (!unlocks.titles.includes('Comet Quill')) unlocks.titles.push('Comet Quill');
      if (!unlocks.titles.includes('Codex Singer')) unlocks.titles.push('Codex Singer');
      if (!unlocks.badges.includes('Tech Rider')) unlocks.badges.push('Tech Rider');
      break;
      
    case 'matikah':
      // Matikah campaign completion unlocks
      if (!unlocks.characters.includes('matikah')) unlocks.characters.push('matikah');
      if (!unlocks.mounts.includes('html_matikah')) unlocks.mounts.push('html_matikah'); // Chalisa
      if (!unlocks.jockeys.includes('matikah')) unlocks.jockeys.push('matikah');
      if (!unlocks.trails.includes('matikah')) unlocks.trails.push('matikah');
      if (!unlocks.titles.includes('Moon-Born Singer')) unlocks.titles.push('Moon-Born Singer');
      if (!unlocks.titles.includes('Wind Dancer')) unlocks.titles.push('Wind Dancer');
      if (!unlocks.badges.includes('Mystic Rider')) unlocks.badges.push('Mystic Rider');
      break;
      
    case 'iam':
      // Iam campaign completion unlocks
      if (!unlocks.characters.includes('iam')) unlocks.characters.push('iam');
      if (!unlocks.mounts.includes('html_iam')) unlocks.mounts.push('html_iam');
      if (!unlocks.jockeys.includes('iam')) unlocks.jockeys.push('iam');
      if (!unlocks.trails.includes('iam')) unlocks.trails.push('iam');
      if (!unlocks.titles.includes('Song Between')) unlocks.titles.push('Song Between');
      if (!unlocks.titles.includes('Word Weaver')) unlocks.titles.push('Word Weaver');
      if (!unlocks.badges.includes('Poet Rider')) unlocks.badges.push('Poet Rider');
      break;
  }
  
  saveUnlockedContent(unlocks);
  console.log(`Campaign ${campaignId} completed! Unlocked new content:`, unlocks);
}

// Get available characters based on unlocks
export function getAvailableCharacters(): string[] {
  const unlocks = getUnlockedContent();
  return unlocks.characters;
}

// Get available mounts based on unlocks
export function getAvailableMounts(): string[] {
  const unlocks = getUnlockedContent();
  return unlocks.mounts;
}

// Get available jockeys based on unlocks
export function getAvailableJockeys(): string[] {
  const unlocks = getUnlockedContent();
  return unlocks.jockeys;
}