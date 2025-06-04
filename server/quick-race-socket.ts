import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { storage } from './storage';
import { artOfWarService } from './art-of-war-service';

interface QuickRacePlayer {
  socketId: string;
  username: string;
  faction: string;
  isReady: boolean;
  chickenName?: string;
  chickenType?: string;
  jockeyType?: string;
  isNPC?: boolean;
  wpm?: number;
  accuracy?: number;
  progress?: number;
  finishTime?: number;
  finished?: boolean;
}

interface QuickRaceRoom {
  players: QuickRacePlayer[];
  raceActive: boolean;
  racePrompt: string;
  raceStartTime: number;
  countdown: number;
  countdownInterval?: NodeJS.Timeout;
  raceInterval?: NodeJS.Timeout;
  results: any[];
}

class QuickRaceManager {
  private io: SocketIOServer;
  private room: QuickRaceRoom;
  private readonly MAX_PLAYERS = 8;
  private readonly COUNTDOWN_DURATION = 3;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.room = {
      players: [],
      raceActive: false,
      racePrompt: '',
      raceStartTime: 0,
      countdown: 0,
      results: []
    };
  }

  addPlayer(socketId: string, userData: any) {
    // Support both logged-in users and guests
    const username = userData.username || `Guest${Math.floor(Math.random() * 10000)}`;
    const existingPlayerIndex = this.room.players.findIndex(p => p.username === username);
    
    if (existingPlayerIndex !== -1) {
      // Update existing player's socket ID
      this.room.players[existingPlayerIndex].socketId = socketId;
    } else {
      // Add new player (guest or logged-in user)
      const newPlayer: QuickRacePlayer = {
        socketId,
        username,
        faction: userData.current_faction || 'd6', // Default faction for guests
        isReady: false,
        chickenName: userData.chicken_name || 'Guest Chicken',
        chickenType: userData.chicken_type || 'white',
        jockeyType: userData.jockey_type || 'steve',
        isNPC: false
      };
      
      this.room.players.push(newPlayer);
    }

    this.broadcastPlayersUpdate();
    this.checkAutoStart();
  }

  removePlayer(socketId: string) {
    const playerIndex = this.room.players.findIndex(p => p.socketId === socketId && !p.isNPC);
    if (playerIndex !== -1) {
      this.room.players.splice(playerIndex, 1);
      this.broadcastPlayersUpdate();
    }
  }

  togglePlayerReady(socketId: string) {
    const player = this.room.players.find(p => p.socketId === socketId);
    if (player && !this.room.raceActive) {
      player.isReady = !player.isReady;
      this.io.to(socketId).emit('player-ready-status', { username: player.username, isReady: player.isReady });
      this.broadcastPlayersUpdate();
      this.checkAutoStart();
    }
  }

  private checkAutoStart() {
    // Auto-start if we have at least 1 real player and countdown hasn't started
    if (this.room.players.filter(p => !p.isNPC).length >= 1 && 
        !this.room.raceActive && 
        this.room.countdown === 0) {
      this.startCountdown();
    }
  }

  startCountdown() {
    if (this.room.raceActive || this.room.countdown > 0) return;

    // Fill empty slots with NPCs
    this.fillWithNPCs();

    this.room.countdown = this.COUNTDOWN_DURATION;
    this.io.emit('countdown-started');
    this.io.emit('countdown-update', this.room.countdown);

    this.room.countdownInterval = setInterval(() => {
      this.room.countdown--;
      this.io.emit('countdown-update', this.room.countdown);

      if (this.room.countdown <= 0) {
        this.startRace();
      }
    }, 1000);
  }

  private fillWithNPCs() {
    const realPlayers = this.room.players.filter(p => !p.isNPC).length;
    const npcsNeeded = Math.min(this.MAX_PLAYERS - realPlayers, 7); // Leave room for real players

    for (let i = 0; i < npcsNeeded; i++) {
      const npcNames = ['Swift_Bot', 'Type_Master', 'Quick_Fingers', 'Rapid_Typer', 'Speed_Demon', 'Key_Crusher', 'Text_Warrior'];
      const npcName = npcNames[Math.floor(Math.random() * npcNames.length)] + '_' + Math.floor(Math.random() * 1000);
      
      const factions = ['d2', 'd4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];
      const chickenTypes = ['html_steve', 'black', 'white', 'brown', 'gold'];
      const jockeyTypes = ['steve', 'fire_jockey', 'zombie', 'auto'];

      const npc: QuickRacePlayer = {
        socketId: `npc_${Date.now()}_${i}`,
        username: npcName,
        faction: factions[Math.floor(Math.random() * factions.length)],
        isReady: true,
        chickenName: npcName,
        chickenType: chickenTypes[Math.floor(Math.random() * chickenTypes.length)],
        jockeyType: jockeyTypes[Math.floor(Math.random() * jockeyTypes.length)],
        isNPC: true,
        wpm: 30 + Math.floor(Math.random() * 40), // 30-70 WPM range
        progress: 0,
        finished: false
      };

      this.room.players.push(npc);
    }

    this.broadcastPlayersUpdate();
  }

  private async startRace() {
    if (this.room.countdownInterval) {
      clearInterval(this.room.countdownInterval);
    }

    // Initialize Art of War service
    await artOfWarService.initialize();
    
    // Get a random passage
    const passage = artOfWarService.getRandomPassage();
    this.room.racePrompt = passage.text;
    this.room.raceActive = true;
    this.room.raceStartTime = Date.now();
    this.room.countdown = 0;
    this.room.results = [];

    // Reset all players
    this.room.players.forEach(player => {
      player.progress = 0;
      player.finished = false;
      player.finishTime = undefined;
    });

    this.io.emit('race-started', this.room.racePrompt);

    // Start NPC simulation
    this.simulateNPCs();

    console.log(`🏁 Quick race started with ${this.room.players.length} players`);
  }

  private simulateNPCs() {
    const npcs = this.room.players.filter(p => p.isNPC);
    
    npcs.forEach(npc => {
      const targetWPM = npc.wpm || (30 + Math.floor(Math.random() * 40));
      const charactersPerSecond = (targetWPM * 5) / 60; // 5 chars per word, 60 seconds per minute
      const totalCharacters = this.room.racePrompt.length;
      const targetFinishTime = (totalCharacters / charactersPerSecond) * 1000; // in milliseconds
      
      // Add some randomness to make it more realistic
      const actualFinishTime = targetFinishTime * (0.8 + Math.random() * 0.4); // ±20% variation
      
      const updateInterval = 100; // Update every 100ms
      const totalUpdates = actualFinishTime / updateInterval;
      let currentUpdate = 0;

      const npcInterval = setInterval(() => {
        if (!this.room.raceActive) {
          clearInterval(npcInterval);
          return;
        }

        currentUpdate++;
        const progress = Math.min(currentUpdate / totalUpdates, 1);
        npc.progress = progress;

        const currentWPM = Math.round(targetWPM * (0.8 + Math.random() * 0.4));
        const accuracy = 85 + Math.floor(Math.random() * 15); // 85-100% accuracy

        this.io.emit('player-progress', {
          username: npc.username,
          progress,
          wpm: currentWPM,
          accuracy
        });

        if (progress >= 1 && !npc.finished) {
          npc.finished = true;
          npc.finishTime = Date.now() - this.room.raceStartTime;
          npc.wpm = currentWPM;
          npc.accuracy = accuracy;
          clearInterval(npcInterval);
          
          console.log(`🏆 ${npc.username} (NPC) finished: ${currentWPM} WPM`);
          this.checkRaceComplete();
        }
      }, updateInterval);
    });
  }

  updatePlayerProgress(socketId: string, progress: number, wpm: number, accuracy: number) {
    const player = this.room.players.find(p => p.socketId === socketId);
    if (player && this.room.raceActive) {
      player.progress = progress;
      player.wpm = wpm;
      player.accuracy = accuracy;

      this.io.emit('player-progress', {
        username: player.username,
        progress,
        wpm,
        accuracy
      });
    }
  }

  async completePlayerRace(socketId: string, finalWpm: number, finalAccuracy: number) {
    const player = this.room.players.find(p => p.socketId === socketId);
    if (player && this.room.raceActive && !player.finished) {
      player.finished = true;
      player.finishTime = Date.now() - this.room.raceStartTime;
      player.wpm = finalWpm;
      player.accuracy = finalAccuracy;

      console.log(`🏆 ${player.username} finished: ${finalWpm} WPM`);

      // Award XP for real players using same logic as Matrix races
      if (!player.isNPC) {
        console.log(`🎯 Quick Race - Awarding XP for completed player: ${player.username}`);
        console.log(`🔍 Quick Race - Player details:`, {
          username: player.username,
          isNPC: player.isNPC,
          finished: player.finished
        });
        try {
          const user = await storage.getUserByUsername(player.username);
          if (user) {
            console.log(`✅ Quick Race - Found user in database: ${user.username} (ID: ${user.id})`);
            // Calculate position
            const finishedPlayers = this.room.players.filter(p => p.finished).length;
            const position = finishedPlayers;
            
            // Calculate XP based on actual characters typed + base reward
            const totalCharacters = this.room.racePrompt.length;
            const charactersTyped = Math.round(((player.progress || 0) / 100) * totalCharacters);
            const positionMultiplier = position === 1 ? 1.0 : position === 2 ? 0.5 : position === 3 ? 0.33 : 0.25;
            const baseXP = 8; // Base participation reward
            const xpGained = Math.round(baseXP + (charactersTyped * positionMultiplier));
            
            // Update XP
            await storage.updateUserXp(user.id, xpGained);
            
            // Update race stats including faction XP using StatsService
            const { StatsService } = await import('./stats-service');
            await StatsService.updatePlayerStats(user.id, {
              wpm: finalWpm,
              accuracy: finalAccuracy,
              position: position,
              totalPlayers: this.room.players.filter(p => !p.isNPC).length,
              faction: user.current_faction || 'd6',
              charactersTyped: charactersTyped,
              xpGained: xpGained
            });
            
            console.log(`💫 ${player.username} earned ${xpGained} XP (position ${position})`);
          }
        } catch (error) {
          console.error(`Error updating player stats for ${player.username}:`, error);
        }
      }

      // Start 10-second timer when first player finishes
      const finishedCount = this.room.players.filter(p => p.finished).length;
      if (finishedCount === 1) {
        console.log('⏰ First player finished - starting 10-second race end timer');
        setTimeout(() => {
          if (this.room.raceActive) {
            this.endRace();
          }
        }, 10000);
      }
    }
  }

  private async endRace() {
    this.room.raceActive = false;

    // Calculate final results for finished players
    const finishedPlayers = this.room.players
      .filter(p => p.finished)
      .sort((a, b) => (a.finishTime || Infinity) - (b.finishTime || Infinity));

    this.room.results = finishedPlayers.map((player, index) => ({
      placement: index + 1,
      username: player.username,
      wpm: player.wpm || 0,
      accuracy: player.accuracy || 0,
      finishTime: player.finishTime || 0,
      isNPC: player.isNPC || false
    }));

    // Award XP to ALL participants (finished and unfinished)
    const allRealPlayers = this.room.players.filter(p => !p.isNPC);
    for (const player of allRealPlayers) {
      if (!player.finished) {
        // Award XP to unfinished players based on their progress
        try {
          const user = await storage.getUserByUsername(player.username);
          if (user) {
            console.log(`🎯 Quick Race - Awarding XP for unfinished player: ${player.username}`);
            
            // Calculate position (finished players get their actual position, unfinished get last place)
            const finishedCount = finishedPlayers.length;
            const position = finishedCount + 1; // Unfinished players are placed after all finished players
            
            // Calculate XP based on actual progress + base reward
            const totalCharacters = this.room.racePrompt.length;
            const charactersTyped = Math.round(((player.progress || 0) / 100) * totalCharacters);
            const positionMultiplier = position === 1 ? 1.0 : position === 2 ? 0.5 : position === 3 ? 0.33 : 0.25;
            const baseXP = 8; // Base participation reward
            const xpGained = Math.round(baseXP + (charactersTyped * positionMultiplier));
            
            // Update XP
            await storage.updateUserXp(user.id, xpGained);
            
            // Update race stats including faction XP using StatsService
            const { StatsService } = await import('./stats-service');
            await StatsService.updatePlayerStats(user.id, {
              wpm: player.wpm || 0,
              accuracy: player.accuracy || 0,
              position: position,
              totalPlayers: allRealPlayers.length,
              faction: user.current_faction || 'd6',
              charactersTyped: charactersTyped,
              xpGained: xpGained
            });
            
            console.log(`💫 ${player.username} earned ${xpGained} XP (position ${position}, unfinished)`);
          }
        } catch (error) {
          console.error(`Error updating unfinished player stats for ${player.username}:`, error);
        }
      }
    }

    this.io.emit('race-completed', { results: this.room.results });

    console.log(`🏁 Quick race ended with ${finishedPlayers.length} finishers, ${allRealPlayers.length - finishedPlayers.length} unfinished`);

    // Clear room after a delay to show results
    setTimeout(() => {
      this.resetRoom();
    }, 10000); // 10 seconds to view results
  }

  private resetRoom() {
    // Remove NPCs, keep real players
    this.room.players = this.room.players.filter(p => !p.isNPC);
    this.room.players.forEach(p => {
      p.isReady = false;
      p.progress = 0;
      p.finished = false;
      p.finishTime = undefined;
    });

    this.room.raceActive = false;
    this.room.racePrompt = '';
    this.room.countdown = 0;
    this.room.results = [];

    this.broadcastPlayersUpdate();
  }

  private broadcastPlayersUpdate() {
    // Emit both events to match client expectations
    this.io.emit('players-update', this.room.players.map(p => ({
      username: p.username,
      faction: p.faction,
      isReady: p.isReady,
      chickenName: p.chickenName,
      chickenType: p.chickenType,
      jockeyType: p.jockeyType,
      isNPC: p.isNPC
    })));

    // Also emit race-state that client is listening for
    this.io.emit('race-state', {
      players: this.room.players.map(p => ({
        id: p.socketId,
        username: p.username,
        faction: p.faction,
        progress: p.progress || 0,
        wpm: p.wpm || 0,
        accuracy: p.accuracy || 0,
        isFinished: p.finished || false,
        finishTime: p.finishTime,
        isNPC: p.isNPC || false
      })),
      raceText: this.room.racePrompt,
      raceActive: this.room.raceActive,
      raceFinished: false
    });
  }

  getRoomInfo() {
    return {
      playerCount: this.room.players.length,
      raceActive: this.room.raceActive,
      countdown: this.room.countdown
    };
  }
}

