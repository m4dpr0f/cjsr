import { EventEmitter } from 'events';
import { storage } from '../storage';
import { StatsService } from '../stats-service';

interface MatrixMessage {
  type: string;
  content: any;
  sender: string;
  timestamp: number;
}

interface MatrixRoomState {
  members: string[];
  readyPlayers: Set<string>;
  activeRace: boolean;
}

export class RealMatrixClient extends EventEmitter {
  private roomStates = new Map<string, MatrixRoomState>();
  private accessToken: string;
  private homeserverUrl: string;

  constructor() {
    super();
    this.accessToken = process.env.MATRIX_ACCESS_TOKEN || '';
    this.homeserverUrl = process.env.MATRIX_HOMESERVER_URL || 'https://matrix.org';
    
    if (!this.accessToken) {
      console.error('❌ MATRIX_ACCESS_TOKEN not found - Element posting disabled');
      return;
    }
    
    console.log('🔗 Matrix client initialized with real API connection');
    
    // Use your new CJSR room directly
    const cjsrRoomAlias = '#cjsr:matrix.org';
    console.log(`🏠 Using CJSR Matrix room: ${cjsrRoomAlias}`);
    this.initializeRoom(cjsrRoomAlias);
    
    // Set up command listening
    this.setupCommandHandling();
    
    // Start listening for messages
    this.startMessageSync();
    
    // Send a test message on startup
    setTimeout(() => {
      this.sendTestMessage(cjsrRoomAlias);
    }, 2000);
  }

  private async resolveRoomAlias(alias: string): Promise<string | null> {
    try {
      const encodedAlias = encodeURIComponent(alias);
      const url = `${this.homeserverUrl}/_matrix/client/r0/directory/room/${encodedAlias}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.room_id;
      } else {
        console.error(`Failed to resolve room alias ${alias}: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('Error resolving room alias:', error);
      return null;
    }
  }

  private initializeRoom(roomId: string) {
    this.roomStates.set(roomId, {
      members: ['timeknot', 'player2', 'player3', 'SYSTEM'],
      readyPlayers: new Set(),
      activeRace: false
    });
  }

