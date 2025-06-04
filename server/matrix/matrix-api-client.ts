import { EventEmitter } from 'events';

interface MatrixMessage {
  msgtype: string;
  body: string;
}

export class MatrixAPIClient extends EventEmitter {
  private accessToken: string;
  private homeserverUrl: string;

  constructor() {
    super();
    this.accessToken = process.env.MATRIX_ACCESS_TOKEN!;
    this.homeserverUrl = process.env.MATRIX_HOMESERVER_URL || 'https://matrix.org';
    
    if (!this.accessToken) {
      console.error('❌ MATRIX_ACCESS_TOKEN not found - Element posting disabled');
      return;
    }
    
    console.log('🔗 Matrix API client initialized with real credentials');
    
    // Send startup test message
    setTimeout(() => {
      this.sendTestMessage('!PeFDRrFqXUxBiMBUOx:matrix.org');
    }, 3000);
  }

  async sendMessage(roomId: string, message: MatrixMessage): Promise<boolean> {
    try {
      const url = `${this.homeserverUrl}/_matrix/client/r0/rooms/${encodeURIComponent(roomId)}/send/m.room.message`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Message sent to Element: ${message.body.substring(0, 50)}...`);
        return true;
      } else {
        const error = await response.text();
        console.error(`❌ Matrix API error: ${response.status} ${error}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Matrix send failed:', error);
      return false;
    }
  }

  async sendTestMessage(roomId: string): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `🚀 CJSR Matrix Integration Active!\n\nCompetitive racing system online - results will now post automatically to Element!\n\nTime: ${new Date().toLocaleTimeString()}`
    };
    
    const success = await this.sendMessage(roomId, message);
    if (success) {
      console.log('🎯 Matrix integration test successful!');
    }
  }

  async sendRaceCompleteWithPlacement(roomId: string, playerId: string, placement: string, finalWpm: number, finalAccuracy: number, finishTime: number, xpReward: number): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `🏆 ${playerId || 'Player'} finished in ${placement || 'Unknown'} place!\n\nStats: ${finalWpm || 0} WPM | ${(finalAccuracy || 0).toFixed(1)}% accuracy | ${(finishTime || 0).toFixed(1)}s\nXP Earned: +${xpReward || 0} XP\nTyping Time Contribution: +${(finishTime || 0).toFixed(1)}s\n\n${placement === "1st" ? "🥇 VICTORY!" : placement === "2nd" ? "🥈 Great job!" : placement === "3rd" ? "🥉 Well done!" : "💪 Nice effort!"}`
    };

    await this.sendMessage(roomId, message);
  }

  async sendFinalRaceResults(roomId: string, finishers: Array<{playerId: string, finalWpm: number, finalAccuracy: number, finishTime: number, timestamp: number}>): Promise<void> {
    const sortedFinishers = finishers.sort((a, b) => a.timestamp - b.timestamp);
    
    let resultsText = "🏁 FINAL RACE RESULTS 🏁\n\n";
    let totalTypingTime = 0;
    
    sortedFinishers.forEach((finisher, index) => {
      const placement = index + 1;
      const medal = placement === 1 ? "🥇" : placement === 2 ? "🥈" : placement === 3 ? "🥉" : "🏅";
      const placementText = placement === 1 ? "1st" : placement === 2 ? "2nd" : placement === 3 ? "3rd" : `${placement}th`;
      
      resultsText += `${medal} ${placementText}: ${finisher.playerId}\n`;
      resultsText += `   ${finisher.finalWpm} WPM | ${finisher.finalAccuracy.toFixed(1)}% | ${finisher.finishTime.toFixed(1)}s\n\n`;
      totalTypingTime += finisher.finishTime;
    });
    
    resultsText += `⏱️ Total Typing Time Contributed: ${totalTypingTime.toFixed(1)}s\n`;
    resultsText += "🎯 Ready for the next race? Click READY to join!";

    const message = {
      msgtype: 'm.text',
      body: resultsText
    };

    await this.sendMessage(roomId, message);
  }

  async sendRaceStart(roomId: string, participants: string[], prompt: string): Promise<void> {
    const message = {
      msgtype: 'm.text',
      body: `🏁 RACE STARTING! 🏁\n\nParticipants: ${participants.join(', ')}\nPrompt: "${prompt}"\n\nReady to race? Type the prompt as fast and accurately as possible!\n\n⚡ Real-time multiplayer via Matrix federation active!`
    };

    await this.sendMessage(roomId, message);
  }
}

export const matrixAPIClient = new MatrixAPIClient();