export function setupQuickRaceSocket(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    path: '/quick-race-socket'
  });

  const quickRaceManager = new QuickRaceManager(io);

  io.use(async (socket, next) => {
    try {
      // Allow both authenticated users and guests
      const req = socket.request as any;
      if (req.user) {
        socket.data.user = req.user;
      } else {
        // Guest user - will be handled in connection handler
        socket.data.user = null;
      }
      next();
    } catch (error) {
      next();
    }
  });

  io.on('connection', async (socket) => {
    console.log(`🔌 Quick race player connected: ${socket.id}`);

    try {
      const user = socket.data.user;
      let userData;

      if (user?.claims?.sub) {
        // Authenticated user
        userData = await storage.getUser(user.claims.sub);
        if (!userData) {
          socket.disconnect();
          return;
        }
        console.log(`🔐 Quick race auth: ${userData.username}`);
      } else {
        // Guest user
        const guestId = `Guest${Math.floor(Math.random() * 10000)}`;
        userData = {
          username: guestId,
          chicken_name: 'Guest Chicken',
          chicken_type: 'white',
          jockey_type: 'steve',
          current_faction: 'd6' // Default faction for guests
        };
        console.log(`👤 Quick race guest: ${guestId}`);
      }

      socket.emit('authenticated');
      
      // Handle join-quick-race event that client emits
      socket.on('join-quick-race', () => {
        quickRaceManager.addPlayer(socket.id, userData);
      });

      socket.on('toggle-ready', () => {
        quickRaceManager.togglePlayerReady(socket.id);
      });

      socket.on('start-countdown', () => {
        quickRaceManager.startCountdown();
      });

      socket.on('player-progress', ({ progress, wpm, accuracy }) => {
        quickRaceManager.updatePlayerProgress(socket.id, progress, wpm, accuracy);
      });

      socket.on('finish-race', ({ finalWpm, finalAccuracy }) => {
        quickRaceManager.completePlayerRace(socket.id, finalWpm, finalAccuracy);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Quick race player disconnected: ${userData.username}`);
        quickRaceManager.removePlayer(socket.id);
      });

    } catch (error) {
      console.error('Quick race socket error:', error);
      socket.disconnect();
    }
  });

  console.log('🚀 Quick Race Socket.IO server initialized on /quick-race-socket');
  return io;
}