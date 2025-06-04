interface WebhookEmbed {
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

interface WebhookMessage {
  content?: string;
  embeds?: WebhookEmbed[];
}

class DiscordWebhook {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async sendWebhook(message: WebhookMessage) {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Webhook error: ${response.status} ${errorText}`);
      }

      // Discord webhooks return empty response on success (204 No Content)
      if (response.status === 204) {
        return { success: true };
      }

      const text = await response.text();
      return text ? JSON.parse(text) : { success: true };
    } catch (error) {
      console.error('Discord webhook request failed:', error);
      throw error;
    }
  }

  // Universal race completion reporter for all race types
  async postUniversalRaceCompletion(
    playerName: string, 
    raceType: string, 
    wpm: number, 
    accuracy: number, 
    raceTime: number, 
    faction?: string, 
    xp?: number, 
    placement?: number,
    promptText?: string
  ) {
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

    const raceTypeEmoji = {
      'Race: Matrix Race': '🌐',
      'Race: Campaign S.0': '📚',
      'Race: Quickrace': '⚡',
      'Race: Scribquest 01': '📜',
      'Race: Practice': '🎯',
      'Race: Multiplayer': '👥',
      'Race: Single Player': '🏃',
      'GLYPH SCRIBE': '🗿'
    };

    const embed: WebhookEmbed = {
      title: `${raceTypeEmoji[raceType as keyof typeof raceTypeEmoji] || '🏁'} ${raceType} Complete!`,
      description: `**${playerName}** finished their typing race!`,
      color: wpm >= 80 ? 0xFFD700 : wpm >= 60 ? 0xC0C0C0 : wpm >= 40 ? 0xCD7F32 : 0x7289DA,
      fields: [
        { name: 'WPM', value: wpm.toString(), inline: true },
        { name: 'Accuracy', value: `${accuracy}%`, inline: true },
        { name: 'Time', value: `${Math.round(raceTime)}s`, inline: true },
        ...(placement ? [{ name: 'Placement', value: `${placement === 1 ? '🥇 1st' : placement === 2 ? '🥈 2nd' : placement === 3 ? '🥉 3rd' : `${placement}th`}`, inline: true }] : []),
        ...(xp ? [{ name: 'XP Earned', value: `+${xp}`, inline: true }] : []),
      ],
      timestamp: new Date().toISOString(),
      footer: { text: 'CJSR Federation - Race Results' }
    };

    if (faction) {
      embed.fields?.unshift({
        name: 'Faction',
        value: `${factionEmoji[faction as keyof typeof factionEmoji] || ''} ${faction.toUpperCase()}`,
        inline: true
      });
    }

    if (promptText && promptText.length > 0) {
      const truncatedPrompt = promptText.length > 100 ? promptText.substring(0, 100) + '...' : promptText;
      embed.fields?.push({
        name: 'Text Practiced',
        value: `"${truncatedPrompt}"`,
        inline: false
      });
    }

    return this.sendWebhook({ embeds: [embed] });
  }

  async postRaceCompletion(playerName: string, placement: number, wpm: number, accuracy: number, raceTime: number, faction?: string, xp?: number) {
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

    const embed: WebhookEmbed = {
      title: `${placementEmoji[placement as keyof typeof placementEmoji] || '🏁'} Race Completion`,
      description: `**${playerName}** finished ${placement === 1 ? '1st' : placement === 2 ? '2nd' : placement === 3 ? '3rd' : `${placement}th`} place!`,
      color: placement === 1 ? 0xFFD700 : placement === 2 ? 0xC0C0C0 : placement === 3 ? 0xCD7F32 : 0x7289DA,
      fields: [
        { name: 'WPM', value: wpm.toString(), inline: true },
        { name: 'Accuracy', value: `${accuracy}%`, inline: true },
        { name: 'Time', value: `${raceTime}s`, inline: true },
        ...(xp ? [{ name: 'XP Earned', value: `+${xp}`, inline: true }] : []),
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

    return this.sendWebhook({ embeds: [embed] });
  }

  async postRaceSummary(participants: Array<{
    playerName: string;
    placement: number;
    wpm: number;
    accuracy: number;
    raceTime: number;
    faction?: string;
    finished?: boolean;
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
        const status = p.finished === false ? ' - Race INCOMPLETE' : '';
        return `${emoji} ${faction}**${p.playerName}** - ${p.wpm} WPM (${p.accuracy}%)${status}`;
      })
      .join('\n');

    const embed: WebhookEmbed = {
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

    return this.sendWebhook({ embeds: [embed] });
  }

  async postLeaderboard(title: string, players: Array<{
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

    const embed: WebhookEmbed = {
      title: `🏆 ${title}`,
      description: leaderboard,
      color: 0xFFD700,
      timestamp: new Date().toISOString(),
      footer: { text: 'CJSR Federation Leaderboard' }
    };

    return this.sendWebhook({ embeds: [embed] });
  }

  async sendChapterCompletion(embed: WebhookEmbed) {
    return this.sendWebhook({ embeds: [embed] });
  }

  async testConnection() {
    return this.sendWebhook({
      content: 'Connection test successful'
    });
  }
}

export { DiscordWebhook };