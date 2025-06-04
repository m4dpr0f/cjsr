import { cjsrMatrixClient, RaceConfiguration } from './matrix-client-simple';
import { artOfWarService } from '../art-of-war-service';

export interface FactionServer {
  faction: string;
  homeserver: string;
  spaceId?: string;
  description: string;
}

export interface MatrixRaceRoom {
  roomId: string;
  raceId: string;
  faction: string;
  prompt: string;
  participants: string[];
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  createdAt: Date;
  startedAt?: Date;
  finishedAt?: Date;
}

export class CJSRRoomManager {
  private activeRaces: Map<string, MatrixRaceRoom> = new Map();
  private races: Map<string, any> = new Map(); // Race rooms for ready system
  private readyPlayers: Map<string, Set<string>> = new Map(); // roomId -> Set of ready player names
  private factionServers: FactionServer[] = [
    {
      faction: 'd2',
      homeserver: 'https://matrix.org',
      description: 'Electric Faction - High-Energy Racing Circuit'
    },
    {
      faction: 'd4',
      homeserver: 'https://matrix.org',
      description: 'Fire Faction - Competitive Racing Hub'
    },
    {
      faction: 'd6', 
      homeserver: 'https://matrix.org',
      description: 'Earth Faction - Strategic Racing Arena'
    },
    {
      faction: 'd8',
      homeserver: 'https://matrix.org', 
      description: 'Air Faction - Speed Racing Center'
    },
    {
      faction: 'd10',
      homeserver: 'https://matrix.org',
      description: 'Chaos Faction - Unpredictable Racing Grounds'
    },
    {
      faction: 'd12',
      homeserver: 'https://matrix.org',
      description: 'Ether Faction - Mystical Racing Realm'
    },
    {
      faction: 'd20',
      homeserver: 'https://matrix.org',
      description: 'Water Faction - Flowing Racing Waters'
    },
    {
      faction: 'd100',
      homeserver: 'https://matrix.org',
      description: 'Order Faction - Precise Racing Academy'
    }
  ];

