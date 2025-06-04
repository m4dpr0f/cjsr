// Character placeholder data for the Fork Campaign characters
// These are temporary placeholders until actual sprite files are provided

// Character types and their basic information
export interface CharacterInfo {
  id: string;
  name: string;
  description: string;
  spritePath: string;
  defaultColor: string;
}

// Character information for the Fork Campaign
export const FORK_CHARACTERS: Record<string, CharacterInfo> = {
  matikah: {
    id: 'matikah',
    name: 'Matikah',
    description: 'A nature-attuned jockey with deep connection to the forest.',
    spritePath: '/Matikah.png', // This file already exists
    defaultColor: '#4CAF50' // Green color
  },
  
  auto: {
    id: 'auto',
    name: 'Auto',
    description: 'A mechanical genius with enhanced perception and reflexes.',
    spritePath: '/Auto.png', // This file needs to be created
    defaultColor: '#2196F3' // Blue color
  },
  
  iam: {
    id: 'iam',
    name: 'Iam',
    description: 'A mysterious figure with shadowy powers and unknown origins.',
    spritePath: '/Iam.png', // This file needs to be created
    defaultColor: '#9C27B0' // Purple color
  },
  
  steve: {
    id: 'steve',
    name: 'Steve & Brutus',
    description: 'A legendary Chicken Jockey and father figure whose culture has been outlawed by the Empire.',
    spritePath: '/Steve.png', // This file needs to be created
    defaultColor: '#795548' // Brown color
  },
  
  death: {
    id: 'death',
    name: 'Death',
    description: 'The grim challenger who tests all racers.',
    spritePath: '/Death.png', // This file already exists
    defaultColor: '#212121' // Dark color
  }
};

// Get character by ID
export function getCharacterById(id: string): CharacterInfo {
  return FORK_CHARACTERS[id] || FORK_CHARACTERS.matikah; // Default to Matikah
}

// Get all characters
export function getAllCharacters(): CharacterInfo[] {
  return Object.values(FORK_CHARACTERS);
}