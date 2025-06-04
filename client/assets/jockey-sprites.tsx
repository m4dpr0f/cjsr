// Minecraft jockey sprite assets - the 14 official CJSR jockeys
// Direct reference to sprite images in public folder
const steveJockeyImg = "/CJSRacer01.png"; // Default to racer01 for Steve
const zombieJockeyOgImg = "/CJSRacer02.png"; // Using standard racer sprites
const zombieJockeyBowImg = "/CJSRacer03.png";
const zombieJockeyDarkImg = "/CJSRacer04.png";
const zombieJockeyDark2Img = "/CJSRacer05.png";
const zombieJockeyDiamondImg = "/CJSRacer06.png";
const zombieJockeyDiamond2Img = "/CJSRacer07.png";
const zombieJockeyGhostImg = "/CJSRacer08.png";
const zombieJockeyGoldImg = "/CJSRacer09.png";
const zombieJockeyHelmImg = "/CJSRacer10.png";
const zombieJockeyInvisGaruImg = "/CJSRacer11.png";
const zombieJockeyOrbImg = "/CJSRacer12.png";
const zombieJockeyShroomImg = "/CJSRacer13.png";
const zombieJockeyTorchImg = "/CJSRacer14.png";

// Map of jockey types to their sprite URLs - only using the 14 from the official CJSR collection
const jockeySprites: Record<string, string> = {
  // All 14 official jockeys
  sj_og: steveJockeyImg,
  zj_og: zombieJockeyOgImg,
  zj_bow: zombieJockeyBowImg,
  zj_dark: zombieJockeyDarkImg,
  zj_dark2: zombieJockeyDark2Img,
  zj_diamond: zombieJockeyDiamondImg,
  zj_diamond2: zombieJockeyDiamond2Img,
  zj_ghost: zombieJockeyGhostImg,
  zj_gold: zombieJockeyGoldImg,
  zj_helm: zombieJockeyHelmImg,
  zj_invis_garu: zombieJockeyInvisGaruImg,
  zj_orb: zombieJockeyOrbImg,
  zj_shroom: zombieJockeyShroomImg,
  zj_torch: zombieJockeyTorchImg,
  
  // Legacy mappings for backward compatibility
  steve: steveJockeyImg,
  zombie: zombieJockeyOgImg
};

// Function to get jockey sprite URL by type
export function getJockeySrc(jockeyType: string): string {
  return jockeySprites[jockeyType] || jockeySprites.steve;
}
