import { IStorage } from "../storage";
import { InsertPrompt } from "@shared/schema";

export class PromptManager {
  private storage: IStorage;
  private MIN_PROMPT_LENGTH = 50;
  private MAX_PROMPT_LENGTH = 250;
  
  // TRUST NO ONE themed prompts for React Jam - Perfect for creating paranoia and suspense!
  private FALLBACK_PROMPTS = [
    "A shadow Garu mimics you. Will you trust the rhythm—or rewrite the script?",
    "Only one track is real. Will you trust the rhythm—or rewrite the script?",
    "Keystrokes control another. Will you trust the rhythm—or rewrite the script?",
    "One racer is a ghost. Will you trust the rhythm—or rewrite the script?",
    "Your opponent's screen lies. Will you trust the rhythm—or rewrite the script?",
    "Each gets false advice. Will you trust the rhythm—or rewrite the script?",
    "Imposter feeds false prompts. Will you trust the rhythm—or rewrite the script?",
    "The Codex speaks false words. Will you trust the rhythm—or rewrite the script?",
    "Players switch roles mid-race. Will you trust the rhythm—or rewrite the script?",
    "Whispers mid-race mislead. Will you trust the rhythm—or rewrite the script?",
    "A shadow Garu mimics you. Will you trust the rhythm—or rewrite the script?",
    "Keystrokes control another. Will you trust the rhythm—or rewrite the script?",
    "Players switch roles mid-race. Will you trust the rhythm—or rewrite the script?",
    "Whispers mid-race mislead. Will you trust the rhythm—or rewrite the script?",
    "One racer is a ghost. Will you trust the rhythm—or rewrite the script?",
    "Your opponent's screen lies. Will you trust the rhythm—or rewrite the script?",
    "Each gets false advice. Will you trust the rhythm—or rewrite the script?",
    "Imposter feeds false prompts. Will you trust the rhythm—or rewrite the script?",
    "Only one track is real. Will you trust the rhythm—or rewrite the script?",
    "The Codex speaks false words. Will you trust the rhythm—or rewrite the script?"
  ];
  
  private nextFallbackPromptId = 9000; // Starting ID for fallback prompts
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  /**
   * Get a random prompt for a race
   */
  async getRandomPrompt(): Promise<{ id: number; text: string } | null> {
    // IMPORTANT: For now, always use fallback prompts to ensure multiplayer works
    // This bypasses any database connection issues
    return this.getFallbackPrompt();
    
    /* Original code commented out until database connection issues are resolved
    try {
      const prompt = await this.storage.getRandomPrompt();
      
      if (prompt) {
        // Mark the prompt as used if database is available
        try {
          await this.storage.incrementPromptUsedCount(prompt.id);
        } catch (error) {
          console.warn("Could not increment prompt used count:", error);
        }
        
        return {
          id: prompt.id,
          text: prompt.text
        };
      }
      
      // If no prompt from database, use a fallback
      return this.getFallbackPrompt();
    } catch (error) {
      console.error("Error getting random prompt from database:", error);
      // Return a fallback prompt when database fails
      return this.getFallbackPrompt();
    }
    */
  }
  
  /**
   * Get a fallback prompt when database is unavailable
   */
  private getFallbackPrompt(): { id: number; text: string } {
    const randomIndex = Math.floor(Math.random() * this.FALLBACK_PROMPTS.length);
    const promptText = this.FALLBACK_PROMPTS[randomIndex];
    
    // Use a unique ID for the fallback prompt
    const promptId = this.nextFallbackPromptId++;
    
    return {
      id: promptId,
      text: promptText
    };
  }
  
  /**
   * Submit a new prompt
   */
  async submitPrompt(text: string, authorId: number): Promise<boolean> {
    // Validate prompt
    if (!this.validatePrompt(text)) {
      return false;
    }
    
    try {
      // Create the prompt
      const promptData: InsertPrompt = {
        text,
        author_id: authorId
      };
      
      await this.storage.createPrompt(promptData);
      
      // Increment user's prompt count
      await this.storage.incrementUserPromptCount(authorId);
      
      return true;
    } catch (error) {
      console.error("Error submitting prompt:", error);
      return false;
    }
  }
  
  /**
   * Validate a prompt
   */
  validatePrompt(text: string): boolean {
    const trimmedText = text.trim();
    
    // Check length
    if (trimmedText.length < this.MIN_PROMPT_LENGTH || trimmedText.length > this.MAX_PROMPT_LENGTH) {
      return false;
    }
    
    // Basic content moderation (in real app, would use more sophisticated moderation)
    const inappropriateWords = ["inappropriate1", "inappropriate2", "badword"];
    for (const word of inappropriateWords) {
      if (trimmedText.toLowerCase().includes(word)) {
        return false;
      }
    }
    
    return true;
  }
}
