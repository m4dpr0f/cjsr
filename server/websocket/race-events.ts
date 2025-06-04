import { WebSocket } from "ws";
import { RaceManager, RaceStatus } from "../game/race-manager";
import { PromptManager } from "../game/prompt-manager";
import { PlayerManager } from "../game/player-manager";
import { RaceStats } from "@shared/schema";
import { artOfWarService } from "../art-of-war-service";

// Extend WebSocket interface to include playerId property
declare module "ws" {
  interface WebSocket {
    playerId?: string;
  }
}

// Function to broadcast message to all players in a race
function broadcastToRace(raceManager: RaceManager, raceId: string, message: any) {
  const race = raceManager.getRace(raceId);
  
  if (!race) {
    return;
  }
  
  const messageString = JSON.stringify(message);
  
  race.players.forEach(player => {
    if (player.socket.readyState === WebSocket.OPEN) {
      player.socket.send(messageString);
    }
  });
}

// Function to send player list to all players in a race
function sendPlayerList(raceManager: RaceManager, raceId: string) {
  const race = raceManager.getRace(raceId);
  
  if (!race) {
    return;
  }
  
  // Create a simplified player list for broadcasting
  const playerList = race.players.map(player => ({
    id: player.id,
    username: player.username,
    level: player.level,
    wpm: player.wpm,
    status: player.status,
    progress: player.progress,
    chickenType: player.chickenType,
    jockeyType: player.jockeyType,
    isNPC: player.isNPC || false
  }));
  
  broadcastToRace(raceManager, raceId, {
    type: "player_list",
    players: playerList
  });
}

// Function to start race countdown
async function startRaceCountdown(
  raceManager: RaceManager,
  promptManager: PromptManager,
  raceId: string
) {
  const countdownRace = raceManager.getRace(raceId);
  
  if (!countdownRace) {
    console.log("No race found with ID:", raceId);
    return;
  }
  
  // Start countdown
  if (!raceManager.startRaceCountdown(raceId)) {
    console.log("Failed to start race countdown for race:", raceId);
    return;
  }
  
  console.log("Race countdown started for race:", raceId);
  
  // Notify players of countdown start
  broadcastToRace(raceManager, raceId, {
    type: "countdown_start"
  });
  
  // Wait for countdown
  const COUNTDOWN_SECONDS = 3;
  await new Promise(resolve => setTimeout(resolve, COUNTDOWN_SECONDS * 1000));
  
  // Get random prompt - with fallback system
  let prompt;
  try {
    prompt = await promptManager.getRandomPrompt();
  } catch (error) {
    console.error("Error getting prompt during race countdown:", error);
    // We'll handle this in the next step
  }
  
  // If prompt fetching failed, use a guaranteed fallback
  if (!prompt) {
    console.log("Using emergency prompt for race:", raceId);
    
    // Provide a guaranteed emergency prompt
    const emergencyPrompt = {
      id: 9999,
      text: "Type this emergency prompt to complete your race. The system had trouble connecting to the database."
    };
    
    // Start race with emergency prompt
    if (raceManager.startRace(raceId, emergencyPrompt.id, emergencyPrompt.text)) {
      console.log("Race started with emergency prompt:", raceId);
      
      // Notify players of race start with emergency prompt
      broadcastToRace(raceManager, raceId, {
        type: "race_start",
        prompt: emergencyPrompt.text
      });
    } else {
      console.error("Failed to start race with emergency prompt:", raceId);
    }
    return;
  }
  
  // Start race with the normal or fallback prompt
  if (raceManager.startRace(raceId, prompt.id, prompt.text)) {
    console.log("Race started with prompt ID:", prompt.id);
    
    // Notify players of race start
    broadcastToRace(raceManager, raceId, {
      type: "race_start",
      prompt: prompt.text
    });
  } else {
    console.error("Failed to start race with prompt:", raceId);
  }
  
  // Set up interval to update NPC progress
  const raceWithNpcs = raceManager.getRace(raceId);
  if (raceWithNpcs && raceWithNpcs.players.some(p => p.isNPC)) {
    console.log(`Race ${raceId} has ${raceWithNpcs.players.filter(p => p.isNPC).length} NPCs - setting up progress updates`);
    
    // Check if any NPCs are in the race
    const updateInterval = setInterval(() => {
      const currentRace = raceManager.getRace(raceId);
      
      // Stop interval if race doesn't exist or is finished
      if (!currentRace || currentRace.status === RaceStatus.FINISHED) {
        console.log(`Race ${raceId} finished or not found - stopping NPC updates`);
        clearInterval(updateInterval);
        return;
      }
      
      // Update NPC progress
      raceManager.updateNpcProgress(raceId);
      
      // Log NPC progress for debugging
      const npcs = currentRace.players.filter(p => p.isNPC);
      if (npcs.length > 0) {
        console.log(`Race ${raceId} NPCs: ${npcs.map(p => `${p.username}: ${p.progress}%`).join(', ')}`);
      }
      
      // Send updated player list
      sendPlayerList(raceManager, raceId);
    }, 100); // Match campaign's 100ms timing for accurate NPC racing
  }
}

