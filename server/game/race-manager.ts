import { WebSocket } from "ws";
import { PromptManager } from "./prompt-manager";
import { PlayerManager } from "./player-manager";
import { RaceStats } from "@shared/schema";
import { artOfWarService } from "../art-of-war-service";
import { DiscordWebhook } from "../discord-webhook";

// Race status enum
export enum RaceStatus {
  WAITING_FOR_PLAYERS = "waiting_for_players",
  COUNTDOWN = "countdown",
  RACING = "racing",
  FINISHED = "finished"
}

// Player status enum
enum PlayerStatus {
  WAITING = "waiting",
  READY = "ready",
  TYPING = "typing",
  FINISHED = "finished"
}

// Race player interface
interface RacePlayer {
  id: string;
  username: string;
  level: number;
  wpm: number;
  chickenType: string;
  jockeyType: string;
  color?: string;
  socket: WebSocket;
  status: PlayerStatus;
  progress: number;
  raceStats?: {
    wpm: number;
    accuracy: number;
    time: number;
  };
  finishPosition?: number;
  isNPC?: boolean;
  difficulty?: 'easy' | 'normal' | 'hard' | 'insane';
}

// Race result interface
interface RaceResult {
  id: string;
  username: string;
  position: number;
  wpm: number;
  accuracy: number;
  xpGained: number;
}

// Race interface
interface Race {
  id: string;
  mode: string;
  status: RaceStatus;
  players: RacePlayer[];
  promptId: number;
  promptText: string;
  startTime: number | null;
  finishedCount: number;
  results: RaceResult[];
  winnerPromptSubmitted: boolean;
  isPrivate?: boolean;
  hostId?: string;
  customData?: any;
}

export class RaceManager {
  private races: Map<string, Race>;
  private playerRaces: Map<string, string>; // Maps player ID to race ID
  private MAX_PLAYERS = 8;
  private MIN_PLAYERS_TO_START = 2;
  private COUNTDOWN_SECONDS = 3;
  private discordWebhook: DiscordWebhook | null = null;
  
  // NPC difficulty settings (WPM, accuracy, consistency)
  private NPC_SETTINGS = {
    easy: { baseWPM: 25, maxWPM: 35, minAccuracy: 90, consistency: 0.8 },
    normal: { baseWPM: 40, maxWPM: 50, minAccuracy: 94, consistency: 0.85 },
    hard: { baseWPM: 60, maxWPM: 70, minAccuracy: 96, consistency: 0.9 },
    insane: { baseWPM: 90, maxWPM: 110, minAccuracy: 98, consistency: 0.95 }
  };
  
  // NPC characteristics - using dedicated NPC sprites with html_ prefix for HTML rendering
  private NPC_CHARACTERS = {
    easy: {
      names: ["Rookie Rider", "Beginner Birdy", "Newbie Nester", "Hatchling Hunter"],
      chickens: ["html_undeadCJ01", "html_undeadCJ02", "html_undeadCJ03", "html_undeadCJ04"],
      jockeys: ["html_undeadCJ01", "html_undeadCJ02", "html_undeadCJ03", "html_undeadCJ04"]
    },
    normal: {
      names: ["Average Avian", "Middling Mover", "Common Cluck", "Standard Strider"],
      chickens: ["html_undeadCJ05", "html_undeadCJ06", "html_undeadCJ07", "html_undeadCJ08"],
      jockeys: ["html_undeadCJ05", "html_undeadCJ06", "html_undeadCJ07", "html_undeadCJ08"]
    },
    hard: {
      names: ["Expert Egger", "Swift Sprinter", "Rapid Runner", "Fast Flapper"],
      chickens: ["html_indusKnightCJ01", "html_indusKnightCJ02", "html_indusKnightCJ03", "html_indusKnightCJ04"],
      jockeys: ["html_indusKnightCJ01", "html_indusKnightCJ02", "html_indusKnightCJ03", "html_indusKnightCJ04"]
    },
    insane: {
      names: ["Champion Clucker", "Legendary Layer", "Insane Igniter", "Feather Flash"],
      chickens: ["html_indusKnightCJ05", "html_indusKnightCJ06", "html_indusKnightCJ07", "html_indusKnightCJ08"],
      jockeys: ["html_indusKnightCJ05", "html_indusKnightCJ06", "html_indusKnightCJ07", "html_indusKnightCJ08"]
    }
  };
  
