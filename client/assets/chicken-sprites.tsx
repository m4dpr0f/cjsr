// Minecraft chicken jockey sprite assets
// Direct reference to sprite images in public folder
const steveJockeyImg = "/CJSRacer01.png"; // Default to racer01
const zombieJockeyImg = "/CJSRacer02.png";
const zombieJockeyLImg = "/CJSRacer03.png";
const zombieJockeyBImg = "/CJSRacer04.png";
const zombieJockeyCImg = "/CJSRacer05.png";
const zombieJockeyDImg = "/CJSRacer06.png";
const zombieJockeyMImg = "/CJSRacer07.png";
const zombieJockeyNImg = "/CJSRacer08.png";
const zombieJockeyOImg = "/CJSRacer09.png";
const zombieJockeyPImg = "/CJSRacer10.png";
const zombieJockeyQImg = "/CJSRacer11.png";
const zombieJockeyRImg = "/CJSRacer12.png";

// Map of chicken types to their sprite URLs
const chickenSprites: Record<string, string> = {
  // Default chickens
  white: steveJockeyImg,
  red: zombieJockeyCImg,
  golden: zombieJockeyLImg,
  diamond: zombieJockeyImg,
  
  // Additional unlockable skins
  mushroom: zombieJockeyRImg,
  skeleton: zombieJockeyNImg,
  iron: zombieJockeyOImg,
  enchanted: zombieJockeyPImg,
  energy: zombieJockeyQImg,
  zombie: zombieJockeyDImg,
  torch: zombieJockeyMImg
};

// Function to get chicken sprite URL by type
export function getChickenSrc(chickenType: string): string {
  return chickenSprites[chickenType] || chickenSprites.white;
}
