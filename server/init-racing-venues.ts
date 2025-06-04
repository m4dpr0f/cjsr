import { db } from "./db";
import { multiplayerRaces } from "@shared/schema";

const FACTION_GUILD_HALLS = [
  {
    id: 'guild_d2_electric',
    name: 'D2 Electric Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'Lightning crackles through the crystalline circuits as electric energy surges with each keystroke. Swift reflexes and sharp precision guide the current of victory.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd2', theme: 'electric' }
  },
  {
    id: 'guild_d4_fire',
    name: 'D4 Fire Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'Flames dance in the forge as molten metal shapes destiny. Every keystroke must be precise and powerful, like the strike of a master blacksmith.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd4', theme: 'fire' }
  },
  {
    id: 'guild_d6_earth',
    name: 'D6 Earth Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'Deep beneath the mountain roots, ancient stones whisper secrets of endurance. Steady hands and unwavering determination carve paths through solid rock.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd6', theme: 'earth' }
  },
  {
    id: 'guild_d8_air',
    name: 'D8 Air Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'High above the clouds where winds dance freely, swift movements carry messages across vast distances. Agility and grace guide every action.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd8', theme: 'air' }
  },
  {
    id: 'guild_d10_chaos',
    name: 'D10 Chaos Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'In the realm where order dissolves into wild possibility, unpredictable forces create new realities. Adaptability and creativity thrive in constant change.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd10', theme: 'chaos' }
  },
  {
    id: 'guild_d12_ether',
    name: 'D12 Ether Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'Between worlds where mystical energies flow like rivers of starlight, ancient magic weaves through every gesture. Wisdom and intuition unlock hidden powers.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd12', theme: 'ether' }
  },
  {
    id: 'guild_d20_water',
    name: 'D20 Water Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'In crystalline depths where currents carry ancient wisdom, fluid movements adapt to every challenge. Patience and flow guide the eternal journey.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd20', theme: 'water' }
  },
  {
    id: 'guild_d100_order',
    name: 'D100 Order Guild Hall',
    mode: 'guild' as const,
    max_players: 8,
    prompt_text: 'Within perfect geometric harmony where every element has its place, mathematical precision creates ultimate balance. Structure and discipline forge perfection.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'd100', theme: 'order' }
  }
];

const CORE_ARENAS = [
  {
    id: 'arena_nexus_central',
    name: 'The Nexus - Central Arena',
    mode: 'arena' as const,
    max_players: 8,
    prompt_text: 'At the heart of all realms where dimensional pathways converge, warriors from every faction gather to test their skills. Here, only pure typing mastery determines victory.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'none', theme: 'nexus', description: 'The central hub where all factions meet for neutral competition' }
  },
  {
    id: 'arena_training_grounds',
    name: 'Training Grounds Arena',
    mode: 'arena' as const,
    max_players: 8,
    prompt_text: 'Ancient practice fields where legends once honed their craft. Wooden training dummies and practice targets surround the arena, inspiring dedication and improvement.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'none', theme: 'training', description: 'Perfect for new racers and skill development' }
  },
  {
    id: 'arena_champions_colosseum',
    name: 'Champions Colosseum',
    mode: 'arena' as const,
    max_players: 8,
    prompt_text: 'The grand colosseum where champions are forged and legends are born. Marble pillars reach toward the sky as crowds of spectators cheer for typing excellence.',
    is_password_protected: false,
    status: 'waiting' as const,
    settings: { faction: 'none', theme: 'championship', description: 'Elite arena for experienced racers seeking glory' }
  }
];

export async function initializeRacingVenues() {
  try {
    console.log('🏗️ Initializing racing venues...');
    
    // Create faction guild halls
    for (const guildHall of FACTION_GUILD_HALLS) {
      try {
        await db.insert(multiplayerRaces)
          .values({
            ...guildHall,
            settings: JSON.stringify(guildHall.settings)
          })
          .onConflictDoUpdate({
            target: multiplayerRaces.id,
            set: {
              name: guildHall.name,
              prompt_text: guildHall.prompt_text,
              settings: JSON.stringify(guildHall.settings),
              status: guildHall.status
            }
          });
        console.log(`🏛️ Guild hall created/updated: ${guildHall.name}`);
      } catch (error) {
        console.log(`⚠️ Guild hall ${guildHall.name} already exists or error:`, error);
      }
    }
    
    // Create core arenas
    for (const arena of CORE_ARENAS) {
      try {
        await db.insert(multiplayerRaces)
          .values({
            ...arena,
            settings: JSON.stringify(arena.settings)
          })
          .onConflictDoUpdate({
            target: multiplayerRaces.id,
            set: {
              name: arena.name,
              prompt_text: arena.prompt_text,
              settings: JSON.stringify(arena.settings),
              status: arena.status
            }
          });
        console.log(`🏟️ Core arena created/updated: ${arena.name}`);
      } catch (error) {
        console.log(`⚠️ Core arena ${arena.name} already exists or error:`, error);
      }
    }
    
    console.log('✅ Racing venues initialization complete!');
    console.log(`🏛️ ${FACTION_GUILD_HALLS.length} faction guild halls initialized`);
    console.log(`🏟️ ${CORE_ARENAS.length} core arenas initialized`);
    
  } catch (error) {
    console.error('❌ Error initializing racing venues:', error);
  }
}