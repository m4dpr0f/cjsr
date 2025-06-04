import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from './storage';

interface SocketClient {
  id: string;
  socket: WebSocket;
  userId?: number;
  username?: string;
  rooms: Set<string>;
}

export class SimpleSocketIO {
  private wss: WebSocketServer;
  private clients: Map<string, SocketClient> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  constructor(httpServer: HttpServer) {
    this.wss = new WebSocketServer({ 
      server: httpServer, 
      path: '/matrix-ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    console.log('🔌 Matrix WebSocket server initialized on /matrix-ws');
  }

  private handleConnection(socket: WebSocket, request: any) {
    const clientId = this.generateId();
    const client: SocketClient = {
      id: clientId,
      socket,
      rooms: new Set()
    };
    
    this.clients.set(clientId, client);
    console.log(`🔌 Matrix WebSocket client connected: ${clientId}`);

    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`📨 Message from ${clientId}:`, message);
        await this.handleMessage(client, message);
      } catch (error) {
        console.error('Matrix WebSocket message error:', error);
      }
    });

    socket.on('close', () => {
      this.handleDisconnection(client);
    });

    socket.on('error', (error) => {
      console.error(`❌ Matrix WebSocket error for ${clientId}:`, error);
    });
  }

  private async handleMessage(client: SocketClient, message: any) {
    console.log(`📨 Matrix message received:`, message);
    const { event, data } = message;

    switch (event) {
      case 'authenticate':
        await this.handleAuthentication(client, data);
        break;
      
      case 'join':
        this.handleJoinRoom(client, data.room);
        break;
      
      case 'matrix:ready':
        await this.handleMatrixReady(client, data);
        break;
      
      case 'matrix:start':
        this.handleMatrixStart(client, data);
        break;
      
      case 'matrix:progress':
        this.handleMatrixProgress(client, data);
        break;
      
      case 'matrix:complete':
        await this.handleMatrixComplete(client, data);
        break;
    }
  }

  private async handleAuthentication(client: SocketClient, data: any) {
    try {
      console.log(`🔐 Matrix auth attempt - userId: ${data.userId}, username: ${data.username}`);
      
      const user = await storage.getUser(data.userId);
      if (user && user.username === data.username) {
        client.userId = user.id;
        client.username = user.username;
        
        this.emit(client, 'authenticated', {
          userId: user.id,
          username: user.username,
          faction: 'd4'
        });
        
        console.log(`✅ Matrix authenticated: ${user.username}`);
      } else {
        console.log(`❌ Matrix auth failed - user not found or mismatch`);
        this.emit(client, 'auth_error', { message: 'User not found' });
      }
    } catch (error) {
      console.error('Matrix auth error:', error);
      this.emit(client, 'auth_error', { message: 'Authentication failed' });
    }
  }

  private handleJoinRoom(client: SocketClient, roomId: string) {
    if (!client.username) return;
    
    client.rooms.add(roomId);
    
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    
    this.rooms.get(roomId)!.add(client.id);
    
    console.log(`🏁 ${client.username} joined room: ${roomId}`);
    
    // Broadcast room update
    this.broadcastToRoom(roomId, 'room:update', {
      players: this.getRoomPlayers(roomId)
    });
  }

  private async handleMatrixReady(client: SocketClient, data: any) {
    if (!client.username) return;
    
    // Store ready state (in a real implementation, this would be in a database or memory store)
    console.log(`🎯 ${client.username} is ${data.isReady ? 'READY' : 'NOT READY'}`);
    
    this.broadcastToRoom(data.roomId, 'matrix:ready_update', {
      username: client.username,
      isReady: data.isReady,
      readyPlayers: this.getRoomPlayers(data.roomId).filter(p => p.isReady)
    });
  }

  private handleMatrixStart(client: SocketClient, data: any) {
    if (!client.username) return;
    
    console.log(`🏁 Matrix race started by ${client.username}`);
    
    this.broadcastToRoom(data.roomId, 'matrix:race_started', {
      startTime: Date.now(),
      prompt: "In war, the way is to avoid what is strong and to strike at what is weak.",
      startedBy: client.username
    });
  }

  private handleMatrixProgress(client: SocketClient, data: any) {
    if (!client.username) return;
    
    this.broadcastToRoom(data.roomId, 'matrix:player_progress', {
      username: client.username,
      progress: data.progress,
      wpm: data.wpm,
      accuracy: data.accuracy
    }, [client.id]); // Exclude sender
  }

  private async handleMatrixComplete(client: SocketClient, data: any) {
    if (!client.username || !client.userId) return;
    
    console.log(`🏆 ${client.username} completed Matrix race: ${data.wpm} WPM, ${data.accuracy}% accuracy`);
    
    // Update player stats
    try {
      const user = await storage.getUser(client.userId);
      if (user) {
        const { XPCalculator } = await import('./xp-calculator');
        const xpGained = XPCalculator.calculateXP({
          wpm: data.wpm,
          accuracy: data.accuracy,
          position: 1, // Solo completion counts as 1st place
          totalPlayers: 1,
          charactersTyped: XPCalculator.getCharacterCount('matrix'),
          isCampaignRace: false
        });
        
        const { StatsService } = await import('./stats-service');
        await StatsService.updatePlayerStats(user.id, {
          wpm: data.wpm,
          accuracy: data.accuracy,
          position: 1,
          totalPlayers: 1,
          faction: 'd4', // Default faction for now
          xpGained
        });
        
        console.log(`Updated stats for ${client.username}: ${xpGained} XP`);
      }
    } catch (error) {
      console.error('Failed to update Matrix race stats:', error);
    }
    
    // Post to Discord and Element
    try {
      const results = [{
        playerName: client.username,
        wpm: data.wpm,
        accuracy: data.accuracy,
        placement: 1,
        faction: 'd4'
      }];
      
      const { realMatrixClient } = await import('./matrix/real-matrix-client');
      await realMatrixClient.sendFinalRaceResults(data.roomId, results);
      
      const { DiscordWebhook } = await import('./discord-webhook');
      const webhook = new DiscordWebhook();
      await webhook.sendRaceResults(results);
      
      console.log('✅ Matrix race results posted to Discord and Element');
    } catch (error) {
      console.error('❌ Failed to post Matrix race results:', error);
    }
    
    this.broadcastToRoom(data.roomId, 'matrix:race_complete', {
      username: client.username,
      wpm: data.wpm,
      accuracy: data.accuracy,
      placement: 1
    });
  }

  private getRoomPlayers(roomId: string) {
    const clientIds = this.rooms.get(roomId) || new Set();
    return Array.from(clientIds)
      .map(id => this.clients.get(id))
      .filter(client => client && client.username)
      .map(client => ({
        username: client!.username,
        isReady: false // In a real implementation, this would track actual ready state
      }));
  }

  private broadcastToRoom(roomId: string, event: string, data: any, excludeIds: string[] = []) {
    const clientIds = this.rooms.get(roomId) || new Set();
    
    clientIds.forEach(clientId => {
      if (!excludeIds.includes(clientId)) {
        const client = this.clients.get(clientId);
        if (client) {
          this.emit(client, event, data);
        }
      }
    });
  }

  private emit(client: SocketClient, event: string, data: any) {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify({ event, data }));
    }
  }

  private handleDisconnection(client: SocketClient) {
    console.log(`🔌 Socket.IO client disconnected: ${client.username || client.id}`);
    
    // Remove from all rooms
    client.rooms.forEach(roomId => {
      const room = this.rooms.get(roomId);
      if (room) {
        room.delete(client.id);
        
        // Broadcast room update
        this.broadcastToRoom(roomId, 'room:update', {
          players: this.getRoomPlayers(roomId)
        });
      }
    });
    
    this.clients.delete(client.id);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}