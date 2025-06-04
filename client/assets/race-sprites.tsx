// Chicken Jockey Scribe Racer - Race sprites
// These are the specialized sprites for racing characters

// Direct reference to sprite images in public folder
const racer01Img = "/CJSRacer01.png";
const racer02Img = "/CJSRacer02.png";
const racer03Img = "/CJSRacer03.png";
const racer04Img = "/CJSRacer04.png";
const racer05Img = "/CJSRacer05.png";
const racer06Img = "/CJSRacer06.png";
const racer07Img = "/CJSRacer07.png";
const racer08Img = "/CJSRacer08.png";
const racer09Img = "/CJSRacer09.png";
const racer10Img = "/CJSRacer10.png";
const racer11Img = "/CJSRacer11.png";
const racer12Img = "/CJSRacer12.png";
const racer13Img = "/CJSRacer13.png";
const racer14Img = "/CJSRacer14.png";
const racer15Img = "/CJSRacer15.png";
const racer16Img = "/CJSRacer16.png";
const racer17Img = "/CJSRacer17.png";
const racer18Img = "/CJSRacer18.png";
const racer19Img = "/CJSRacer19.png";
const racer20Img = "/CJSRacer20.png";

// ZJ special sprites
const zj_bowImg = "/zj_bow.png";
const zj_darkImg = "/zj_dark.png";
const zj_dark2Img = "/zj_dark2.png";
const zj_diamondImg = "/zj_diamond.png";
const zj_diamond2Img = "/zj_diamond2.png";
const zj_ghostImg = "/zj_ghost.png";
const zj_goldImg = "/zj_gold.png";
const zj_helmImg = "/zj_helm.png";
const zj_invis_garuImg = "/zj_invis_garu.png";
const zj_ogImg = "/zj_og.png";
const zj_orbImg = "/zj_orb.png";
const zj_shroomImg = "/zj_shroom.png";
const zj_torchImg = "/zj_torch.png";

// Campaign-specific sprites
const matikahImg = "/Matikah.png";
const deathImg = "/Death.png";

// Map of racer types to their sprite URLs
const racerSprites: Record<string, string> = {
  // Basic chicken/garu types
  white: racer02Img,  // White Garu
  black: racer01Img,  // Black Garu - Dark Feathers
  brown: racer14Img,  // Brown Garu
  gold: racer05Img,   // Golden Garu
  blue: racer03Img,   // Blue/Coin Garu
  red: racer11Img,    // Red/Fire Garu
  green: racer04Img,  // Green/Earth Garu
  cyan: racer18Img,   // Cyan/Air Garu
  purple: racer12Img, // Purple/Chaos Garu
  pink: racer06Img,   // Pink/Ether Garu
  indigo: racer13Img, // Indigo/Water Garu
  orange: racer15Img, // Orange/Order Garu
  
  // Character jockeys
  steve: racer02Img,
  auto: racer08Img,
  matikah_jockey: matikahImg,
  iam: racer16Img,
  
  // Specialized racing sprites
  racer01: racer01Img,
  racer02: racer02Img,
  racer03: racer03Img,
  racer04: racer04Img, 
  racer05: racer05Img,
  racer06: racer06Img,
  racer07: racer07Img,
  racer08: racer08Img,
  racer09: racer09Img,
  racer10: racer10Img,
  racer11: racer11Img,
  racer12: racer12Img,
  racer13: racer13Img,
  racer14: racer14Img,
  racer15: racer15Img,
  racer16: racer16Img,
  racer17: racer17Img,
  racer18: racer18Img,
  racer19: racer19Img,
  racer20: racer20Img,
  
  // ZJ special sprites
  zj_bow: zj_bowImg,
  zj_dark: zj_darkImg,
  zj_dark2: zj_dark2Img,
  zj_diamond: zj_diamondImg,
  zj_diamond2: zj_diamond2Img,
  zj_ghost: zj_ghostImg,
  zj_gold: zj_goldImg,
  zj_helm: zj_helmImg,
  zj_invis_garu: zj_invis_garuImg,
  zj_og: zj_ogImg,
  zj_orb: zj_orbImg,
  zj_shroom: zj_shroomImg,
  zj_torch: zj_torchImg,
  
  // Campaign-specific characters
  matikah_campaign: matikahImg,
  death: deathImg,
};

// Function to get racer sprite URL by type
export function getRacerSrc(racerType: string): string {
  return racerSprites[racerType] || racerSprites.racer01;
}

// Export the racer sprite options for customization
export const racerOptions = [
  { id: "racer01", name: "Dark Feathers", requiredLevel: 0 },
  { id: "racer02", name: "Snow Rider", requiredLevel: 2 },
  { id: "racer03", name: "Blue Streak", requiredLevel: 3 },
  { id: "racer04", name: "Emerald Speed", requiredLevel: 4 },
  { id: "racer05", name: "Golden Flash", requiredLevel: 5 },
  { id: "racer06", name: "Mystic Blaze", requiredLevel: 6 },
  { id: "racer07", name: "Azure Detective", requiredLevel: 7 },
  { id: "racer08", name: "Silver Scholar", requiredLevel: 8 },
  { id: "racer09", name: "Amber Swift", requiredLevel: 9 },
  { id: "racer10", name: "Forest Runner", requiredLevel: 10 },
  { id: "racer11", name: "Flame Scribe", requiredLevel: 11 },
  { id: "racer12", name: "Purple Royalty", requiredLevel: 12 },
  { id: "racer13", name: "Cobalt Champion", requiredLevel: 13 },
  { id: "racer14", name: "Rustic Racer", requiredLevel: 14 },
  { id: "racer15", name: "Sunburst Scribe", requiredLevel: 15 },
  { id: "racer16", name: "Midnight Messenger", requiredLevel: 16 },
  { id: "racer17", name: "Crimson Courier", requiredLevel: 17 },
  { id: "racer18", name: "Aqua Adventurer", requiredLevel: 18 },
  { id: "racer19", name: "Verdant Voyager", requiredLevel: 19 },
  { id: "racer20", name: "Gilded Guardian", requiredLevel: 20 },
  
  // ZJ Special Characters
  { id: "zj_bow", name: "Archer Jockey", requiredLevel: 25 },
  { id: "zj_dark", name: "Shadow Rider", requiredLevel: 25 },
  { id: "zj_dark2", name: "Nightshade", requiredLevel: 25 },
  { id: "zj_diamond", name: "Crystal Jockey", requiredLevel: 25 },
  { id: "zj_diamond2", name: "Diamond Racer", requiredLevel: 25 },
  { id: "zj_ghost", name: "Phantom Rider", requiredLevel: 25 },
  { id: "zj_gold", name: "Golden Champion", requiredLevel: 25 },
  { id: "zj_helm", name: "Knight Commander", requiredLevel: 25 },
  { id: "zj_invis_garu", name: "Invisible Trickster", requiredLevel: 25 },
  { id: "zj_og", name: "Classic Jockey", requiredLevel: 25 },
  { id: "zj_orb", name: "Mystic Orb Master", requiredLevel: 25 },
  { id: "zj_shroom", name: "Fungal Racer", requiredLevel: 25 },
  { id: "zj_torch", name: "Flame Bearer", requiredLevel: 25 },
  
  // Campaign-specific characters
  { id: "matikah", name: "Matikah", requiredLevel: 0 },
  { id: "death", name: "Death", requiredLevel: 0 },
];