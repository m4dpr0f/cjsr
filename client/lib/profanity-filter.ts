/**
 * Simple profanity filter for chicken names
 * Keeps the game family-friendly and appropriate
 */

const INAPPROPRIATE_WORDS = [
  // Basic profanity
  'damn', 'hell', 'crap', 'suck', 'stupid', 'idiot', 'moron', 'dumb',
  // More serious words (abbreviated to avoid false positives)
  'f***', 's***', 'b****', 'a**', 'wtf', 'omg',
  // Inappropriate content
  'sex', 'porn', 'nude', 'naked', 'kill', 'die', 'death', 'murder',
  // Hate speech indicators
  'hate', 'nazi', 'racist', 'terror',
  // Gaming toxicity
  'noob', 'trash', 'garbage', 'loser', 'failure'
];

/**
 * Check if a chicken name contains inappropriate content
 */
export function containsProfanity(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  
  const cleanName = name.toLowerCase().trim();
  
  // Check for inappropriate words
  for (const word of INAPPROPRIATE_WORDS) {
    if (cleanName.includes(word.toLowerCase())) {
      return true;
    }
  }
  
  // Check for excessive special characters (spam-like)
  const specialCharCount = (cleanName.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  if (specialCharCount > cleanName.length * 0.5) {
    return true;
  }
  
  return false;
}

/**
 * Clean and validate a chicken name
 */
export function validateChickenName(name: string): { valid: boolean; error?: string; cleaned?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const cleaned = name.trim();
  
  // Length validation
  if (cleaned.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (cleaned.length > 20) {
    return { valid: false, error: 'Name must be 20 characters or less' };
  }
  
  // Profanity check
  if (containsProfanity(cleaned)) {
    return { valid: false, error: 'Please choose a family-friendly name' };
  }
  
  // Character validation (allow letters, numbers, spaces, basic punctuation)
  const validPattern = /^[a-zA-Z0-9\s\-'\.]+$/;
  if (!validPattern.test(cleaned)) {
    return { valid: false, error: 'Name can only contain letters, numbers, spaces, hyphens, apostrophes, and periods' };
  }
  
  return { valid: true, cleaned };
}