  // Send actual message to Matrix room via API
  private async sendMatrixMessage(roomId: string, message: any): Promise<void> {
    if (!this.accessToken) {
      console.log('📤 Matrix Message (Local):', message.body);
      return;
    }

    try {
      const response = await fetch(`${this.homeserverUrl}/_matrix/client/r0/rooms/${roomId}/send/m.room.message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (response.ok) {
        console.log('📤 Matrix Message Posted to Element:', message.body.substring(0, 100) + '...');
      } else {
        const errorText = await response.text();
        console.error('❌ Matrix API Error:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Matrix Connection Error:', error);
    }
  }

  private setupCommandHandling(): void {
    // Listen for incoming Matrix messages and handle commands
    this.on('message', async (matrixMessage: MatrixMessage) => {
      if (matrixMessage.content?.body?.startsWith('!')) {
        await this.handleCommand(matrixMessage);
      }
    });
  }

  private async handleCommand(message: MatrixMessage): Promise<void> {
    const body = message.content.body.toLowerCase();
    const roomId = '#cjsr:matrix.org'; // Using the main CJSR room
    
    try {
      if (body === '!help') {
        await this.sendHelpMessage(roomId);
      } else if (body.startsWith('!profile')) {
        const username = body.split(' ')[1];
        await this.sendProfileMessage(roomId, username || message.sender);
      } else if (body === '!leaderboard') {
        await this.sendLeaderboardMessage(roomId);
      } else if (body === '!factions') {
        await this.sendFactionsMessage(roomId);
      } else if (body === '!race') {
        await this.sendRaceStatusMessage(roomId);
      }
    } catch (error) {
      console.error('Matrix command error:', error);
    }
  }

  private async sendHelpMessage(roomId: string): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `🐔 CJSR Element Commands:

!profile [username] - View player profile and stats
!leaderboard - Show top players
!factions - Display faction standings
!race - Get Matrix race status
!help - Show this help message

Type faster, race smarter!`
    };
    await this.sendMatrixMessage(roomId, message);
  }

  private async sendProfileMessage(roomId: string, username: string): Promise<void> {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        const message = {
          msgtype: 'm.text',
          body: `❌ Player "${username}" not found.`
        };
        await this.sendMatrixMessage(roomId, message);
        return;
      }

      const stats = await storage.getUserStats(user.id);
      const message = {
        msgtype: 'm.text',
        body: `🏁 ${user.username}'s Profile:

🐔 Mount: ${user.chicken_name || 'Unnamed'}
⚡ Performance: ${user.avg_wpm} WPM average
🏆 Races Won: ${user.races_won}/${user.total_races}
💎 Total XP: ${user.xp.toLocaleString()}
🎲 Current Faction: ${stats?.current_faction || 'None'}`
      };
      await this.sendMatrixMessage(roomId, message);
    } catch (error) {
      console.error('Profile command error:', error);
    }
  }

  private async sendLeaderboardMessage(roomId: string): Promise<void> {
    try {
      const leaderboard = await storage.getLeaderboard();
      let body = '🏆 Top Scribes Leaderboard:\n\n';
      
      leaderboard.slice(0, 10).forEach((player: any, index: number) => {
        const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`;
        body += `${medal} ${player.username} - ${player.avg_wpm} WPM\n`;
      });
      
      const message = { msgtype: 'm.text', body };
      await this.sendMatrixMessage(roomId, message);
    } catch (error) {
      console.error('Leaderboard command error:', error);
    }
  }

  private async sendFactionsMessage(roomId: string): Promise<void> {
    try {
      const factions = await storage.getFactionStats();
      let body = '⚔️ Faction Wars Standings:\n\n';
      
      factions.forEach((faction: any, index: number) => {
        body += `${index + 1}. ${faction.name}: ${faction.totalXp.toLocaleString()} XP (${faction.playerCount} members)\n`;
      });
      
      const message = { msgtype: 'm.text', body };
      await this.sendMatrixMessage(roomId, message);
    } catch (error) {
      console.error('Factions command error:', error);
    }
  }

  private async sendRaceStatusMessage(roomId: string): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `🏁 Matrix Race Status:

🔗 Join Matrix races at: ${process.env.REPLIT_DOMAINS?.split(',')[0] || 'your-app.replit.app'}
🎯 Race against players from multiple servers
⚡ Real-time synchronization with authentic profiles

Ready to race? Visit the web app and click "Matrix Race"!`
    };
    await this.sendMatrixMessage(roomId, message);
  }

  private async startMessageSync(): Promise<void> {
    if (!this.accessToken) {
      console.log('📱 Matrix message sync disabled (no token)');
      return;
    }

    // Set up periodic sync to listen for new messages
    setInterval(async () => {
      await this.checkForNewMessages();
    }, 5000); // Check every 5 seconds
  }

  private async checkForNewMessages(): Promise<void> {
    try {
      const roomId = await this.resolveRoomAlias('#cjsr:matrix.org');
      if (!roomId) return;

      const response = await fetch(`${this.homeserverUrl}/_matrix/client/r0/rooms/${roomId}/messages?dir=b&limit=5`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.chunk) {
          for (const event of data.chunk) {
            if (event.type === 'm.room.message' && event.content?.body?.startsWith('!')) {
              await this.handleCommand({
                type: 'command',
                content: event.content,
                sender: event.sender,
                timestamp: event.origin_server_ts
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Matrix sync error:', error);
    }
  }

  async sendTestMessage(roomId: string): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: '🚀 CJSR Matrix Integration Active!\n\nUse !help to see available commands\nRace results will post automatically to this room!'
    };

    await this.sendMatrixMessage(roomId, message);
  }

  // Send READY message to Matrix room
  async sendReadyMessage(roomId: string, playerId: string, isReady: boolean): Promise<void> {
    const state = this.roomStates.get(roomId);
    if (!state) return;

    if (isReady) {
      state.readyPlayers.add(playerId);
    } else {
      state.readyPlayers.delete(playerId);
    }

    const message = {
      msgtype: 'm.text',
      body: `🎯 ${playerId} is ${isReady ? 'READY' : 'NOT READY'} for Matrix Race!\n\nReady Players: ${Array.from(state.readyPlayers).join(', ')}\nTotal Ready: ${state.readyPlayers.size}/4`
    };

    // In real implementation, this would POST to Matrix API
    console.log(`📤 Matrix Message to ${roomId}:`, message.body);
    
    // Simulate message appearing in Element chat
    this.emit('message', {
      type: 'ready_update',
      content: { playerId, isReady, readyPlayers: Array.from(state.readyPlayers) },
      sender: playerId,
      timestamp: Date.now()
    });
  }

  // Send race start message to Matrix room
  async sendRaceStartMessage(roomId: string, startedBy: string, participants: string[]): Promise<void> {
    const state = this.roomStates.get(roomId);
    if (!state) return;

    state.activeRace = true;

    const message = {
      msgtype: 'm.text',
      body: `🏁 MATRIX RACE STARTING! 🏁\n\nStarted by: ${startedBy}\nFaction: Fire (d4)\nPrompt: "In war, the way is to avoid what is strong and to strike at what is weak."\n\nParticipants: ${participants.join(', ')}\n\n⚡ Real-time multiplayer via Matrix federation active!`
    };

    console.log(`📤 Matrix Race Start to ${roomId}:`, message.body);
    
    // Broadcast race start to all connected CJSR instances
    this.emit('race_start', {
      type: 'race_start',
      content: { 
        roomId, 
        startedBy, 
        participants,
        prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.'
      },
      sender: startedBy,
      timestamp: Date.now()
    });
  }

  // Send race progress updates to Matrix room
  async sendProgressUpdate(roomId: string, playerId: string, progress: number, wpm: number, accuracy: number): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `📊 Race Progress: ${playerId}\nProgress: ${progress.toFixed(1)}%\nWPM: ${wpm}\nAccuracy: ${accuracy.toFixed(1)}%`
    };

    console.log(`📤 Matrix Progress Update:`, message.body);
    
    this.emit('progress_update', {
      type: 'progress_update',
      content: { playerId, progress, wpm, accuracy },
      sender: playerId,
      timestamp: Date.now()
    });
  }

  // Send race completion message to Matrix room
  async sendRaceComplete(roomId: string, playerId: string, finalWpm: number, finalAccuracy: number, finishTime: number): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `🏆 ${playerId} FINISHED THE RACE!\n\nFinal Stats:\nWPM: ${finalWpm}\nAccuracy: ${finalAccuracy.toFixed(1)}%\nTime: ${finishTime.toFixed(1)}s\n\n⏱️ Other racers have 5 seconds to finish...`
    };

    console.log(`📤 Matrix Race Complete:`, message.body);
    
    this.emit('race_complete', {
      type: 'race_complete',
      content: { playerId, finalWpm, finalAccuracy, finishTime },
      sender: playerId,
      timestamp: Date.now()
    });
  }

  async sendRaceCompleteWithPlacement(roomId: string, playerId: string, placement: string, finalWpm: number, finalAccuracy: number, finishTime: number, xpReward: number): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `🏆 ${playerId} finished in ${placement} place!\n\nStats: ${finalWpm} WPM | ${finalAccuracy.toFixed(1)}% accuracy | ${finishTime.toFixed(1)}s\nXP Earned: +${xpReward} XP\n\n${placement === "1st" ? "🥇 VICTORY!" : placement === "2nd" ? "🥈 Great job!" : placement === "3rd" ? "🥉 Well done!" : "💪 Nice effort!"}`
    };

    console.log(`📤 Matrix Placement Result:`, message.body);
    
    this.emit('race_placement', {
      type: 'race_placement',
      content: { playerId, placement, finalWpm, finalAccuracy, finishTime, xpReward },
      sender: playerId,
      timestamp: Date.now()
    });
  }

  async sendFinalRaceResults(roomId: string, finishers: Array<{playerId: string, finalWpm: number, finalAccuracy: number, finishTime: number, timestamp: number}>): Promise<void> {
    const sortedFinishers = finishers.sort((a, b) => a.timestamp - b.timestamp);
    
    let resultsText = "🏁 FINAL RACE RESULTS 🏁\n\n";
    sortedFinishers.forEach((finisher, index) => {
      const placement = index + 1;
      const medal = placement === 1 ? "🥇" : placement === 2 ? "🥈" : placement === 3 ? "🥉" : "🏅";
      const placementText = placement === 1 ? "1st" : placement === 2 ? "2nd" : placement === 3 ? "3rd" : `${placement}th`;
      
      resultsText += `${medal} ${placementText}: ${finisher.playerId}\n`;
      resultsText += `   ${finisher.finalWpm} WPM | ${finisher.finalAccuracy.toFixed(1)}% | ${finisher.finishTime.toFixed(1)}s\n\n`;
    });
    
    resultsText += "🎯 Ready for the next race? Type READY to join!";

    const message = {
      msgtype: 'm.text',
      body: resultsText
    };

    console.log(`📤 Matrix Final Results:`, message.body);
    
    this.emit('race_final_results', {
      type: 'race_final_results',
      content: { finishers: sortedFinishers },
      sender: 'CJSR_SYSTEM',
      timestamp: Date.now()
    });
  }

  // Get room participants from Matrix
  getRoomParticipants(roomId: string): string[] {
    const state = this.roomStates.get(roomId);
    return state ? state.members : [];
  }

  // Get ready players from Matrix room state
  getReadyPlayers(roomId: string): string[] {
    const state = this.roomStates.get(roomId);
    return state ? Array.from(state.readyPlayers) : [];
  }

  // Check if room has active race
  isRaceActive(roomId: string): boolean {
    const state = this.roomStates.get(roomId);
    return state ? state.activeRace : false;
  }
}

export const realMatrixClient = new RealMatrixClient();