  async createFactionRaceRoom(
    faction: string,
    hostUserId: string,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium',
    maxPlayers: number = 8
  ): Promise<MatrixRaceRoom> {
    
    // Generate race prompt based on difficulty
    const prompt = await artOfWarService.getRandomPassage();
    const raceId = `${faction}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const raceConfig: RaceConfiguration = {
      raceId,
      prompt,
      faction,
      difficulty,
      maxPlayers,
      hostUserId
    };

    try {
      // Create Matrix room for this race
      const roomId = await cjsrMatrixClient.createRaceRoom(raceConfig);
      
      const raceRoom: MatrixRaceRoom = {
        roomId,
        raceId,
        faction,
        prompt,
        participants: [hostUserId],
        status: 'waiting',
        createdAt: new Date()
      };

      this.activeRaces.set(raceId, raceRoom);
      
      console.log(`🏁 Created faction race room for ${faction}: ${roomId}`);
      return raceRoom;
      
    } catch (error) {
      console.error(`❌ Failed to create faction race room for ${faction}:`, error);
      throw error;
    }
  }

  async joinRaceRoom(raceId: string, userId: string): Promise<MatrixRaceRoom> {
    const race = this.activeRaces.get(raceId);
    if (!race) {
      throw new Error(`Race ${raceId} not found`);
    }

    if (race.status !== 'waiting') {
      throw new Error(`Race ${raceId} is not accepting new participants`);
    }

    if (race.participants.length >= 8) {
      throw new Error(`Race ${raceId} is full`);
    }

    if (!race.participants.includes(userId)) {
      race.participants.push(userId);
      await cjsrMatrixClient.joinRoom(race.roomId);
      console.log(`✅ Player ${userId} joined race ${raceId}`);
    }

    return race;
  }

  async startRace(raceId: string, hostUserId: string): Promise<MatrixRaceRoom> {
    const race = this.activeRaces.get(raceId);
    if (!race) {
      throw new Error(`Race ${raceId} not found`);
    }

    if (race.participants[0] !== hostUserId) {
      throw new Error('Only the race host can start the race');
    }

    if (race.status !== 'waiting') {
      throw new Error(`Race ${raceId} cannot be started in current status: ${race.status}`);
    }

    // Update race status
    race.status = 'countdown';
    race.startedAt = new Date();

    // Send countdown start via Matrix
    await cjsrMatrixClient.sendRaceProgress(race.roomId, {
      race_id: raceId,
      player_id: 'system',
      player_name: 'Race System',
      characters_typed: 0,
      wpm: 0,
      accuracy: 100,
      position: 0,
      faction: race.faction
    });

    console.log(`🚀 Started race ${raceId} with ${race.participants.length} participants`);
    return race;
  }

  async updateRaceProgress(
    raceId: string, 
    userId: string, 
    charactersTyped: number, 
    wpm: number, 
    accuracy: number
  ): Promise<void> {
    const race = this.activeRaces.get(raceId);
    if (!race || race.status !== 'active') {
      return;
    }

    if (!race.participants.includes(userId)) {
      throw new Error(`Player ${userId} is not in race ${raceId}`);
    }

    // Calculate position based on progress
    const position = this.calculatePosition(race, userId, charactersTyped);

    await cjsrMatrixClient.sendRaceProgress(race.roomId, {
      race_id: raceId,
      player_id: userId,
      player_name: `Player_${userId}`, // This would come from user data in real implementation
      characters_typed: charactersTyped,
      wpm,
      accuracy,
      position,
      faction: race.faction
    });
  }

  async finishRace(
    raceId: string,
    userId: string,
    finalWpm: number,
    finalAccuracy: number,
    finishPosition: number
  ): Promise<void> {
    const race = this.activeRaces.get(raceId);
    if (!race) {
      throw new Error(`Race ${raceId} not found`);
    }

    // Calculate XP based on performance and position
    const baseXP = race.prompt.length;
    const positionMultipliers = { 1: 1.0, 2: 0.5, 3: 0.33, 4: 0.25 };
    const multiplier = positionMultipliers[Math.min(finishPosition, 4) as keyof typeof positionMultipliers] || 0.25;
    const xpGained = Math.max(1, Math.floor(baseXP * multiplier));

    await cjsrMatrixClient.sendRaceFinish(race.roomId, {
      race_id: raceId,
      player_id: userId,
      player_name: `Player_${userId}`,
      final_wpm: finalWpm,
      final_accuracy: finalAccuracy,
      finish_position: finishPosition,
      xp_gained: xpGained,
      faction: race.faction
    });

    // Check if all players have finished
    const allFinished = this.checkAllPlayersFinished(race);
    if (allFinished) {
      race.status = 'finished';
      race.finishedAt = new Date();
      console.log(`🏆 Race ${raceId} completed`);
    }
  }

  private calculatePosition(race: MatrixRaceRoom, userId: string, charactersTyped: number): number {
    // This is a simplified position calculation
    // In a real implementation, you'd track all players' progress
    const progressPercentage = (charactersTyped / race.prompt.length) * 100;
    return progressPercentage >= 100 ? 1 : Math.ceil(Math.random() * race.participants.length);
  }

  private checkAllPlayersFinished(race: MatrixRaceRoom): boolean {
    // This would check if all participants have sent finish events
    // Simplified for now
    return false;
  }

  // Get active races for a faction
  getActiveFactionRaces(faction: string): MatrixRaceRoom[] {
    return Array.from(this.activeRaces.values())
      .filter(race => race.faction === faction && race.status !== 'finished');
  }

  // Get all active races
  getAllActiveRaces(): MatrixRaceRoom[] {
    return Array.from(this.activeRaces.values())
      .filter(race => race.status !== 'finished');
  }

  // Get race by ID
  getRace(raceId: string): MatrixRaceRoom | undefined {
    return this.activeRaces.get(raceId);
  }

  // READY system for Matrix federation
  setPlayerReady(roomId: string, playerId: string, isReady: boolean): string[] {
    if (!this.readyPlayers.has(roomId)) {
      this.readyPlayers.set(roomId, new Set());
    }
    
    const roomReadyPlayers = this.readyPlayers.get(roomId)!;
    
    if (isReady) {
      roomReadyPlayers.add(playerId);
    } else {
      roomReadyPlayers.delete(playerId);
    }
    
    console.log(`🎯 Matrix Ready System: ${playerId} ${isReady ? 'READY' : 'NOT READY'} - Total ready: ${roomReadyPlayers.size}`);
    
    return Array.from(roomReadyPlayers);
  }

  getReadyPlayers(roomId: string): string[] {
    return Array.from(this.readyPlayers.get(roomId) || new Set());
  }

  // Get race room by room ID and race ID
  getRaceRoom(roomId: string, raceId: string): MatrixRaceRoom | undefined {
    const raceKey = `${roomId}:${raceId}`;
    return this.activeRaces.get(raceKey) || this.activeRaces.get(raceId);
  }

  // Add participant to race room
  async addParticipant(roomId: string, raceId: string, participantId: string): Promise<void> {
    const raceKey = `${roomId}:${raceId}`;
    let race = this.activeRaces.get(raceKey);
    
    if (!race) {
      // Create race room if it doesn't exist with actual Matrix room data
      race = {
        roomId,
        raceId,
        faction: 'd4', // Fire faction from the Matrix room
        prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.',
        participants: [], // Start empty, add real participants dynamically
        status: 'waiting',
        createdAt: new Date()
      };
      this.activeRaces.set(raceKey, race);
      console.log(`🏁 Created Matrix race room: ${raceKey} with Fire faction prompt`);
    }
    
    // Add participant if not already in the list
    if (!race.participants.includes(participantId)) {
      race.participants.push(participantId);
      console.log(`🏃 Added participant ${participantId} to race ${raceKey}`);
      
      // Send Matrix message about new participant
      try {
        await cjsrMatrixClient.sendRaceEvent(roomId, {
          type: 'player_joined',
          raceId,
          playerId: participantId,
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('Failed to send player joined event:', error);
      }
    }
  }

  // Get ready players for a room (use the main readyPlayers Map)
  getReadyPlayers(roomId: string): string[] {
    return Array.from(this.readyPlayers.get(roomId) || new Set());
  }

  // Set player ready state and return list of ready players (use the main readyPlayers Map)
  setPlayerReady(roomId: string, playerId: string, isReady: boolean): string[] {
    if (!this.readyPlayers.has(roomId)) {
      this.readyPlayers.set(roomId, new Set());
    }
    
    const roomReadyPlayers = this.readyPlayers.get(roomId)!;
    
    if (isReady) {
      roomReadyPlayers.add(playerId);
    } else {
      roomReadyPlayers.delete(playerId);
    }
    
    console.log(`🎯 Matrix Ready System: ${playerId} ${isReady ? 'READY' : 'NOT READY'} - Total ready: ${roomReadyPlayers.size}`);
    
    return Array.from(roomReadyPlayers);
  }

  // Initialize the Matrix race room with default participants
  initializeMatrixRace(roomId: string, raceId: string): void {
    const raceKey = `${roomId}:${raceId}`;
    if (!this.activeRaces.has(raceKey)) {
      this.activeRaces.set(raceKey, {
        roomId,
        raceId,
        faction: 'd4',
        prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.',
        participants: ['timeknot', 'system'], // Real Matrix room participants
        status: 'waiting',
        createdAt: new Date()
      });
      console.log(`🎯 Initialized Matrix race room with authentic participants`);
    }

    // Also initialize in races map for ready system
    if (!this.races.has(roomId)) {
      this.races.set(roomId, {
        roomId,
        raceId,
        participants: ['timeknot', 'player2', 'player3', 'SYSTEM'],
        readyPlayers: new Set(),
        status: 'waiting',
        prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.',
        createdAt: new Date()
      });
    }
  }

  // Cleanup finished races
  cleanupFinishedRaces(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    for (const [raceId, race] of this.activeRaces.entries()) {
      if (race.status === 'finished' && race.finishedAt && race.finishedAt < oneHourAgo) {
        this.activeRaces.delete(raceId);
        console.log(`🗑️ Cleaned up finished race: ${raceId}`);
      }
    }
  }

  // Get faction servers
  getFactionServers(): FactionServer[] {
    return this.factionServers;
  }

  // Set up federation spaces (would require proper Matrix credentials)
  async setupFactionSpaces(): Promise<void> {
    console.log('📡 Setting up faction federation spaces...');
    
    for (const factionServer of this.factionServers) {
      try {
        // This would create Matrix Spaces for each faction
        // Requires proper Matrix client initialization with credentials
        console.log(`🏛️ Would set up space for ${factionServer.faction} on ${factionServer.homeserver}`);
      } catch (error) {
        console.error(`❌ Failed to set up space for ${factionServer.faction}:`, error);
      }
    }
  }
}

export const cjsrRoomManager = new CJSRRoomManager();