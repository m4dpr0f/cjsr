import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';

interface MatrixRaceRoom {
  id: string;
  readyPlayers: Set<string>;
  raceActive: boolean;
  raceStartTime?: number;
  completedPlayers: Map<string, {
    wpm: number;
    accuracy: number;
    finishTime: number;
    placement: number;
    faction: string;
  }>;
}

class SocketManager {
  private wss: WebSocketServer;
  private rooms: Map<string, MatrixRaceRoom> = new Map();
  private userSockets: Map<string, WebSocket> = new Map();

  constructor(httpServer: HttpServer) {
    this.wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/matrix-ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 Matrix WebSocket server initialized');
  }

  private async handleConnection(socket: Socket) {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', async (data) => {
      try {
        const { userId } = data;
        if (userId) {
          const user = await storage.getUser(userId);
          if (user) {
            socket.data.user = user;
            this.userSockets.set(user.username, socket);
            socket.emit('authenticated', { user: user.username });
            console.log(`✅ Socket authenticated: ${user.username}`);
          }
        }
      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('auth_error', { message: 'Authentication failed' });
      }
    });

    // Handle Matrix race room joining
    socket.on('join_matrix_race', (data) => {
      const { roomId } = data;
      if (!socket.data.user) {
        socket.emit('error', { message: 'Must be authenticated to join race' });
        return;
      }

      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          id: roomId,
          readyPlayers: new Set(),
          raceActive: false,
          completedPlayers: new Map()
        });
      }

      console.log(`🏁 ${socket.data.user.username} joined Matrix race room: ${roomId}`);
      
      // Send current room state
      const room = this.rooms.get(roomId)!;
      socket.emit('room_state', {
        readyPlayers: Array.from(room.readyPlayers),
        raceActive: room.raceActive,
        canStartRace: room.readyPlayers.size >= 2
      });
    });

    // Handle ready toggle
    socket.on('toggle_ready', (data) => {
      const { roomId, isReady } = data;
      if (!socket.data.user) {
        socket.emit('error', { message: 'Must be authenticated' });
        return;
      }

      const room = this.rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const username = socket.data.user.username;
      
      if (isReady) {
        room.readyPlayers.add(username);
      } else {
        room.readyPlayers.delete(username);
      }

      console.log(`🎯 ${username} is ${isReady ? 'READY' : 'NOT READY'} in room ${roomId}`);

      // Broadcast to all players in room
      this.io.to(roomId).emit('ready_update', {
        readyPlayers: Array.from(room.readyPlayers),
        canStartRace: room.readyPlayers.size >= 2,
        playerName: username,
        isReady
      });
    });

    // Handle race start
    socket.on('start_race', (data) => {
      const { roomId, raceId } = data;
      const room = this.rooms.get(roomId);
      
      if (!room || room.readyPlayers.size < 2) {
        socket.emit('error', { message: 'Not enough ready players' });
        return;
      }

      room.raceActive = true;
      room.raceStartTime = Date.now();
      room.completedPlayers.clear();

      console.log(`🏁 Race started in room ${roomId} with ${room.readyPlayers.size} players`);

      // Broadcast race start to all ready players
      this.io.to(roomId).emit('race_started', {
        startTime: room.raceStartTime,
        participants: Array.from(room.readyPlayers)
      });
    });

    // Handle race completion
    socket.on('race_complete', async (data) => {
      const { roomId, raceId, wpm, accuracy, faction } = data;
      if (!socket.data.user) return;

      const room = this.rooms.get(roomId);
      if (!room || !room.raceActive) return;

      const username = socket.data.user.username;
      const finishTime = Date.now();
      const placement = room.completedPlayers.size + 1;

      // Record completion
      room.completedPlayers.set(username, {
        wpm,
        accuracy,
        finishTime,
        placement,
        faction
      });

      console.log(`🏆 ${username} finished in position ${placement} with ${wpm} WPM`);

      // Broadcast completion to room
      this.io.to(roomId).emit('player_finished', {
        playerName: username,
        placement,
        wpm,
        accuracy,
        totalFinished: room.completedPlayers.size,
        totalPlayers: room.readyPlayers.size
      });

      // Check if race is complete
      if (room.completedPlayers.size === room.readyPlayers.size) {
        await this.handleRaceComplete(roomId, raceId, room);
      }
    });

    // Handle progress updates
    socket.on('race_progress', (data) => {
      const { roomId, progress, wpm, accuracy } = data;
      if (!socket.data.user) return;

      socket.to(roomId).emit('player_progress', {
        playerName: socket.data.user.username,
        progress,
        wpm,
        accuracy
      });
    });

    socket.on('disconnect', () => {
      if (socket.data.user) {
        this.userSockets.delete(socket.data.user.username);
        console.log(`🔌 Socket disconnected: ${socket.data.user.username}`);
      }
    });
  }

  private async handleRaceComplete(roomId: string, raceId: string, room: MatrixRaceRoom) {
    const results = Array.from(room.completedPlayers.entries()).map(([playerName, data]) => ({
      playerName,
      ...data
    }));

    console.log('🏁 Matrix race complete! Results:', results);

    // Broadcast final results
    this.io.to(roomId).emit('race_finished', { results });

    // Post to Discord and Element
    try {
      const { realMatrixClient } = await import('./matrix/real-matrix-client');
      await realMatrixClient.sendFinalRaceResults(roomId, results);
      
      const { DiscordWebhook } = await import('./discord-webhook');
      const webhook = new DiscordWebhook();
      await webhook.sendRaceResults(results);
      
      console.log('✅ Matrix race results posted to Discord and Element');
    } catch (error) {
      console.error('❌ Failed to post Matrix race results:', error);
    }

    // Update player stats
    for (const result of results) {
      try {
        const user = await storage.getUserByUsername(result.playerName);
        if (user) {
          const { XPCalculator } = await import('./xp-calculator');
          const xpGained = XPCalculator.calculateXP({
            wpm: result.wpm,
            accuracy: result.accuracy,
            position: result.placement,
            totalPlayers: results.length,
            charactersTyped: XPCalculator.getCharacterCount('matrix'),
            isCampaignRace: false
          });
          
          const { StatsService } = await import('./stats-service');
          await StatsService.updatePlayerStats(user.id, {
            wpm: result.wpm,
            accuracy: result.accuracy,
            position: result.placement,
            totalPlayers: results.length,
            faction: result.faction || 'd4',
            xpGained
          });
          
          console.log(`Updated stats for ${result.playerName}: ${xpGained} XP, position ${result.placement}`);
        }
      } catch (error) {
        console.error(`Failed to update stats for ${result.playerName}:`, error);
      }
    }

    // Reset room
    room.raceActive = false;
    room.readyPlayers.clear();
    room.completedPlayers.clear();
  }

  public getRoomReadyPlayers(roomId: string): string[] {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.readyPlayers) : [];
  }
}

export default SocketManager;