import { Router } from "express";
import { IStorage } from "../storage";

export function registerShrineRoutes(router: Router, storage: IStorage) {
  // Get recent shrine offerings
  router.get("/api/shrine/offerings", async (req, res) => {
    try {
      const offerings = await storage.getRecentOfferings();
      return res.json({ offerings });
    } catch (error) {
      console.error("Error fetching shrine offerings:", error);
      return res.status(500).json({ message: "Failed to fetch shrine offerings" });
    }
  });

  // Get generated Garu eggs
  router.get("/api/shrine/eggs", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.json({ eggs: [] }); // Return empty if not logged in
      }
      
      const eggs = await storage.getUserEggs(userId);
      return res.json({ eggs });
    } catch (error) {
      console.error("Error fetching Garu eggs:", error);
      return res.status(500).json({ message: "Failed to fetch Garu eggs" });
    }
  });

  // Submit a new petal selection
  router.post("/api/shrine/submissions", async (req: any, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "You must be logged in to make an offering" });
      }
      
      const { petalId, source, type } = req.body;
      
      if (!petalId) {
        return res.status(400).json({ message: "A petal selection is required" });
      }
      
      // Record the offering
      const offering = await storage.createOffering({
        userId,
        petalId,
        source: source || "Anonymous",
        type: type || "personal"
      });
      
      // Generate an egg based on the petal selection
      const egg = await storage.createGaruEgg({
        userId,
        petalId,
        name: generateEggName(petalId),
        timestamp: new Date().toISOString()
      });
      
      return res.json({ success: true, egg });
    } catch (error) {
      console.error("Error submitting petal selection:", error);
      return res.status(500).json({ message: "Failed to submit petal selection" });
    }
  });
  
  return router;
}

// Helper function to generate egg names
function generateEggName(petalId: string): string {
  const prefixes = [
    "Mystic", "Radiant", "Ancient", "Vibrant", "Enigmatic", 
    "Primal", "Ethereal", "Whispering", "Resonant", "Celestial"
  ];
  
  const suffixes = [
    "Dreamer", "Guardian", "Voyager", "Seeker", "Champion",
    "Herald", "Watcher", "Oracle", "Sentinel", "Visionary"
  ];
  
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  
  // Extract the element from the petal ID (e.g., "D4 Fire" -> "Fire")
  const element = petalId.split(" ").pop() || "Mysterious";
  
  return `${prefix} ${element} ${suffix}`;
}