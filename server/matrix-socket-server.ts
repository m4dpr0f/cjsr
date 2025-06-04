import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';

interface MatrixPlayer {
  username: string;
  userId: number;
  socket: WebSocket;
  isReady: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  placement?: number;
}

interface MatrixRoom {
  id: string;
  players: Map<string, MatrixPlayer>;
  raceActive: boolean;
  raceStartTime?: number;
  prompt: string;
}

export class MatrixSocketServer {
  private wss: WebSocketServer;
  private rooms: Map<string, MatrixRoom> = new Map();

  constructor(httpServer: HttpServer) {
    this.wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/matrix-socket'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 Matrix Socket Server initialized on /matrix-socket');
  }

  private handleConnection(socket: WebSocket, request: any) {
    console.log('🔌 New Matrix socket connection');
    
    let authenticatedPlayer: MatrixPlayer | null = null;

    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'authenticate':
            authenticatedPlayer = await this.handleAuthentication(socket, message);
            break;
            
          case 'join_room':
            if (authenticatedPlayer) {
              this.handleJoinRoom(authenticatedPlayer, message.roomId);
            }
            break;
            
          case 'toggle_ready':
            if (authenticatedPlayer) {
              this.handleToggleReady(authenticatedPlayer, message.roomId, message.isReady);
            }
            break;
            
          case 'start_race':
            if (authenticatedPlayer) {
              this.handleStartRace(message.roomId);
            }
            break;
            
          case 'race_progress':
            if (authenticatedPlayer) {
              this.handleRaceProgress(authenticatedPlayer, message);
            }
            break;
            
          case 'race_complete':
            if (authenticatedPlayer) {
              await this.handleRaceComplete(authenticatedPlayer, message.roomId, message);
            }
            break;
        }
      } catch (error) {
        console.error('Matrix socket message error:', error);
      }
    });

    socket.on('close', () => {
      if (authenticatedPlayer) {
        this.handleDisconnection(authenticatedPlayer);
      }
    });
  }

  private async handleAuthentication(socket: WebSocket, message: any): Promise<MatrixPlayer | null> {
    try {
      const { userId } = message;
      const user = await storage.getUser(userId);
      
      if (user) {
        const player: MatrixPlayer = {
          username: user.username,
          userId: user.id,
          socket,
          isReady: false,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          finished: false
        };
        
        socket.send(JSON.stringify({
          type: 'authenticated',
          username: user.username,
          faction: user.current_faction || 'd4'
        }));
        
        console.log(`✅ Matrix player authenticated: ${user.username}`);
        return player;
      }
    } catch (error) {
      console.error('Matrix authentication error:', error);
    }
    
    socket.send(JSON.stringify({
      type: 'auth_error',
      message: 'Authentication failed'
    }));
    
    return null;
  }

  private handleJoinRoom(player: MatrixPlayer, roomId: string) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        players: new Map(),
        raceActive: false,
        prompt: "In war, the way is to avoid what is strong and to strike at what is weak."
      });
    }
    
    const room = this.rooms.get(roomId)!;
    room.players.set(player.username, player);
    
    console.log(`🏁 ${player.username} joined Matrix room: ${roomId}`);
    
    this.broadcastRoomUpdate(roomId);
  }

  private handleToggleReady(player: MatrixPlayer, roomId: string, isReady: boolean) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    player.isReady = isReady;
    console.log(`🎯 ${player.username} is ${isReady ? 'READY' : 'NOT READY'}`);
    
    this.broadcastRoomUpdate(roomId);
  }

  private handleStartRace(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const readyPlayers = Array.from(room.players.values()).filter(p => p.isReady);
    if (readyPlayers.length < 2) return;
    
    room.raceActive = true;
    room.raceStartTime = Date.now();
    
    // Reset all player states
    readyPlayers.forEach(player => {
      player.progress = 0;
      player.wpm = 0;
      player.accuracy = 100;
      player.finished = false;
      player.placement = undefined;
    });
    
    console.log(`🏁 Matrix race started with ${readyPlayers.length} players`);
    
    this.broadcastToRoom(roomId, {
      type: 'race_started',
      startTime: room.raceStartTime,
      prompt: room.prompt,
      participants: readyPlayers.map(p => p.username)
    });
  }

  private handleRaceProgress(player: MatrixPlayer, message: any) {
    player.progress = message.progress || 0;
    player.wpm = message.wpm || 0;
    player.accuracy = message.accuracy || 100;
    
    // Broadcast progress to other players in the same room
    for (const [roomId, room] of this.rooms) {
      if (room.players.has(player.username)) {
        this.broadcastToRoom(roomId, {
          type: 'player_progress',
          playerName: player.username,
          progress: player.progress,
          wpm: player.wpm,
          accuracy: player.accuracy
        }, [player.username]); // Exclude the sender
        break;
      }
    }
  }

  private async handleRaceComplete(player: MatrixPlayer, roomId: string, message: any) {
    const room = this.rooms.get(roomId);
    if (!room || !room.raceActive) return;
    
    player.finished = true;
    player.wpm = message.wpm || 0;
    player.accuracy = message.accuracy || 100;
    
    // Calculate placement
    const finishedPlayers = Array.from(room.players.values()).filter(p => p.finished);
    player.placement = finishedPlayers.length;
    
    console.log(`🏆 ${player.username} finished in position ${player.placement}`);
    
    this.broadcastToRoom(roomId, {
      type: 'player_finished',
      playerName: player.username,
      placement: player.placement,
      wpm: player.wpm,
      accuracy: player.accuracy
    });
    
    // Check if race is complete
    const readyPlayers = Array.from(room.players.values()).filter(p => p.isReady);
    if (finishedPlayers.length === readyPlayers.length) {
      await this.completeRace(roomId, room);
    }
  }

  private async completeRace(roomId: string, room: MatrixRoom) {
    const results = Array.from(room.players.values())
      .filter(p => p.finished)
      .sort((a, b) => (a.placement || 999) - (b.placement || 999))
      .map(p => ({
        playerName: p.username,
        wpm: p.wpm,
        accuracy: p.accuracy,
        placement: p.placement || 999,
        faction: 'd4' // Default faction
      }));
    
    console.log('🏁 Matrix race complete! Results:', results);
    
    // Broadcast final results
    this.broadcastToRoom(roomId, {
      type: 'race_finished',
      results
    });
    
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
            faction: user.current_faction || 'd4',
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
    room.players.forEach(player => {
      player.isReady = false;
      player.finished = false;
      player.progress = 0;
      player.placement = undefined;
    });
  }

  private handleDisconnection(player: MatrixPlayer) {
    console.log(`🔌 Matrix player disconnected: ${player.username}`);
    
    // Remove player from all rooms
    for (const [roomId, room] of this.rooms) {
      if (room.players.has(player.username)) {
        room.players.delete(player.username);
        this.broadcastRoomUpdate(roomId);
      }
    }
  }

  private broadcastRoomUpdate(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const players = Array.from(room.players.values());
    const readyPlayers = players.filter(p => p.isReady);
    
    this.broadcastToRoom(roomId, {
      type: 'room_update',
      players: players.map(p => ({
        username: p.username,
        isReady: p.isReady,
        progress: p.progress,
        wpm: p.wpm,
        accuracy: p.accuracy
      })),
      readyPlayers: readyPlayers.map(p => p.username),
      canStartRace: readyPlayers.length >= 2,
      raceActive: room.raceActive
    });
  }

  private broadcastToRoom(roomId: string, message: any, excludeUsers: string[] = []) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    const messageStr = JSON.stringify(message);
    
    room.players.forEach((player, username) => {
      if (!excludeUsers.includes(username) && player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(messageStr);
      }
    });
  }
}