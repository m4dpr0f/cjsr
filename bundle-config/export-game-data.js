import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Export authentic game data for offline bundle
function exportGameData() {
  const exportDir = path.join(__dirname, '../export-bundle/data');
  
  // Create data directory
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Race prompts for offline mode
  const racePrompts = [
    {
      id: 1,
      text: "The quick brown fox jumps over the lazy dog",
      difficulty: "easy",
      category: "basic"
    },
    {
      id: 2,
      text: "Pack my box with five dozen liquor jugs",
      difficulty: "easy",
      category: "basic"
    },
    {
      id: 3,
      text: "In the depths of winter, I finally learned that within me there lay an invincible summer",
      difficulty: "medium",
      category: "literary"
    },
    {
      id: 4,
      text: "The only way to do great work is to love what you do",
      difficulty: "medium",
      category: "inspirational"
    },
    {
      id: 5,
      text: "Programming is not a science. Programming is a craft",
      difficulty: "medium",
      category: "technical"
    }
  ];

  // Faction system data
  const factions = {
    d2: {
      name: "Electric Guild",
      element: "Lightning",
      color: "#FFD700",
      description: "Masters of speed and precision"
    },
    d4: {
      name: "Fire Guild", 
      element: "Fire",
      color: "#FF4500",
      description: "Passionate racers with burning determination"
    },
    d6: {
      name: "Earth Guild",
      element: "Earth", 
      color: "#8B4513",
      description: "Grounded typists with steady hands"
    },
    d8: {
      name: "Air Guild",
      element: "Air",
      color: "#87CEEB", 
      description: "Swift and agile keyboard warriors"
    },
    d10: {
      name: "Chaos Guild",
      element: "Chaos",
      color: "#8A2BE2",
      description: "Unpredictable masters of randomness"
    },
    d12: {
      name: "Ether Guild", 
      element: "Ether",
      color: "#9370DB",
      description: "Mystical typists channeling ancient wisdom"
    },
    d20: {
      name: "Water Guild",
      element: "Water", 
      color: "#4169E1",
      description: "Fluid and adaptive racing style"
    },
    d100: {
      name: "Order Guild",
      element: "Order",
      color: "#FFE4B5",
      description: "Methodical perfectionists seeking balance"
    }
  };

  // Campaign structure for offline mode
  const campaigns = [
    {
      id: "basic-training",
      name: "Basic Training",
      description: "Learn the fundamentals of typing",
      levels: [
        {
          id: 1,
          name: "First Steps",
          prompt: "Welcome to CJSR! Type this text to begin your journey.",
          targetWPM: 20,
          targetAccuracy: 90
        },
        {
          id: 2, 
          name: "Building Speed",
          prompt: "Practice makes perfect. Keep typing to improve your speed.",
          targetWPM: 30,
          targetAccuracy: 92
        }
      ]
    },
    {
      id: "wisdom-path",
      name: "Path of Wisdom",
      description: "Type sacred texts and philosophical quotes",
      levels: [
        {
          id: 1,
          name: "Ancient Wisdom",
          prompt: "The journey of a thousand miles begins with one step",
          targetWPM: 25,
          targetAccuracy: 95
        }
      ]
    }
  ];

  // Wisdom texts for offline scribe mode
  const wisdomTexts = [
    {
      id: 1,
      tradition: "Taoism",
      text: "The journey of a thousand miles begins with one step",
      source: "Tao Te Ching",
      translation: "Every great achievement starts with a single action"
    },
    {
      id: 2,
      tradition: "Buddhism", 
      text: "Peace comes from within. Do not seek it without",
      source: "Buddha",
      translation: "True tranquility is found through inner cultivation"
    },
    {
      id: 3,
      tradition: "Vedanta",
      text: "You are what your deep, driving desire is",
      source: "Brihadaranyaka Upanishad",
      translation: "Our fundamental aspirations shape our reality"
    }
  ];

  // Glyph Scribes chapter data
  const glyphChapters = [
    {
      id: "chapter-1",
      name: "Chapter 1: Symbols of Character",
      glyphs: [
        {
          name: "Compassion",
          symbol: "♡",
          meaning: "Universal love and kindness",
          lore: "The heart symbol represents the fundamental force that binds all beings together in mutual care and understanding."
        },
        {
          name: "Wisdom", 
          symbol: "☯",
          meaning: "Balance of knowledge and understanding",
          lore: "The yin-yang symbol shows how opposing forces create harmony and deeper insight through their dynamic interaction."
        },
        {
          name: "Growth",
          symbol: "🌱", 
          meaning: "Continuous learning and development",
          lore: "The sprouting seed represents the endless potential within every individual to evolve and flourish."
        }
      ]
    }
  ];

  // Export all data files
  fs.writeFileSync(path.join(exportDir, 'race-prompts.json'), JSON.stringify(racePrompts, null, 2));
  fs.writeFileSync(path.join(exportDir, 'factions.json'), JSON.stringify(factions, null, 2));
  fs.writeFileSync(path.join(exportDir, 'campaigns.json'), JSON.stringify(campaigns, null, 2));
  fs.writeFileSync(path.join(exportDir, 'wisdom-texts.json'), JSON.stringify(wisdomTexts, null, 2));
  fs.writeFileSync(path.join(exportDir, 'glyph-chapters.json'), JSON.stringify(glyphChapters, null, 2));

  console.log('✅ Game data exported successfully to export-bundle/data/');
}

// Run export if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportGameData();
}

export { exportGameData };