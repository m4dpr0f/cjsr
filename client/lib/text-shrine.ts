// Text Shrine mechanic - Codex Crucible or Scribing Shrine
// This module handles the gameplay mechanic of generating Garu Eggs based on text typing performance

import { getStats } from './single-player';

// Interface for the egg generation result
export interface GaruEgg {
  name: string;
  color: string;
  element: string;
  bonus: string;
  lore: string;
  imageUrl?: string; // URL to the egg image if available
}

// Interface for typing performance
export interface TypingPerformance {
  accuracy: number;
  wpm: number;
  text: string;
}

// The available text prompts from our library
export interface TextPrompt {
  id: string;
  text: string;
  author: string;
  title: string;
  themes: string[];
}

// Cache the prompts after loading
let promptsCache: TextPrompt[] | null = null;

// Load the text prompts from the CSV file
export async function loadTextPrompts(): Promise<TextPrompt[]> {
  if (promptsCache) return promptsCache;
  
  try {
    const response = await fetch('/data/CJSR_TextToEgg_Library.csv');
    const csv = await response.text();
    
    // Parse CSV (simple parser, for production use a proper CSV library)
    const lines = csv.split('\n');
    const headers = lines[0].split(',');
    
    const prompts: TextPrompt[] = [];
    
    // Start from index 1 to skip the header
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Handle the case of commas inside quoted strings
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue);
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      
      // Add the last value
      values.push(currentValue);
      
      // Create the prompt object
      const prompt: TextPrompt = {
        id: values[0],
        text: values[1].replace(/^"|"$/g, ''), // Remove quotes
        author: values[2],
        title: values[3],
        themes: values[7].split(',').map(theme => theme.trim())
      };
      
      prompts.push(prompt);
    }
    
    promptsCache = prompts;
    return prompts;
  } catch (error) {
    console.error('Failed to load text prompts:', error);
    return [];
  }
}

// Get a random prompt from our library
export async function getRandomPrompt(): Promise<TextPrompt | null> {
  const prompts = await loadTextPrompts();
  if (prompts.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

// Get a prompt by ID
export async function getPromptById(id: string): Promise<TextPrompt | null> {
  const prompts = await loadTextPrompts();
  return prompts.find(prompt => prompt.id === id) || null;
}

// Generate an egg based on typing performance
export function generateEgg(performance: TypingPerformance, prompt: TextPrompt): GaruEgg {
  // Determine performance tier
  let tier = 'Low';
  if (performance.accuracy >= 95 && performance.wpm >= 45) {
    tier = 'High';
  } else if (performance.accuracy >= 85 && performance.wpm >= 30) {
    tier = 'Moderate';
  }
  
  // Extract dominant themes based on the prompt
  const themes = prompt.themes;
  
  // Generate egg properties based on performance and themes
  let element = 'Neutral';
  let color = 'White';
  let bonus = 'No special bonus';
  
  // Map themes to elements and colors
  if (themes.includes('wind') || themes.includes('air')) {
    element = 'Air';
    color = 'Azure';
  } else if (themes.includes('memory') || themes.includes('mind')) {
    element = tier === 'High' ? 'Spirit' : 'Mind';
    color = tier === 'High' ? 'Shimmering Blue' : 'Violet';
  } else if (themes.includes('existence') || themes.includes('destiny')) {
    element = 'Fate';
    color = 'Silver';
  }
  
  // Add tier influence
  if (tier === 'High') {
    element += '/Spirit';
    color += '/Gold glimmer';
    bonus = 'Significant boost in races related to the egg themes';
  } else if (tier === 'Moderate') {
    element += '/Shadow';
    color += '/Shimmer';
    bonus = 'Minor boost in races related to the egg themes';
  } else {
    bonus = 'Basic racing stats';
  }
  
  // Generate egg name
  let name = '';
  if (themes.includes('rebirth')) {
    name += 'Lifestream ';
  } else if (themes.includes('dilemma')) {
    name += 'Crown of Doubt ';
  } else {
    name += 'Mystic ';
  }
  
  // Add suffix based on performance
  if (performance.wpm >= 50) {
    name += 'Flare';
  } else if (performance.accuracy >= 90) {
    name += 'Precision';
  } else {
    name += 'Seeker';
  }
  
  name += ' Egg';
  
  // Generate lore
  const lorePrefix = tier === 'High' ? 'Forged from ' : tier === 'Moderate' ? 'Borne from ' : 'Created by ';
  const loreSuffix = tier === 'High' ? 
    'the memory of a scribe reborn in wisdom and skill.' : 
    tier === 'Moderate' ? 
    'the echoes of focused concentration.' : 
    'the persistent effort of a dedicated jockey.';
  
  const lore = `${lorePrefix}${loreSuffix}`;
  
  return {
    name,
    color,
    element,
    bonus,
    lore
  };
}

// Get all eggs generated by the player (to be stored/retrieved from localStorage)
export function getPlayerEggs(): GaruEgg[] {
  const eggsData = localStorage.getItem('cjsr_player_eggs');
  return eggsData ? JSON.parse(eggsData) : [];
}

// Save a new egg to the player's collection
export function savePlayerEgg(egg: GaruEgg): void {
  const eggs = getPlayerEggs();
  eggs.push(egg);
  localStorage.setItem('cjsr_player_eggs', JSON.stringify(eggs));
}