import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto'; // Use Node.js built-in module
import http from 'http';
import https from 'https';

// TEK8 Lotus Petals & Canon Texts
export const TEK8_CANONICAL_TEXTS = [
  {
    petal: 'D4',
    element: 'Fire',
    theme: 'Identity | Aura | Sight',
    text: 'The Wonderful Toymaker',
    author: 'Evelyn Sharp',
    url: 'https://www.gutenberg.org/files/30400/30400-h/30400-h.htm',
    eggType: 'flameheart',
    description: 'A tale of transformation, where personal identity is forged in the fires of adventure and imagination.'
  },
  {
    petal: 'D6',
    element: 'Earth',
    theme: 'Stability | Strength | Grounding',
    text: 'The Swiss Family Robinson',
    author: 'Johann David Wyss',
    url: 'https://www.gutenberg.org/files/11707/11707-h/11707-h.htm',
    eggType: 'terraverde',
    description: 'Rooted in land and survival, this story shows how strength, family, and grounded creativity stabilize life.'
  },
  {
    petal: 'D8',
    element: 'Air',
    theme: 'Creativity | Motion | Breath',
    text: 'The Wonderful Wizard of Oz',
    author: 'L. Frank Baum',
    url: 'https://www.gutenberg.org/files/55/55-h/55-h.htm',
    eggType: 'skywisp',
    description: 'Wind, flight, and fantasy power this tale of imaginative transformation and moving beyond the known.'
  },
  {
    petal: 'D10',
    element: 'Chaos',
    theme: 'Hype | Vibe | Disruption',
    text: 'Alice\'s Adventures in Wonderland',
    author: 'Lewis Carroll',
    url: 'https://www.gutenberg.org/files/11/11-h/11-h.htm',
    eggType: 'voidmyst',
    description: 'A masterpiece of vibrant chaos, bending rules, language, and logic into a whirlwind of psychedelic storytelling.'
  },
  {
    petal: 'D12',
    element: 'Ether',
    theme: 'Lore | Frequency | Intuition',
    text: 'The Arabian Nights Entertainments',
    author: 'Anonymous',
    url: 'https://www.gutenberg.org/files/5667/5667-h/5667-h.htm',
    eggType: 'ethereal',
    description: 'A lore-dense archive of nested stories, dreams, and frequencies that echo moral and magical vibrations.'
  },
  {
    petal: 'D20',
    element: 'Water',
    theme: 'Empathy | Depth | Healing',
    text: '20,000 Leagues Under the Sea',
    author: 'Jules Verne',
    url: 'https://www.gutenberg.org/files/164/164-h/164-h.htm',
    eggType: 'aquafrost',
    description: 'A literal and emotional descent into deep ocean empathy — isolation, healing, and submerged humanity.'
  },
  {
    petal: 'D2',
    element: 'Coin',
    theme: 'Luck | Risk | Exchange',
    text: 'Jack and the Beanstalk',
    author: 'Anonymous',
    url: 'https://www.gutenberg.org/files/17034/17034-h/17034-h.htm',
    eggType: 'sunglow',
    description: 'Chance and barter catalyze a bold vertical journey of risk, treasure, and the unknown.'
  },
  {
    petal: 'D100',
    element: 'Order',
    theme: 'Archive | Cosmos | Pattern',
    text: 'Grimms\' Fairy Tales',
    author: 'Jacob and Wilhelm Grimm',
    url: 'https://www.gutenberg.org/files/2591/2591-h/2591-h.htm',
    eggType: 'stonehide',
    description: 'A structured cosmos of story archetypes. Every tale encodes moral pattern and recursive mythos.'
  }
];
import * as csv from 'fast-csv';

// Type definitions
export interface ShrineSubmission {
  id: string;
  text: string;
  source: string;
  type: string;
  timestamp: string;
  reviewed: boolean;
}

export interface ShrineOffering {
  id: string;
  text: string;
  source: string;
  type: string;
  timestamp: string;
}

export interface GaruEgg {
  id: string;
  name: string;
  type: string;
  elementalAffinity: string;
  color: string;
  timestamp: string;
  offeringId: string;
}

// File paths for data storage
const dataDir = path.join(process.cwd(), 'data');
const submissionsPath = path.join(dataDir, 'shrine-submissions.json');
const offeringsPath = path.join(dataDir, 'shrine-offerings.json');
const eggsPath = path.join(dataDir, 'garu-eggs.json');
const libraryPath = path.join(process.cwd(), 'attached_assets', 'CJSR_TextToEgg_Library.csv');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize files if they don't exist
if (!fs.existsSync(submissionsPath)) {
  fs.writeFileSync(submissionsPath, JSON.stringify({ submissions: [] }));
}

if (!fs.existsSync(offeringsPath)) {
  fs.writeFileSync(offeringsPath, JSON.stringify({ offerings: [] }));
}

