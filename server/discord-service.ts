import { DiscordWebhook } from "./discord-webhook";

class DiscordService {
  private static instance: DiscordService;
  private webhook: DiscordWebhook | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): DiscordService {
    if (!DiscordService.instance) {
      DiscordService.instance = new DiscordService();
    }
    return DiscordService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!process.env.DISCORD_WEBHOOK_URL) {
      console.log('🤖 Discord webhook URL not provided - Discord features disabled');
      return;
    }

    try {
      this.webhook = new DiscordWebhook(process.env.DISCORD_WEBHOOK_URL);
      this.initialized = true;
      console.log('🎮 Discord webhook initialized for race results posting');
    } catch (error) {
      console.log('⚠️ Discord webhook initialization failed:', error);
      this.webhook = null;
    }
  }

  getWebhook(): DiscordWebhook | null {
    return this.webhook;
  }

  isAvailable(): boolean {
    return this.webhook !== null;
  }
}

export const discordService = DiscordService.getInstance();