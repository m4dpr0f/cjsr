import type { Express } from "express";
import { cjsrRoomManager } from './room-manager';
import { matrixConfig, setupMatrixCredentials } from './matrix-config';
import { cjsrMatrixClient } from './matrix-client';
import { z } from "zod";

const createRaceSchema = z.object({
  faction: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  maxPlayers: z.number().min(2).max(8).default(8)
});

const joinRaceSchema = z.object({
  raceId: z.string()
});

const updateProgressSchema = z.object({
  raceId: z.string(),
  charactersTyped: z.number(),
  wpm: z.number(),
  accuracy: z.number()
});

const finishRaceSchema = z.object({
  raceId: z.string(),
  finalWpm: z.number(),
  finalAccuracy: z.number(),
  finishPosition: z.number()
});

const setupCredentialsSchema = z.object({
  homeserver: z.string().url(),
  accessToken: z.string().min(10),
  userId: z.string().regex(/^@.*:.*$/)
});

export function registerMatrixRoutes(app: Express) {
  // Setup Matrix credentials (one-time configuration)
  app.post('/api/matrix/setup', async (req, res) => {
    try {
      const data = setupCredentialsSchema.parse(req.body);
      
      // Configure credentials
      const success = setupMatrixCredentials(data.homeserver, data.accessToken, data.userId);
      
      if (success) {
        // Initialize the Matrix client
        await cjsrMatrixClient.initializeClient(data.homeserver, data.accessToken, data.userId);
        
        res.json({
          success: true,
          message: 'Matrix federation activated! CJSR is now ready for cross-server racing.',
          status: matrixConfig.getStatus()
        });
      } else {
        res.status(400).json({
          error: 'Failed to configure Matrix credentials'
        });
      }
    } catch (error: any) {
      console.error('Matrix setup error:', error);
      res.status(400).json({ 
        error: 'Invalid Matrix credentials',
        details: error.message 
      });
    }
  });

  // Create a new Matrix-based race room
  app.post('/api/matrix/races/create', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const data = createRaceSchema.parse(req.body);
      const userId = String((req.user as any).id);
      
      const raceRoom = await cjsrRoomManager.createFactionRaceRoom(
        data.faction,
        userId,
        data.difficulty,
        data.maxPlayers
      );

      res.json({
        success: true,
        race: raceRoom,
        message: `Matrix race room created for ${data.faction} faction`
      });
    } catch (error: any) {
      console.error('Matrix race creation error:', error);
      res.status(500).json({ 
        error: 'Failed to create Matrix race room',
        details: error.message 
      });
    }
  });

  // Join an existing Matrix race room
  app.post('/api/matrix/races/join', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const data = joinRaceSchema.parse(req.body);
      const userId = String((req.user as any).id);
      
      const raceRoom = await cjsrRoomManager.joinRaceRoom(data.raceId, userId);

      res.json({
        success: true,
        race: raceRoom,
        message: 'Successfully joined Matrix race room'
      });
    } catch (error: any) {
      console.error('Matrix race join error:', error);
      res.status(400).json({ 
        error: 'Failed to join Matrix race room',
        details: error.message 
      });
    }
  });

  // Start a Matrix race (host only)
  app.post('/api/matrix/races/:raceId/start', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { raceId } = req.params;
      const userId = String((req.user as any).id);
      
      const raceRoom = await cjsrRoomManager.startRace(raceId, userId);

      res.json({
        success: true,
        race: raceRoom,
        message: 'Matrix race started successfully'
      });
    } catch (error: any) {
      console.error('Matrix race start error:', error);
      res.status(400).json({ 
        error: 'Failed to start Matrix race',
        details: error.message 
      });
    }
  });

  // Update race progress via Matrix
  app.post('/api/matrix/races/progress', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const data = updateProgressSchema.parse(req.body);
      const userId = String((req.user as any).id);
      
      await cjsrRoomManager.updateRaceProgress(
        data.raceId,
        userId,
        data.charactersTyped,
        data.wpm,
        data.accuracy
      );

      res.json({
        success: true,
        message: 'Race progress updated via Matrix'
      });
    } catch (error: any) {
      console.error('Matrix progress update error:', error);
      res.status(400).json({ 
        error: 'Failed to update race progress',
        details: error.message 
      });
    }
  });

  // Finish race and send results via Matrix
  app.post('/api/matrix/races/finish', async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const data = finishRaceSchema.parse(req.body);
      const userId = String((req.user as any).id);
      
      await cjsrRoomManager.finishRace(
        data.raceId,
        userId,
        data.finalWpm,
        data.finalAccuracy,
        data.finishPosition
      );

      res.json({
        success: true,
        message: 'Race finished and results sent via Matrix'
      });
    } catch (error: any) {
      console.error('Matrix race finish error:', error);
      res.status(400).json({ 
        error: 'Failed to finish race',
        details: error.message 
      });
    }
  });

  // Get active races for a faction
  app.get('/api/matrix/races/faction/:faction', async (req, res) => {
    try {
      const { faction } = req.params;
      const races = cjsrRoomManager.getActiveFactionRaces(faction);

      res.json({
        success: true,
        faction,
        races,
        count: races.length
      });
    } catch (error: any) {
      console.error('Get faction races error:', error);
      res.status(500).json({ 
        error: 'Failed to get faction races',
        details: error.message 
      });
    }
  });

  // Get all active Matrix races
  app.get('/api/matrix/races', async (req, res) => {
    try {
      const races = cjsrRoomManager.getAllActiveRaces();

      res.json({
        success: true,
        races,
        count: races.length,
        by_faction: races.reduce((acc, race) => {
          acc[race.faction] = (acc[race.faction] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
    } catch (error: any) {
      console.error('Get all races error:', error);
      res.status(500).json({ 
        error: 'Failed to get races',
        details: error.message 
      });
    }
  });

  // Get specific race details
  app.get('/api/matrix/races/:raceId', async (req, res) => {
    try {
      const { raceId } = req.params;
      const race = cjsrRoomManager.getRace(raceId);

      if (!race) {
        return res.status(404).json({ error: 'Race not found' });
      }

      res.json({
        success: true,
        race
      });
    } catch (error: any) {
      console.error('Get race details error:', error);
      res.status(500).json({ 
        error: 'Failed to get race details',
        details: error.message 
      });
    }
  });

  // Get available faction servers
  app.get('/api/matrix/factions', async (req, res) => {
    try {
      const factionServers = cjsrRoomManager.getFactionServers();

      res.json({
        success: true,
        factions: factionServers,
        message: 'Available faction servers for Matrix federation'
      });
    } catch (error: any) {
      console.error('Get faction servers error:', error);
      res.status(500).json({ 
        error: 'Failed to get faction servers',
        details: error.message 
      });
    }
  });

  // Matrix connection status
  app.get('/api/matrix/status', async (req, res) => {
    try {
      // This would check Matrix client connection status
      const isConnected = false; // Will be implemented when Matrix credentials are provided
      
      res.json({
        success: true,
        matrix_connected: isConnected,
        active_races: cjsrRoomManager.getAllActiveRaces().length,
        message: isConnected ? 'Matrix federation active' : 'Matrix federation ready (awaiting credentials)'
      });
    } catch (error: any) {
      console.error('Matrix status error:', error);
      res.status(500).json({ 
        error: 'Failed to get Matrix status',
        details: error.message 
      });
    }
  });

  console.log('📡 Matrix federation API routes registered');
}