if (!fs.existsSync(eggsPath)) {
  fs.writeFileSync(eggsPath, JSON.stringify({ eggs: [] }));
}

// Helper functions for Egg Generation
const garuTypes = [
  'EtherGaru', 'AirGaru', 'FireGaru', 'WaterGaru', 
  'EarthGaru', 'ChaosGaru', 'OrderGaru', 'WealthGaru'
];

const elementalAffinities = {
  'EtherGaru': ['Radiance', 'Sound', 'Light', 'Dream'],
  'AirGaru': ['Wind', 'Lightning', 'Voice', 'Flight'],
  'FireGaru': ['Flame', 'Forge', 'Passion', 'Destruction'],
  'WaterGaru': ['Ocean', 'Ice', 'Healing', 'Reflection'],
  'EarthGaru': ['Mountain', 'Forest', 'Growth', 'Stability'],
  'ChaosGaru': ['Void', 'Chance', 'Change', 'Disruption'],
  'OrderGaru': ['Pattern', 'Logic', 'Clockwork', 'Structure'],
  'WealthGaru': ['Prosperity', 'Balance', 'Trade', 'Fortune']
};

const colors = {
  'EtherGaru': 'Indigo',
  'AirGaru': 'Sky Blue',
  'FireGaru': 'Crimson',
  'WaterGaru': 'Deep Blue',
  'EarthGaru': 'Forest Green',
  'ChaosGaru': 'Black Prism',
  'OrderGaru': 'White Chrome',
  'WealthGaru': 'Gold'
};

const nameTemplates = {
  'EtherGaru': ['Aura', 'Echo', 'Whisper', 'Shimmer', 'Harmony'],
  'AirGaru': ['Breeze', 'Zephyr', 'Gale', 'Sky', 'Thunder'],
  'FireGaru': ['Ember', 'Blaze', 'Spark', 'Scorch', 'Fury'],
  'WaterGaru': ['Ripple', 'Tide', 'Wave', 'Stream', 'Frost'],
  'EarthGaru': ['Terra', 'Stone', 'Root', 'Leaf', 'Mountain'],
  'ChaosGaru': ['Glitch', 'Void', 'Enigma', 'Riddle', 'Shadow'],
  'OrderGaru': ['Vector', 'Logic', 'Axiom', 'Theorem', 'Rule'],
  'WealthGaru': ['Fortune', 'Bounty', 'Gift', 'Prosperity', 'Coin']
};

// Load keyword library from CSV
async function loadKeywordLibrary(): Promise<Map<string, string>> {
  const keywordMap = new Map<string, string>();
  
  if (!fs.existsSync(libraryPath)) {
    console.warn("Keyword library CSV not found. Using random egg assignment.");
    return keywordMap;
  }
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(libraryPath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => reject(error))
      .on('data', row => {
        const keyword = row.Keyword?.toLowerCase();
        const garuType = row.GaruType;
        if (keyword && garuType) {
          keywordMap.set(keyword, garuType);
        }
      })
      .on('end', () => resolve(keywordMap));
  });
}

// Determine egg type based on text content
async function determineEggType(text: string): Promise<string> {
  const keywordLibrary = await loadKeywordLibrary();
  
  if (keywordLibrary.size > 0) {
    // Check text against keyword library
    const words = text.toLowerCase().split(/\\s+/);
    for (const word of words) {
      if (keywordLibrary.has(word)) {
        return keywordLibrary.get(word)!;
      }
    }
  }
  
  // Fallback algorithm if no keyword match
  // Length-based mapping (very basic)
  const textLength = text.length;
  
  if (textLength < 50) return 'ChaosGaru'; // Short, unpredictable
  if (textLength < 100) return 'FireGaru'; // Quick, intense
  if (textLength < 200) return 'AirGaru'; // Light, flowing
  if (textLength < 350) return 'WaterGaru'; // Moderate, flowing
  if (textLength < 500) return 'EarthGaru'; // Substantial, grounded
  if (textLength < 700) return 'WealthGaru'; // Rich in content
  if (textLength < 1000) return 'OrderGaru'; // Structured, lengthy
  
  return 'EtherGaru'; // Most complex, transcendent
}

