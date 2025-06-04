import type { Express } from "express";
import { discordService } from "./discord-service";
import { storage } from "./storage";

export function setupDiscordRoutes(app: Express) {
  if (!discordService.isAvailable()) {
    return;
  }

  const discordWebhook = discordService.getWebhook()!;

  // Test Discord webhook connection
  app.get('/api/discord/test', async (req, res) => {
    try {
      await discordWebhook.testConnection();
      res.json({ success: true, message: 'Discord webhook test message sent successfully' });
    } catch (error: any) {
      console.error('Discord webhook test failed:', error);
      res.status(500).json({ 
        error: 'Discord webhook connection failed', 
        details: error.message 
      });
    }
  });

  // Post current leaderboard to Discord
  app.post('/api/discord/leaderboard', async (req, res) => {
    try {
      if (!process.env.DISCORD_CHANNEL_ID) {
        return res.status(400).json({ 
          error: 'DISCORD_CHANNEL_ID not set' 
        });
      }

      // Get top players from storage
      const players = await storage.getTopPlayers(10);
      
      if (players.length === 0) {
        return res.json({ message: 'No players found for leaderboard' });
      }

      // Format players for Discord
      const leaderboardPlayers = players.map(player => ({
        username: player.username,
        bestWpm: player.bestWpm || 0,
        totalRaces: player.totalRaces || 0,
        faction: player.currentFaction
      }));

      await discordClient.postLeaderboard(
        process.env.DISCORD_CHANNEL_ID,
        'CJSR Global Leaderboard',
        leaderboardPlayers
      );

      res.json({ success: true, message: 'Leaderboard posted to Discord' });
    } catch (error: any) {
      console.error('Failed to post leaderboard to Discord:', error);
      res.status(500).json({ 
        error: 'Failed to post leaderboard', 
        details: error.message 
      });
    }
  });

  // Manual race result posting (for testing)
  app.post('/api/discord/race-result', async (req, res) => {
    try {
      if (!process.env.DISCORD_CHANNEL_ID) {
        return res.status(400).json({ 
          error: 'DISCORD_CHANNEL_ID not set' 
        });
      }

      const { playerName, placement, wpm, accuracy, raceTime, faction } = req.body;

      if (!playerName || !placement || !wpm || !accuracy || !raceTime) {
        return res.status(400).json({ 
          error: 'Missing required race result data' 
        });
      }

      await discordClient.postRaceCompletion(
        process.env.DISCORD_CHANNEL_ID,
        playerName,
        placement,
        wpm,
        accuracy,
        raceTime,
        faction
      );

      res.json({ success: true, message: 'Race result posted to Discord' });
    } catch (error: any) {
      console.error('Failed to post race result to Discord:', error);
      res.status(500).json({ 
        error: 'Failed to post race result', 
        details: error.message 
      });
    }
  });
}