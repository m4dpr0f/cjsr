// Simplified Matrix client implementation
import { artOfWarService } from '../art-of-war-service';

export interface RaceConfiguration {
  raceId: string;
  prompt: string;
  faction: string;
  difficulty: 'easy' | 'medium' | 'hard';
  maxPlayers: number;
  hostUserId: string;
}

export interface RaceEvent {
  type: 'start' | 'progress' | 'finish' | 'player_joined';
  raceId: string;
  playerId?: string;
  progress?: number;
  wpm?: number;
  accuracy?: number;
  timestamp: number;
}

export class SimplifiedMatrixClient {
  private participants: Map<string, string[]> = new Map();
  
  async sendRaceEvent(roomId: string, event: RaceEvent): Promise<void> {
    // Simulate sending to Matrix room - in real implementation this would use Matrix API
    console.log(`📡 Matrix Event [${roomId}]: ${event.type} - ${JSON.stringify(event)}`);
    
    // Log the event for demonstration
    if (event.type === 'player_joined') {
      console.log(`🏃 Player ${event.playerId} joined race ${event.raceId}`);
    }
  }

  async getRoomParticipants(roomId: string): Promise<string[]> {
    // Filter out SYSTEM participants, only return real CJSR players
    const participants = this.participants.get(roomId) || [];
    return participants.filter(p => p !== 'system' && p !== 'SYSTEM');
  }

  async addParticipant(roomId: string, participantId: string): Promise<void> {
    const participants = this.participants.get(roomId) || [];
    if (!participants.includes(participantId)) {
      participants.push(participantId);
      this.participants.set(roomId, participants);
      console.log(`➕ Added participant ${participantId} to room ${roomId}`);
    }
  }

  // Listen for Matrix room messages and convert them to race events
  onMatrixMessage(roomId: string, callback: (message: string, sender: string) => void): void {
    // Simulate receiving Matrix messages - in real implementation this would listen to Matrix events
    console.log(`👂 Listening for Matrix messages in room ${roomId}`);
  }

  // Simulate a Matrix message for testing
  simulateMatrixMessage(roomId: string, message: string, sender: string): void {
    console.log(`💬 Matrix Message [${roomId}] ${sender}: ${message}`);
    // This would trigger the real-time update in CJSR
  }

  onRaceEvent(callback: (event: RaceEvent) => void): void {
    // Simplified event handler
    console.log('🎧 Matrix event listener registered');
  }
}

export const cjsrMatrixClient = new SimplifiedMatrixClient();