// Interface for race types
// Note: RaceStatus is already imported at the top 

// Race interface needed for type safety
interface Race {
  id: string;
  mode: string;
  status: RaceStatus;
  players: {
    id: string;
    username: string;
    level: number;
    wpm: number;
    status: string;
    progress: number;
    socket: WebSocket;
    isNPC?: boolean;
    difficulty?: string;
    [key: string]: any;
  }[];
  promptId: number;
  promptText: string;
  startTime: number | null;
  finishedCount: number;
  results: any[];
  winnerPromptSubmitted: boolean;
}

// Find a race that contains the given socket
function findPlayerRaceBySocket(raceManager: RaceManager, socket: WebSocket): Race | undefined {
  for (const race of raceManager.getAllRaces()) {
    if (race.players.some((p: any) => p.socket === socket)) {
      return race;
    }
  }
  return undefined;
}

// Handle all race-related WebSocket events
export async function handleRaceEvents(
  socket: WebSocket,
  message: any,
  raceManager: RaceManager,
  promptManager: PromptManager,
  playerManager: PlayerManager
) {
  // Handle string command types (old format)
  if (typeof message === 'string') {
    if (message === 'player_ready') {
      // Handle player ready command
      const playerRace = findPlayerRaceBySocket(raceManager, socket);
      if (playerRace) {
        const playerIndex = playerRace.players.findIndex(p => p.socket === socket);
        if (playerIndex >= 0) {
          playerRace.players[playerIndex].status = "ready";
          sendPlayerList(raceManager, playerRace.id);
          
          // Start race if all players are ready
          if (playerRace.players.every(p => p.status === "ready")) {
            startRaceCountdown(raceManager, promptManager, playerRace.id);
          }
        }
      }
      return;
    } else if (message === 'start_race') {
      // Force start a race immediately
      console.log("START NOW button pressed, finding available races");
      
      // Use Art of War prompts exclusively for private races - MASSIVE COLLECTION
      const artOfWarPrompts = [
        // Classic Core Passages
        "All warfare is based on deception. Hence, when able to attack, we must seem unable; when using our forces, we must seem inactive; when we are near, we must make the enemy believe we are far away; when far away, we must make him believe we are near.",
        "The supreme excellence consists in breaking the enemy's resistance without fighting.",
        "Speed is the essence of war: take advantage of the enemy's unreadiness, make your way by unexpected routes, and attack unguarded spots.",
        "Know your enemy and know yourself; in a hundred battles, you will never be defeated.",
        "He who is prudent and lies in wait for an enemy who is not, will be victorious.",
        
        // Chapter II - Waging War
        "Strike where weak. Flow like water shaped by ground.",
        "Unite strength. Don't overburden one — coordinate many.",

        // Chapter III - Attack by Stratagem
        "Win without battle. Break plans, not bodies.",
        "Disrupt alliances. Avoid sieges — they waste all.",
        "Defeat without blood. Dismantle with design, not delay.",

        // Chapter IV - Tactical Dispositions
        "Be unbreakable first. Then wait to strike.",
        "Defense is yours to build. Opportunity is theirs to offer.",

        // Chapter V - Energy
        "Rush like flood, strike like falcon. Momentum is timing.",
        "Wind draws bow. Victory pulls the trigger.",

        // Chapter VI - Weak Points and Strong
        "Arrive first — rest easy. Arrive late — race weary.",
        "Attack when they nap. Vanish when they rage.",

        // Chapter VII - Maneuvering
        "War is a riddle. Deception is its answer.",
        "Lure them. Hit where they don't look.",
        "Fast is strong. Ready is smart.",
        
        // Historical + Wisdom Passages
        "If commands confuse, blame the general. If ignored, blame the officers.",
        "Duty isn't paused by comfort. The general's commission stands.",
        "Drill in chaos. Then move in silence. Precision is discipline.",
        
        // Tactics, Timing, and Flow
        "He who wins first, fights later.",
        "Strike only when it brings gain.",
        "The clever strike when it is safe to strike.",
        "The swift river doesn't wait for the stone.",
        "Speed wins where strength cannot.",
        "Slowness loses more than battles.",
        "Do not chase — intercept.",
        "The enemy rests; you move.",
        "Battle belongs to the one who waits — then pounces.",
        "Rain soaks all, but lightning chooses its path.",

        // Perception and Deception
        "Let them see weakness. Then strike with strength.",
        "Make noise where you are not. Strike where you are.",
        "When close, seem far. When far, seem near.",
        "Shadows dance loudest before the storm.",
        "To fool the ear, echo. To fool the eye, shimmer.",
        "The clearest map hides the most traps.",
        "Mask courage with silence. Mask blades with laughter.",
        "Let your false retreat become their real collapse.",
        "Where the dust rises, something hides beneath.",
        "Hide ten troops behind the flutter of one flag.",

        // Preparation and Awareness
        "To know terrain is to write the script of war.",
        "Camp high. Face the sun. Guard your back.",
        "Know the hill, know the wind, and you know who will win.",
        "Read the birds. Hear the silence.",
        "Scout the grass. It whispers who walks there.",
        "A wise rider checks the road, not just the rival.",
        "Do not enter the marsh unless you own the rain.",
        "Avoid the gorge — unless you're the thunder.",
        "Secure your water. Then secure the win.",
        "Watch the horses drink before your foes do.",

        // Morale and Movement
        "Rested legs outrun brave hearts.",
        "Tired troops fight with memory, not will.",
        "Morning hearts are bold. Evening hearts seek campfires.",
        "If they lean on spears, they're low on rations.",
        "Faint armies shout loudest before they flee.",
        "A burning tail sends even the bravest ox stampeding.",
        "Desperate troops fight like cornered beasts.",
        "Split them, and they will tire. Delay them, and they will doubt.",
        "Fear marches louder than drums.",
        "Let them tire chasing shadows while you race past.",

        // Leadership and Judgment
        "The general who hesitates loses twice.",
        "Punish with clarity. Reward with purpose.",
        "Do not obey a foolish order in a wise war.",
        "Love your troops — but not enough to lose.",
        "The leader who sees all must also be unseen.",
        "Discipline is trust forged in flame.",
        "Confusion at dawn means weak command.",
        "Flags that shift reveal minds that drift.",
        "A still army may be coiled to strike.",
        "Words shouted are often hiding fear.",

        // Strategy and Control
        "Divide, confuse, strike.",
        "Let the terrain do your work.",
        "Never attack the city. Attack the reason it stands.",
        "Silence wins where steel cannot.",
        "Hold the high ground in your mind — and on the map.",
        "Victory lies not in numbers, but in angles.",
        "Feint, then flood. Distract, then devour.",
        "The baited path leads both hunter and prey.",
        "Attack the plan, not the man.",
        "To trap an army, offer one way out — and seal it behind them.",

        // Energy and Momentum
        "Be water. Be wave. Be waterfall.",
        "Energy is a bow drawn — but not yet loosed.",
        "Release only when aim meets certainty.",
        "Momentum breaks mountains. Delay makes dust.",
        "The torrent crushes rock not by rage — but by rhythm.",
        "Strike when their spirit is thin.",
        "Let decision ride like the wind, but root like the mountain.",
        "Do not seek force. Seek flow.",
        "Strong starts mean little. Strong finishes mean all.",
        "Let the falcon's swoop be your signal.",

        // Scribe Racing Mind Games
        "Race the script, not the scribe.",
        "Trust no egg left unguarded.",
        "The slowest word can trip the fastest mind.",
        "Even a misspelled truth is more dangerous than a perfect lie.",
        "Victory begins when your fingers forget your fears.",
        "When lag lies, only the script reveals truth.",
        "The keyboard is your mount. Ride wisely.",
        "Not all clicks are meant to win. Some are meant to deceive.",
        "Never type the first word you feel — type the one that cuts.",
        "A true scribe races the unseen — not the scoreboard."
      ];
      const randomPrompt = artOfWarPrompts[Math.floor(Math.random() * artOfWarPrompts.length)];
      const racePrompt = {
        id: 9999,
        text: randomPrompt
      };
      
      // Get all active races
      const allRaces = raceManager.getAllRaces();
      let raceStarted = false;
      
      // First try to find the race associated with this socket
      const socketRace = findPlayerRaceBySocket(raceManager, socket);
      if (socketRace) {
        console.log(`Found race ${socketRace.id} associated with this socket`);
        
        // Make sure all players are in ready state
        raceManager.setPlayersReady(socketRace.id);
        
        // Start this race with Art of War prompt
        if (raceManager.startRace(socketRace.id, racePrompt.id, racePrompt.text)) {
          console.log(`Successfully started race ${socketRace.id} with Art of War prompt`);
          
          // Notify all players in this race
          broadcastToRace(raceManager, socketRace.id, {
            type: "race_start",
            prompt: racePrompt.text
          });
          
          raceStarted = true;
        }
      }
      
      // If we couldn't find or start the socket's race, try any available race
      if (!raceStarted) {
        console.log("Checking for other available races");
        
        for (const race of allRaces) {
          if (race.status === RaceStatus.WAITING_FOR_PLAYERS || race.status === RaceStatus.COUNTDOWN) {
            console.log(`Trying to start race ${race.id}`);
            
            // Set all players to ready
            raceManager.setPlayersReady(race.id);
            
            // Start race with Art of War prompt
            if (raceManager.startRace(race.id, racePrompt.id, racePrompt.text)) {
              console.log(`Successfully started race ${race.id} with Art of War prompt`);
              
              // Notify all players
              broadcastToRace(raceManager, race.id, {
                type: "race_start",
                prompt: racePrompt.text
              });
              
              raceStarted = true;
              break;
            }
          }
        }
      }
      
      if (!raceStarted) {
        console.error("Couldn't find any races to start");
      }
      
      return;
    }
    
    // Fall through for unhandled string commands
    return;
  }
  // Handle player ready command (for guest players)
  if (message.type === "player_ready") {
    const { guestId, guestName } = message;
    
    // Create a unique player ID if not provided
    const playerId = guestId || `guest_${Math.floor(Math.random() * 10000)}`;
    
    // Get player's actual WPM from their stored statistics for proper matchmaking
    let playerWpm = 60; // Fallback only if we can't get real stats
    
    try {
      // Try to get actual player stats from the database
      const playerStats = await playerManager.getPlayerById(playerId);
      if (playerStats && playerStats.wpm > 0) {
        playerWpm = playerStats.wpm;
        console.log(`Using real player WPM: ${playerWpm} for matchmaking`);
      }
    } catch (error) {
      console.log(`Could not fetch real stats for player ${playerId}, using fallback WPM: ${playerWpm}`);
    }
    
    // Determine race mode based on message type or default to quickrace
    const raceMode = message.raceMode || 'quickrace'; // 'quickrace' or 'multiplayer-only'
    
    // Find or create a race with proper skill matching
    const raceId = raceManager.findOrCreateRace(raceMode, playerWpm);
    
    // Add player to race with realistic WPM
    const added = raceManager.addPlayerToRace({
      id: playerId,
      username: guestName || `Guest${Math.floor(Math.random() * 10000)}`,
      level: Math.max(1, Math.floor(playerWpm / 10)),
      wpm: playerWpm,
      chickenType: message.chickenType || 'white',
      jockeyType: message.jockeyType || 'steve',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16)
    }, socket);
    
    if (!added) {
      socket.send(JSON.stringify({
        type: "error",
        message: "Failed to join race"
      }));
      return;
    }
    
    // Store player ID on socket for easy reference
    socket.playerId = playerId;
    
    // Send confirmation to player
    socket.send(JSON.stringify({
      type: "joined_race",
      raceId,
      playerId
    }));
    
    // Send updated player list to all players in race
    sendPlayerList(raceManager, raceId);
    
    // Smart auto-detection: Create buffer when multiple real players are present
    const race = raceManager.getRace(raceId);
    if (race) {
      const humanPlayers = race.players.filter(p => !p.isNPC);
      
      if (race.mode === 'quickrace') {
        // Auto-detect multiple players and create buffer for better matchmaking
        if (humanPlayers.length > 1) {
          console.log(`Multiple players detected in quickrace ${raceId} - creating 8-second buffer for synchronization`);
          setTimeout(() => {
            if (raceManager.isRaceReadyToStart(raceId)) {
              raceManager.setPlayersReady(raceId);
              sendPlayerList(raceManager, raceId);
              startRaceCountdown(raceManager, promptManager, raceId);
            }
          }, 8000); // 8-second buffer when multiple players join
        } else {
          // Single player - start immediately with NPCs
          console.log(`Single player in quickrace ${raceId} - starting immediately`);
          setTimeout(() => {
            if (raceManager.isRaceReadyToStart(raceId)) {
              raceManager.setPlayersReady(raceId);
              sendPlayerList(raceManager, raceId);
              startRaceCountdown(raceManager, promptManager, raceId);
            }
          }, 2000); // Quick start for single player
        }
        
      } else if (race.mode === 'multiplayer-only') {
        // Check if we have enough human players to start
        if (raceManager.isRaceReadyToStart(raceId)) {
          console.log(`Multiplayer-only race ${raceId} has enough players - starting countdown buffer`);
          setTimeout(() => {
            if (raceManager.isRaceReadyToStart(raceId)) {
              raceManager.setPlayersReady(raceId);
              sendPlayerList(raceManager, raceId);
              startRaceCountdown(raceManager, promptManager, raceId);
            }
          }, 5000); // 5-second buffer for multiplayer-only
        } else {
          console.log(`Multiplayer-only race ${raceId} waiting for more human players`);
        }
      }
    }
    
    return;
  }
  
  // Handle NPC summon command
  if (message.type === "add_npc") {
    const { difficulty } = message;
    
    if (!socket.playerId) {
      socket.send(JSON.stringify({
        type: "error",
        message: "You need to join the race first"
      }));
      return;
    }
    
    // Get player's race
    const race = raceManager.getPlayerRace(socket.playerId);
    if (!race) {
      socket.send(JSON.stringify({
        type: "error",
        message: "You are not in a race"
      }));
      return;
    }
    
    // Map difficulty names to internal difficulty levels
    let npcDifficulty: 'easy' | 'normal' | 'hard' | 'insane' = 'normal';
    
    if (difficulty === 'peaceful' || difficulty === 'rookie') {
      npcDifficulty = 'easy';
    } else if (difficulty === 'easy' || difficulty === 'average') {
      npcDifficulty = 'normal';
    } else if (difficulty === 'hard' || difficulty === 'expert') {
      npcDifficulty = 'hard';
    } else if (difficulty === 'insane' || difficulty === 'champion') {
      npcDifficulty = 'insane';
    }
    
    // Add NPC to race
    raceManager.addNpcOpponents(race.id, npcDifficulty, 1);
    
    // Send updated player list to all players in race
    sendPlayerList(raceManager, race.id);
    
    return;
  }
  
  switch (message.type) {
    case "join_race": {
      const { mode, player } = message;
      
      if (!mode || !player || !player.id) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Invalid join_race message"
        }));
        return;
      }
      
      // Find or create a race
      const raceId = raceManager.findOrCreateRace(mode);
      
      // Add player to race
      const added = raceManager.addPlayerToRace(
        raceId,
        player.id,
        player.username,
        player.level,
        player.wpm,
        player.chickenType,
        player.jockeyType,
        socket
      );
      
      if (!added) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Failed to join race"
        }));
        return;
      }
      
      // Store player ID on socket for easy reference
      socket.playerId = player.id;
      
      // Send updated player list to all players
      sendPlayerList(raceManager, raceId);
      
      // Check if we need to add NPC opponents
      // If the player has requested a specific difficulty mode
      if (mode.startsWith('npc-')) {
        const difficulty = mode.replace('npc-', '') as 'easy' | 'normal' | 'hard' | 'insane';
        
        // Add NPCs of the requested difficulty (2-3 opponents)
        const npcCount = 2 + Math.floor(Math.random() * 2); // 2 or 3 NPCs
        raceManager.addNpcOpponents(raceId, difficulty, npcCount);
        
        // Send updated player list with NPCs
        sendPlayerList(raceManager, raceId);
        
        // Set all players to ready and start countdown
        raceManager.setPlayersReady(raceId);
        sendPlayerList(raceManager, raceId);
        
        // Start race countdown
        startRaceCountdown(raceManager, promptManager, raceId);
      }
      // Check if enough real players have joined
      else {
        const race = raceManager.getRace(raceId);
        if (race && race.players.length >= 2) {
          raceManager.setPlayersReady(raceId);
          sendPlayerList(raceManager, raceId);
          
          // Start race countdown
          startRaceCountdown(raceManager, promptManager, raceId);
        }
      }
      
      break;
    }
    
    case "leave_race": {
      if (!socket.playerId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Not in a race"
        }));
        return;
      }
      
      // Get race before removing player
      const race = raceManager.getPlayerRace(socket.playerId);
      if (!race) return;
      const raceId = race.id;
      
      // Remove player from race
      raceManager.removePlayerFromRace(socket.playerId);
      
      // Clear player ID from socket
      socket.playerId = undefined;
      
      // Send updated player list to remaining players
      sendPlayerList(raceManager, raceId);
      
      break;
    }
    
    case "update_progress": {
      const { progress } = message;
      
      if (!socket.playerId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Not in a race"
        }));
        return;
      }
      
      // Get player's race
      const race = raceManager.getPlayerRace(socket.playerId);
      if (!race) return;
      
      // Update player's progress
      raceManager.updatePlayerProgress(socket.playerId, progress);
      
      // Broadcast progress to all players in race
      broadcastToRace(raceManager, race.id, {
        type: "player_progress",
        playerId: socket.playerId,
        progress
      });
      
      break;
    }
    
    case "finish_race": {
      const { stats } = message;
      
      if (!socket.playerId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Not in a race"
        }));
        return;
      }
      
      // Get player's race
      const race = raceManager.getPlayerRace(socket.playerId);
      if (!race) return;
      
      // Parse and validate stats
      const raceStats: RaceStats = {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        time: stats.time
      };
      
      // Mark player as finished
      raceManager.playerFinished(socket.playerId, raceStats);
      
      // Broadcast finish to all players in race
      broadcastToRace(raceManager, race.id, {
        type: "player_finished",
        playerId: socket.playerId
      });
      
      // Check if race is finished
      if (race.status === "finished") {
        // Get winner
        const winner = raceManager.getRaceWinner(race.id);
        
        // Log all race results for debugging
        console.log(`Race ${race.id} finished. Results:`, 
          race.results.map(r => `${r.position}. ${r.username}: ${r.wpm} WPM, ${r.accuracy}% accuracy, +${r.xpGained} XP`).join('\n')
        );
        
        // Broadcast results to all players
        broadcastToRace(raceManager, race.id, {
          type: "race_end",
          results: race.results,
          winnerId: winner ? winner.id : null
        });
        
        // Update stats and XP for all players
        for (const result of race.results) {
          // Skip if missing stats
          const player = race.players.find(p => p.id === result.id);
          if (!player || !player.raceStats) continue;
          
          // Convert string ID to number for database operations
          const userId = parseInt(result.id, 10);
          if (isNaN(userId)) continue;
          
          // Update player XP
          await playerManager.updatePlayerXp(userId, result.xpGained);
          
          // Update player stats
          await playerManager.updatePlayerStats(
            userId,
            player.raceStats.wpm,
            player.raceStats.accuracy,
            result.position,
            race.players.length
          );
          
          // Record race history
          await playerManager.recordRaceHistory(
            userId,
            race.promptId,
            result.position,
            race.players.length,
            player.raceStats,
            result.xpGained
          );
        }
      }
      
      break;
    }
    
    case "submit_prompt": {
      const { text } = message;
      
      if (!socket.playerId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Not in a race"
        }));
        return;
      }
      
      // Get player's race
      const race = raceManager.getPlayerRace(socket.playerId);
      if (!race) return;
      
      // Check if player is the winner
      const winner = raceManager.getRaceWinner(race.id);
      if (!winner || winner.id !== socket.playerId) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Only the winner can submit a prompt"
        }));
        return;
      }
      
      // Check if winner already submitted a prompt
      if (race.winnerPromptSubmitted) {
        socket.send(JSON.stringify({
          type: "error",
          message: "You already submitted a prompt"
        }));
        return;
      }
      
      // Convert string ID to number for database operations
      const userId = parseInt(socket.playerId, 10);
      if (isNaN(userId)) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Invalid user ID"
        }));
        return;
      }
      
      // Submit prompt
      const submitted = await promptManager.submitPrompt(text, userId);
      
      if (!submitted) {
        socket.send(JSON.stringify({
          type: "error",
          message: "Failed to submit prompt"
        }));
        return;
      }
      
      // Mark prompt as submitted
      raceManager.setWinnerPromptSubmitted(race.id);
      
      // Notify player of success
      socket.send(JSON.stringify({
        type: "prompt_submitted"
      }));
      
      break;
    }
  }
}
