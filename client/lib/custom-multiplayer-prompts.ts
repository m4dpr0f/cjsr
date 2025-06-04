/**
 * TRUST NO ONE - React Jam Spring 2025 themed prompts
 */

// Authentic Trust No One Garu Riders Lore - Complete Trilogy
export const customMultiplayerPrompts = [
  // Ciro's Story - The Vanished Rider
  "Ciro wore no banner, carried no scroll. His Garu, Paliko, was quiet sleek of feather, black with one glowing talon.",
  "He had trained in the imperial circuits, groomed to become a lead scribe in the Bureau of Codified Races.",
  "There, chicken jockeys were studied, not honored. Garu were classified by genetic code, tagged, tracked, enhanced.",
  "They told him it was progress. That the races were safer now. More fair. More controlled.",
  "During a calibration run, Ciro stumbled upon an unauthorized scribe trail etched in raw code across the canyon walls.",
  "At the trail's end, he met a child with no name, riding a Garu with no tag.",
  "They raced side by side, and Ciro felt the rhythm break free in his blood.",
  "The empire called it defection. Treason. They erased his records and sent out the Retrieval Hawks.",
  "But Ciro had already rewritten himself line by line, ride by ride.",
  "A peace treaty, they said. The empire wanted to integrate the rogue riders.",
  "Offer them land, citizenship, tech support. Even featherless mounts. Some believed it. Some even signed.",
  "He met with the Council of Forgotten Riders in the hollows of Mount Scribe.",
  "He begged them not to trust the empire's smiles. But the others were tired. Wounded. They wanted rest.",
  "The day the Accord was signed, Ciro vanished.",
  "Paliko was found days later, talon cracked, feathers burnt, standing guard beside an empty saddle.",
  "Some say Ciro was taken. Some say he let himself be caught to plant false code inside the Bureau's archives.",
  "Others whisper that he still rides underground, invisible, rewriting the maps in ways no AI can track.",
  "The empire will offer feathers dipped in gold. But gold blinds. And feathers burn.",

  // Matikah's Story - The Return of Paliko
  "Paliko had not flown since the day the saddle burned. The old Garu had taken to the shadows of the Far Reaches.",
  "Some called him the Ghost Mount. Others said he was waiting. But the truth was stranger: Paliko was listening.",
  "Not to words. Not to riders. But to the deep hum of the Codex beneath the earth.",
  "A rhythm stitched into the stones written by riders long gone, echoing through mossroot, glacier, and glass.",
  "And one Spring, the hum changed. It was not Ciro's beat. It was younger. Fiercer. Touched by fire and storm.",
  "It was Matikah. She had found a hidden trail one the Codex itself tried to hide.",
  "A trail that only opened when a song was written backward, in pulse instead of phrase.",
  "Her flute cracked the veil. Her feet struck the chords. And when she reached the Hollow of Names, Paliko was there.",
  "The Garu bowed not as a beast, but as a bearer of legacy. Matikah placed her hand on his shoulder.",
  "I race not alone. I race with the vanished.",
  "That night, Paliko raced again. Not as a mount. As a guide.",
  "Matikah followed him through the Seven False Gates each one a trap, each one a mirror of old lies.",
  "But Matikah typed not to prove them wrong, but to prove herself whole. She wrote the truth between the traps.",
  "We are not what they erased. We ride in layered memory. Our rhythm outlives empire.",

  // The Final Race - Trilogy Conclusion
  "The last race was never meant to be seen. It was buried beneath the ruins of the First Circuit.",
  "Until Auto returned. His red quill burned brighter than ever. His Garu, Timaru, bore circuitry woven with vine and ash.",
  "On his back, he carried a sealed book, bound with three feathers: one silver, one black, one gold.",
  "He didn't come for victory. He came to scribe the last lie.",
  "Matikah joined him days later, her flute silent, her sash flowing with petals. She brought no mount. Only rhythm. Only memory.",
  "And then came the impossible. Ciro. Alive. Older, thinner, but unmistakable.",
  "He rode no Garu. He walked with Paliko's feather braided into his hair. I laid the first glyph, he told them. It's yours to close.",
  "Auto opened the book. Ciro held the quill. Matikah sang. Together, they rewrote it.",
  "Not with rage. Not with revenge. But with rhythm. With memory. With truth.",
  "When the sun rose, the circuit collapsed into wildflower and stone. The empire's name erased from every finish line.",
  "And across the world, riders felt something shift. Feathers lifted. Quills glowed. Tracks opened.",
  "They trusted no one and became the ones we trust.",

  // Trust Messages
  "Trust no one who calls you mount. Trust only those who ride with you, heart for heart.",
  "Trust no one who edits your name. Trust only those who remember it."
];

/**
 * Get a random custom multiplayer prompt
 * Combines multiple prompts for longer text if needed
 */
export function getCustomMultiplayerPrompt() {
  // Get a random prompt from the list
  const index = Math.floor(Math.random() * customMultiplayerPrompts.length);
  const basePrompt = customMultiplayerPrompts[index];
  
  // Determine if we should create a longer combined prompt (30% chance)
  const shouldCombine = Math.random() < 0.3;
  
  if (shouldCombine) {
    // Get a second random prompt, ensuring it's different from the first
    let secondIndex;
    do {
      secondIndex = Math.floor(Math.random() * customMultiplayerPrompts.length);
    } while (secondIndex === index);
    
    const secondPrompt = customMultiplayerPrompts[secondIndex];
    
    // Combine the prompts
    return {
      text: `${basePrompt} ${secondPrompt}`,
      difficulty: 'hard' // Combined prompts are harder
    };
  }
  
  // Return a single prompt
  return {
    text: basePrompt,
    difficulty: 'medium'
  };
}