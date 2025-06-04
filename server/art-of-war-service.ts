import * as fs from 'fs';
import * as path from 'path';
import { expandedArtOfWarPassages, normalizeText } from './art-of-war-expanded';

interface ArtOfWarPassage {
  text: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: number;
}

export class ArtOfWarService {
  private passages: ArtOfWarPassage[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      const filePath = path.join(process.cwd(), 'data', 'art-of-war.txt');
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Extract strategic passages from the text
      this.extractPassages(content);
      this.initialized = true;
      
      console.log(`📚 Art of War service initialized with ${this.passages.length} strategic passages`);
    } catch (error) {
      console.error('Error initializing Art of War service:', error);
      // Use the expanded family-friendly collection
      this.initializeFallbackPassages();
      this.initialized = true;
    }
  }

  private extractPassages(content: string) {
    // Split content into meaningful sections
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // Extract strategic quotes and passages
    const strategicPassages = [
      // Chapter I - Laying Plans
      "All warfare is based on deception. Hence, when able to attack, we must seem unable; when using our forces, we must seem inactive; when we are near, we must make the enemy believe we are far away; when far away, we must make him believe we are near.",
      
      "Hold out baits to entice the enemy. Feign disorder, and crush him. If he is secure at all points, be prepared for him. If he is in superior strength, evade him.",
      
      "If your opponent is of choleric temper, seek to irritate him. Pretend to be weak, that he may grow arrogant. If he is taking his ease, give him no rest. If his forces are united, separate them.",
      
      // Chapter II - Waging War  
      "In war, the way is to avoid what is strong and to strike at what is weak. Water shapes its course according to the nature of the ground over which it flows.",
      
      "The clever combatant looks to the effect of combined energy, and does not require too much from individuals. Hence his ability to pick out the right men and utilize combined energy.",
      
      // Chapter III - Attack by Stratagem
      "The supreme excellence consists in breaking the enemy's resistance without fighting. Thus the highest form of warfare is to attack the enemy's plans.",
      
      "Next best is to disrupt his alliances. The next best is to attack his army. The worst policy of all is to besiege walled cities.",
      
      "Therefore the skillful strategist defeats the enemy without any fighting; he captures their cities without laying siege to them; he overthrows their kingdom without lengthy operations in the field.",
      
      // Chapter IV - Tactical Dispositions
      "The good fighters of old first put themselves beyond the possibility of defeat, and then waited for an opportunity of defeating the enemy.",
      
      "To secure ourselves against defeat lies in our own hands, but the opportunity of defeating the enemy is provided by the enemy himself.",
      
      // Chapter V - Energy
      "The rush of a torrent carries away boulders; such is the nature of its momentum. The swoop of a falcon breaks the body of its prey; such is the nature of timing.",
      
      "Therefore the good warrior will be terrible in his onset, and prompt in his decision. Energy may be likened to the bending of a crossbow; decision, to the releasing of a trigger.",
      
      // Chapter VI - Weak Points and Strong
      "Whoever is first in the field and awaits the coming of the enemy, will be fresh for the fight; whoever is second in the field and has to hasten to battle will arrive exhausted.",
      
      "Therefore the clever combatant avoids the enemy when his spirit is keen and attacks him when it is sluggish and his soldiers homesick.",
      
      // Chapter VII - Maneuvering
      "All warfare is based on deception. There is no place where espionage is not used. Offer the enemy bait to lure him.",
      
      "In war, the way is to avoid what is strong and to strike at what is weak. Speed is the essence of war: take advantage of the enemy's unreadiness.",
      
      // Historical passages
      "Sun Tzu said: 'If words of command are not clear and distinct, if orders are not thoroughly understood, then the general is to blame. But if his orders are clear, and the soldiers nevertheless disobey, then it is the fault of their officers.'",
      
      "When the King saw that his court attendants were about to face consequences, he was greatly alarmed and hurriedly sent down a message. Sun Tzu replied: 'Having once received His Majesty's commission to be the general of his forces, there are certain commands which I am unable to accept.'",
      
      "After the demonstration, the students went through all the evolutions, turning to the right or to the left, marching ahead or wheeling back, kneeling or standing, with perfect accuracy and precision, not venturing to utter a sound.",

      // Additional 20 family-friendly Art of War passages
      "Know yourself and know your enemy, and you will never be defeated in a hundred battles.",
      "The wise warrior avoids the battle.",
      "Supreme excellence is breaking the enemy's resistance without fighting.",
      "In the midst of chaos, there is also opportunity.",
      "Let your plans be dark and impenetrable as night, and when you move, fall like a thunderbolt.",
      "The greatest victory is that which requires no battle.",
      "If you know the enemy and know yourself, your victory will not stand in doubt.",
      "All warfare is based on deception. When capable, feign incapacity; when active, inactivity.",
      "The art of war teaches us to rely not on the likelihood of the enemy's not coming, but on our own readiness to receive him.",
      "He who is prudent and lies in wait for an enemy who is not, will be victorious.",
      "Water shapes its course according to the nature of the ground; the soldier works out his victory in relation to the foe he is facing.",
      "The clever combatant avoids the enemy when his spirit is keen and attacks him when it is sluggish.",
      "Rapidity is the essence of war: take advantage of the enemy's unreadiness, make your way by unexpected routes.",
      "The skillful strategist defeats the enemy without any fighting; he captures their cities without laying siege.",
      "When you surround an army, leave an outlet free. Do not press a desperate foe too hard.",
      "Be extremely subtle, even to the point of formlessness. Be extremely mysterious, even to the point of soundlessness.",
      "The general who wins a battle makes many calculations in his temple before the battle is fought.",
      "In war, the way is to avoid what is strong and strike at what is weak.",
      "He who knows when to fight and when not to fight will be victorious.",
      "The soldier who strikes first and strikes hardest usually wins the day.",
      "Victory belongs to the most persevering commander who adapts to changing circumstances.",
      "A wise general makes a point of foraging on the enemy territory rather than his own.",
      "The best victory is when the opponent surrenders of its own accord before there are any actual hostilities."
    ]
      ;

    // Process each passage
    strategicPassages.forEach((text, index) => {
      const wordCount = text.split(' ').length;
      let difficulty: 'easy' | 'medium' | 'hard';
      let chapter = 'Strategic Wisdom';
      
      // Determine difficulty based on length and complexity
      if (wordCount < 25) {
        difficulty = 'easy';
      } else if (wordCount < 50) {
        difficulty = 'medium';
      } else {
        difficulty = 'hard';
      }
      
      // Determine chapter context
      if (text.includes('deception') || text.includes('plans')) {
        chapter = 'Chapter I: Laying Plans';
      } else if (text.includes('energy') || text.includes('momentum')) {
        chapter = 'Chapter V: Energy';
      } else if (text.includes('strategy') || text.includes('attack')) {
        chapter = 'Chapter III: Attack by Stratagem';
      } else if (text.includes('Sun Tzu said') || text.includes('court attendants')) {
        chapter = 'Historical Account';
      }
      
      this.passages.push({
        text: text.trim(),
        chapter,
        difficulty,
        length: wordCount
      });
    });
  }

  private initializeFallbackPassages() {
    // Use the expanded family-friendly collection from art-of-war-expanded.ts
    this.passages = expandedArtOfWarPassages.map(text => {
      const wordCount = text.split(' ').length;
      let difficulty: 'easy' | 'medium' | 'hard';
      let chapter = 'Strategic Wisdom';

      if (wordCount <= 20) {
        difficulty = 'easy';
      } else if (wordCount <= 40) {
        difficulty = 'medium';
      } else {
        difficulty = 'hard';
      }

      // Categorize by content themes
      if (text.includes('planning') || text.includes('preparation')) {
        chapter = 'Chapter I: Strategic Planning';
      } else if (text.includes('timing') || text.includes('energy')) {
        chapter = 'Chapter V: Energy and Timing';
      } else if (text.includes('alliance') || text.includes('cooperation')) {
        chapter = 'Chapter III: Planning and Preparation';
      }

      return {
        text: normalizeText(text), // Apply character normalization
        chapter,
        difficulty,
        length: wordCount
      };
    });

    console.log(`📚 Art of War fallback initialized with ${this.passages.length} normalized passages`);
  }

  getRandomPassage(difficulty?: 'easy' | 'medium' | 'hard'): ArtOfWarPassage {
    if (!this.initialized) {
      throw new Error('Art of War service not initialized');
    }
    
    let availablePassages = this.passages;
    
    if (difficulty) {
      availablePassages = this.passages.filter(p => p.difficulty === difficulty);
    }
    
    if (availablePassages.length === 0) {
      availablePassages = this.passages; // Fallback to all passages
    }
    
    const randomIndex = Math.floor(Math.random() * availablePassages.length);
    return availablePassages[randomIndex];
  }

  getPassageByLength(minLength: number, maxLength: number): ArtOfWarPassage {
    if (!this.initialized) {
      throw new Error('Art of War service not initialized');
    }
    
    const suitablePassages = this.passages.filter(p => 
      p.length >= minLength && p.length <= maxLength
    );
    
    if (suitablePassages.length === 0) {
      return this.getRandomPassage(); // Fallback
    }
    
    const randomIndex = Math.floor(Math.random() * suitablePassages.length);
    return suitablePassages[randomIndex];
  }

  getAllPassages(): ArtOfWarPassage[] {
    return [...this.passages];
  }
}

// Export singleton instance
export const artOfWarService = new ArtOfWarService();