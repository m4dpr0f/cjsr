// Simplified Matrix client without external dependencies

export interface RaceConfiguration {
  raceId: string;
  prompt: string;
  faction: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxPlayers: number;
  hostUserId: string;
}

export interface CJSRRaceProgressEvent {
  type: 'm.cjsr.race.progress';
  content: {
    race_id: string;
    player_id: string;
    player_name: string;
    characters_typed: number;
    wpm: number;
    accuracy: number;
    position: number;
    timestamp: number;
    faction: string;
  };
}

export interface CJSRRaceStartEvent {
  type: 'm.cjsr.race.start';
  content: {
    race_id: string;
    prompt_text: string;
    faction: string;
    difficulty: string;
    max_players: number;
    start_timestamp: number;
    host_player: string;
  };
}

export interface CJSRRaceFinishEvent {
  type: 'm.cjsr.race.finish';
  content: {
    race_id: string;
    player_id: string;
    player_name: string;
    final_wpm: number;
    final_accuracy: number;
    finish_position: number;
    finish_timestamp: number;
    xp_gained: number;
    faction: string;
  };
}

export class CJSRMatrixClient {
  private client: MatrixClient | null = null;
  private isInitialized = false;
  private eventHandlers: Map<string, Function[]> = new Map();

  async initializeClient(homeserver: string, accessToken: string, userId: string) {
    try {
      console.log(`🔌 Initializing CJSR Matrix client for ${userId} on ${homeserver}`);
      
      this.client = createClient({
        baseUrl: homeserver,
        accessToken: accessToken,
        userId: userId
      });

      await this.client.startClient();
      this.setupRaceEventHandlers();
      
      this.isInitialized = true;
      console.log('✅ CJSR Matrix client initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Matrix client:', error);
      throw error;
    }
  }

  private setupRaceEventHandlers() {
    if (!this.client) return;

    // Listen for custom CJSR events
    this.client.on('Room.timeline', (event: MatrixEvent) => {
      const eventType = event.getType();
      
      if (eventType.startsWith('m.cjsr.')) {
        this.handleCJSREvent(event);
      }
    });

    console.log('📡 Matrix event handlers configured for CJSR racing');
  }

  private handleCJSREvent(event: MatrixEvent) {
    const eventType = event.getType();
    const content = event.getContent();
    
    console.log(`🎯 Received CJSR event: ${eventType}`, content);
    
    // Trigger registered event handlers
    const handlers = this.eventHandlers.get(eventType) || [];
    handlers.forEach(handler => handler(content, event));
  }

  async createRaceRoom(raceConfig: RaceConfiguration): Promise<string> {
    if (!this.client) throw new Error('Matrix client not initialized');

    try {
      const roomCreation = await this.client.createRoom({
        name: `🏁 CJSR Race: ${raceConfig.prompt.substring(0, 30)}...`,
        topic: `Faction: ${raceConfig.faction} | Difficulty: ${raceConfig.difficulty} | Max Players: ${raceConfig.maxPlayers}`,
        preset: 'public_chat',
        room_alias_name: `cjsr-race-${raceConfig.raceId}`,
        initial_state: [
          {
            type: 'm.room.power_levels',
            content: {
              events: {
                'm.cjsr.race.start': 50,
                'm.cjsr.race.progress': 0,
                'm.cjsr.race.finish': 0
              }
            }
          }
        ]
      });

      const roomId = roomCreation.room_id;
      console.log(`🏟️ Created CJSR race room: ${roomId}`);

      // Send race initialization event
      const startEvent: CJSRRaceStartEvent = {
        type: 'm.cjsr.race.start',
        content: {
          race_id: raceConfig.raceId,
          prompt_text: raceConfig.prompt,
          faction: raceConfig.faction,
          difficulty: raceConfig.difficulty,
          max_players: raceConfig.maxPlayers,
          start_timestamp: Date.now(),
          host_player: raceConfig.hostUserId
        }
      };

      await this.client.sendEvent(roomId, 'm.cjsr.race.start', startEvent.content);
      console.log(`🚀 Race start event sent to room ${roomId}`);

      return roomId;
    } catch (error) {
      console.error('❌ Failed to create race room:', error);
      throw error;
    }
  }

  async sendRaceProgress(roomId: string, progressData: Omit<CJSRRaceProgressEvent['content'], 'timestamp'>) {
    if (!this.client) throw new Error('Matrix client not initialized');

    try {
      const progressEvent: CJSRRaceProgressEvent = {
        type: 'm.cjsr.race.progress',
        content: {
          ...progressData,
          timestamp: Date.now()
        }
      };

      await this.client.sendEvent(roomId, 'm.cjsr.race.progress', progressEvent.content);
    } catch (error) {
      console.error('❌ Failed to send race progress:', error);
      throw error;
    }
  }

  async sendRaceFinish(roomId: string, finishData: Omit<CJSRRaceFinishEvent['content'], 'finish_timestamp'>) {
    if (!this.client) throw new Error('Matrix client not initialized');

    try {
      const finishEvent: CJSRRaceFinishEvent = {
        type: 'm.cjsr.race.finish',
        content: {
          ...finishData,
          finish_timestamp: Date.now()
        }
      };

      await this.client.sendEvent(roomId, 'm.cjsr.race.finish', finishEvent.content);
      console.log(`🏆 Race finish event sent for player ${finishData.player_name}`);
    } catch (error) {
      console.error('❌ Failed to send race finish:', error);
      throw error;
    }
  }

  async joinRoom(roomId: string): Promise<void> {
    if (!this.client) throw new Error('Matrix client not initialized');

    try {
      await this.client.joinRoom(roomId);
      console.log(`✅ Joined Matrix room: ${roomId}`);
    } catch (error) {
      console.error('❌ Failed to join room:', error);
      throw error;
    }
  }

  // Event handler registration
  onRaceEvent(eventType: string, handler: Function) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)?.push(handler);
  }

  // Cleanup
  async disconnect() {
    if (this.client) {
      await this.client.stopClient();
      this.client = null;
      this.isInitialized = false;
      console.log('🔌 Matrix client disconnected');
    }
  }

  get isConnected(): boolean {
    return this.isInitialized && this.client !== null;
  }
}

export const cjsrMatrixClient = new CJSRMatrixClient();