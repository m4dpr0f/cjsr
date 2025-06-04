import { CharacterPresets } from "@/components/html-sprites/chicken-jockey";

// Define HTML sprite options for the chicken customizer
export const htmlSpriteOptions = [
  // Main campaign characters
  { id: "html_matikah", name: "Matikah & Chalisa", requiredLevel: 0 },
  { id: "html_auto", name: "Auto & Timaru", requiredLevel: 0 },
  { id: "html_death", name: "Death", requiredLevel: 5 },
  { id: "html_iam", name: "Iam", requiredLevel: 10 },
  { id: "html_steve", name: "Steve & Brutus", requiredLevel: 0 },
  
  // Additional HTML sprite options
  { id: "html_golden", name: "Golden Champion", requiredLevel: 15 },
  { id: "html_teacherGuru", name: "Teacher Guru", requiredLevel: 0 },
  
  // TEK8 Garu types based on lore
  { id: "html_etherGaru", name: "Ether Garu", requiredLevel: 10, description: "The Radiant Sky Garu with ether elemental powers" },
  { id: "html_airGaru", name: "Air Garu", requiredLevel: 5, description: "The Zephyr Garu with air elemental powers" },
  { id: "html_fireGaru", name: "Fire Garu", requiredLevel: 5, description: "The Ember Garu with fire elemental powers" },
  { id: "html_waterGaru", name: "Water Garu", requiredLevel: 5, description: "The Tide Garu with water elemental powers" },
  { id: "html_earthGaru", name: "Earth Garu", requiredLevel: 5, description: "The Terra Garu with earth elemental powers" },
  { id: "html_chaosGaru", name: "Chaos Garu", requiredLevel: 15, description: "The Trickster Garu with chaos elemental powers" },
  { id: "html_orderGaru", name: "Order Garu", requiredLevel: 15, description: "The Sentinel Garu with order elemental powers" },
  { id: "html_wealthGaru", name: "Wealth Garu", requiredLevel: 20, description: "The Fortune Garu with wealth elemental powers" },
  
  // Undead NPC Options (Easy/Normal Difficulty)
  { id: "html_undeadCJ01", name: "Undead Rider (Red)", requiredLevel: 5, description: "A mysterious undead rider with a dark red mount" },
  { id: "html_undeadCJ02", name: "Undead Rider (Blue)", requiredLevel: 5, description: "A mysterious undead rider with a dark blue mount" },
  { id: "html_undeadCJ03", name: "Undead Rider (Green)", requiredLevel: 5, description: "A mysterious undead rider with a dark green mount" },
  { id: "html_undeadCJ04", name: "Undead Rider (Yellow)", requiredLevel: 5, description: "A mysterious undead rider with a dark yellow mount" },
  { id: "html_undeadCJ05", name: "Undead Rider (Pink)", requiredLevel: 10, description: "A powerful undead rider with a dark pink mount" },
  { id: "html_undeadCJ06", name: "Undead Rider (Purple)", requiredLevel: 10, description: "A powerful undead rider with a dark purple mount" },
  { id: "html_undeadCJ07", name: "Undead Rider (Teal)", requiredLevel: 10, description: "A powerful undead rider with a dark teal mount" },
  { id: "html_undeadCJ08", name: "Undead Rider (Orange)", requiredLevel: 10, description: "A powerful undead rider with a dark orange mount" },
  { id: "html_undeadCJ09", name: "Undead Rider (Crimson)", requiredLevel: 10, description: "A powerful undead rider with a crimson mount" },
  
  // Indus Knight NPC Options (Hard/Insane Difficulty)
  { id: "html_indusKnightCJ01", name: "Indus Knight (Fire)", requiredLevel: 15, description: "An elite knight with a fiery mount and golden sword" },
  { id: "html_indusKnightCJ02", name: "Indus Knight (Water)", requiredLevel: 15, description: "An elite knight with a water-attuned mount and blue shield" },
  { id: "html_indusKnightCJ03", name: "Indus Knight (Earth)", requiredLevel: 15, description: "An elite knight with an earth-attuned mount and bow" },
  { id: "html_indusKnightCJ04", name: "Indus Knight (Arcane)", requiredLevel: 15, description: "An elite knight with an arcane-attuned mount and staff" },
  { id: "html_indusKnightCJ05", name: "Indus Knight (Shadow)", requiredLevel: 20, description: "A legendary knight with a shadow-attuned mount and enchanted sword" },
  { id: "html_indusKnightCJ06", name: "Indus Knight (Ocean)", requiredLevel: 20, description: "A legendary knight with an ocean-attuned mount and enchanted shield" },
  { id: "html_indusKnightCJ07", name: "Indus Knight (Flame)", requiredLevel: 20, description: "A legendary knight with a flame-attuned mount and enchanted bow" },
  { id: "html_indusKnightCJ08", name: "Indus Knight (Blood)", requiredLevel: 20, description: "A legendary knight with a blood-attuned mount and enchanted staff" },
];

// This helper function converts HTML sprite IDs to their proper format
// For example, "html_matikah" -> "matikah" or "html_golden" -> "golden"
export function getHtmlSpriteId(id: string): string {
  if (id.startsWith("html_")) {
    return id.substring(5); // Remove "html_" prefix
  }
  return id;
}

// This function checks if a sprite ID is for an HTML sprite
export function isHtmlSprite(id: string): boolean {
  return id.startsWith("html_") || 
         id === "matikah" || 
         id === "auto" || 
         id === "death" || 
         id === "iam" || 
         id === "steve" ||
         id === "peacock_mount" ||
         id.includes("peacock");
}

// This function helps get the proper preset for an HTML sprite
export function getHtmlSpritePreset(id: string) {
  const spriteId = getHtmlSpriteId(id);
  
  // Special handling for peacock mount
  if (spriteId === 'peacock_mount' || spriteId.includes('peacock')) {
    return CharacterPresets.PeacockMount;
  }
  
  const formattedId = spriteId.charAt(0).toUpperCase() + spriteId.slice(1);
  
  if (formattedId in CharacterPresets) {
    return CharacterPresets[formattedId as keyof typeof CharacterPresets];
  }
  
  // Provide a better default
  if (spriteId === 'white' || spriteId === '') {
    return CharacterPresets.Steve; // Use Steve as default sprite
  }
  
  // Use Auto as a fallback for other unrecognized IDs
  return CharacterPresets.Auto;
}