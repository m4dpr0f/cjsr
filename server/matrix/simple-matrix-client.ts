// Simplified Matrix client using HTTP requests
// This works without the matrix-js-sdk dependency

interface MatrixCredentials {
  homeserver: string;
  accessToken: string;
  userId: string;
}

interface CJSRRaceEvent {
  race_id: string;
  event_type: 'start' | 'progress' | 'finish';
  player_id: string;
  player_name: string;
  faction: string;
  data: any;
  timestamp: number;
}

export class SimpleMatrixClient {
  private credentials: MatrixCredentials | null = null;
  private isReady = false;

  configure(homeserver: string, accessToken: string, userId: string) {
    this.credentials = {
      homeserver: homeserver.replace(/\/$/, ''), // Remove trailing slash
      accessToken,
      userId
    };
    this.isReady = true;
    console.log(`✅ Matrix client configured for ${userId} on ${homeserver}`);
  }

  async createRaceRoom(raceConfig: {
    raceId: string;
    prompt: string;
    faction: string;
    difficulty: string;
    maxPlayers: number;
  }): Promise<string | null> {
    if (!this.isReady || !this.credentials) {
      console.log('⏳ Matrix client not configured - storing race locally');
      return null;
    }

    try {
      const roomData = {
        name: `🏁 CJSR Race: ${raceConfig.prompt.substring(0, 30)}...`,
        topic: `Faction: ${raceConfig.faction} | Difficulty: ${raceConfig.difficulty}`,
        preset: 'public_chat',
        room_alias_name: `cjsr-race-${raceConfig.raceId}`
      };

      const response = await fetch(`${this.credentials.homeserver}/_matrix/client/r0/createRoom`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.credentials.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      });

      if (response.ok) {
        const result = await response.json();
        const roomId = result.room_id;
        
        console.log(`🏟️ Created Matrix race room: ${roomId}`);
        
        // Send race start event
        await this.sendRaceEvent(roomId, {
          race_id: raceConfig.raceId,
          event_type: 'start',
          player_id: 'system',
          player_name: 'Race System',
          faction: raceConfig.faction,
          data: {
            prompt_text: raceConfig.prompt,
            difficulty: raceConfig.difficulty,
            max_players: raceConfig.maxPlayers
          },
          timestamp: Date.now()
        });

        return roomId;
      } else {
        console.error('Failed to create Matrix room:', await response.text());
        return null;
      }
    } catch (error) {
      console.error('Matrix room creation error:', error);
      return null;
    }
  }

  async sendRaceEvent(roomId: string, event: CJSRRaceEvent): Promise<boolean> {
    if (!this.isReady || !this.credentials || !roomId) {
      return false;
    }

    try {
      const eventType = `m.cjsr.race.${event.event_type}`;
      const txnId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(
        `${this.credentials.homeserver}/_matrix/client/r0/rooms/${roomId}/send/${eventType}/${txnId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(event)
        }
      );

      if (response.ok) {
        console.log(`📡 Sent ${event.event_type} event to Matrix room`);
        return true;
      } else {
        console.error('Failed to send Matrix event:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Matrix event send error:', error);
      return false;
    }
  }

  async joinRoom(roomId: string): Promise<boolean> {
    if (!this.isReady || !this.credentials || !roomId) {
      return false;
    }

    try {
      const response = await fetch(
        `${this.credentials.homeserver}/_matrix/client/r0/rooms/${roomId}/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.credentials.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      if (response.ok) {
        console.log(`✅ Joined Matrix room: ${roomId}`);
        return true;
      } else {
        console.error('Failed to join Matrix room:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('Matrix room join error:', error);
      return false;
    }
  }

  get isConnected(): boolean {
    return this.isReady;
  }

  getStatus(): string {
    if (!this.isReady) {
      return 'Matrix client not configured';
    }
    return `Matrix federation active (${this.credentials?.userId})`;
  }
}

export const simpleMatrixClient = new SimpleMatrixClient();