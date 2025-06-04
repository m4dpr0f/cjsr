import { Router } from "express";
import { IStorage } from "../storage";

// Elemental Petal System - Each petal corresponds to an elemental affinity
export const ELEMENTAL_PETALS = {
  // Primary petals (four elements)
  fire: {
    id: "fire",
    name: "Fire Petal",
    element: "fire",
    description: "The fire petal represents passion, transformation, and creativity.",
    eggType: "Blaze"
  },
  water: {
    id: "water",
    name: "Water Petal",
    element: "water",
    description: "The water petal represents flow, intuition, and emotional depth.",
    eggType: "Aqua"
  },
  earth: {
    id: "earth",
    name: "Earth Petal",
    element: "earth", 
    description: "The earth petal represents stability, growth, and material abundance.",
    eggType: "Terra"
  },
  air: {
    id: "air",
    name: "Air Petal",
    element: "air",
    description: "The air petal represents intellect, communication, and freedom.",
    eggType: "Aero"
  },
  
  // Secondary petals (four combinations)
  crystal: {
    id: "crystal",
    name: "Crystal Petal",
    element: "crystal", 
    description: "The crystal petal represents clarity, focus, and amplification of intentions.",
    eggType: "Prism"
  },
  lightning: {
    id: "lightning",
    name: "Lightning Petal",
    element: "lightning",
    description: "The lightning petal represents sudden insight, action, and transformation.",
    eggType: "Bolt"
  },
  nature: {
    id: "nature",
    name: "Nature Petal",
    element: "nature",
    description: "The nature petal represents harmony, growth, and connection with all living things.",
    eggType: "Flora"
  },
  void: {
    id: "void",
    name: "Void Petal",
    element: "void",
    description: "The void petal represents mystery, potential, and the spaces between.",
    eggType: "Nebula"
  }
};

// The elemental affinities determine egg colors and special properties
export const ELEMENTAL_AFFINITIES = {
  fire: {
    colors: ["#FF5733", "#FF8C42", "#FFBD4A"],
    traits: ["passionate", "energetic", "transformative"]
  },
  water: {
    colors: ["#4A90E2", "#56CCF2", "#6BDDFF"],
    traits: ["intuitive", "adaptive", "reflective"]
  },
  earth: {
    colors: ["#8BC34A", "#689F38", "#CDDC39"],
    traits: ["stable", "nurturing", "abundant"]
  },
  air: {
    colors: ["#E0E0E0", "#B0BEC5", "#CFD8DC"],
    traits: ["intellectual", "communicative", "free"]
  },
  crystal: {
    colors: ["#9C27B0", "#BA68C8", "#E1BEE7"],
    traits: ["clear", "focused", "amplifying"]
  },
  lightning: {
    colors: ["#FFEB3B", "#FFC107", "#FF9800"],
    traits: ["insightful", "quick", "transformative"]
  },
  nature: {
    colors: ["#4CAF50", "#81C784", "#C8E6C9"],
    traits: ["harmonious", "growing", "connected"]
  },
  void: {
    colors: ["#424242", "#616161", "#9E9E9E"],
    traits: ["mysterious", "potential", "spacious"]
  }
};

// Name templates for generated eggs
export const NAME_TEMPLATES = [
  "Little [element]",
  "[element] Whisper",
  "[element] Dream",
  "Dawn [element]",
  "Twilight [element]",
  "[element] Seeker",
  "[element] Guardian",
  "Silent [element]",
  "[element] Voice",
  "Eternal [element]"
];

// Egg types corresponding to petals
export const GARU_EGG_TYPES = {
  Blaze: {
    element: "fire",
    rarity: "common"
  },
  Aqua: {
    element: "water",
    rarity: "common"
  },
  Terra: {
    element: "earth",
    rarity: "common"
  },
  Aero: {
    element: "air",
    rarity: "common"
  },
  Prism: {
    element: "crystal",
    rarity: "uncommon"
  },
  Bolt: {
    element: "lightning",
    rarity: "uncommon"
  },
  Flora: {
    element: "nature",
    rarity: "uncommon"
  },
  Nebula: {
    element: "void",
    rarity: "rare"
  }
};

export function registerTEK8Routes(router: Router, storage: IStorage) {
  // Get all available elemental petals
  router.get("/api/tek8/petals", (req, res) => {
    try {
      res.json({ petals: Object.values(ELEMENTAL_PETALS) });
    } catch (error) {
      console.error("Error fetching elemental petals:", error);
      res.status(500).json({ message: "Failed to fetch petals" });
    }
  });

  // Get petal by ID
  router.get("/api/tek8/petals/:id", (req, res) => {
    try {
      const { id } = req.params;
      const petalId = id as keyof typeof ELEMENTAL_PETALS;
      const petal = ELEMENTAL_PETALS[petalId];
      
      if (!petal) {
        return res.status(404).json({ message: "Petal not found" });
      }
      
      res.json(petal);
    } catch (error) {
      console.error("Error fetching elemental petal:", error);
      res.status(500).json({ message: "Failed to fetch petal" });
    }
  });
  
  // Generate an egg from a selected petal
  router.post("/api/tek8/generate-egg", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "You must be logged in to generate an egg" });
      }
      
      const { petalId, source = "codex_crucible" } = req.body;
      const petalKey = petalId as keyof typeof ELEMENTAL_PETALS;
      
      if (!petalId || !ELEMENTAL_PETALS[petalKey]) {
        return res.status(400).json({ message: "Invalid petal selection" });
      }
      
      // Create the offering record
      await storage.createOffering({
        userId,
        petalId,
        source,
        type: "personal"
      });
      
      // Generate the egg from the selected petal
      const eggData = {
        userId,
        petalId,
        name: generateEggName(petalId),
        timestamp: new Date().toISOString()
      };
      
      const egg = await storage.createGaruEgg(eggData);
      
      res.status(201).json({ 
        message: "Egg generated successfully",
        egg
      });
    } catch (error) {
      console.error("Error generating egg:", error);
      res.status(500).json({ message: "Failed to generate egg" });
    }
  });
}

// Helper function to generate egg names
function generateEggName(petalId: string): string {
  const petal = ELEMENTAL_PETALS[petalId as keyof typeof ELEMENTAL_PETALS];
  if (!petal) return "Mysterious Egg";
  
  const template = NAME_TEMPLATES[Math.floor(Math.random() * NAME_TEMPLATES.length)];
  return template.replace("[element]", petal.element.charAt(0).toUpperCase() + petal.element.slice(1));
}