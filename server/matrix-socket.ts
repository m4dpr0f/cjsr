import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { artOfWarService } from './art-of-war-service';
import { storage } from './storage';
import { discordService } from './discord-service';
import { RealMatrixClient } from './matrix/real-matrix-client';

interface MatrixPlayer {
  id: string;
  userId: number;
  username: string;
  faction: string;
  chickenName: string;
  chickenType: string;
  jockeyType: string;
  isReady: boolean;
  roomId?: string;
  progress?: number;
  wpm?: number;
  accuracy?: number;
  finished?: boolean;
  finishTime?: number;
}

interface MatrixRace {
  id: string;
  prompt: string;
  startTime: number;
  players: Map<string, MatrixPlayer>;
  isActive: boolean;
  endTimer?: NodeJS.Timeout;
  firstFinishTime?: number;
}

export class MatrixSocketManager {
  private io: SocketIOServer;
  private currentRace: MatrixRace | null = null;
  private connectedPlayers: Map<string, MatrixPlayer> = new Map();

  constructor(httpServer: HttpServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      },
      path: '/matrix-socket'
    });

    this.setupEventHandlers();
    console.log('🔌 Matrix Socket.IO server initialized');
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔌 Matrix player connected: ${socket.id}`);

      // Handle leaderboard requests
      socket.on('request_leaderboard', async () => {
        try {
          const leaderboardData = await storage.getLeaderboard();
          socket.emit('leaderboard_data', leaderboardData);
        } catch (error) {
          console.error('Failed to fetch leaderboard:', error);
          socket.emit('leaderboard_error', { message: 'Failed to fetch leaderboard' });
        }
      });

      // Handle faction stats requests
      socket.on('request_faction_stats', async () => {
        try {
          const factionStats = await storage.getFactionStats();
          socket.emit('faction_stats_data', factionStats);
        } catch (error) {
          console.error('Failed to fetch faction stats:', error);
          socket.emit('faction_stats_error', { message: 'Failed to fetch faction stats' });
        }
      });

      socket.on('authenticate', async (data) => {
        try {
          const { userId, username } = data;
          console.log(`🔐 Matrix auth: ${username}`);
          console.log(`👥 Current connected players: ${this.connectedPlayers.size}`);
          
          const user = await storage.getUser(userId);
          if (user && user.username === username) {
            // Get user stats to get faction data
            const playerStats = await storage.getUserStats(userId);
            
            console.log(`🔍 Matrix auth user data:`, { 
              username: user.username, 
              chicken_name: user.chicken_name,
              chicken_type: user.chicken_type, 
              jockey_type: user.jockey_type,
              current_faction: playerStats?.current_faction
            });
            
            // Remove any existing player with the same username (handle reconnections)
            console.log(`🔍 Checking for duplicates of username: ${user.username}`);
            this.removePlayerByUsername(user.username);
            
            const player: MatrixPlayer = {
              id: socket.id,
              userId: user.id,
              username: user.username,
              faction: playerStats?.current_faction || 'd4',
              chickenName: user.chicken_name,
              chickenType: user.chicken_type,
              jockeyType: user.jockey_type,
              isReady: false,
              roomId: 'matrix-federation-room'
            };
            
            this.connectedPlayers.set(socket.id, player);
            
            socket.emit('authenticated', {
              success: true,
              player: player
            });
            
            this.broadcastPlayerList();
            console.log(`✅ Matrix authenticated: ${username}`);
          } else {
            socket.emit('auth_error', { message: 'Authentication failed' });
          }
        } catch (error) {
          console.error('Matrix auth error:', error);
          socket.emit('auth_error', { message: 'Authentication failed' });
        }
      });

      socket.on('ready_toggle', () => {
        const player = this.connectedPlayers.get(socket.id);
        if (player) {
          player.isReady = !player.isReady;
          console.log(`🎯 ${player.username} is ${player.isReady ? 'READY' : 'NOT READY'}`);
          
          this.broadcastPlayerList();
          this.checkCanStartRace();
        }
      });

      socket.on('start_race', () => {
        const readyPlayers = Array.from(this.connectedPlayers.values()).filter(p => p.isReady);
        if (readyPlayers.length >= 2) {
          this.startNewRace();
        }
      });

      socket.on('race_progress', (data) => {
        const player = this.connectedPlayers.get(socket.id);
        if (player && this.currentRace?.isActive) {
          player.progress = data.progress;
          player.wpm = data.wpm;
          player.accuracy = data.accuracy;
          
          this.io.emit('player_progress', {
            username: player.username,
            progress: data.progress,
            wpm: data.wpm,
            accuracy: data.accuracy
          });
        }
      });

      socket.on('race_complete', async (data) => {
        const player = this.connectedPlayers.get(socket.id);
        if (player && this.currentRace?.isActive && !player.finished) {
          player.finished = true;
          player.finishTime = Date.now();
          player.wpm = data.finalWpm;
          player.accuracy = data.finalAccuracy;
          
          console.log(`🏆 ${player.username} finished: ${data.finalWpm} WPM`);
          
          // Check if this is the first player to finish
          const finishedPlayers = Array.from(this.currentRace.players.values()).filter(p => p.finished);
          if (finishedPlayers.length === 1 && !this.currentRace.firstFinishTime) {
            // First player finished - end race immediately for fair placement
            this.currentRace.firstFinishTime = Date.now();
            console.log('🏁 First player finished! Ending race immediately for fair placement...');
            
            // End race with a shorter delay to catch near-completions
            setTimeout(async () => {
              if (this.currentRace?.isActive) {
                await this.endRaceWithCurrentProgress();
              }
            }, 3000); // Reduced to 3 seconds to catch near-completions
            
            // Notify all players that race is ending
            this.io.emit('race_ending', { 
              firstFinisher: player.username,
              message: 'Race ending - final placements being calculated!'
            });
          }
          
          // Post individual finish result immediately  
          await this.postIndividualFinish(player);
          
          this.io.emit('player_finished', {
            username: player.username,
            finalWpm: data.finalWpm,
            finalAccuracy: data.finalAccuracy
          });
          
          await this.checkRaceComplete();
        }
      });

      socket.on('disconnect', () => {
        const player = this.connectedPlayers.get(socket.id);
        if (player) {
          console.log(`🔌 Matrix player disconnected: ${player.username}`);
          this.connectedPlayers.delete(socket.id);
          
          // Remove from active race if they were participating
          if (this.currentRace && this.currentRace.isActive) {
            this.currentRace.players.delete(socket.id);
            console.log(`🏃 Removed ${player.username} from active race`);
            this.checkRaceComplete();
          }
          
          this.broadcastPlayerList();
        }
      });
    });
  }

  private broadcastPlayerList() {
    // Only broadcast players who are actively in the Matrix race room
    const matrixRoomPlayers = Array.from(this.connectedPlayers.values()).filter(player => 
      player.roomId === 'matrix-federation-room' // Only players in Matrix room
    );
    const readyCount = matrixRoomPlayers.filter(p => p.isReady).length;
    
    this.io.emit('player_list_update', {
      players: matrixRoomPlayers.map(p => ({
        username: p.username,
        faction: p.faction,
        chickenName: p.chickenName,
        chickenType: p.chickenType,
        jockeyType: p.jockeyType,
        isReady: p.isReady
      })),
      readyCount,
      canStart: readyCount >= 2
    });
  }

  private checkCanStartRace() {
    const matrixRoomPlayers = Array.from(this.connectedPlayers.values()).filter(player => 
      player.roomId === 'matrix-federation-room'
    );
    const readyCount = matrixRoomPlayers.filter(p => p.isReady).length;
    this.io.emit('can_start_update', { canStart: readyCount >= 2, readyCount });
  }

  private removePlayerByUsername(username: string) {
    // Find and remove any existing player with this username
    const playersToRemove: string[] = [];
    
    console.log(`🔍 Looking for existing players with username: ${username}`);
    console.log(`🔍 Total connected players: ${this.connectedPlayers.size}`);
    
    this.connectedPlayers.forEach((player, socketId) => {
      console.log(`🔍 Checking player: ${player.username} (${socketId})`);
      if (player.username === username) {
        console.log(`🎯 Found duplicate player: ${username} (${socketId})`);
        playersToRemove.push(socketId);
      }
    });
    
    console.log(`🔍 Players to remove: ${playersToRemove.length}`);
    
    playersToRemove.forEach(socketId => {
      console.log(`🧹 Removing duplicate player: ${username} (${socketId})`);
      this.connectedPlayers.delete(socketId);
      
      // Also remove from active race if they were in one
      if (this.currentRace?.isActive) {
        this.currentRace.players.delete(socketId);
      }
    });
  }

  private startNewRace() {
    const prompt = artOfWarService.getRandomPassage();
    const raceId = Math.random().toString(36).substr(2, 9);
    
    // First emit countdown start
    this.io.emit('countdown_started', { countdown: 3 });
    
    // Start 3-second countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
      countdown--;
      this.io.emit('countdown_update', { countdown });
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        
        // Create the actual race after countdown
        this.currentRace = {
          id: raceId,
          prompt: prompt.text,
          startTime: Date.now(),
          players: new Map(),
          isActive: true
        };

        // Add ready players to race
        this.connectedPlayers.forEach(player => {
          if (player.isReady) {
            player.progress = 0;
            player.finished = false;
            this.currentRace!.players.set(player.id, player);
          }
        });

        console.log(`🏁 Matrix race started: ${this.currentRace.players.size} players`);
        
        this.io.emit('race_started', {
          raceId: this.currentRace.id,
          prompt: this.currentRace.prompt,
          startTime: this.currentRace.startTime
        });
      }
    }, 1000);
  }

  private async checkRaceComplete() {
    if (!this.currentRace) return;
    
    const racePlayers = Array.from(this.currentRace.players.values());
    const finishedPlayers = racePlayers.filter(p => p.finished);
    
    if (finishedPlayers.length === racePlayers.length) {
      // All players finished - clear timer and end race
      if (this.currentRace.endTimer) {
        clearTimeout(this.currentRace.endTimer);
        this.currentRace.endTimer = undefined;
      }
      
      await this.finishRaceWithResults();
    }
  }

  private async endRaceWithCurrentProgress() {
    if (!this.currentRace?.isActive) return;
    
    console.log('🏁 Ending race immediately - calculating fair placement based on current progress');
    
    // Clear any existing timer
    if (this.currentRace.endTimer) {
      clearTimeout(this.currentRace.endTimer);
      this.currentRace.endTimer = undefined;
    }
    
    await this.finishRaceWithFairPlacement();
  }

  private async forceEndRace() {
    if (!this.currentRace?.isActive) return;
    
    console.log('⏰ Force ending Matrix race due to timer');
    
    // Clear the timer
    if (this.currentRace.endTimer) {
      clearTimeout(this.currentRace.endTimer);
      this.currentRace.endTimer = undefined;
    }
    
    await this.finishRaceWithResults();
  }

  private async finishRaceWithFairPlacement() {
    if (!this.currentRace) return;
    
    console.log('🏁 Calculating fair placement based on current progress...');
    
    // Get all players and calculate placement based on progress
    const racePlayers = Array.from(this.currentRace.players.values());
    const finishedPlayers = racePlayers.filter(p => p.finished);
    const unfinishedPlayers = racePlayers.filter(p => !p.finished);
    
    // Sort finished players by finish time (normal placement)
    const finishedResults = finishedPlayers
      .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0))
      .map((player, index) => ({
        position: index + 1,
        username: player.username,
        wpm: player.wpm || 0,
        accuracy: player.accuracy || 0,
        finishTime: player.finishTime || 0,
        finished: true
      }));
    
    // Sort unfinished players by current progress (higher progress = better placement)
    const unfinishedResults = unfinishedPlayers
      .sort((a, b) => (b.progress || 0) - (a.progress || 0))
      .map((player, index) => ({
        position: finishedResults.length + index + 1,
        username: player.username,
        wpm: player.wpm || 0,
        accuracy: player.accuracy || 0,
        finishTime: 0,
        finished: false,
        progress: player.progress || 0
      }));
    
    const results = [...finishedResults, ...unfinishedResults];

    // Award XP and update player stats - get actual XP values awarded
    const xpResults = await this.awardXpAndUpdateStats(results);

    // Add actual XP earned to results
    const resultsWithXp = results.map(result => ({
      ...result,
      xpEarned: xpResults.find(xp => xp.username === result.username)?.xpEarned || 0
    }));

    this.io.emit('race_complete', { results: resultsWithXp });
    
    // Emit multiple race ended events to ensure all players clear their text
    this.io.emit('matrix:race_ended', { message: 'Race completed - calculating final results' });
    this.io.emit('race_ended', { message: 'Race completed - text fields clearing' });
    this.io.emit('clear_text', { raceComplete: true });
    
    // Post final summary to Discord and Element
    await this.postFinalRaceSummary(results);
    
    this.currentRace.isActive = false;
    console.log(`🏁 Matrix race completed with fair placement - ${finishedResults.length} finished, ${unfinishedResults.length} placed by progress`);
  }

  private async finishRaceWithResults() {
    if (!this.currentRace) return;
    
    // Race is complete, calculate final results and award XP
    const racePlayers = Array.from(this.currentRace.players.values());
    const finishedPlayers = racePlayers.filter(p => p.finished);
    const results = finishedPlayers
      .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0))
      .map((player, index) => ({
        position: index + 1,
        username: player.username,
        wpm: player.wpm || 0,
        accuracy: player.accuracy || 0,
        finishTime: player.finishTime || 0
      }));

    // Award XP and update player stats - get actual XP values awarded
    const xpResults = await this.awardXpAndUpdateStats(results);

    // Add actual XP earned to results
    const resultsWithXp = results.map(result => ({
      ...result,
      xpEarned: xpResults.find(xp => xp.username === result.username)?.xpEarned || 0
    }));

    this.io.emit('race_complete', { results: resultsWithXp });
    
    // Emit multiple race ended events to ensure all players clear their text
    this.io.emit('matrix:race_ended', { message: 'Race completed - calculating final results' });
    this.io.emit('race_ended', { message: 'Race completed - text fields clearing' });
    this.io.emit('clear_text', { raceComplete: true });
    
    // Post final summary to Discord and Element
    await this.postFinalRaceSummary(results);
    
    this.currentRace.isActive = false;
    console.log('🏁 Matrix race completed with XP awarded');
  }

  private async postIndividualFinish(player: any) {
    try {
      
      // Calculate position based on performance ranking, not finish order
      const allPlayers = Array.from(this.currentRace.players.values()).filter(p => p.finished);
      
      // Sort by performance: primary by progress %, secondary by WPM, tertiary by accuracy
      const sortedPlayers = allPlayers.sort((a, b) => {
        // First compare by progress percentage
        const progressDiff = (b.progress || 0) - (a.progress || 0);
        if (Math.abs(progressDiff) > 0.1) return progressDiff;
        
        // If progress is similar, compare by WPM
        const wpmDiff = (b.wpm || 0) - (a.wpm || 0);
        if (Math.abs(wpmDiff) > 0.1) return wpmDiff;
        
        // If WPM is similar, compare by accuracy
        return (b.accuracy || 0) - (a.accuracy || 0);
      });
      
      // Find this player's position in the performance ranking
      const position = sortedPlayers.findIndex(p => p.username === player.username) + 1;
      
      // Calculate XP based on actual characters typed + base reward
      const charactersTyped = player.progress ? Math.round((player.progress / 100) * (this.currentRace.prompt?.length || 67)) : 0;
      const positionMultiplier = position === 1 ? 1.0 : position === 2 ? 0.5 : position === 3 ? 0.33 : 0.25;
      const baseXP = 8; // Base participation reward
      const xpEarned = Math.round(baseXP + (charactersTyped * positionMultiplier));
      
      // Format finish time
      const finishTimeSeconds = (player.finishTime / 1000).toFixed(1);
      
      const finishText = `🏁 **${player.username}** finished ${this.getPositionSuffix(position)}!\n` +
                        `🐔 Faction: ${player.faction || 'Unknown'} | Mount: ${player.chickenName}\n` +
                        `⚡ ${player.wpm} WPM | 🎯 ${player.accuracy}% accuracy\n` +
                        `⏱️ Time: ${finishTimeSeconds}s | 🌟 +${xpEarned} XP`;
      
      // Post to Discord
      try {
        const webhook = discordService.getWebhook();
        if (webhook) {
          await webhook.postRaceCompletion(
            player.username,
            position,
            player.wpm,
            player.accuracy,
            parseFloat(finishTimeSeconds),
            player.faction || 'Unknown',
            xpEarned
          );
        }
      } catch (error) {
        console.error('Discord posting error:', error);
      }
      
      // Post to Element room  
      try {
        const { MatrixAPIClient } = await import('./matrix/matrix-api-client');
        const matrixClient = new MatrixAPIClient();
        await matrixClient.sendMessage('#cjsr:matrix.org', {
          msgtype: 'm.text',
          body: finishText
        });
      } catch (error) {
        console.error('Matrix posting error:', error);
      }

      // Post to Telegram  
      try {
        const { telegramService } = await import('../services/telegram-service');
        await telegramService.postRaceCompletion(
          player.username,
          player.wpm,
          player.accuracy,
          'Matrix Race'
        );
      } catch (telegramError) {
        console.error('Telegram individual finish error:', telegramError);
      }
      
      console.log(`✅ Individual finish posted for ${player.username}`);
    } catch (error) {
      console.error('❌ Failed to post individual finish:', error);
    }
  }

  private async awardXpAndUpdateStats(results: any[]): Promise<any[]> {
    const xpResults: any[] = [];
    try {
      for (const result of results) {
        // Calculate XP based on actual characters typed + base reward
        const player = this.currentRace?.players.get(result.username);
        const totalCharacters = this.currentRace?.prompt?.length || 67;
        
        // For finished players (position 1), they typed the full prompt
        // For unfinished players, use their progress percentage
        let charactersTyped;
        if (result.position === 1) {
          charactersTyped = totalCharacters; // Winner typed full prompt
        } else {
          charactersTyped = player?.progress ? Math.round((player.progress / 100) * totalCharacters) : 0; // No progress = 0 characters typed
        }
        
        const positionMultiplier = result.position === 1 ? 1.0 : result.position === 2 ? 0.5 : result.position === 3 ? 0.33 : 0.25;
        const baseXP = 8; // Base participation reward
        const xpEarned = Math.round(baseXP + (charactersTyped * positionMultiplier));
        
        // Update player stats in database using correct storage methods
        const user = await storage.getUserByUsername(result.username);
        if (user) {
          // Update XP
          await storage.updateUserXp(user.id, xpEarned);
          
          // Update race stats including faction XP
          const { StatsService } = await import('./stats-service');
          await StatsService.updatePlayerStats(user.id, {
            wpm: result.wpm,
            accuracy: result.accuracy,
            position: result.position,
            totalPlayers: results.length,
            faction: user.current_faction || 'd4',
            charactersTyped: charactersTyped,
            xpGained: xpEarned
          });
        }
        
        console.log(`💫 ${result.username} earned ${xpEarned} XP (position ${result.position})`);
        
        // Store the actual XP earned for frontend display
        xpResults.push({
          username: result.username,
          xpEarned: xpEarned
        });
      }
      
      return xpResults;
    } catch (error) {
      console.error('❌ Failed to award XP:', error);
      return xpResults;
    }
  }

  private async postFinalRaceSummary(results: any[]) {
    try {
      // Format results for Discord webhook - it expects specific field names
      const formattedResults = results.map(result => ({
        playerName: result.username, // Fix: use playerName instead of username
        placement: result.position,
        wpm: result.wpm,
        accuracy: result.accuracy,
        raceTime: result.finishTime || 0,
        faction: undefined, // Will add faction support later
        finished: result.finished !== false // Default to true if not explicitly set to false
      }));

      // Post to Discord using postRaceSummary method
      const webhook = discordService.getWebhook();
      if (webhook) {
        await webhook.postRaceSummary(formattedResults, 0);
        console.log('✅ Final race summary posted to Discord');
      }

      // Post to Telegram
      try {
        const { telegramService } = await import('../services/telegram-service');
        await telegramService.postMatrixRaceResults(results);
        console.log('✅ Final race summary posted to Telegram');
      } catch (telegramError) {
        console.error('❌ Failed to post to Telegram:', telegramError);
      }
    } catch (error) {
      console.error('❌ Failed to post final race summary:', error);
    }
  }

  private getPositionSuffix(position: number): string {
    if (position === 1) return '1st';
    if (position === 2) return '2nd'; 
    if (position === 3) return '3rd';
    return `${position}th`;
  }

  // Public method to get Matrix room players for API endpoints
  public getMatrixRoomPlayers(): MatrixPlayer[] {
    // Return all connected Matrix players regardless of specific room ID
    // since we're managing a single Matrix federation race instance
    const matrixRoomPlayers = Array.from(this.connectedPlayers.values());
    console.log(`🎯 Matrix Socket Manager: Found ${matrixRoomPlayers.length} connected players`);
    return matrixRoomPlayers;
  }
}