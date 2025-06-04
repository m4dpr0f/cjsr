interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  timestamp?: string;
  footer?: {
    text: string;
  };
}

interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
}

class DiscordClient {
  private botToken: string;
  private baseUrl = 'https://discord.com/api/v10';

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bot ${this.botToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Discord API error: ${response.status} ${errorText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Discord API request failed:', error);
      throw error;
    }
  }

  async sendMessage(channelId: string, message: DiscordMessage) {
    return this.makeRequest(`/channels/${channelId}/messages`, 'POST', message);
  }

  async postRaceCompletion(channelId: string, playerName: string, placement: number, wpm: number, accuracy: number, raceTime: number, faction?: string) {
    const factionEmoji = {
      'd2': '💰',
      'd4': '🔥',
      'd6': '🌱',
      'd8': '💨',
      'd10': '⚡',
      'd12': '✨',
      'd20': '🌊',
      'd100': '⚖️'
    };

    const placementEmoji = {
      1: '🥇',
      2: '🥈',
      3: '🥉'
    };

    const embed: DiscordEmbed = {
      title: `${placementEmoji[placement as keyof typeof placementEmoji] || '🏁'} Race Completion`,
      description: `**${playerName}** finished ${placement === 1 ? '1st' : placement === 2 ? '2nd' : placement === 3 ? '3rd' : `${placement}th`} place!`,
      color: placement === 1 ? 0xFFD700 : placement === 2 ? 0xC0C0C0 : placement === 3 ? 0xCD7F32 : 0x7289DA,
      fields: [
        { name: 'WPM', value: wpm.toString(), inline: true },
        { name: 'Accuracy', value: `${accuracy}%`, inline: true },
        { name: 'Time', value: `${raceTime}s`, inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'CJSR Federation' }
    };

    if (faction) {
      embed.fields?.unshift({
        name: 'Faction',
        value: `${factionEmoji[faction as keyof typeof factionEmoji] || ''} ${faction.toUpperCase()}`,
        inline: true
      });
    }

    return this.sendMessage(channelId, { embeds: [embed] });
  }

  async postRaceSummary(channelId: string, participants: Array<{
    playerName: string;
    placement: number;
    wpm: number;
    accuracy: number;
    raceTime: number;
    faction?: string;
  }>, totalTypingTime: number) {
    const factionEmoji = {
      'd2': '💰',
      'd4': '🔥',
      'd6': '🌱',
      'd8': '💨',
      'd10': '⚡',
      'd12': '✨',
      'd20': '🌊',
      'd100': '⚖️'
    };

    const leaderboard = participants
      .sort((a, b) => a.placement - b.placement)
      .map(p => {
        const emoji = p.placement === 1 ? '🥇' : p.placement === 2 ? '🥈' : p.placement === 3 ? '🥉' : '🏁';
        const faction = p.faction ? `${factionEmoji[p.faction as keyof typeof factionEmoji] || ''} ` : '';
        return `${emoji} ${faction}**${p.playerName}** - ${p.wpm} WPM (${p.accuracy}%)`;
      })
      .join('\n');

    const embed: DiscordEmbed = {
      title: '🏁 Race Complete!',
      description: leaderboard,
      color: 0x00FF00,
      fields: [
        { name: 'Total Typing Time', value: `${totalTypingTime} seconds`, inline: true },
        { name: 'Participants', value: participants.length.toString(), inline: true },
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'CJSR Federation - Ready for next race!' }
    };

    return this.sendMessage(channelId, { embeds: [embed] });
  }

  async postLeaderboard(channelId: string, title: string, players: Array<{
    username: string;
    bestWpm: number;
    totalRaces: number;
    faction?: string;
  }>) {
    const factionEmoji = {
      'd2': '💰',
      'd4': '🔥',
      'd6': '🌱',
      'd8': '💨',
      'd10': '⚡',
      'd12': '✨',
      'd20': '🌊',
      'd100': '⚖️'
    };

    const leaderboard = players
      .slice(0, 10) // Top 10
      .map((player, index) => {
        const rank = index + 1;
        const emoji = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
        const faction = player.faction ? `${factionEmoji[player.faction as keyof typeof factionEmoji] || ''} ` : '';
        return `${emoji} ${faction}**${player.username}** - ${player.bestWpm} WPM (${player.totalRaces} races)`;
      })
      .join('\n');

    const embed: DiscordEmbed = {
      title: `🏆 ${title}`,
      description: leaderboard,
      color: 0xFFD700,
      timestamp: new Date().toISOString(),
      footer: { text: 'CJSR Federation Leaderboard' }
    };

    return this.sendMessage(channelId, { embeds: [embed] });
  }
}

export { DiscordClient };