import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;
const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

interface TelegramMessage {
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
}

class TelegramService {
  private botToken: string | undefined;
  private channelId: string | undefined;
  private groupId: string | undefined;

  constructor() {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID || !TELEGRAM_GROUP_ID) {
      console.warn('⚠️ Telegram credentials not configured');
      return;
    }
    
    this.botToken = TELEGRAM_BOT_TOKEN;
    this.channelId = TELEGRAM_CHANNEL_ID;
    this.groupId = TELEGRAM_GROUP_ID;
    
    console.log('🤖 Telegram bot service initialized');
  }

  private async sendMessage(chatId: string, message: TelegramMessage): Promise<boolean> {
    if (!this.botToken) return false;

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message.text,
          parse_mode: message.parse_mode || 'HTML',
          disable_web_page_preview: message.disable_web_page_preview || false,
        }),
      });

      const result = await response.json() as any;
      
      if (!response.ok) {
        console.error('❌ Telegram API error:', result);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to send Telegram message:', error);
      return false;
    }
  }

  async postToChannel(message: TelegramMessage): Promise<boolean> {
    if (!this.channelId) return false;
    return this.sendMessage(this.channelId, message);
  }

  async postToGroup(message: TelegramMessage): Promise<boolean> {
    if (!this.groupId) return false;
    return this.sendMessage(this.groupId, message);
  }

  async postToBoth(message: TelegramMessage): Promise<boolean> {
    const [channelResult, groupResult] = await Promise.all([
      this.postToChannel(message),
      this.postToGroup(message)
    ]);
    return channelResult && groupResult;
  }

  // Racing achievement notifications
  async postRaceCompletion(username: string, wpm: number, accuracy: number, raceType?: string): Promise<void> {
    const message = {
      text: `<b>🏁 Race Complete!</b>

<b>${username}</b> finished with:
📊 ${wpm} WPM | ${accuracy}% accuracy
${raceType ? `🎮 ${raceType}` : ''}

<i>Every keystroke brings us closer to digital mastery!</i>

🔗 <a href="https://chickenjockeyracer.replit.app">Join the race</a>`,
      parse_mode: 'HTML' as const
    };

    // Post to both channel and group
    await this.postToBoth(message);
  }

  // Sacred text completion notifications
  async postSacredTextCompletion(username: string, textTitle: string, chapter?: string): Promise<void> {
    const message = {
      text: `<b>📜 Sacred Text Mastered!</b>

<b>${username}</b> has completed:
🌟 <i>${textTitle}</i>
${chapter ? `📖 ${chapter}` : ''}

<i>"The scribe who masters ancient wisdom carries the light forward."</i>

🔗 <a href="https://chickenjockeyracer.replit.app/glyph-scribes">Begin your journey</a>`,
      parse_mode: 'HTML' as const
    };

    await this.postToBoth(message);
  }

  // Glyph Scribes completion notifications
  async postGlyphScribeCompletion(username: string, chapter: string, timing: number, accuracy: number, xpAwarded: number = 0, qlxAwarded: number = 0): Promise<void> {
    const rewardsText = (xpAwarded > 0 || qlxAwarded > 0) 
      ? `\n✨ Rewards: ${xpAwarded > 0 ? `+${xpAwarded} XP` : ''}${xpAwarded > 0 && qlxAwarded > 0 ? ' • ' : ''}${qlxAwarded > 0 ? `+${qlxAwarded} QLX` : ''}`
      : '';

    const message = {
      text: `<b>🧿 Glyph Scribe Achievement!</b>

<b>${username}</b> mastered:
📚 <i>${chapter}</i>
⏱️ Completed in ${Math.round(timing)}s
🎯 ${accuracy}% accuracy${rewardsText}

<i>Ancient wisdom flows through digital channels.</i>

🔗 <a href="https://chickenjockeyracer.replit.app/glyph-scribes">Study the sacred symbols</a>`,
      parse_mode: 'HTML' as const
    };

    await this.postToBoth(message);
  }

  // Faction achievements
  async postFactionAchievement(username: string, faction: string, achievement: string): Promise<void> {
    const factionEmojis: Record<string, string> = {
      'd2': '⚡',
      'd4': '🔥', 
      'd6': '🌍',
      'd8': '💨',
      'd10': '🌀',
      'd12': '✨',
      'd20': '🌊',
      'd100': '🎯'
    };

    const message = {
      text: `<b>${factionEmojis[faction] || '🎖️'} Faction Achievement!</b>

<b>${username}</b> unlocked:
🏆 <i>${achievement}</i>
⚔️ Faction: ${faction.toUpperCase()}

<i>Honor through typing mastery!</i>

🔗 <a href="https://chickenjockeyracer.replit.app">Choose your faction</a>`,
      parse_mode: 'HTML' as const
    };

    await this.postToGroup(message);
  }

  // Daily wisdom quotes
  async postDailyWisdom(quote: string, source?: string): Promise<void> {
    const message = {
      text: `<b>💫 Daily Wisdom</b>

<i>"${quote}"</i>

${source ? `— ${source}` : '— Ancient Proverb'}

<i>Let wisdom guide your keystrokes today.</i>

🔗 <a href="https://chickenjockeyracer.replit.app">Begin your journey</a>`,
      parse_mode: 'HTML' as const
    };

    await this.postToChannel(message);
  }

  // Campaign updates and announcements
  async postCampaignUpdate(title: string, description: string, url?: string): Promise<void> {
    const message = {
      text: `<b>📣 Campaign Update</b>

<b>${title}</b>

${description}

${url ? `🔗 <a href="${url}">Learn more</a>` : '🔗 <a href="https://chickenjockeyracer.replit.app">Play now</a>'}`,
      parse_mode: 'HTML' as const
    };

    await this.postToBoth(message);
  }

  // Matrix Federation race results
  async postMatrixRaceResults(results: any[]): Promise<void> {
    const topPlayers = results.slice(0, 3);
    let resultText = '<b>🏁 Matrix Federation Race Complete!</b>\n\n<b>🏆 Top Performers:</b>\n';
    
    topPlayers.forEach((player, index) => {
      const medals = ['🥇', '🥈', '🥉'];
      resultText += `${medals[index]} <b>${player.username}</b> - ${player.wpm} WPM\n`;
    });

    resultText += '\n<i>The digital realm rewards swift scribes!</i>\n\n🔗 <a href="https://chickenjockeyracer.replit.app/matrix-race">Join the Matrix</a>';

    const message = {
      text: resultText,
      parse_mode: 'HTML' as const
    };

    await this.postToBoth(message);
  }

  // Math race completion notifications
  async postMathRaceCompletion(
    username: string, 
    correctAnswers: number, 
    totalProblems: number, 
    accuracy: number, 
    qlxEarned: number, 
    level: string, 
    isGuest: boolean
  ): Promise<void> {
    const playerType = isGuest ? '(Guest)' : '';
    const message = {
      text: `<b>🧮 Math Race Complete!</b>

<b>${username}</b> ${playerType} finished:
📊 <i>${level} Level</i>
✅ ${correctAnswers}/${totalProblems} correct answers
🎯 ${accuracy}% accuracy
💰 Earned <b>${qlxEarned} QuiLuX coins</b>

<i>Mathematical mastery unlocks infinite possibilities!</i>

🔗 <a href="https://chickenjockeyracer.replit.app/maths">Practice Math Racing</a>`,
      parse_mode: 'HTML' as const
    };

    await this.postToBoth(message);
  }
}

export const telegramService = new TelegramService();