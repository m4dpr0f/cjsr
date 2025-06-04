// Trust No One: Garu Riders Lore Story Excerpts
// Based on "Trust No One: A Tale of the Vanished Rider" and "Trust No One II: The Return of Paliko"

export const STORY_EXCERPTS = [
  // Ciro's Story - The Vanished Rider
  "Ciro once believed the empire's promises, until he discovered the truth hidden in the ancient scrolls.",
  "The imperial scribes taught him to write, but they never taught him to question what he was writing.",
  "In the depths of the archive, Ciro found records that contradicted everything the empire claimed.",
  "His Garu, Paliko, sensed the deception before Ciro ever did - animals know when something is wrong.",
  "The empire called him a hero, but Ciro knew he was just another tool in their grand deception.",
  "Every document he transcribed was a lie, every order he copied was built on false foundations.",
  "Paliko's eyes reflected a wisdom that the empire's gold could never buy or corrupt.",
  "The night Ciro vanished, he left behind only a single message: 'Question everything, trust no one.'",
  "They say he rides still, somewhere beyond the empire's reach, gathering the scattered truth.",
  "The empire branded him a traitor, but history would remember him as the first to see clearly.",
  
  // Matikah's Journey - The Return of Paliko
  "Matikah found Paliko wandering the borderlands, masterless but carrying Ciro's legacy.",
  "The Garu chose her, not the other way around - some bonds transcend imperial law.",
  "Through Paliko's memories, Matikah saw glimpses of Ciro's final days and his desperate flight.",
  "The moon-born singer learned to read the signs that Ciro had left hidden in plain sight.",
  "Each race became a ritual of remembrance, each victory a small rebellion against the lie.",
  "Paliko taught her that speed without purpose is just another form of running away.",
  "In the ancient scripts, Matikah discovered codes that Ciro had embedded years before.",
  "The empire's version of events never mentioned the riders who simply disappeared.",
  "Together, they carried forward the truth that the empire tried so hard to bury.",
  "Matikah realized that some stories can only be told by those brave enough to live them.",
  
  // Themes of Trust and Deception
  "Every official record was sanitized, every heroic tale was carefully edited propaganda.",
  "The empire's greatest weapon was not its armies, but its ability to rewrite history.",
  "Truth became a luxury that only the desperate and the exiled could afford to seek.",
  "In a world of lies, the bond between rider and Garu remained the only honest thing.",
  "They learned to communicate in code, hiding rebellion in the rhythm of racing.",
  "The fastest riders were often the first to see through the empire's carefully crafted illusions.",
  "Every race was a test of loyalty - not to the empire, but to the truth itself.",
  "The scribes who questioned their orders had a tendency to simply vanish without explanation.",
  "In the end, the empire's greatest fear was not invasion, but enlightenment.",
  "Those who rode with purpose carried more than just speed - they carried hope for change.",
  
  // The Resistance
  "Hidden in the racing circuits, a new kind of resistance was taking shape.",
  "They used the empire's own competitions to spread their dangerous ideas about truth.",
  "Each rider who learned the real history became another crack in the empire's foundation.",
  "The official races were spectacle, but the underground races were revolution.",
  "They raced not for glory or gold, but for the right to remember what really happened.",
  "In the dust and thunder of the tracks, whispered truths traveled faster than imperial lies.",
  "The empire could control the scribes, but they couldn't control the stories riders told.",
  "Every secret message was encoded in racing patterns that only the initiated could read.",
  "The network grew slowly, carefully, connecting riders who valued truth over comfort.",
  "They knew that one day, the accumulated weight of truth would topple the empire's lies.",
  
  // Philosophical Reflections
  "Speed without direction is just chaos, but purpose transforms racing into something sacred.",
  "The empire taught them to compete, but Ciro taught them to question the very concept of victory.",
  "In a world where truth was treason, the fastest escape was sometimes the only option.",
  "The bond between rider and Garu became a metaphor for authentic connection in a false world.",
  "They learned that sometimes the bravest thing you can do is simply refuse to participate.",
  "The real race was not against other riders, but against the forces of deception itself.",
  "Freedom meant more than just the wind in your face - it meant the right to know the truth.",
  "Every keystroke in the ancient codes was an act of rebellion against imposed ignorance.",
  "The empire's greatest weakness was its need to make everyone believe in its version of reality.",
  "In the end, they discovered that the most powerful weapon against lies was simply bearing witness."
];

export function getRandomStoryExcerpt(): string {
  return STORY_EXCERPTS[Math.floor(Math.random() * STORY_EXCERPTS.length)];
}

export function getStoryExcerptById(id: number): string {
  return STORY_EXCERPTS[id % STORY_EXCERPTS.length];
}