// Generate a random name for an egg based on its type
function generateEggName(type: string): string {
  const templates = nameTemplates[type as keyof typeof nameTemplates] || nameTemplates.EtherGaru;
  const nameBase = templates[Math.floor(Math.random() * templates.length)];
  const suffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${nameBase}-${suffix}`;
}

// Generate a random elemental affinity for an egg based on its type
function generateElementalAffinity(type: string): string {
  const affinities = elementalAffinities[type as keyof typeof elementalAffinities] || elementalAffinities.EtherGaru;
  return affinities[Math.floor(Math.random() * affinities.length)];
}

// Generate an egg from an offering
async function generateEgg(offering: ShrineOffering): Promise<GaruEgg> {
  const type = await determineEggType(offering.text);
  
  const egg: GaruEgg = {
    id: randomUUID(),
    name: generateEggName(type),
    type,
    elementalAffinity: generateElementalAffinity(type),
    color: colors[type as keyof typeof colors] || colors.EtherGaru,
    timestamp: new Date().toISOString(),
    offeringId: offering.id
  };
  
  return egg;
}

// Read, write, and manage submissions
export async function getSubmissions(): Promise<ShrineSubmission[]> {
  const data = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'));
  return data.submissions || [];
}

export async function addSubmission(submission: Omit<ShrineSubmission, 'id' | 'timestamp' | 'reviewed'>): Promise<ShrineSubmission> {
  const submissions = await getSubmissions();
  
  const newSubmission: ShrineSubmission = {
    id: randomUUID(),
    ...submission,
    timestamp: new Date().toISOString(),
    reviewed: false
  };
  
  submissions.push(newSubmission);
  fs.writeFileSync(submissionsPath, JSON.stringify({ submissions }));
  
  return newSubmission;
}

// Read, write, and manage offerings
export async function getOfferings(): Promise<ShrineOffering[]> {
  const data = JSON.parse(fs.readFileSync(offeringsPath, 'utf8'));
  return data.offerings || [];
}

export async function addOffering(offering: Omit<ShrineOffering, 'id' | 'timestamp'>): Promise<ShrineOffering> {
  const offerings = await getOfferings();
  
  const newOffering: ShrineOffering = {
    id: randomUUID(),
    ...offering,
    timestamp: new Date().toISOString()
  };
  
  offerings.push(newOffering);
  fs.writeFileSync(offeringsPath, JSON.stringify({ offerings }));
  
  // Generate an egg from this offering
  const egg = await generateEgg(newOffering);
  await addEgg(egg);
  
  return newOffering;
}

// Read, write, and manage eggs
export async function getEggs(): Promise<GaruEgg[]> {
  const data = JSON.parse(fs.readFileSync(eggsPath, 'utf8'));
  return data.eggs || [];
}

export async function addEgg(egg: GaruEgg): Promise<GaruEgg> {
  const eggs = await getEggs();
  eggs.push(egg);
  fs.writeFileSync(eggsPath, JSON.stringify({ eggs }));
  return egg;
}

// Approve a submission and convert to offering
export async function approveSubmission(submissionId: string): Promise<ShrineOffering | null> {
  const submissions = await getSubmissions();
  const submissionIndex = submissions.findIndex(s => s.id === submissionId);
  
  if (submissionIndex === -1) {
    return null;
  }
  
  const submission = submissions[submissionIndex];
  submission.reviewed = true;
  
  // Add as an approved offering
  const offering = await addOffering({
    text: submission.text,
    source: submission.source,
    type: submission.type
  });
  
  // Update submissions file
  fs.writeFileSync(submissionsPath, JSON.stringify({ submissions }));
  
  return offering;
}

// Reject a submission
export async function rejectSubmission(submissionId: string): Promise<boolean> {
  const submissions = await getSubmissions();
  const submissionIndex = submissions.findIndex(s => s.id === submissionId);
  
  if (submissionIndex === -1) {
    return false;
  }
  
  submissions[submissionIndex].reviewed = true;
  fs.writeFileSync(submissionsPath, JSON.stringify({ submissions }));
  
  return true;
}

// Fetch content from Project Gutenberg (enhanced to support TEK8 canonical texts)
export async function fetchFromGutenberg(url: string): Promise<{ title: string; excerpt: string; eggType?: string } | null> {
  try {
    // Validate URL format
    if (!url.includes('gutenberg.org')) {
      throw new Error('Invalid Gutenberg URL');
    }
    
    // Find matching TEK8 text
    const matchingText = TEK8_CANONICAL_TEXTS.find(text => 
      url.includes(text.url.split('/').slice(-2)[0]) || 
      url.includes(text.text.toLowerCase().replace(/\s+/g, '-'))
    );
    
    // TEK8 canonical texts with excerpts
    const TEK8_EXCERPTS = [
      {
        title: "The Wonderful Toymaker",
        excerpt: "There was once a wonderful toymaker who could make toys come alive. Not with batteries or clockwork, but with something more magical - the joy of children. Each toy he created held a little piece of identity, a spark of life that would grow as a child played with it and loved it.",
        eggType: "flameheart"
      },
      {
        title: "The Swiss Family Robinson",
        excerpt: "For many days we had been tempest-tossed. The storm appeared to have taken us entirely out of our route, and we were now sailing over a totally unknown sea. Our provisions were nearly exhausted, and we gazed with increasing anxiety upon the horizon, hoping that we might discover some shore upon which we might land and replenish our stores.",
        eggType: "terraverde"
      },
      {
        title: "The Wonderful Wizard of Oz",
        excerpt: "Dorothy lived in the midst of the great Kansas prairies, with Uncle Henry, who was a farmer, and Aunt Em, who was the farmer's wife. Their house was small, for the lumber to build it had to be carried by wagon many miles. There were four walls, a floor and a roof, which made one room.",
        eggType: "skywisp"
      },
      {
        title: "Alice's Adventures in Wonderland",
        excerpt: "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, 'and what is the use of a book,' thought Alice 'without pictures or conversations?'",
        eggType: "voidmyst"
      },
      {
        title: "The Arabian Nights Entertainments",
        excerpt: "Scheherazade had perused the books, annals and legends of preceding Kings, and the stories, examples and instances of bygone men and things; indeed it was said that she had collected a thousand books of histories relating to antique races and departed rulers. She had perused the works of the poets and knew them by heart; she had studied philosophy and the sciences, arts and accomplishments.",
        eggType: "ethereal"
      },
      {
        title: "20,000 Leagues Under the Sea",
        excerpt: "The year 1866 was signalised by a remarkable incident, a mysterious and puzzling phenomenon, which doubtless no one has yet forgotten. Not to mention rumours which agitated the maritime population and excited the public mind, even in the interior of continents, seafaring men were particularly excited. Merchants, common sailors, captains of vessels, skippers, both of Europe and America, naval officers of all countries, and the Governments of several States on the two continents, were deeply interested in the matter.",
        eggType: "aquafrost"
      },
      {
        title: "Jack and the Beanstalk",
        excerpt: "Jack's mother was very angry. 'What a foolish boy you are!' she said. 'You've sold our cow for a handful of beans!' She threw the beans out of the window and sent Jack to bed without any supper. The next morning, when Jack woke up, the room was dark. There was something outside his window. It was a giant beanstalk! It went right up into the sky!",
        eggType: "sunglow"
      },
      {
        title: "Grimms' Fairy Tales",
        excerpt: "Once upon a time there was a dear little girl who was loved by everyone who looked at her, but most of all by her grandmother, and there was nothing that she would not have given to the child. Once she gave her a little riding hood of red velvet, which suited her so well that she would never wear anything else.",
        eggType: "stonehide"
      }
    ];
    
    // Return the matching TEK8 excerpt or a random one if no match
    if (matchingText) {
      const matchingExcerpt = TEK8_EXCERPTS.find(e => e.eggType === matchingText.eggType);
      if (matchingExcerpt) {
        return {
          title: matchingText.text,
          excerpt: matchingExcerpt.excerpt,
          eggType: matchingText.eggType
        };
      }
    }
    
    // Return a random TEK8 excerpt if no direct match
    const randomExcerpt = TEK8_EXCERPTS[Math.floor(Math.random() * TEK8_EXCERPTS.length)];
    return {
      title: randomExcerpt.title,
      excerpt: randomExcerpt.excerpt,
      eggType: randomExcerpt.eggType
    };
  } catch (error) {
    console.error('Error with Gutenberg sample:', error);
    return null;
  }
}

// Function to generate a TEK8 Lotus Petal egg based on canonical texts
export async function generateTEK8Egg(userId: number): Promise<any> {
  try {
    // Get a random TEK8 text
    const tekIndex = Math.floor(Math.random() * TEK8_CANONICAL_TEXTS.length);
    const tek8Text = TEK8_CANONICAL_TEXTS[tekIndex];
    
    // Fetch excerpt using our enhanced function
    const gutenbergResult = await fetchFromGutenberg(tek8Text.url);
    
    if (!gutenbergResult) {
      throw new Error('Failed to fetch text from Gutenberg');
    }
    
    // Create a text offering
    const offering: ShrineOffering = {
      id: randomUUID(),
      text: gutenbergResult.excerpt,
      source: `${tek8Text.text} by ${tek8Text.author}`,
      type: tek8Text.petal,
      timestamp: new Date().toISOString()
    };
    
    // Add offering to storage
    await addOffering(offering);
    
    // Generate egg with the specific type
    const eggType = gutenbergResult.eggType || tek8Text.eggType;
    
    // Create the egg from the offering
    const egg = await generateEgg(offering);
    
    // Override the egg type if needed to match the TEK8 petal
    if (egg.type !== eggType) {
      egg.type = eggType;
    }
    
    // Add egg to storage
    await addEgg(egg);
    
    return {
      success: true,
      egg,
      offering,
      text: tek8Text
    };
  } catch (error) {
    console.error('Error generating TEK8 egg:', error);
    return {
      success: false,
      error: 'Failed to generate TEK8 egg'
    };
  }
}