  constructor() {
    this.races = new Map();
    this.playerRaces = new Map();
    
    // Initialize Discord webhook if webhook URL is available
    if (process.env.DISCORD_WEBHOOK_URL) {
      this.discordWebhook = new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL);
      console.log('🎮 Discord webhook initialized for race results posting');
    }
  }
  
  /**
   * Create a new race with the specified mode
   */
  createRace(mode: string): string {
    const raceId = this.generateRaceId();
    
    this.races.set(raceId, {
      id: raceId,
      mode,
      status: RaceStatus.WAITING_FOR_PLAYERS,
      players: [],
      promptId: 0,
      promptText: "",
      startTime: null,
      finishedCount: 0,
      results: [],
      winnerPromptSubmitted: false
    });
    
    return raceId;
  }
  
  /**
   * Add a player to a race
   */
  addPlayerToRace(
    raceIdOrPlayer: string | {
      id: string;
      username: string;
      level: number;
      wpm: number;
      chickenType: string;
      jockeyType: string;
      color?: string;
    },
    playerIdOrSocket: string | WebSocket,
    username?: string,
    level?: number,
    wpm?: number,
    chickenType?: string,
    jockeyType?: string,
    socket?: WebSocket
  ): boolean {
    // Handle overloaded method
    if (typeof raceIdOrPlayer === 'object') {
      // Called with player object and socket
      const player = raceIdOrPlayer;
      const playerSocket = playerIdOrSocket as WebSocket;
      
      // Find or create a race in multiplayer mode
      const raceId = this.findOrCreateRace('multiplayer');
      const race = this.races.get(raceId);
      
      if (!race) {
        return false;
      }
      
      // Check if race is full
      if (race.players.length >= this.MAX_PLAYERS) {
        return false;
      }
      
      // Check if race has already started
      if (race.status !== RaceStatus.WAITING_FOR_PLAYERS) {
        return false;
      }
      
      // Check if player is already in a race
      if (this.playerRaces.has(player.id)) {
        this.removePlayerFromRace(player.id);
      }
      
      // Add player to race
      race.players.push({
        id: player.id,
        username: player.username,
        level: player.level,
        wpm: player.wpm,
        chickenType: player.chickenType,
        jockeyType: player.jockeyType,
        color: player.color,
        socket: playerSocket,
        status: PlayerStatus.WAITING,
        progress: 0
      });
      
      // Associate player with race
      this.playerRaces.set(player.id, raceId);
      
      return true;
    } else {
      // Called with individual parameters
      const raceId = raceIdOrPlayer;
      const playerId = playerIdOrSocket as string;
      
      const race = this.races.get(raceId);
      
      if (!race) {
        return false;
      }
      
      // Check if race is full
      if (race.players.length >= this.MAX_PLAYERS) {
        return false;
      }
      
      // Check if race has already started
      if (race.status !== RaceStatus.WAITING_FOR_PLAYERS) {
        return false;
      }
      
      // Check if player is already in a race
      if (this.playerRaces.has(playerId)) {
        this.removePlayerFromRace(playerId);
      }
      
      // Add player to race
      race.players.push({
        id: playerId,
        username: username!,
        level: level!,
        wpm: wpm!,
        chickenType: chickenType!,
        jockeyType: jockeyType!,
        socket: socket!,
        status: PlayerStatus.WAITING,
        progress: 0
      });
      
      // Associate player with race
      this.playerRaces.set(playerId, raceId);
      
      return true;
    }
  }
  
  /**
   * Remove a player from their current race
   */
  removePlayerFromRace(playerId: string): boolean {
    const raceId = this.playerRaces.get(playerId);
    
    if (!raceId) {
      return false;
    }
    
    const race = this.races.get(raceId);
    
    if (!race) {
      this.playerRaces.delete(playerId);
      return false;
    }
    
    const wasHost = race.hostId === playerId;
    
    // Remove player from race
    race.players = race.players.filter(player => player.id !== playerId);
    
    // Remove association
    this.playerRaces.delete(playerId);
    
    // Handle host transfer if the leaving player was the host
    if (wasHost && race.players.length > 0 && race.isPrivate) {
      // Transfer host to the first remaining player
      race.hostId = race.players[0].id;
      console.log(`👑 Host transferred from ${playerId} to ${race.players[0].username} in room ${raceId}`);
    }
    
    // If race is empty, remove it
    if (race.players.length === 0) {
      this.races.delete(raceId);
      console.log(`🗑️ Removed empty race room ${raceId}`);
    }
    
    return true;
  }
  
  /**
   * Set all players in a race to ready status
   */
  setPlayersReady(raceId: string): boolean {
    const race = this.races.get(raceId);
    
    if (!race) {
      return false;
    }
    
    race.players.forEach(player => {
      player.status = PlayerStatus.READY;
    });
    
    return true;
  }
  
  /**
   * Start a race countdown
   */
  startRaceCountdown(raceId: string): boolean {
    const race = this.races.get(raceId);
    
    if (!race) {
      return false;
    }
    
    // Check if race already started
    if (race.status !== RaceStatus.WAITING_FOR_PLAYERS) {
      return false;
    }
    
    // Check if race has enough players
    if (race.players.length < this.MIN_PLAYERS_TO_START) {
      return false;
    }
    
    // Start countdown
    race.status = RaceStatus.COUNTDOWN;
    
    return true;
  }
  
  /**
   * Add NPC opponents to a race based on specified difficulty
   */
  addNpcOpponents(raceId: string, difficulty: 'easy' | 'normal' | 'hard' | 'insane', count: number = 1): boolean {
    const race = this.races.get(raceId);
    
    if (!race || race.status !== RaceStatus.WAITING_FOR_PLAYERS) {
      return false;
    }
    
    // Make sure we don't exceed max players
    const availableSlots = this.MAX_PLAYERS - race.players.length;
    const npcCount = Math.min(count, availableSlots);
    
    if (npcCount <= 0) {
      return false;
    }
    
    for (let i = 0; i < npcCount; i++) {
      // Get random name, chicken and jockey for this difficulty
      const names = this.NPC_CHARACTERS[difficulty].names;
      const chickens = this.NPC_CHARACTERS[difficulty].chickens;
      const jockeys = this.NPC_CHARACTERS[difficulty].jockeys;
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomChicken = chickens[Math.floor(Math.random() * chickens.length)];
      const randomJockey = jockeys[Math.floor(Math.random() * jockeys.length)];
      
      // Calculate WPM based on difficulty (with slight randomization)
      const settings = this.NPC_SETTINGS[difficulty];
      const wpmVariance = settings.maxWPM - settings.baseWPM;
      const npcWpm = settings.baseWPM + Math.floor(Math.random() * wpmVariance);
      
      // Create a unique ID for the NPC with npc_ prefix to match what the client expects
      const npcId = `npc_${difficulty}_${Math.random().toString(36).substring(2, 7)}`;
      
      // Create a mock socket for the NPC
      const mockSocket = {
        send: () => {}, // No-op function
        close: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        readyState: WebSocket.OPEN
      } as unknown as WebSocket;
      
      // Add NPC to race with a distinct name including difficulty level
      race.players.push({
        id: npcId,
        username: `${randomName} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
        level: difficulty === 'easy' ? 1 : 
               difficulty === 'normal' ? 5 : 
               difficulty === 'hard' ? 15 : 30,
        wpm: npcWpm,
        chickenType: randomChicken,
        jockeyType: randomJockey,
        socket: mockSocket,
        status: PlayerStatus.READY,  // Set to READY so they start immediately
        progress: 0,
        isNPC: true,
        difficulty: difficulty,
        color: '#' + Math.floor(Math.random() * 16777215).toString(16) // Random color
      });
    }
    
    return true;
  }
  
  /**
   * Update NPC progress during a race
   */
  updateNpcProgress(raceId: string): void {
    const race = this.races.get(raceId);
    
    if (!race || race.status !== RaceStatus.RACING || !race.startTime) {
      return;
    }
    
    const elapsedSeconds = (Date.now() - race.startTime) / 1000;
    
    // Update each NPC's progress
    race.players.forEach(player => {
      if (player.isNPC && player.status !== PlayerStatus.FINISHED) {
        const settings = this.NPC_SETTINGS[player.difficulty!];
        
        // Set player status to TYPING if it was READY
        if (player.status === PlayerStatus.READY) {
          player.status = PlayerStatus.TYPING;
        }
        
        // EXACT campaign formula - incremental progress with 0.1 second intervals
        const promptLength = race.promptText.length;
        
        // Campaign mode formula: (targetWPM * 5) / 60 characters per second
        const charactersPerSecond = (player.wpm * 5) / 60;
        const progressPerInterval = (charactersPerSecond * 0.1) / promptLength * 100; // 0.1 second interval like campaign
        const randomFactor = (Math.random() * 0.3) + 0.85; // Exact campaign randomness
        
        // Add incremental progress (campaign approach)
        const newProgress = Math.min(100, player.progress + (progressPerInterval * randomFactor));
        
        // Update progress percentage
        const progress = Math.floor(newProgress);
        
        console.log(`NPC ${player.username} progress: ${progress}% (WPM: ${player.wpm}, chars/sec: ${charactersPerSecond.toFixed(2)}, interval progress: ${progressPerInterval.toFixed(4)}, random: ${randomFactor.toFixed(2)}, elapsed: ${elapsedSeconds.toFixed(1)}s)`);
        
        player.progress = progress;
        
        // If NPC has finished typing, calculate stats
        if (progress >= 100 && player.status === PlayerStatus.TYPING) {
          this.npcFinished(raceId, player.id);
        }
      }
    });
  }
  
  /**
   * Get typing burst factor for realistic NPC behavior
   */
  private getTypingBurstFactor(elapsedSeconds: number, settings: any): number {
    // Simulate typing bursts - faster at beginning, slower during difficult parts
    const burstCycle = Math.sin(elapsedSeconds * 0.3) * 0.2; // Oscillating between -0.2 and 0.2
    return 1 + (burstCycle * settings.consistency); // More consistent NPCs have smaller bursts
  }

  /**
   * Get typing pause factor for realistic hesitations
   */
  private getTypingPauseFactor(elapsedSeconds: number, settings: any): number {
    // Much more aggressive typing - fewer pauses so NPCs race at their true WPM
    const pauseChance = Math.random();
    
    if (pauseChance < 0.02) { // Only 2% chance of a pause
      return 0.85; // Minor slowdown
    } else if (pauseChance < 0.05) { // 3% chance of tiny hesitation
      return 0.95; // Very slight slowdown
    }
    
    return 1.0; // Normal speed most of the time
  }

  /**
   * Match NPCs to player skill level for balanced competition
   */
  private generateBalancedNPCs(playerWpm: number, raceSize: number): RacePlayer[] {
    const npcs: RacePlayer[] = [];
    const npcNames = [
      "CrystalWing", "ThunderBeak", "ShadowFeather", "PrismTail", 
      "VoidRunner", "SolarFlare", "FrostWing", "NeonRush"
    ];

    // Create NPCs with WPM properly balanced around player's skill level
    for (let i = 0; i < raceSize - 1; i++) { // -1 for the human player
      const variance = 12; // ±12 WPM variance for closer competition
      const randomOffset = (Math.random() - 0.5) * variance * 2;
      const npcWpm = Math.max(25, Math.min(100, Math.round(playerWpm + randomOffset)));

      // Assign difficulty based on WPM relative to player - much tighter ranges
      let difficulty: 'easy' | 'normal' | 'hard' | 'insane';
      const wpmDiff = npcWpm - playerWpm;
      
      if (wpmDiff < -8) difficulty = 'easy';
      else if (wpmDiff < 3) difficulty = 'normal';  
      else if (wpmDiff < 8) difficulty = 'hard';
      else difficulty = 'insane';

      console.log(`Creating NPC ${i}: ${npcWpm} WPM (player: ${playerWpm} WPM, diff: ${wpmDiff}, difficulty: ${difficulty})`);

      npcs.push({
        id: `npc_${i}`,
        username: npcNames[i % npcNames.length],
        level: Math.floor(npcWpm / 10),
        wpm: Math.round(npcWpm),
        chickenType: this.getRandomChickenType(),
        jockeyType: this.getRandomJockeyType(),
        socket: null as any,
        status: PlayerStatus.READY,
        progress: 0,
        isNPC: true,
        difficulty: difficulty
      });
    }

    return npcs;
  }

  /**
   * Get random chicken type for NPCs
   */
  private getRandomChickenType(): string {
    const types = ["auto", "timaru", "goldfeather"];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Get random jockey type for NPCs
   */
  private getRandomJockeyType(): string {
    const types = ["steve", "auto", "matikah", "iam"];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Mark an NPC as finished and calculate its race stats
   */
  npcFinished(raceId: string, npcId: string): void {
    const race = this.races.get(raceId);
    
    if (!race || !race.startTime) {
      return;
    }
    
    const player = race.players.find(p => p.id === npcId);
    
    if (!player || !player.isNPC || player.status === PlayerStatus.FINISHED) {
      return;
    }
    
    // Mark NPC as finished
    player.status = PlayerStatus.FINISHED;
    player.progress = 100;
    race.finishedCount++;
    player.finishPosition = race.finishedCount;
    
    // Calculate race time
    const raceTimeSeconds = (Date.now() - race.startTime) / 1000;
    
    // Calculate stats based on difficulty settings
    const settings = this.NPC_SETTINGS[player.difficulty!];
    const accuracy = settings.minAccuracy + Math.random() * (100 - settings.minAccuracy);
    
    // Set race stats
    player.raceStats = {
      wpm: player.wpm,
      accuracy: Math.round(accuracy),
      time: Math.round(raceTimeSeconds)
    };
    
    // Add to results
    const xpGained = this.calculateXp(
      player.finishPosition, 
      player.wpm, 
      player.raceStats.accuracy, 
      race.players.length
    );
    
    race.results.push({
      id: player.id,
      username: player.username,
      position: player.finishPosition,
      wpm: player.wpm,
      accuracy: player.raceStats.accuracy,
      xpGained
    });
    
    // Post individual completion to Discord
    this.postRaceCompletionToDiscord(raceId, player.id);
    
    // Check if all players have finished
    if (race.finishedCount >= race.players.length) {
      race.status = RaceStatus.FINISHED;
    }
  }

  /**
   * Start a race with the given prompt
   */
  startRace(raceId: string, promptId: number, promptText: string): boolean {
    const race = this.races.get(raceId);
    
    if (!race) {
      console.error(`startRace: Race ${raceId} not found`);
      return false;
    }
    
    // IMPORTANT FIX: Allow starting from either COUNTDOWN or WAITING_FOR_PLAYERS state
    // This ensures races can start even if there were issues during countdown
    if (race.status !== RaceStatus.COUNTDOWN && race.status !== RaceStatus.WAITING_FOR_PLAYERS) {
      console.error(`startRace: Race ${raceId} in invalid state: ${race.status}`);
      return false;
    }
    
    console.log(`Starting race ${raceId} with existing prompt: "${race.promptText?.substring(0, 50)}..."`);
    
    // CRITICAL FIX: Don't overwrite the existing prompt text - preserve what was set when race was created
    race.status = RaceStatus.RACING;
    race.startTime = Date.now();
    
    // Only update prompt if it doesn't exist (shouldn't happen for private rooms)
    if (!race.promptText && promptText) {
      race.promptId = promptId;
      race.promptText = promptText;
      console.log(`⚠️ Setting fallback prompt for race ${raceId}: "${promptText.substring(0, 50)}..."`);
    } else {
      console.log(`✅ Using existing race prompt: "${race.promptText.substring(0, 50)}..."`);
    }
    
    // Set all players to typing status
    race.players.forEach(player => {
      player.status = PlayerStatus.TYPING;
    });
    
    console.log(`Race ${raceId} started successfully with ${race.players.length} players`);
    
    // Start NPC updates if we have any NPCs
    if (race.players.some(p => p.isNPC)) {
      this.updateNpcProgress(raceId);
    }
    
    return true;
  }
  
  /**
   * Update a player's progress in their race
   */
  updatePlayerProgress(playerId: string, progress: number): boolean {
    const raceId = this.playerRaces.get(playerId);
    
    if (!raceId) {
      return false;
    }
    
    const race = this.races.get(raceId);
    
    if (!race) {
      return false;
    }
    
    // Update player progress
    const player = race.players.find(p => p.id === playerId);
    
    if (!player) {
      return false;
    }
    
    player.progress = progress;
    player.status = PlayerStatus.TYPING;
    
    return true;
  }
  
  /**
   * Mark a player as finished with their race
   */
  playerFinished(playerId: string, stats: RaceStats): boolean {
    const raceId = this.playerRaces.get(playerId);
    
    if (!raceId) {
      console.error(`Cannot find race for player ${playerId}`);
      return false;
    }
    
    const race = this.races.get(raceId);
    
    if (!race) {
      console.error(`Race ${raceId} not found`);
      return false;
    }
    
    // Find player
    const player = race.players.find(p => p.id === playerId);
    
    if (!player) {
      console.error(`Player ${playerId} not found in race ${raceId}`);
      return false;
    }
    
    // Set player as finished
    player.status = PlayerStatus.FINISHED;
    player.progress = 100;
    player.raceStats = stats;
    
    // Increment finished count and assign position
    race.finishedCount++;
    player.finishPosition = race.finishedCount;
    
    // Calculate XP based on position, WPM, accuracy and prompt length
    const xpGained = this.calculateXp(
      player.finishPosition,
      stats.wpm,
      stats.accuracy,
      race.players.length,
      race.promptText
    );
    
    console.log(`Player ${player.username} finished race with: WPM ${stats.wpm}, Accuracy ${stats.accuracy}%, Position ${player.finishPosition}, XP +${xpGained}`);
    
    // Add to results
    race.results.push({
      id: player.id,
      username: player.username,
      position: player.finishPosition,
      wpm: Math.round(stats.wpm),
      accuracy: Math.round(stats.accuracy),
      xpGained
    });
    
    // Auto-finish timer for multiplayer races - end race 5 seconds after first player finishes
    if (race.finishedCount === 1 && race.isPrivate) {
      console.log(`🏁 First player finished in private race ${raceId} - starting 5-second auto-finish timer`);
      setTimeout(() => {
        const currentRace = this.races.get(raceId);
        if (currentRace && currentRace.status !== RaceStatus.FINISHED) {
          currentRace.status = RaceStatus.FINISHED;
          console.log(`⏰ Auto-finished private race ${raceId} after 5 seconds`);
          
          // Broadcast race finished to all remaining players
          currentRace.players.forEach(player => {
            if (player.socket && player.socket.readyState === 1) { // WebSocket.OPEN
              player.socket.send(JSON.stringify({
                type: "race_finished",
                results: currentRace.results
              }));
            }
          });
        }
      }, 5000); // 5 second auto-finish
    }
    
    // Check if all players have finished
    if (race.finishedCount === race.players.length) {
      race.status = RaceStatus.FINISHED;
      console.log(`Race ${raceId} complete - all players finished. Sending results.`);
      
      // Post race summary to Discord if available
      this.postRaceSummaryToDiscord(raceId);
    }
    
    return true;
  }
  
  /**
   * Get a race by ID
   */
  getRace(raceId: string): Race | undefined {
    return this.races.get(raceId);
  }
  
  /**
   * Get a player's current race
   */
  getPlayerRace(playerId: string): Race | undefined {
    const raceId = this.playerRaces.get(playerId);
    
    if (!raceId) {
      return undefined;
    }
    
    return this.races.get(raceId);
  }
  
  /**
   * Get all active races
   */
  getAllRaces(): Race[] {
    return Array.from(this.races.values());
  }

  /**
   * Create a private race room
   */
  createPrivateRace(roomData: any, host?: any): string {
    // Use provided roomId for guild halls/arenas, or generate one for regular private rooms
    const raceId = roomData.roomId || `private_${Math.random().toString(36).substr(2, 9)}`;
    
    // CRITICAL FIX: Check if race already exists for guild halls/arenas
    if (roomData.roomId && this.races.has(raceId)) {
      console.log(`🏟️ Race already exists for venue ${raceId}, reusing existing race`);
      return raceId;
    }
    
    // Get a strategic passage from The Art of War for private rooms
    let promptText = "The quick brown fox jumps over the lazy dog."; // Fallback
    
    try {
      if (!artOfWarService) {
        console.warn("Art of War service not available, using fallback prompt");
      } else {
        // Initialize service if needed
        artOfWarService.initialize();
        
        // Select passage based on room preferences or random
        const difficulty = roomData.difficulty || 'medium';
        const passage = artOfWarService.getRandomPassage(difficulty as 'easy' | 'medium' | 'hard');
        
        if (passage && passage.text) {
          promptText = passage.text;
          console.log(`📚 Using Art of War passage from ${passage.chapter} (${passage.difficulty}): "${passage.text.substring(0, 50)}..."`);
        }
      }
    } catch (error) {
      console.error("Error getting Art of War passage:", error);
      // Keep fallback text
    }
    
    const race: Race = {
      id: raceId,
      mode: roomData.roomId ? (roomData.roomId.startsWith('guild_') ? 'guild' : 'arena') : 'private',
      status: RaceStatus.WAITING_FOR_PLAYERS,
      players: [],
      promptId: 0,
      promptText: roomData.customPrompt ? roomData.customPrompt : promptText, // Use Art of War if no custom prompt
      startTime: null,
      finishedCount: 0,
      results: [],
      winnerPromptSubmitted: false,
      isPrivate: true,
      hostId: host?.id || 'system',
      customData: {
        ...roomData,
        name: roomData.name || "Private Race Room",
        promptText: roomData.customPrompt || promptText
      }
    };
    
    this.races.set(raceId, race);
    
    if (roomData.roomId) {
      console.log(`🏛️ Created race session for persistent venue: ${raceId}`);
    } else {
      console.log(`🏠 Created private race room: ${raceId} hosted by ${host?.username || 'System'}`);
      // DON'T auto-join the creator - they will join via WebSocket to prevent duplication
      console.log(`👑 Room ${raceId} ready for host ${host?.username || 'System'} to join via WebSocket`);
    }
    
    return raceId;
  }

  /**
   * Add player to a private race
   */
  addPlayerToPrivateRace(raceId: string, playerData: any, socket: any): boolean {
    const race = this.races.get(raceId);
    
    if (!race || !race.isPrivate) {
      return false;
    }
    
    // CRITICAL FIX: Remove any existing instances of this player first
    const existingPlayerIndex = race.players.findIndex(p => p.id === playerData.id);
    if (existingPlayerIndex !== -1) {
      console.log(`🔄 Removing existing player ${playerData.username} from private race ${raceId} to prevent duplicates`);
      race.players.splice(existingPlayerIndex, 1);
    }
    
    // Also remove from any other races they might be in
    const existingRaceId = this.playerRaces.get(playerData.id);
    if (existingRaceId && existingRaceId !== raceId) {
      this.removePlayerFromRace(playerData.id);
    }
    
    // Check room capacity after cleanup
    if (race.players.length >= this.MAX_PLAYERS) {
      console.log(`❌ Private room ${raceId} is full (${race.players.length}/${this.MAX_PLAYERS})`);
      return false;
    }
    
    // If this is the first player and no host is set, make them the host
    if (race.players.length === 0 && !race.hostId) {
      race.hostId = playerData.id;
      console.log(`🎯 Setting ${playerData.username} as host of private room ${raceId}`);
    }
    
    const player: RacePlayer = {
      id: playerData.id,
      username: playerData.username,
      level: playerData.level,
      wpm: playerData.wpm,
      chickenType: playerData.chickenType,
      jockeyType: playerData.jockeyType,
      socket: socket,
      status: PlayerStatus.WAITING,
      progress: 0
    };
    
    race.players.push(player);
    this.playerRaces.set(playerData.id, raceId);
    
    console.log(`✅ Added ${playerData.username} to private race ${raceId} (${race.players.length}/${this.MAX_PLAYERS})`);
    
    return true;
  }

  /**
   * Set player ready state in private room
   */
  setPlayerReadyState(raceId: string, playerId: string, isReady: boolean): boolean {
    const race = this.races.get(raceId);
    
    if (!race || !race.isPrivate) {
      return false;
    }
    
    const player = race.players.find(p => p.id === playerId);
    if (!player) {
      return false;
    }
    
    player.status = isReady ? PlayerStatus.READY : PlayerStatus.WAITING;
    console.log(`🔄 Player ${player.username} ready state: ${isReady} in room ${raceId}`);
    
    return true;
  }

  /**
   * Start race countdown for private room
   */
  startPrivateRaceCountdown(raceId: string): boolean {
    const race = this.races.get(raceId);
    
    if (!race || !race.isPrivate) {
      return false;
    }
    
    race.status = RaceStatus.COUNTDOWN;
    
    // Start countdown sequence
    let countdown = this.COUNTDOWN_SECONDS;
    const countdownInterval = setInterval(() => {
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        this.startPrivateRace(raceId);
      }
    }, 1000);
    
    return true;
  }

  /**
   * Start the actual private race
   */
  private startPrivateRace(raceId: string): void {
    const race = this.races.get(raceId);
    
    if (!race) {
      return;
    }
    
    race.status = RaceStatus.RACING;
    race.startTime = Date.now();
    
    // Set all players to typing status
    race.players.forEach(player => {
      player.status = PlayerStatus.TYPING;
      player.progress = 0;
    });
    
    // Broadcast race start to all players
    race.players.forEach(player => {
      if (player.socket && player.socket.readyState === 1) {
        player.socket.send(JSON.stringify({
          type: "race_started",
          raceId,
          promptText: race.promptText,
          startTime: race.startTime
        }));
      }
    });
    
    console.log(`🏁 Private race ${raceId} started with ${race.players.length} players`);
  }
  
  /**
   * Find or create a race of the specified mode with intelligent NPC filling
   */
  findOrCreateRace(mode: string, playerWpm: number = 60): string {
    // Look for an existing race in this mode that's waiting for players
    for (const [id, race] of this.races.entries()) {
      if (race.mode === mode && 
          race.status === RaceStatus.WAITING_FOR_PLAYERS && 
          race.players.length < this.MAX_PLAYERS) {
        return id;
      }
    }
    
    // No suitable race found, create a new one
    const raceId = this.createRace(mode);
    
    // Fill with skill-matched NPCs for better competition
    this.fillRaceWithBalancedNPCs(raceId, playerWpm);
    
    return raceId;
  }

  /**
   * Get all private rooms for the API
   */
  getAllPrivateRooms() {
    const privateRooms = [];
    console.log(`🔍 Checking ${this.races.size} total races for private rooms`);
    
    this.races.forEach((race, id) => {
      console.log(`   Race ${id}: isPrivate=${race.isPrivate}, mode=${race.mode}, status=${race.status}`);
      if (race.isPrivate) {
        const roomData = {
          id,
          name: race.customData?.name || "Private Room",
          host: race.hostId || "Unknown",
          playerCount: race.players.length,
          maxPlayers: this.MAX_PLAYERS,
          customPrompt: race.promptText,
          isPasswordProtected: race.customData?.isPasswordProtected || false,
          status: race.status === RaceStatus.WAITING_FOR_PLAYERS ? "waiting" : "racing"
        };
        console.log(`   ✅ Found private room:`, roomData);
        privateRooms.push(roomData);
      }
    });
    
    console.log(`🏠 Returning ${privateRooms.length} private rooms`);
    return privateRooms;
  }

  /**
   * Broadcast private room update to all connected players
   */
  broadcastPrivateRoomUpdate(roomId: string): void {
    const race = this.races.get(roomId);
    if (!race) return;

    const roomData = {
      id: roomId,
      name: race.name || roomId,
      players: race.players.map(p => ({
        id: p.id,
        username: p.username,
        status: p.status,
        progress: p.progress || 0,
        wpm: p.wpm || 0,
        accuracy: p.accuracy || 0,
        position: p.position,
        finishTime: p.finishTime,
        xpGained: p.xpGained
      })),
      maxPlayers: race.maxPlayers,
      status: race.status === RaceStatus.WAITING_FOR_PLAYERS ? "waiting" : "racing",
      customPrompt: race.prompt
    };

    // Broadcast to all players in the room via their WebSocket connections
    race.players.forEach(player => {
      if (player.socket && player.socket.readyState === 1) { // WebSocket.OPEN = 1
        player.socket.send(JSON.stringify({
          type: 'private_room_update',
          data: roomData
        }));
      }
    });
  }

  /**
   * Fill a race with NPCs matched to player skill level (only for quickrace mode)
   */
  private fillRaceWithBalancedNPCs(raceId: string, playerWpm: number): void {
    const race = this.races.get(raceId);
    if (!race) return;
    
    // CRITICAL FIX: Don't add NPCs to multiplayer-only races
    if (race.mode === 'multiplayer-only') {
      console.log(`Race ${raceId} is multiplayer-only - no NPCs will be added`);
      return;
    }

    // Calculate how many NPCs to add (aim for 6-8 total racers for quickrace)
    const targetSize = Math.min(8, Math.max(6, 4 + Math.floor(Math.random() * 3)));
    const npcsToAdd = Math.max(0, targetSize - race.players.length);

    if (npcsToAdd > 0) {
      const balancedNPCs = this.generateBalancedNPCs(playerWpm, npcsToAdd + 1);
      
      // Add the NPCs to the race
      balancedNPCs.forEach(npc => {
        race.players.push(npc);
      });

      console.log(`Added ${npcsToAdd} skill-matched NPCs to quickrace ${raceId} (player WPM: ${playerWpm})`);
    }
  }

  /**
   * Check if a race is ready to start based on its mode
   */
  isRaceReadyToStart(raceId: string): boolean {
    const race = this.races.get(raceId);
    if (!race) return false;

    // For multiplayer-only mode, need at least 2 human players
    if (race.mode === 'multiplayer-only') {
      const humanPlayers = race.players.filter(p => !p.isNPC && p.status === PlayerStatus.READY);
      return humanPlayers.length >= 2;
    }

    // For quickrace mode, can start with 1 human player (NPCs will fill)
    const humanPlayers = race.players.filter(p => !p.isNPC && p.status === PlayerStatus.READY);
    return humanPlayers.length >= 1;
  }
  
  /**
   * Set a race's winner prompt as submitted
   */
  setWinnerPromptSubmitted(raceId: string): boolean {
    const race = this.races.get(raceId);
    
    if (!race) {
      return false;
    }
    
    race.winnerPromptSubmitted = true;
    return true;
  }
  
  /**
   * Reset a race to waiting state
   */
  resetRace(raceId: string): boolean {
    const race = this.races.get(raceId);
    
    if (!race) {
      return false;
    }
    
    // Reset race state
    race.status = RaceStatus.WAITING_FOR_PLAYERS;
    race.promptId = 0;
    race.promptText = "";
    race.startTime = null;
    race.finishedCount = 0;
    race.results = [];
    race.winnerPromptSubmitted = false;
    
    // Reset player states
    race.players.forEach(player => {
      player.status = PlayerStatus.WAITING;
      player.progress = 0;
      player.raceStats = undefined;
      player.finishPosition = undefined;
    });
    
    return true;
  }
  
  /**
   * Get the winner of a race
   */
  getRaceWinner(raceId: string): RacePlayer | undefined {
    const race = this.races.get(raceId);
    
    if (!race || race.status !== RaceStatus.FINISHED || race.results.length === 0) {
      return undefined;
    }
    
    const winnerResult = race.results.find(result => result.position === 1);
    
    if (!winnerResult) {
      return undefined;
    }
    
    return race.players.find(player => player.id === winnerResult.id);
  }
  
  /**
   * Calculate XP gained based on position, WPM and accuracy
   */
  private calculateXp(position: number, wpm: number, accuracy: number, totalPlayers: number, promptText?: string): number {
    // Calculate base XP from characters typed (1 point per character for 1st place)
    const charactersTyped = promptText ? promptText.length : 100; // fallback if no prompt
    
    // Position-based multipliers as specified:
    // 1st place: 100% (1.0), 2nd place: 50% (0.5), 3rd place: 33.333% (0.33333), 4th+: 25% (0.25)
    let positionMultiplier: number;
    if (position === 1) {
      positionMultiplier = 1.0;
    } else if (position === 2) {
      positionMultiplier = 0.5;
    } else if (position === 3) {
      positionMultiplier = 0.33333;
    } else {
      positionMultiplier = 0.25;
    }
    
    // Calculate XP based on characters typed and position
    const baseXp = Math.floor(charactersTyped * positionMultiplier);
    
    console.log(`XP Calculation: Position ${position}, Characters ${charactersTyped}, Multiplier ${positionMultiplier}, XP ${baseXp}`);
    
    return baseXp;
  }
  
  /**
   * Generate a unique race ID
   */
  private generateRaceId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Post individual race completion to Discord
   */
  private async postRaceCompletionToDiscord(raceId: string, playerId: string) {
    if (!this.discordWebhook) {
      return;
    }
    
    const race = this.races.get(raceId);
    if (!race) return;
    
    const player = race.players.find(p => p.id === playerId);
    const result = race.results.find(r => r.id === playerId);
    
    if (!player || !result || !player.raceStats) return;
    
    try {
      await this.discordWebhook.postRaceCompletion(
        player.username,
        result.position,
        Math.round(player.raceStats.wpm),
        Math.round(player.raceStats.accuracy),
        Math.round(player.raceStats.time),
        // Extract faction from player data if available
        undefined // TODO: Add faction support
      );
    } catch (error) {
      console.error('Failed to post race completion to Discord:', error);
    }
  }
  
  /**
   * Post race summary to Discord
   */
  private async postRaceSummaryToDiscord(raceId: string) {
    if (!this.discordWebhook) {
      return;
    }
    
    const race = this.races.get(raceId);
    if (!race || race.results.length === 0) return;
    
    try {
      // Map race results to Discord format
      const participants = race.results.map(result => {
        const player = race.players.find(p => p.id === result.id);
        return {
          playerName: result.username,
          placement: result.position,
          wpm: Math.round(result.wpm),
          accuracy: Math.round(result.accuracy),
          raceTime: player?.raceStats?.time || 0,
          // TODO: Add faction support
          faction: undefined
        };
      });
      
      // Calculate total typing time
      const totalTypingTime = participants.reduce((total, p) => total + p.raceTime, 0);
      
      await this.discordWebhook.postRaceSummary(
        participants,
        Math.round(totalTypingTime)
      );
    } catch (error) {
      console.error('Failed to post race summary to Discord:', error);
    }
  }
}
