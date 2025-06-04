import { DiscordWebhook } from '../discord-webhook';

class DiscordService {
  private webhook: DiscordWebhook | null = null;

  constructor() {
    if (process.env.DISCORD_WEBHOOK_URL) {
      this.webhook = new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL);
    }
  }

  private generateGuestName(): string {
    const adjectives = ['Swift', 'Quick', 'Fast', 'Rapid', 'Speedy', 'Lightning', 'Turbo', 'Flash'];
    const nouns = ['Scribe', 'Typer', 'Writer', 'Racer', 'Keyboard', 'Fingers', 'Words', 'Text'];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `Guest${adjective}${noun}${randomNum}`;
  }

  async reportRaceCompletion(
    username: string | null,
    raceType: string,
    wpm: number,
    accuracy: number,
    raceTime: number,
    options: {
      faction?: string;
      xp?: number;
      placement?: number;
      promptText?: string;
      isGuest?: boolean;
    } = {}
  ) {
    if (!this.webhook) {
      console.log('Discord webhook not configured, skipping race report');
      return;
    }

    try {
      const playerName = username || this.generateGuestName();
      
      await this.webhook.postUniversalRaceCompletion(
        playerName,
        raceType,
        Math.round(wpm),
        Math.round(accuracy),
        raceTime,
        options.faction,
        options.xp,
        options.placement,
        options.promptText
      );

      console.log(`✅ Discord: ${raceType} completion reported for ${playerName}`);
    } catch (error) {
      console.error('❌ Failed to report race completion to Discord:', error);
    }
  }

  async reportGlyphScribeCompletion(
    username: string | null,
    chapter: string,
    tome: string,
    glyphsUnlocked: number,
    totalTime: number
  ) {
    if (!this.webhook) {
      console.log('Discord webhook not configured, skipping glyph scribe report');
      return;
    }

    try {
      const playerName = username || this.generateGuestName();
      
      // Use the same universal posting method but with GLYPH SCRIBE label
      await this.webhook.postUniversalRaceCompletion(
        playerName,
        `GLYPH SCRIBE: ${tome} - ${chapter}`,
        0, // No WPM for glyph learning
        100, // Always 100% accuracy required for completion
        totalTime,
        undefined, // No faction
        undefined, // No XP
        undefined, // No placement
        `Mastered ${glyphsUnlocked} Adinkra symbols with cultural authenticity`
      );

      console.log(`✅ Discord: Glyph Scribe completion reported for ${playerName}: ${chapter}`);
    } catch (error) {
      console.error('❌ Failed to report glyph scribe completion to Discord:', error);
    }
  }

  getWebhook(): DiscordWebhook | null {
    return this.webhook;
  }
}

export const discordService = new DiscordService();