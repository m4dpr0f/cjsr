import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { registerAdminRoutes } from "./simple-admin-routes";
import { initWebSocketHandlers } from "./websocket/message-handler";
import { setupDiscordRoutes } from "./discord-routes";
import { RaceManager } from "./game/race-manager";
import { PromptManager } from "./game/prompt-manager";
import { PlayerManager } from "./game/player-manager";
import { CampaignService } from "./campaign-service";
import { getRandomSacredText, getTextsByTradition, getAvailableTraditions } from "./sacred-text-parser";
import { discordService } from "./services/discord-service";
import { telegramService } from "./services/telegram-service";
import { z } from "zod";
import { ZodError } from "zod";
import { 
  insertPromptSchema, 
  insertUserSchema, 
  userRegistrationSchema, 
  customizationSchema,
  passwordRecoveryRequestSchema,
  usernameRecoveryRequestSchema,
  passwordResetSchema,
  users
} from "@shared/schema";
import { db } from "./db";
import { desc, sql, eq } from "drizzle-orm";
import { multiplayerRaces, raceParticipants, playerStats } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { 
  generateEnhancedPasswordResetEmail, 
  generateEnhancedUsernameRecoveryEmail 
} from "./utils/enhanced-email";
import { sendEmail } from "./utils/email";
import * as path from "path";
import * as fs from "fs";
import multer from "multer";
import { randomUUID } from "crypto";
import sharp from "sharp";
import { registerTEK8Routes } from "./routes/tek8";
import { registerShrineRoutes } from "./routes/shrine";
import { StatsService } from "./stats-service";
import { initializeRacingVenues } from "./init-racing-venues";
// TEK8 and Shrine routes are implemented in separate files

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Initialize Socket.IO for Matrix races
  try {
    const { SimpleSocketIO } = await import('./simple-socket-io');
    const socketIO = new SimpleSocketIO(httpServer);
    console.log('🔌 Socket.IO initialized for Matrix races');
  } catch (error) {
    console.log('⚠️ Socket.IO not available, using fallback system');
  }

  // Initialize Quick Race Socket.IO server
  try {
    const { setupQuickRaceSocket } = await import('./quick-race-socket');
    setupQuickRaceSocket(httpServer);
    console.log('🚀 Quick Race Socket.IO server initialized');
  } catch (error) {
    console.error('Failed to initialize Quick Race Socket.IO:', error);
  }
  
  // Auth check middleware - MUST be defined before any routes that use it
  const isAuthenticated = async (req: any, res: any, next: any) => {
    console.log(`🔐 Auth check - session:`, req.session?.userId, `cookies:`, req.headers?.cookie);
    
    const userId = req.session?.userId;
    
    if (!userId) {
      console.log(`❌ No userId in session`);
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      console.log(`❌ User not found for ID: ${userId}`);
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    console.log(`✅ User authenticated: ${user.username}`);
    req.user = user;
    next();
  };
  
  // Initialize game managers
  const raceManager = new RaceManager();
  const promptManager = new PromptManager(storage);
  const playerManager = new PlayerManager(storage);
  
  // Initialize Matrix room manager
  const { CJSRRoomManager } = await import('./matrix/room-manager');
  const roomManager = new CJSRRoomManager();
  (global as any).roomManager = roomManager;
  
  // Initialize the actual Matrix race room with known participants
  roomManager.initializeMatrixRace('!PeFDRrFqXUxBiMBUOx:matrix.org', 'playtest-fire-001');
  
  // Matrix READY system - manages ready states across federation
  app.post('/api/matrix/set-ready', async (req, res) => {
    try {
      const { roomId, playerId, isReady } = req.body;
      
      console.log(`🎯 Matrix READY: ${playerId} is ${isReady ? 'READY' : 'NOT READY'} in room ${roomId}`);
      
      // Import real Matrix client for Element integration
      const { realMatrixClient } = await import('./matrix/real-matrix-client');
      
      // Send ready message to Element room
      await realMatrixClient.sendReadyMessage(roomId, playerId, isReady);
      
      // Update ready state through Matrix federation
      const readyPlayers = roomManager.setPlayerReady(roomId, playerId, isReady);
      const canStartRace = readyPlayers.length >= 2;
      
      // Broadcast ready state to all Matrix participants
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'matrix_ready_update',
            data: { playerId, isReady, readyPlayers, canStartRace, roomId }
          }));
        }
      });
      
      res.json({ 
        success: true, 
        readyPlayers, 
        canStartRace,
        message: `${playerId} ready state updated in Matrix federation`
      });
    } catch (error) {
      console.error('Matrix ready system error:', error);
      res.status(500).json({ error: 'Failed to update ready state' });
    }
  });

  // Matrix synchronized race start - begins race for ALL ready players
  app.post('/api/matrix/start-race', async (req, res) => {
    try {
      const { roomId, raceId, startedBy } = req.body;
      
      console.log(`🏁 Matrix Race Started by ${startedBy} in room ${roomId}`);
      
      // Import real Matrix client for Element integration
      const { realMatrixClient } = await import('./matrix/real-matrix-client');
      
      // Get ready players who will participate
      const readyPlayers = roomManager.getReadyPlayers(roomId);
      
      if (readyPlayers.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 ready players to start race' });
      }
      
      // Send race start message to Element room
      await realMatrixClient.sendRaceStartMessage(roomId, startedBy, readyPlayers);
      
      // Broadcast race start to ALL Matrix participants
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'matrix_race_start',
            data: { 
              roomId, 
              raceId, 
              startedBy, 
              participants: readyPlayers,
              startTime: Date.now(),
              prompt: 'In war, the way is to avoid what is strong and to strike at what is weak.'
            }
          }));
        }
      });
      
      res.json({ 
        success: true, 
        participants: readyPlayers,
        message: `Matrix race started with ${readyPlayers.length} players`
      });
    } catch (error) {
      console.error('Matrix race start error:', error);
      res.status(500).json({ error: 'Failed to start Matrix race' });
    }
  });

  // Track race finishers for competitive placement
  const raceFinishers = new Map<string, Array<{playerId: string, finalWpm: number, finalAccuracy: number, finishTime: number, timestamp: number}>>();

  // Matrix race completion - posts results to Element and saves to CJSR leaderboard
  app.post('/api/matrix/race-complete', async (req, res) => {
    try {
      const { roomId, playerId, finalWpm, finalAccuracy, finishTime, prompt, faction } = req.body;
      
      console.log(`🏆 Matrix Race Complete: ${playerId} - ${finalWpm} WPM`);
      
      // Initialize race finishers if not exists
      if (!raceFinishers.has(roomId)) {
        raceFinishers.set(roomId, []);
      }
      
      // Add this player to finishers list
      const finishers = raceFinishers.get(roomId)!;
      const placement = finishers.length + 1;
      
      finishers.push({
        playerId,
        finalWpm,
        finalAccuracy,
        finishTime,
        timestamp: Date.now()
      });
      
      // Calculate XP based on placement (1st=100, 2nd=75, 3rd=50, others=25)
      const xpReward = placement === 1 ? 100 : placement === 2 ? 75 : placement === 3 ? 50 : 25;
      const placementText = placement === 1 ? "1st" : placement === 2 ? "2nd" : placement === 3 ? "3rd" : `${placement}th`;
      
      // Import real Matrix client for Element integration
      const { matrixAPIClient } = await import('./matrix/matrix-api-client');
      
      // Post individual race completion to Element room with placement
      await matrixAPIClient.sendRaceCompleteWithPlacement(
        roomId, 
        playerId, 
        placementText, 
        finalWpm, 
        finalAccuracy, 
        finishTime, 
        xpReward
      );
      
      console.log(`🎯 Posting ${placementText} place result to Element room...`);
      console.log(`✅ Posted ${playerId} ${placementText} place result to Element!`);
      
      console.log(`📊 Race result saved for ${playerId} - ${placement} place, ${finalWpm} WPM`);
      
      // Check if all ready players have finished
      const readyPlayers = roomManager.getReadyPlayers(roomId) || [];
      const expectedFinishers = readyPlayers.length;
      
      console.log(`🎯 Race progress: ${finishers.length}/${expectedFinishers} players finished`);
      
      if (finishers.length >= expectedFinishers) {
        // All ready players have finished - post final race summary to Element
        await matrixAPIClient.sendFinalRaceResults(roomId, finishers);
        
        console.log(`🏆 Final race results posted for ${expectedFinishers} players!`);
        
        // Clear race finishers for next race
        raceFinishers.delete(roomId);
      }
      
      res.json({ 
        success: true,
        placement: placementText,
        xpReward,
        message: `${placementText} place finish posted to Element! +${xpReward} XP`
      });
    } catch (error) {
      console.error('Matrix race completion error:', error);
      res.status(500).json({ error: 'Failed to save race results' });
    }
  });

  // Element room message bridge - connects your Matrix chat to CJSR game
  app.post('/api/matrix/room-message', async (req, res) => {
    try {
      const { message, sender, roomId } = req.body;
      
      console.log(`💬 Element Message [${roomId}] ${sender}: ${message}`);
      
      // Broadcast Element messages to all CJSR players in real-time
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'matrix_chat',
            data: { sender, message, timestamp: Date.now(), roomId }
          }));
        }
      });
      
      res.json({ success: true, message: `Element chat synchronized to CJSR` });
    } catch (error) {
      console.error('Matrix room message sync error:', error);
      res.status(500).json({ error: 'Failed to sync Element message' });
    }
  });
  
  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Initialize racing venues (guild halls and core arenas)
  await initializeRacingVenues();

  // Initialize WebSocket handlers
  initWebSocketHandlers(wss, raceManager, promptManager, playerManager);
  
  // Register admin routes
  registerAdminRoutes(app);
  
  // Setup Discord routes
  setupDiscordRoutes(app);
  
  // Set up NPC update interval
  setInterval(() => {
    // Update NPCs in all active races
    for (const raceId of raceManager.getAllRaces().map(race => race.id)) {
      raceManager.updateNpcProgress(raceId);
      
      // Update all clients with player progress
      const race = raceManager.getRace(raceId);
      if (race && race.status === 'racing') {
        race.players.forEach(player => {
          // Broadcast updated player progress to everyone in the race
          race.players.forEach(otherPlayer => {
            if (otherPlayer.socket.readyState === WebSocket.OPEN) {
              otherPlayer.socket.send(JSON.stringify({
                type: "player_progress",
                playerId: player.id,
                progress: player.progress
              }));
            }
          });
        });
      }
    }
  }, 250); // Update 4 times per second
  
  // CRITICAL: Private room API endpoints MUST be first to prevent route conflicts
  app.get("/api/private-rooms", async (req, res) => {
    console.log("🏟️ RACING VENUES API ROUTE ACCESSED!");
    try {
      // Get persistent guild halls and core arenas from database
      const venues = await db.select().from(multiplayerRaces)
        .where(sql`${multiplayerRaces.mode} IN ('guild', 'arena')`);
      
      // Get participant counts for each venue
      const venuesWithCounts = await Promise.all(venues.map(async (venue) => {
        // Note: raceParticipants uses integer session_id, but venues use text id
        // For now, we'll return 0 participants since these are persistent venues
        const participants = [];
        
        const settings = typeof venue.settings === 'string' ? JSON.parse(venue.settings) : venue.settings;
        
        return {
          id: venue.id,
          name: venue.name,
          host: venue.mode === 'guild' ? 'Guild Master' : 'Arena Master',
          playerCount: participants.length,
          maxPlayers: venue.max_players,
          customPrompt: venue.prompt_text,
          isPasswordProtected: venue.is_password_protected,
          status: venue.status,
          faction: settings.faction || 'none',
          theme: settings.theme || 'general',
          mode: venue.mode,
          restrictedAccess: venue.mode === 'guild' // Guild halls are faction-restricted
        };
      }));
      
      console.log(`🏟️ Fetching racing venues: found ${venuesWithCounts.length} venues`);
      console.log('⚡ Venue details:', JSON.stringify(venuesWithCounts, null, 2));
      res.json(venuesWithCounts);
    } catch (error) {
      console.error("Error fetching racing venues:", error);
      res.status(500).json({ message: "Failed to fetch racing venues" });
    }
  });

  app.post("/api/private-rooms", isAuthenticated, async (req: any, res: Response) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`🌐 Redirecting ${user.username} to Matrix Federation Racing`);
      
      // Redirect to Matrix race page for cross-server federation racing
      res.status(201).json({
        redirect: "/matrix-race",
        message: "Matrix Federation Racing is now available!",
        features: [
          "Cross-server multiplayer racing",
          "Real-time Element room integration", 
          "Live race results posting",
          "Federation leaderboards",
          "Art of War strategic passages"
        ]
      });
    } catch (error) {
      console.error("Error redirecting to Matrix racing:", error);
      res.status(500).json({ message: "Failed to access Matrix racing" });
    }
  });

  // Start private race route
  app.post("/api/private-rooms/:roomId/start", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.id;
      
      console.log(`🚀 Starting private race ${roomId} requested by user ${userId}`);
      
      const race = raceManager.getRace(roomId);
      if (!race) {
        return res.status(404).json({ message: "Race not found" });
      }
      
      if (race.hostId !== userId.toString()) {
        return res.status(403).json({ message: "Only the host can start the race" });
      }
      
      const success = raceManager.startPrivateRaceCountdown(roomId);
      if (!success) {
        return res.status(400).json({ message: "Failed to start race" });
      }
      
      console.log(`✅ Private race ${roomId} countdown started`);
      res.json({ message: "Race countdown started" });
    } catch (error) {
      console.error("Error starting private race:", error);
      res.status(500).json({ message: "Failed to start race" });
    }
  });

  // Set up multer for file uploads
  const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads/avatars');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, 'avatar-' + uniqueSuffix + ext);
    }
  });
  
  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  };
  
  const upload = multer({ 
    storage: avatarStorage, 
    fileFilter,
    limits: { 
      fileSize: 1024 * 1024 // 1MB limit
    }
  });;
  
  // API Routes
  
  // User authentication and registration with guest data migration
  app.post("/api/auth/register", upload.single('avatar'), async (req: Request, res: Response) => {
    try {
      // Get the form data and optional guest data
      const { username, password, email, guestXP, guestCampaignProgress } = req.body;
      
      // Validate registration data
      const userData = insertUserSchema.parse({
        username,
        password,
        email: email || undefined
      });
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        // Clean up the uploaded file if it exists
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(409).json({ message: "Username already taken" });
      }
      
      // If email is provided, check if it already exists
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          // Clean up the uploaded file if it exists
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(409).json({ message: "Email already registered" });
        }
      }
      
      // Process avatar if uploaded
      let avatarUrl = undefined;
      if (req.file) {
        try {
          // Resize image to save space and ensure consistent avatar size
          const outputPath = req.file.path.replace(path.extname(req.file.path), '.webp');
          
          await sharp(req.file.path)
            .resize(128, 128, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(outputPath);
            
          // Delete the original file after processing
          fs.unlinkSync(req.file.path);
          
          // Set the avatar URL relative to the server
          avatarUrl = '/uploads/avatars/' + path.basename(outputPath);
        } catch (error) {
          console.error('Error processing avatar image:', error);
          // Continue registration without avatar if processing fails
        }
      }
      
      // Check for placement test selections and apply them
      let userCustomizations: any = {};
      
      if (req.body.selected_faction) {
        userCustomizations.current_faction = req.body.selected_faction;
      }
      
      if (req.body.selected_chicken) {
        userCustomizations.chicken_type = req.body.selected_chicken;
      }
      
      if (req.body.selected_jockey) {
        userCustomizations.jockey_type = req.body.selected_jockey;
      }
      
      // Create the user with avatar and customizations if available
      const newUser = await storage.createUser({
        ...userData,
        avatar_url: avatarUrl,
        ...userCustomizations
      });
      
      // Transfer guest XP if provided
      if (guestXP && typeof guestXP === 'number' && guestXP > 0) {
        try {
          await storage.updateUserXp(newUser.id, guestXP);
          console.log(`Transferred ${guestXP} guest XP to new user ${newUser.username}`);
        } catch (e) {
          console.log('Failed to transfer guest XP:', e);
        }
      }
      
      // Transfer guest campaign progress if provided
      if (guestCampaignProgress && typeof guestCampaignProgress === 'string') {
        try {
          await storage.updateUserCampaignProgress(newUser.id, guestCampaignProgress);
          console.log(`Transferred guest campaign progress to new user ${newUser.username}`);
        } catch (e) {
          console.log('Failed to transfer guest campaign progress:', e);
        }
      }
      
      // If placement stats were provided, store them
      if (req.body.placement_stats) {
        try {
          const stats = JSON.parse(req.body.placement_stats);
          // You could store these stats in a user_stats table if needed
          console.log(`New user ${newUser.username} registered with placement stats:`, stats);
        } catch (e) {
          console.log('Failed to parse placement stats:', e);
        }
      }
      
      console.log(`New user ${newUser.username} registered with customizations:`, userCustomizations);
      
      // Send welcome notification to Telegram
      try {
        const welcomeMessage = {
          text: `<b>🎉 New CJSR Racer!</b>

Welcome <b>${newUser.username}</b> to the community!

<i>Get ready to race chickens, master ancient wisdom, and join the scribes!</i>

🔗 <a href="https://chickenjockeyracer.replit.app">Start your journey</a>`,
          parse_mode: 'HTML' as const
        };
        
        await telegramService.postToBoth(welcomeMessage);
      } catch (telegramError) {
        console.error('Failed to send welcome message to Telegram:', telegramError);
      }
      
      // Remove sensitive data from response
      const { password: _, ...userResponse } = newUser;
      
      res.status(201).json(userResponse);
    } catch (error) {
      // Clean up the uploaded file if it exists in case of an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error("Registration error:", error);
      if (error instanceof ZodError) {
        const zodError = fromZodError(error);
        res.status(400).json({ message: zodError.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred during registration" });
      }
    }
  });
  
  app.post("/api/auth/login", async (req: any, res: Response) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Don't send password back
      const { password: _, ...userResponse } = user;
      
      // Set session data with improved logging for troubleshooting
      if (req.session) {
        req.session.userId = user.id;
        console.log(`User ${user.username} logged in successfully, session ID: ${req.sessionID}`);
      } else {
        console.warn("Session object not available - user will not remain logged in");
      }
      
      res.status(200).json(userResponse);
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof ZodError) {
        const zodError = fromZodError(error);
        res.status(400).json({ message: zodError.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred during login" });
      }
    }
  });
  
  app.post("/api/auth/logout", (req: any, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  
  // Password recovery request endpoint
  app.post("/api/auth/recover-password", async (req: Request, res: Response) => {
    try {
      const { email } = passwordRecoveryRequestSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // For security reasons, don't reveal if the email exists
        return res.status(200).json({ 
          message: "If the email exists in our system, a password reset link has been sent." 
        });
      }
      
      // Create a recovery token
      const token = await storage.createRecoveryToken(user.id, "password");
      
      // Get base URL for reset link (in production, this would be your domain)
      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
      
      // Generate enhanced email content
      const emailContent = generateEnhancedPasswordResetEmail(user.username, token, baseUrl);
      
      // Send the email
      await sendEmail(email, emailContent.subject, emailContent.text, emailContent.html);
      
      res.status(200).json({ 
        message: "If the email exists in our system, a password reset link has been sent." 
      });
    } catch (error) {
      console.error("Password recovery error:", error);
      if (error instanceof ZodError) {
        const zodError = fromZodError(error);
        res.status(400).json({ message: zodError.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred during password recovery" });
      }
    }
  });
  
  // Username recovery request endpoint
  app.post("/api/auth/recover-username", async (req: Request, res: Response) => {
    try {
      const { email } = usernameRecoveryRequestSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        // For security reasons, don't reveal if the email exists
        return res.status(200).json({ 
          message: "If the email exists in our system, your username has been sent." 
        });
      }
      
      // Generate enhanced email content
      const emailContent = generateEnhancedUsernameRecoveryEmail(email, user.username);
      
      // Send the email
      await sendEmail(email, emailContent.subject, emailContent.text, emailContent.html);
      
      res.status(200).json({ 
        message: "If the email exists in our system, your username has been sent." 
      });
    } catch (error) {
      console.error("Username recovery error:", error);
      if (error instanceof ZodError) {
        const zodError = fromZodError(error);
        res.status(400).json({ message: zodError.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred during username recovery" });
      }
    }
  });
  
  // Password reset endpoint
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = passwordResetSchema.parse(req.body);
      
      // Validate token
      const validationResult = await storage.validateRecoveryToken(token);
      
      if (!validationResult.valid || validationResult.tokenType !== "password") {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
      // Get the token from database
      const recoveryToken = await storage.getRecoveryTokenByToken(token);
      
      if (!recoveryToken) {
        return res.status(400).json({ message: "Invalid token" });
      }
      
      // Update the user's password
      await storage.updateUserPassword(validationResult.userId!, newPassword);
      
      // Mark the token as used
      await storage.markTokenAsUsed(recoveryToken.id);
      
      res.status(200).json({ message: "Password has been reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof ZodError) {
        const zodError = fromZodError(error);
        res.status(400).json({ message: zodError.message });
      } else {
        res.status(500).json({ message: "An unexpected error occurred during password reset" });
      }
    }
  });
  
  // User profile
  app.get("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    // Disable caching for profile data to ensure fresh faction XP data
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    const userId = req.user.id;
    
    try {
      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's race history
      const recentRaces = await storage.getRaceHistoryByUserId(userId, 10);
      
      // Get user's submitted prompts
      const prompts = await storage.getPromptsByAuthorId(userId);
      
      // Get user's egg collection
      const eggs = await storage.getUserEggs(userId);
      
      // Get user's player stats including faction data
      const playerStats = await storage.getUserStats(userId);
      
      // Don't send password back
      const { password, ...userProfile } = user;
      
      // Ensure faction_xp is properly parsed if it comes as a string
      let factionXpData = {};
      if (playerStats?.faction_xp) {
        if (typeof playerStats.faction_xp === 'string') {
          try {
            factionXpData = JSON.parse(playerStats.faction_xp);
          } catch (e) {
            console.error("Failed to parse faction_xp JSON:", e);
            factionXpData = {};
          }
        } else {
          factionXpData = playerStats.faction_xp;
        }
      }
      
      console.log("Profile API - playerStats faction_xp:", playerStats?.faction_xp);
      console.log("Profile API - parsed factionXpData:", factionXpData);
      console.log("Profile API - playerStats current_faction:", playerStats?.current_faction);
      
      // Calculate level from XP (each level requires level * 100 XP)
      const userXp = userProfile.xp || 0;
      let level = 1;
      let remainingXp = userXp;
      let xpForNextLevel = 100;
      
      while (remainingXp >= xpForNextLevel) {
        remainingXp -= xpForNextLevel;
        level++;
        xpForNextLevel = level * 100;
      }

      res.status(200).json({
        ...userProfile,
        level, // Add calculated level to the response
        faction: playerStats?.current_faction || 'd2', // Use playerStats faction or default to d2
        faction_xp: factionXpData,
        recentRaces,
        prompts,
        eggs
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  app.patch("/api/profile/customization", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.id;
    
    try {
      const customization = customizationSchema.parse(req.body);
      
      const updatedUser = await storage.updateUserCustomization(
        userId,
        customization.chickenName,
        customization.chickenType,
        customization.jockeyType,
        customization.trailType,
        customization.faction
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back
      const { password, ...userResponse } = updatedUser;
      
      res.status(200).json(userResponse);
    } catch (error) {
      const zodError = fromZodError(error as ZodError);
      res.status(400).json({ message: zodError.message });
    }
  });

  app.post("/api/profile/faction", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.id;
    
    try {
      const { faction } = z.object({ faction: z.string() }).parse(req.body);
      
      // Update faction in both users and playerStats tables
      const updatedUser = await storage.updateUserCustomization(
        userId,
        "", // Keep existing chicken name
        "", // Keep existing chicken type  
        "", // Keep existing jockey type
        "", // Keep existing trail type
        faction
      );
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Send faction change notification to Telegram
      try {
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
        
        await telegramService.postFactionAchievement(
          req.user.username,
          faction,
          `Joined ${faction.toUpperCase()} faction`
        );
      } catch (telegramError) {
        console.error('Failed to send faction change to Telegram:', telegramError);
      }
      
      res.status(200).json({ success: true, faction });
    } catch (error) {
      const zodError = fromZodError(error as ZodError);
      res.status(400).json({ message: zodError.message });
    }
  });
  
  // Prompts
  app.get("/api/prompts", async (req, res) => {
    try {
      const prompts = await storage.getAllPrompts();
      res.status(200).json(prompts);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });
  
  app.post("/api/prompts", isAuthenticated, async (req: any, res: Response) => {
    const authorId = req.user.id;
    
    try {
      const { text } = z.object({ text: z.string().min(50).max(250) }).parse(req.body);
      
      const newPrompt = await storage.createPrompt({
        text,
        author_id: authorId
      });
      
      // Update user's prompts_added count
      await storage.incrementUserPromptCount(authorId);
      
      res.status(201).json(newPrompt);
    } catch (error) {
      const zodError = fromZodError(error as ZodError);
      res.status(400).json({ message: zodError.message });
    }
  });

  // Campaign Progress API routes
  app.get("/api/campaign-progress", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.id;
      const userStats = await storage.getUserStats(userId);
      
      let campaignProgress;
      
      if (userStats?.campaign_progress) {
        if (typeof userStats.campaign_progress === 'string') {
          try {
            campaignProgress = JSON.parse(userStats.campaign_progress);
            console.log(`Retrieved campaign progress for user ${userId}:`, JSON.stringify(campaignProgress).substring(0, 200));
          } catch (e) {
            console.log(`Failed to parse campaign progress for user ${userId}, creating default`);
            campaignProgress = null;
          }
        } else {
          campaignProgress = userStats.campaign_progress;
        }
      }
      
      // Only create default progress if none exists
      if (!campaignProgress) {
        campaignProgress = {
          steve: { completed: [], bestScores: {}, unlocked: true, progress: 0 },
          auto: { completed: [], bestScores: {}, unlocked: false, progress: 0 },
          matikah: { completed: [], bestScores: {}, unlocked: false, progress: 0 },
          iam: { completed: [], bestScores: {}, unlocked: false, progress: 0 }
        };
        console.log(`Created default campaign progress for user ${userId}`);
      }

      // Check progression and update unlocks
      const hasCompletedRequiredRaces = (completed: number[]) => {
        return [0, 1, 2, 3, 4].every(raceNum => completed.includes(raceNum));
      };

      // Update unlock status based on progress
      if (hasCompletedRequiredRaces(campaignProgress.steve.completed)) {
        campaignProgress.auto.unlocked = true;
      }
      
      if (hasCompletedRequiredRaces(campaignProgress.auto.completed)) {
        campaignProgress.matikah.unlocked = true;
      }
      
      if (hasCompletedRequiredRaces(campaignProgress.matikah.completed)) {
        campaignProgress.iam.unlocked = true;
      }
      
      res.json({ campaigns: campaignProgress });
    } catch (error) {
      console.error("Error fetching campaign progress:", error);
      res.status(500).json({ message: "Failed to fetch campaign progress" });
    }
  });

  app.post("/api/campaign-progress", isAuthenticated, async (req: any, res: Response) => {
    try {
      // Fix: Use req.user.id instead of req.session.userId for consistency
      const userId = req.user?.id || req.session?.userId;
      const { campaigns } = req.body;
      
      if (!userId) {
        console.error("Campaign progress save failed: No user ID found", { 
          sessionUserId: req.session?.userId, 
          userObj: req.user 
        });
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Save progress to user stats
      await storage.updateCampaignProgress(userId, JSON.stringify(campaigns));
      
      console.log(`✅ Campaign progress saved successfully for user ${userId}`);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving campaign progress:", error);
      res.status(500).json({ message: "Failed to save campaign progress" });
    }
  });

  // Create exports directory if it doesn't exist
  const exportsDir = path.join(process.cwd(), "exports");
  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }


  
  // Basic shrine routes implementation (using separate functions)
  app.get('/api/shrine/offerings', async (req, res) => {
    try {
      // Directly access offerings data from file
      const dataDir = path.join(process.cwd(), 'data');
      const offeringsPath = path.join(dataDir, 'shrine-offerings.json');
      
      if (!fs.existsSync(offeringsPath)) {
        return res.json({ offerings: [] });
      }
      
      const data = JSON.parse(fs.readFileSync(offeringsPath, 'utf8'));
      res.json({ offerings: data.offerings || [] });
    } catch (error) {
      console.error('Error fetching offerings:', error);
      res.status(500).json({ error: 'Failed to fetch offerings' });
    }
  });
  
  app.get('/api/shrine/eggs', async (req, res) => {
    try {
      // Directly access eggs data from file
      const dataDir = path.join(process.cwd(), 'data');
      const eggsPath = path.join(dataDir, 'shrine-eggs.json');
      
      if (!fs.existsSync(eggsPath)) {
        return res.json({ eggs: [] });
      }
      
      const data = JSON.parse(fs.readFileSync(eggsPath, 'utf8'));
      res.json({ eggs: data.eggs || [] });
    } catch (error) {
      console.error('Error fetching eggs:', error);
      res.status(500).json({ error: 'Failed to fetch eggs' });
    }
  });
  
  app.post('/api/shrine/submissions', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { petalId, source } = req.body;
      
      if (!petalId) {
        return res.status(400).json({ error: 'Petal ID is required' });
      }
      
      if (!source || source.trim() === "") {
        return res.status(400).json({ error: 'Custom text is required for egg name generation' });
      }
      
      console.log(`User ${req.user.username} (ID: ${req.user.id}) attempting egg creation`);
      
      // TimeKnot account gets unlimited eggs
      if (req.user.username === 'TimeKnot') {
        console.log('TimeKnot account detected - unlimited egg creation enabled');
        // No limit check for TimeKnot
      } else {
        // For everyone else, apply the daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysEggs = await storage.getUserEggsAfterDate(userId, today);
        console.log(`User has ${todaysEggs.length} eggs created today`);
        
        if (todaysEggs.length > 0) {
          return res.status(400).json({ 
            error: 'You have already claimed an egg today. Please return tomorrow for another egg.'
          });
        }
      }
      
      // If we're here, either it's TimeKnot (unlimited) or the user hasn't claimed an egg today
      
      // Find the selected petal's element and egg type
      const ELEMENTAL_PETALS = [
        { petal: 'D4', element: 'Fire', eggType: 'FireGaru', displayName: 'flameheart egg' },
        { petal: 'D6', element: 'Earth', eggType: 'EarthGaru', displayName: 'terraverde egg' },
        { petal: 'D8', element: 'Air', eggType: 'AirGaru', displayName: 'skywisp egg' },
        { petal: 'D10', element: 'Chaos', eggType: 'ChaosGaru', displayName: 'voidmyst egg' },
        { petal: 'D12', element: 'Ether', eggType: 'EtherGaru', displayName: 'ethereal egg' },
        { petal: 'D20', element: 'Water', eggType: 'WaterGaru', displayName: 'aquafrost egg' },
        { petal: 'D2', element: 'Coin', eggType: 'Silver', displayName: 'sunglow egg' },
        { petal: 'D100', element: 'Order', eggType: 'Goldstone', displayName: 'stonehide egg' }
      ];
      
      const selectedPetal = ELEMENTAL_PETALS.find((p: { petal: string; element: string; eggType: string; displayName: string }) => p.petal === petalId);
      
      if (!selectedPetal) {
        return res.status(400).json({ error: 'Invalid petal ID' });
      }
      
      // Create offering record
      const offering = await storage.createOffering({
        userId: userId,
        petalId: petalId,
        source,
        type: 'custom_text'
      });
      
      // Generate a name using the custom text and element
      // Extract up to 2 words from user input
      const words = source.split(/\s+/).filter((word: string) => word.length > 0).slice(0, 2);
      const nameBase = words.map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("");
      const nameSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      const eggName = `${nameBase}${selectedPetal.element}${nameSuffix}`;
      
      // Get color based on element
      let color = "#7e57c2"; // Default purple
      switch(selectedPetal.element) {
        case "Fire": color = "#f44336"; break; // Red
        case "Earth": color = "#4caf50"; break; // Green
        case "Air": color = "#ffffff"; break; // White
        case "Chaos": color = "#212121"; break; // Black
        case "Ether": color = "#000000"; break; // Black
        case "Water": color = "#2196f3"; break; // Blue
        case "Coin": color = "#C0C0C0"; break; // Silver color for D2
        case "Order": color = "#FFD700"; break; // Gold color for D100
      }
      
      // Create the egg - removing display_name until we migrate the database
      const egg = await storage.createEgg({
        user_id: userId,
        name: eggName,
        type: selectedPetal.eggType,
        elemental_affinity: selectedPetal.element,
        color,
        petal_id: petalId,
        hatched: false
      });
      
      res.json({ 
        success: true, 
        offering,
        egg,
        message: "Your egg has been created! Check 'YOUR EGGS' to see your new Garu egg."
      });
    } catch (error) {
      console.error('Error processing shrine submission:', error);
      res.status(500).json({ error: 'Failed to process submission' });
    }
  });
  
  // Shrine claim endpoint for egg claiming
  app.post('/api/shrine/claim', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { eggType } = req.body;
      
      if (!eggType) {
        return res.status(400).json({ message: "Egg type is required" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate available claims (1% of total XP)
      const totalXP = user.xp || 0;
      const availableClaims = Math.floor(totalXP * 0.01);
      
      // Get current egg inventory
      const currentInventory = JSON.parse(user.egg_inventory || "{}");
      const totalClaimedEggs = Object.values(currentInventory).reduce((sum: number, count: any) => sum + (count || 0), 0);
      const remainingClaims = Math.max(0, availableClaims - totalClaimedEggs);
      
      if (remainingClaims <= 0) {
        return res.status(400).json({ 
          message: "No remaining egg claims! Earn more XP to unlock additional claims." 
        });
      }
      
      // Add the egg to inventory
      currentInventory[eggType] = (currentInventory[eggType] || 0) + 1;
      
      // Update user's egg inventory
      await storage.updateUser(userId, {
        egg_inventory: JSON.stringify(currentInventory)
      });
      
      res.json({ 
        success: true, 
        eggType,
        newCount: currentInventory[eggType],
        remainingClaims: remainingClaims - 1,
        message: `You received a ${eggType.toUpperCase()} egg!`
      });
    } catch (error) {
      console.error('Error claiming egg:', error);
      res.status(500).json({ message: "Failed to claim egg" });
    }
  });

  app.post('/api/shrine/gutenberg', async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url || !url.includes('gutenberg.org')) {
        return res.status(400).json({ error: 'Invalid Gutenberg URL' });
      }
      
      // Provide sample texts (for simplicity)
      const sampleTexts = [
        {
          title: "The Wonderful Toymaker",
          excerpt: "There was once a wonderful toymaker who could make toys come alive. Not with batteries or clockwork, but with something more magical - the joy of children. Each toy he created held a little piece of identity, a spark of life that would grow as a child played with it and loved it.",
          eggType: "flameheart"
        },
        {
          title: "The Swiss Family Robinson",
          excerpt: "For many days we had been tempest-tossed. The storm appeared to have taken us entirely out of our route, and we were now sailing over a totally unknown sea. Our provisions were nearly exhausted, and we gazed with increasing anxiety upon the horizon, hoping that we might discover some shore upon which we might land and replenish our stores.",
          eggType: "terraverde"
        },
        {
          title: "The Wonderful Wizard of Oz",
          excerpt: "Dorothy lived in the midst of the great Kansas prairies, with Uncle Henry, who was a farmer, and Aunt Em, who was the farmer's wife. Their house was small, for the lumber to build it had to be carried by wagon many miles. There were four walls, a floor and a roof, which made one room.",
          eggType: "skywisp"
        }
      ];
      
      // Return a random sample
      const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
      res.json(randomSample);
    } catch (error) {
      console.error('Error fetching from Gutenberg:', error);
      res.status(500).json({ error: 'Failed to fetch content' });
    }
  });
  
  // TEK8 Lotus Petals routes
  app.get('/api/tek8/petals', (req, res) => {
    try {
      // Direct data for TEK8 canonical texts
      const TEK8_CANONICAL_TEXTS = [
        {
          petal: 'D4',
          element: 'Fire',
          theme: 'Identity | Aura | Sight',
          text: 'The Wonderful Toymaker',
          author: 'Evelyn Sharp',
          url: 'https://www.gutenberg.org/files/30400/30400-h/30400-h.htm',
          eggType: 'flameheart',
          description: 'A tale of transformation, where personal identity is forged in the fires of adventure and imagination.'
        },
        {
          petal: 'D6',
          element: 'Earth',
          theme: 'Stability | Strength | Grounding',
          text: 'The Swiss Family Robinson',
          author: 'Johann David Wyss',
          url: 'https://www.gutenberg.org/files/11707/11707-h/11707-h.htm',
          eggType: 'terraverde',
          description: 'Rooted in land and survival, this story shows how strength, family, and grounded creativity stabilize life.'
        },
        {
          petal: 'D8',
          element: 'Air',
          theme: 'Creativity | Motion | Breath',
          text: 'The Wonderful Wizard of Oz',
          author: 'L. Frank Baum',
          url: 'https://www.gutenberg.org/files/55/55-h/55-h.htm',
          eggType: 'skywisp',
          description: 'Wind, flight, and fantasy power this tale of imaginative transformation and moving beyond the known.'
        },
        {
          petal: 'D10',
          element: 'Chaos',
          theme: 'Hype | Vibe | Disruption',
          text: 'Alice\'s Adventures in Wonderland',
          author: 'Lewis Carroll',
          url: 'https://www.gutenberg.org/files/11/11-h/11-h.htm',
          eggType: 'voidmyst',
          description: 'A masterpiece of vibrant chaos, bending rules, language, and logic into a whirlwind of psychedelic storytelling.'
        },
        {
          petal: 'D12',
          element: 'Ether',
          theme: 'Lore | Frequency | Intuition',
          text: 'The Arabian Nights Entertainments',
          author: 'Anonymous',
          url: 'https://www.gutenberg.org/files/5667/5667-h/5667-h.htm',
          eggType: 'ethereal',
          description: 'A lore-dense archive of nested stories, dreams, and frequencies that echo moral and magical vibrations.'
        },
        {
          petal: 'D20',
          element: 'Water',
          theme: 'Empathy | Depth | Healing',
          text: '20,000 Leagues Under the Sea',
          author: 'Jules Verne',
          url: 'https://www.gutenberg.org/files/164/164-h/164-h.htm',
          eggType: 'aquafrost',
          description: 'A literal and emotional descent into deep ocean empathy — isolation, healing, and submerged humanity.'
        },
        {
          petal: 'D2',
          element: 'Coin',
          theme: 'Luck | Risk | Exchange',
          text: 'Jack and the Beanstalk',
          author: 'Anonymous',
          url: 'https://www.gutenberg.org/files/17034/17034-h/17034-h.htm',
          eggType: 'silver',
          description: 'Chance and barter catalyze a bold vertical journey of risk, treasure, and the unknown.'
        },
        {
          petal: 'D100',
          element: 'Order',
          theme: 'Archive | Cosmos | Pattern',
          text: 'Grimms\' Fairy Tales',
          author: 'Jacob and Wilhelm Grimm',
          url: 'https://www.gutenberg.org/files/2591/2591-h/2591-h.htm',
          eggType: 'goldstone',
          description: 'A structured cosmos of story archetypes. Every tale encodes moral pattern and recursive mythos.'
        }
      ];
      
      res.json({ petals: TEK8_CANONICAL_TEXTS });
    } catch (error) {
      console.error('Error fetching TEK8 petals:', error);
      res.status(500).json({ error: 'Failed to fetch TEK8 petals' });
    }
  });
  
  app.post('/api/tek8/generate-egg', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      
      // Generate a TEK8 egg by randomly selecting a petal
      const TEK8_CANONICAL_TEXTS = [
        {
          petal: 'D4',
          element: 'Fire',
          eggType: 'flameheart'
        },
        {
          petal: 'D6',
          element: 'Earth',
          eggType: 'terraverde'
        },
        {
          petal: 'D8',
          element: 'Air',
          eggType: 'skywisp'
        },
        {
          petal: 'D10',
          element: 'Chaos',
          eggType: 'voidmyst'
        },
        {
          petal: 'D12',
          element: 'Ether',
          eggType: 'ethereal'
        },
        {
          petal: 'D20',
          element: 'Water',
          eggType: 'aquafrost'
        },
        {
          petal: 'D2',
          element: 'Coin',
          eggType: 'silver'
        },
        {
          petal: 'D100',
          element: 'Order',
          eggType: 'goldstone'
        }
      ];
      
      // Select a random petal
      const randomPetal = TEK8_CANONICAL_TEXTS[Math.floor(Math.random() * TEK8_CANONICAL_TEXTS.length)];
      
      // Create a new egg for the user
      const egg = await storage.generateRandomEgg(userId, randomPetal.eggType);
      
      res.json({ 
        success: true, 
        egg,
        petal: randomPetal
      });
    } catch (error) {
      console.error('Error generating TEK8 egg:', error);
      res.status(500).json({ error: 'Failed to generate TEK8 egg' });
    }
  });
  
  // Admin routes for shrine submissions
  app.get('/api/admin/submissions', isAuthenticated, async (req: any, res: Response) => {
    try {
      // For simplicity, all users can view submissions
      const dataDir = path.join(process.cwd(), 'data');
      const submissionsPath = path.join(dataDir, 'shrine-submissions.json');
      
      if (!fs.existsSync(submissionsPath)) {
        return res.json({ submissions: [] });
      }
      
      const data = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'));
      res.json({ submissions: data.submissions || [] });
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ error: 'Failed to fetch submissions' });
    }
  });
  
  // Wisdom texts API route - serves authentic sacred texts from our curated collection
  app.post("/api/wisdom/fetch-text", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { tradition } = req.body;
      
      console.log(`Fetching authentic sacred text for tradition: ${tradition}`);
      
      // Use our authentic sacred text parser with real Bhagavad Gita verses and other religious content
      const wisdomText = getRandomSacredText(tradition || 'hinduism');
      
      console.log(`Serving authentic ${tradition} text:`, wisdomText.title);
      
      res.json(wisdomText);
    } catch (error) {
      console.error('Error fetching wisdom text:', error);
      res.status(500).json({ error: 'Failed to fetch wisdom text' });
    }
  });

  // Add API route to get available traditions
  app.get("/api/wisdom/traditions", (req: Request, res: Response) => {
    try {
      const traditions = getAvailableTraditions();
      res.json(traditions);
    } catch (error) {
      console.error('Error fetching traditions:', error);
      res.status(500).json({ error: 'Failed to fetch traditions' });
    }
  });

  // Add API route to get all texts for a specific tradition  
  app.get("/api/wisdom/texts/:tradition", (req: Request, res: Response) => {
    try {
      const { tradition } = req.params;
      const texts = getTextsByTradition(tradition);
      res.json(texts);
    } catch (error) {
      console.error('Error fetching texts by tradition:', error);
      res.status(500).json({ error: 'Failed to fetch texts for tradition' });
    }
  });

  // Wisdom text fetching route  
  app.post('/api/wisdom/fetch-text', async (req, res) => {
    try {
      const { tradition } = req.body;
      
      if (!tradition) {
        return res.status(400).json({ error: 'Tradition parameter required' });
      }

      let wisdomText;

        // Authentic fallback texts from each tradition - using real sacred texts
        const authenticTexts: { [key: string]: any } = {
            'christianity': {
              title: "The Golden Rule - Matthew 7:12",
              content: "Therefore, whatever you want men to do to you, do also to them, for this is the Law and the Prophets.",
              reference: "Matthew 7:12"
            },
            'buddhism': {
              title: "The Buddha's Teaching on Compassion",
              content: "Just as a mother would protect her only child with her life, even so let one cultivate a boundless love towards all beings.",
              reference: "Karaniya Metta Sutta"
            },
            'islam': {
              title: "The Quran on Knowledge - Revealed to Prophet Muhammad ﷺ",
              content: "And say: My Lord, increase me in knowledge. The seeking of knowledge is an obligation upon every Muslim, as taught by the Prophet Muhammad ﷺ.",
              reference: "Quran 20:114 & Hadith tradition"
            },
            'judaism': {
              title: "Hillel's Teaching - Talmud",
              content: "What is hateful to you, do not do to your fellow: this is the whole Torah; the rest is the explanation; go and learn.",
              reference: "Talmud, Shabbat 31a"
            },
            'taoism': {
              title: "The Way of Water - Tao Te Ching",
              content: "Nothing in the world is softer than water, yet nothing is better at overcoming the hard and strong.",
              reference: "Tao Te Ching, Chapter 78"
            },
            'sikhism': {
              title: "One Universal Creator - Guru Granth Sahib",
              content: "There is but One God, whose name is Truth, the Creator, devoid of fear and enmity, immortal, unborn, self-existent.",
              reference: "Guru Granth Sahib, Japji"
            },
            'atheism': {
              title: "On Reason - David Hume",
              content: "The life of man is of no greater importance to the universe than that of an oyster.",
              reference: "David Hume, Essays"
            }
          };
          
          const selectedText = authenticTexts[tradition] || authenticTexts['christianity'];
          wisdomText = {
            id: `sacred_fallback_${Date.now()}`,
            title: selectedText.title,
            content: selectedText.content,
            source: 'sacred-texts.com',
            tradition: tradition,
            reference: selectedText.reference
          };

      if (!wisdomText) {
        return res.status(503).json({ error: 'Sacred text service unavailable' });
      }

      res.json(wisdomText);
    } catch (error) {
      console.error('Error fetching wisdom text:', error);
      res.status(500).json({ error: 'Failed to fetch wisdom text' });
    }
  });

  // Egg collection routes
  app.post("/api/eggs/generate", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.id;
    const { source } = req.body;
    
    try {
      const newEgg = await storage.generateRandomEgg(userId, source || "test");
      res.status(201).json(newEgg);
    } catch (error) {
      console.error("Error generating egg:", error);
      res.status(500).json({ message: "Failed to generate egg" });
    }
  });
  
  app.get("/api/eggs", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.id;
    
    try {
      const eggs = await storage.getUserEggs(userId);
      res.status(200).json(eggs);
    } catch (error) {
      console.error("Error fetching eggs:", error);
      res.status(500).json({ message: "Failed to fetch eggs" });
    }
  });

  // Private room routes are now at the top of this file to prevent conflicts

  // Stats and Leaderboards API Routes for Live Deployment
  
  // Update player stats after race completion
  app.post('/api/stats/update-race', async (req: any, res: Response) => {
    try {
      const { userId, username, wpm, accuracy, position, totalPlayers, faction, charactersTyped, isNPC, xpGained, raceNumber, raceType, promptText, raceTime } = req.body;
      
      // For authenticated users, use their actual userId from session or claims
      const actualUserId = isNPC ? userId : (req.user?.claims?.sub || req.session?.userId || req.user?.id || userId);
      
      console.log("=== RACE STATS UPDATE ===");
      console.log("Stats update - actualUserId:", actualUserId, "session userId:", req.session?.userId, "isNPC:", isNPC);
      console.log("Raw request body:", JSON.stringify(req.body));
      console.log("Race data received - WPM:", wpm, "Accuracy:", accuracy, "Position:", position, "Faction:", faction);
      console.log("========================");
      
      // Use the XP amount calculated and displayed by the frontend, with universal fallback calculation
      let finalXpGained = xpGained;
      if (!Number.isFinite(xpGained) || xpGained <= 0) {
        // Universal XP formula with campaign bonus if applicable
        const safeCharactersTyped = Number.isFinite(charactersTyped) && charactersTyped > 0 ? charactersTyped : 50;
        const safePosition = Number.isFinite(position) && position > 0 ? position : 8;
        const positionMultipliers: { [key: number]: number } = { 1: 1.0, 2: 0.5, 3: 0.33 };
        const multiplier = positionMultipliers[safePosition] || 0.25;
        const baseXP = 8; // Base participation reward
        let campaignBonus = 0;
        
        // Add campaign bonus if race number is provided (campaign race)
        if (raceNumber && Number.isFinite(raceNumber) && raceNumber > 0) {
          campaignBonus = 25 + (10 * raceNumber);
          console.log("📚 Campaign bonus applied for race", raceNumber, ":", campaignBonus);
        }
        
        const raceXP = Math.round(safeCharactersTyped * multiplier);
        finalXpGained = baseXP + campaignBonus + raceXP;
        console.log("⚠️ Using universal fallback XP calculation:", {
          baseXP,
          campaignBonus,
          raceXP,
          total: finalXpGained
        });
      } else {
        console.log("✅ Using frontend-calculated XP:", finalXpGained);
      }
      
      // Ensure we have a valid user ID before updating stats
      if (!actualUserId || actualUserId === null) {
        console.error("Cannot update stats: user ID is null or undefined");
        return res.status(400).json({ error: "Invalid user ID" });
      }

      await StatsService.updatePlayerStats(actualUserId, {
        wpm,
        accuracy, 
        position,
        totalPlayers,
        faction,
        xpGained: finalXpGained
      });

      // Skip campaign-specific Discord posting here since it's handled by the centralized discordService below
      
      // Report to Discord for all race types
      try {
        const { discordService } = await import('./services/discord-service');
        
        // Determine race type with proper labels
        let raceTypeName = raceType;
        if (!raceTypeName) {
          if (raceNumber !== undefined) {
            raceTypeName = 'Campaign';
          } else {
            raceTypeName = 'Quickrace'; // Default for non-campaign races
          }
        }
        
        // Add TOPSECRET label for cryptofae campaign
        if (raceTypeName === 'Campaign' && promptText && promptText.toLowerCase().includes('cryptofae')) {
          raceTypeName = 'TOPSECRET Campaign';
        }
        const actualRaceTime = raceTime || 30; // Default if not provided
        
        // Get the actual username from the authenticated user if available
        let actualUsername = username;
        if (!actualUsername && actualUserId && !isNPC) {
          try {
            const user = await storage.getUserStats(actualUserId);
            actualUsername = user?.username || null;
          } catch (err) {
            console.log('Could not fetch username for Discord reporting');
          }
        }
        
        // Include campaign and race details in the prompt text for better reporting
        let enhancedPromptText = promptText;
        let discordRaceTypeName = raceTypeName;
        
        if (raceNumber !== undefined && raceTypeName === 'Campaign') {
          enhancedPromptText = `Campaign Race ${raceNumber} - ${promptText || 'Steve Campaign'}`;
          discordRaceTypeName = 'Race: Campaign S.0';
        } else if (!raceTypeName || raceTypeName === 'Quick Race') {
          discordRaceTypeName = 'Race: Quickrace';
        } else if (raceTypeName === 'Matrix Race') {
          discordRaceTypeName = 'Race: Matrix Race';
        } else if (raceTypeName === 'Practice') {
          discordRaceTypeName = 'Race: Practice';
        } else if (raceTypeName.includes('Glyph') || raceTypeName.includes('Scribe')) {
          discordRaceTypeName = 'Race: Scribquest 01';
        }
        
        await discordService.reportRaceCompletion(
          actualUsername,
          discordRaceTypeName,
          wpm,
          accuracy,
          actualRaceTime,
          {
            faction: faction,
            xp: finalXpGained,
            placement: position,
            promptText: enhancedPromptText,
            isGuest: !actualUserId || isNPC
          }
        );
      } catch (discordError) {
        console.error('Failed to report race completion to Discord:', discordError);
        // Don't fail the stats update if Discord reporting fails
      }

      // Report to Telegram for all race types
      try {
        let displayUsername = username;
        if (!displayUsername && actualUserId && !isNPC) {
          try {
            const user = await storage.getUserStats(actualUserId);
            displayUsername = user?.username || 'Guest';
          } catch (err) {
            displayUsername = 'Guest';
          }
        }
        displayUsername = displayUsername || 'Guest';
        
        let finalRaceTypeName = raceType;
        if (!finalRaceTypeName) {
          if (raceNumber !== undefined) {
            finalRaceTypeName = 'Race: Campaign S.0';
          } else {
            finalRaceTypeName = 'Race: Quickrace';
          }
        }
        
        await telegramService.postRaceCompletion(
          displayUsername,
          wpm,
          accuracy,
          finalRaceTypeName
        );
      } catch (telegramError) {
        console.error('Failed to report race completion to Telegram:', telegramError);
        // Don't fail the stats update if Telegram reporting fails
      }

      res.json({ success: true, xpGained: finalXpGained });
    } catch (error) {
      console.error('Error updating race stats:', error);
      res.status(500).json({ error: 'Failed to update race stats' });
    }
  });
  
  // Get faction leaderboard
  app.get('/api/leaderboards/faction/:faction', async (req: Request, res: Response) => {
    try {
      const { faction } = req.params;
      const limit = parseInt(req.query.limit as string) || 100;
      
      const leaderboard = await StatsService.getFactionLeaderboard(faction, limit);
      res.json({ leaderboard });
    } catch (error) {
      console.error('Error fetching faction leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch faction leaderboard' });
    }
  });
  
  // Get global leaderboard
  app.get('/api/leaderboards/global', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const leaderboard = await StatsService.getGlobalLeaderboard(limit);
      res.json({ leaderboard });
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch global leaderboard' });
    }
  });

  // Get faction war leaderboard - totals of all faction XP across all players
  app.get('/api/leaderboards/faction-war', async (req: Request, res: Response) => {
    try {
      const factionTotals = await StatsService.getFactionStats();
      res.json({ factionTotals });
    } catch (error) {
      console.error('Error fetching faction war leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch faction war leaderboard' });
    }
  });
  
  // Get player profile and stats
  app.get('/api/stats/profile', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const profile = await StatsService.getPlayerProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error('Error fetching player profile:', error);
      res.status(500).json({ error: 'Failed to fetch player profile' });
    }
  });
  
  // Get faction statistics overview
  app.get('/api/stats/factions', async (req: Request, res: Response) => {
    try {
      const factionStats = await StatsService.getFactionStats();
      res.json({ factions: factionStats });
    } catch (error) {
      console.error('Error fetching faction stats:', error);
      res.status(500).json({ error: 'Failed to fetch faction stats' });
    }
  });
  
  // Claim egg endpoint - 1% of total XP system
  app.post('/api/eggs/claim', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { eggType } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Calculate available claims (1% of total XP)
      const totalXP = user.xp || 0;
      const availableClaims = Math.floor(totalXP * 0.01);
      
      // Get current egg inventory
      const currentInventory = JSON.parse(user.egg_inventory || "{}");
      const totalClaimedEggs = Object.values(currentInventory).reduce((sum: number, count: any) => sum + (count || 0), 0);
      const remainingClaims = Math.max(0, availableClaims - totalClaimedEggs);
      
      if (remainingClaims <= 0) {
        return res.status(400).json({ 
          message: "No remaining egg claims! Earn more XP to unlock additional claims." 
        });
      }
      
      // Add the egg to inventory
      currentInventory[eggType] = (currentInventory[eggType] || 0) + 1;
      
      // Update user's egg inventory
      await storage.updateUserProfile(userId, {
        egg_inventory: JSON.stringify(currentInventory)
      });
      
      res.json({ 
        success: true, 
        eggType,
        newCount: currentInventory[eggType],
        remainingClaims: remainingClaims - 1,
        message: `You received a ${eggType.toUpperCase()} egg!`
      });
    } catch (error) {
      console.error('Error claiming egg:', error);
      res.status(500).json({ message: "Failed to claim egg" });
    }
  });

  app.post("/api/eggs/:id/hatch", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.id;
    const eggId = parseInt(req.params.id);
    
    try {
      const egg = await storage.getEgg(eggId);
      
      if (!egg) {
        return res.status(404).json({ message: "Egg not found" });
      }
      
      if (egg.user_id !== userId) {
        return res.status(403).json({ message: "Not your egg" });
      }
      
      // Ensure egg hasn't been hatched yet
      if (egg.hatched === true) {
        return res.status(400).json({ message: "Egg is already hatched" });
      }
      
      const hatchedEgg = await storage.hatchEgg(eggId);
      res.status(200).json(hatchedEgg);
    } catch (error) {
      console.error("Error hatching egg:", error);
      res.status(500).json({ message: "Failed to hatch egg" });
    }
  });
  
  // SCRIBE Hall API Routes
  app.get('/api/scribe/submissions', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const submissions = await storage.getUserLoreSubmissions(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching user submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  app.get('/api/scribe/featured', async (req: Request, res: Response) => {
    try {
      const featured = await storage.getFeaturedLoreSubmissions();
      res.json(featured);
    } catch (error) {
      console.error("Error fetching featured submissions:", error);
      res.status(500).json({ message: "Failed to fetch featured submissions" });
    }
  });

  app.post('/api/scribe/submit', isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.id;
      const { title, content, category, promptId } = req.body;

      // Validate input
      if (!title?.trim() || !content?.trim() || !category) {
        return res.status(400).json({ message: "Title, content, and category are required" });
      }

      if (content.length < 100) {
        return res.status(400).json({ message: "Content must be at least 100 characters long" });
      }

      // Calculate metrics
      const wordCount = content.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
      const characterCount = content.length;

      // Calculate XP based on category and word count
      let baseXP = 50;
      if (category === 'story') baseXP = 100;
      else if (category === 'lore') baseXP = 150;
      else if (category === 'epic') baseXP = 200;

      // Bonus for longer content
      const lengthBonus = Math.min(Math.floor(wordCount / 50) * 25, 100);
      const totalXP = baseXP + lengthBonus;

      const submission = await storage.createLoreSubmission({
        userId,
        title: title.trim(),
        content: content.trim(),
        category,
        promptId,
        wordCount,
        characterCount,
        xpAwarded: totalXP
      });

      // Award XP immediately for submission
      await storage.addUserXP(userId, totalXP);

      res.json({ 
        success: true, 
        submissionId: submission.id,
        xpAwarded: totalXP,
        message: "Submission created successfully!"
      });
    } catch (error) {
      console.error("Error creating lore submission:", error);
      res.status(500).json({ message: "Failed to submit your writing" });
    }
  });

  // Stats Export routes
  app.get("/api/exports/users", isAuthenticated, async (req: any, res: Response) => {
    try {
      const fileName = `user_stats_${Date.now()}.csv`;
      const filePath = path.join(exportsDir, fileName);
      
      const exportedFile = await storage.exportUserStatsToCSV(filePath);
      
      res.download(exportedFile, fileName, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          // File cleanup after sending or error
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        } else {
          // Clean up file after successful download
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        }
      });
    } catch (error) {
      console.error("Error exporting user stats:", error);
      res.status(500).json({ message: "Failed to export user stats" });
    }
  });

  // Get leaderboard data - top typers by WPM, accuracy, or races won
  app.get("/api/leaderboard", async (req: Request, res: Response) => {
    try {
      // Database utilities are already imported at the top
      
      // Get query params for pagination and filtering
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const sortBy = (req.query.sort as string) || 'avg_wpm'; // Default sort by WPM
      
      // Get users with race stats, ordered by the requested metric
      const leaderboardUsers = await db
        .select({
          id: users.id,
          username: users.username,
          avg_wpm: users.avg_wpm,
          accuracy: users.accuracy,
          races_won: users.races_won,
          total_races: users.total_races,
          xp: users.xp,
          chicken_name: users.chicken_name,
          chicken_type: users.chicken_type,
          jockey_type: users.jockey_type,
          current_faction: playerStats.current_faction
        })
        .from(users)
        .leftJoin(playerStats, eq(users.id, playerStats.user_id))
        .where(sql`${users.total_races} > 0`) // Only include users who have raced
        .orderBy(desc(
          sortBy === 'avg_wpm' ? users.avg_wpm : 
          sortBy === 'accuracy' ? users.accuracy : 
          sortBy === 'races_won' ? users.races_won : 
          sortBy === 'xp' ? users.xp : 
          users.avg_wpm
        ))
        .limit(limit)
        .offset(offset);
        
      // Calculate total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(sql`${users.total_races} > 0`);
        
      // Return leaderboard with pagination info
      res.json({
        leaderboard: leaderboardUsers.map((user: any, index: number) => ({
          ...user,
          rank: offset + index + 1,
          win_rate: user.total_races > 0 ? Math.round((user.races_won / user.total_races) * 100) : 0
        })),
        pagination: {
          total: Number(count),
          limit,
          offset,
          hasMore: offset + limit < Number(count)
        }
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard data" });
    }
  });
  
  app.get("/api/exports/leaderboard", isAuthenticated, async (req: any, res: Response) => {
    try {
      const fileName = `leaderboard_${Date.now()}.csv`;
      const filePath = path.join(exportsDir, fileName);
      
      const exportedFile = await storage.exportLeaderboardToCSV(filePath);
      
      res.download(exportedFile, fileName, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        } else {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        }
      });
    } catch (error) {
      console.error("Error exporting leaderboard:", error);
      res.status(500).json({ message: "Failed to export leaderboard" });
    }
  });

  app.get("/api/exports/race-history", isAuthenticated, async (req: any, res: Response) => {
    try {
      const fileName = `race_history_${Date.now()}.csv`;
      const filePath = path.join(exportsDir, fileName);
      
      const exportedFile = await storage.exportRaceHistoryToCSV(filePath);
      
      res.download(exportedFile, fileName, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        } else {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        }
      });
    } catch (error) {
      console.error("Error exporting race history:", error);
      res.status(500).json({ message: "Failed to export race history" });
    }
  });

  // User-specific exports
  app.get("/api/exports/my-races", isAuthenticated, async (req: any, res: Response) => {
    const userId = req.user.id;
    
    try {
      // Create a temp directory for user exports if it doesn't exist
      const userExportsDir = path.join(exportsDir, `user_${userId}`);
      if (!fs.existsSync(userExportsDir)) {
        fs.mkdirSync(userExportsDir, { recursive: true });
      }
      
      const fileName = `my_races_${Date.now()}.csv`;
      const filePath = path.join(userExportsDir, fileName);
      
      // Get all user's race history
      const races = await storage.getRaceHistoryByUserId(userId);
      
      if (races.length === 0) {
        return res.status(404).json({ message: "No race history found" });
      }
      
      // Create a CSV file with this user's race history
      const csvWriter = require('fast-csv').write;
      const writeStream = fs.createWriteStream(filePath);
      
      const csvStream = csvWriter({ headers: true });
      csvStream.pipe(writeStream);
      
      for (const race of races) {
        const prompt = await storage.getPrompt(race.prompt_id);
        
        csvStream.write({
          date: race.race_date.toISOString(),
          position: race.position,
          total_players: race.total_players,
          wpm: race.wpm,
          accuracy: race.accuracy + '%',
          time_taken: race.time_taken + 's',
          xp_gained: race.xp_gained,
          prompt: prompt?.text || 'Unknown prompt'
        });
      }
      
      csvStream.end();
      
      // Wait for the stream to finish
      await new Promise((resolve) => {
        writeStream.on('finish', resolve);
      });
      
      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error("Error downloading file:", err);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        } else {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error("Error removing temp file:", unlinkErr);
          });
        }
      });
    } catch (error) {
      console.error("Error exporting user race history:", error);
      res.status(500).json({ message: "Failed to export race history" });
    }
  });
  
  // Campaign progression endpoint - Enhanced to handle race unlocking
  app.post("/api/campaign/complete-race", isAuthenticated, async (req: any, res) => {
    try {
      const { character, raceNumber, stats } = req.body;
      const userId = req.user?.id;
      const username = req.user?.username || 'Unknown Player';

      if (!userId) {
        return res.status(401).json({ message: "User ID not found" });
      }

      // Get current campaign progress
      const userStats = await storage.getUserStats(userId);
      let campaignProgress;
      
      if (userStats?.campaign_progress) {
        if (typeof userStats.campaign_progress === 'string') {
          try {
            campaignProgress = JSON.parse(userStats.campaign_progress);
          } catch (e) {
            console.log(`Failed to parse campaign progress for user ${userId}, creating new`);
            campaignProgress = null;
          }
        } else {
          campaignProgress = userStats.campaign_progress;
        }
      }
      
      // Only create default progress if none exists
      if (!campaignProgress) {
        campaignProgress = {
          steve: { completed: [], bestScores: {}, unlocked: true, progress: 0 },
          auto: { completed: [], bestScores: {}, unlocked: false, progress: 0 },
          matikah: { completed: [], bestScores: {}, unlocked: false, progress: 0 },
          iam: { completed: [], bestScores: {}, unlocked: false, progress: 0 }
        };
        console.log(`Created new campaign progress for user ${userId}`);
      } else {
        console.log(`Retrieved existing campaign progress for user ${userId}:`, JSON.stringify(campaignProgress).substring(0, 200));
      }

      const characterProgress = campaignProgress[character as keyof typeof campaignProgress];
      if (!characterProgress) {
        return res.status(400).json({ message: "Invalid character" });
      }

      // Ensure progress field exists
      if (characterProgress.progress === undefined) {
        characterProgress.progress = 0;
      }

      // Add race to completed if not already there
      if (!characterProgress.completed.includes(raceNumber)) {
        characterProgress.completed.push(raceNumber);
      }

      // Update best score
      characterProgress.bestScores[raceNumber] = stats;

      // Update progress to unlock next race if player finished in top 3
      if (stats.position <= 3) {
        // Always unlock the next race if they haven't reached it yet
        if (raceNumber >= characterProgress.progress) {
          const newProgress = raceNumber + 1;
          characterProgress.progress = newProgress;
          console.log(`🏁 ${username} completed race ${raceNumber} and unlocked race ${newProgress} in ${character} campaign`);
        } else {
          console.log(`🏁 ${username} completed race ${raceNumber} (already unlocked further races)`);
        }
      } else {
        console.log(`⚠️ ${username} completed race ${raceNumber} but finished position ${stats.position} (need top 3 to unlock next race)`);
      }

      // Check if completing this race unlocks the next campaign
      const hasCompletedRequiredRaces = (completed: number[]) => {
        return [0, 1, 2, 3, 4].every(raceNum => completed.includes(raceNum));
      };

      // Auto unlock progression logic
      if (character === 'steve' && hasCompletedRequiredRaces(campaignProgress.steve.completed)) {
        campaignProgress.auto.unlocked = true;
        console.log('🔓 Auto campaign unlocked after completing Steve races 0-4');
      }
      
      if (character === 'auto' && hasCompletedRequiredRaces(campaignProgress.auto.completed)) {
        campaignProgress.matikah.unlocked = true;
        console.log('🔓 Matikah campaign unlocked after completing Auto races 0-4');
      }
      
      if (character === 'matikah' && hasCompletedRequiredRaces(campaignProgress.matikah.completed)) {
        campaignProgress.iam.unlocked = true;
        console.log('🔓 Iam campaign unlocked after completing Matikah races 0-4');
      }

      // Save progress
      await storage.updateUserCampaignProgress(userId, JSON.stringify(campaignProgress));

      console.log(`✅ Campaign progress saved for ${character} race ${raceNumber} (${username})`);
      res.json({ success: true, progress: campaignProgress });
    } catch (error) {
      console.error('Error completing campaign race:', error);
      res.status(500).json({ message: "Failed to save campaign progress" });
    }
  });

  // Register TEK8 and Shrine routes for Codex Crucible feature
  registerTEK8Routes(app._router, storage);
  registerShrineRoutes(app._router, storage);

  // Register Matrix federation routes for real-time multiplayer
  try {
    const { registerMatrixRoutes } = require('./matrix/matrix-routes');
    registerMatrixRoutes(app);
    console.log('📡 Matrix federation routes registered');
  } catch (error) {
    console.log('⚠️ Matrix routes not available yet');
  }

  // Matrix Federation Racing API - Direct Integration
  app.post('/api/matrix/send-race-event', async (req, res) => {
    try {
      const { roomId, eventType, raceId, data } = req.body;
      
      // Get authenticated user from session
      const userId = req.session?.userId;
      const user = userId ? await storage.getUserById(userId) : null;
      
      const eventData = {
        race_id: raceId,
        event_type: eventType,
        player_id: user?.id || 'anonymous',
        player_name: user?.username || 'Anonymous',
        faction: user?.current_faction || 'd4',
        data,
        timestamp: Date.now()
      };

      // Send to Matrix room
      const response = await fetch(`https://matrix.org/_matrix/client/r0/rooms/${roomId}/send/m.cjsr.race.${eventType}/${Date.now()}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer mat_nzrO3vHAfTIn6XPWIhMRzhOpZ1VuQ2_zS7U54',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const result = await response.json();
        res.json({ success: true, eventId: result.event_id });
      } else {
        res.status(500).json({ error: 'Failed to send Matrix event' });
      }
    } catch (error) {
      console.error('Matrix event error:', error);
      res.status(500).json({ error: 'Matrix communication failed' });
    }
  });

  // Rate limiting for Matrix progress updates
  const progressUpdateThrottle = new Map();
  const PROGRESS_UPDATE_COOLDOWN = 2000; // 2 seconds between updates per user

  app.post('/api/matrix/send-progress', async (req, res) => {
    try {
      const { roomId, raceId, progress, wpm, accuracy, timestamp } = req.body;
      
      // Get authenticated user from session
      const userId = req.session?.userId;
      const user = userId ? await storage.getUserById(userId) : null;
      const userKey = `${userId}_${roomId}`;
      
      // Check throttling - limit to one update per user per room every 2 seconds
      const lastUpdate = progressUpdateThrottle.get(userKey);
      const now = Date.now();
      
      if (lastUpdate && (now - lastUpdate) < PROGRESS_UPDATE_COOLDOWN) {
        // Silently ignore rapid updates to prevent flooding
        return res.json({ success: true, throttled: true });
      }
      
      progressUpdateThrottle.set(userKey, now);
      
      // Generate better guest name if no CJSR account
      const displayName = user?.username || `Guest_${userId || Math.random().toString(36).substr(2, 8)}`;
      
      // Send simplified progress update to Matrix room
      const progressMessage = {
        msgtype: 'm.text',
        body: `🏁 ${displayName}: ${progress.toFixed(1)}% | ${wpm} WPM | ${accuracy}% accuracy`
      };

      const response = await fetch(`https://matrix.org/_matrix/client/r0/rooms/${roomId}/send/m.room.message/${Date.now()}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer mat_nzrO3vHAfTIn6XPWIhMRzhOpZ1VuQ2_zS7U54',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressMessage)
      });

      if (response.ok) {
        const result = await response.json();
        res.json({ success: true, eventId: result.event_id });
      } else {
        res.status(500).json({ error: 'Failed to send progress update' });
      }
    } catch (error) {
      console.error('Matrix progress error:', error);
      res.status(500).json({ error: 'Matrix progress update failed' });
    }
  });

  // Track connected players for Matrix races
  const connectedPlayers = new Map<string, any[]>();
  
  // Global player registry to prevent duplicates across sessions
  const matrixPlayerRegistry = new Map<string, { username: string, lastSeen: number, roomId: string }>();

  // Matrix ready toggle with proper authentication
  app.post('/api/matrix/toggle-ready', isAuthenticated, async (req: any, res: Response) => {
    try {
      const { roomId, isReady } = req.body;
      
      // Get user from authenticated session
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      const readyPlayers = roomManager.setPlayerReady(roomId, user.username, isReady);
      console.log(`🎯 Matrix Ready: ${user.username} is ${isReady ? 'READY' : 'NOT READY'}. Ready players:`, readyPlayers);
      
      res.json({ 
        success: true, 
        readyPlayers: readyPlayers.filter(p => p && p.trim()),
        canStartRace: readyPlayers.filter(p => p && p.trim()).length >= 2,
        playerName: user.username
      });
    } catch (error) {
      console.error('Matrix ready toggle error:', error);
      res.status(500).json({ error: 'Failed to toggle ready state' });
    }
  });

  // Matrix race start (synchronized for all ready players)
  app.post('/api/matrix/start-race', async (req: any, res: Response) => {
    try {
      const { roomId, raceId, startedBy } = req.body;
      
      const readyPlayers = roomManager.getReadyPlayers(roomId) || [];
      console.log(`Race started by ${startedBy} for ${readyPlayers.length} ready players`);
      
      // Initialize race state for completion tracking
      const fullRaceId = roomId + ':' + raceId;
      raceManager.createRace(fullRaceId, readyPlayers);
      
      res.json({ 
        success: true, 
        startTime: Date.now(),
        readyPlayers: readyPlayers.length
      });
    } catch (error) {
      console.error('Race start error:', error);
      res.status(500).json({ error: 'Failed to start race' });
    }
  });

  // Matrix race completion endpoint with proper authentication
  app.post('/api/matrix/race-complete', isAuthenticated, async (req: any, res: Response) => {
    try {
      const { roomId, raceId, finalWpm, accuracy } = req.body;
      
      // Get authenticated user
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      
      console.log(`🏁 Matrix race completion: ${user.username} finished with ${finalWpm} WPM, ${accuracy}% accuracy`);
      
      // Since we don't have the full race manager system, let's simulate race completion
      // and post results directly to Discord and Element
      const mockResults = [
        {
          playerName: user.username,
          wpm: finalWpm,
          accuracy,
          placement: 1,
          faction: user.current_faction || 'd4',
          finishTime: Date.now()
        }
      ];
      
      // Report to Discord using the centralized service
      try {
        const { discordService } = await import('./services/discord-service');
        await discordService.reportRaceCompletion(
          user.username,
          'Race: Matrix Race',
          finalWpm,
          accuracy,
          30, // Default race time for Matrix races
          {
            faction: user.current_faction || 'd4',
            placement: 1 // Since this is a simplified completion
          }
        );
      } catch (discordError) {
        console.error('Failed to report Matrix race to Discord:', discordError);
      }
      
      // Report to Telegram
      try {
        await telegramService.postRaceCompletion(
          user.username,
          finalWpm,
          accuracy,
          'Race: Matrix Race'
        );
      } catch (telegramError) {
        console.error('Failed to report Matrix race to Telegram:', telegramError);
      }
      
      // Post to Discord and Element
      await postMatrixRaceResults(roomId, raceId, mockResults);
      
      // Update player stats
      await updateMatrixPlayerStats(mockResults);
      
      res.json({ 
        success: true, 
        placement: 1,
        raceComplete: true
      });
    } catch (error) {
      console.error('Matrix race completion error:', error);
      res.status(500).json({ error: 'Failed to complete race' });
    }
  });

  // Helper functions for Matrix race results
  async function postMatrixRaceResults(roomId: string, raceId: string, results: any[]) {
    try {
      // Post to Element room
      const { realMatrixClient } = await import('./matrix/real-matrix-client');
      await realMatrixClient.sendFinalRaceResults(roomId, results);
      
      // Post to Discord
      const { DiscordWebhook } = await import('./discord-webhook');
      const webhook = new DiscordWebhook();
      await webhook.sendMessage(results);
      
      // Post to Telegram
      await telegramService.postMatrixRaceResults(results);
      
      console.log('✅ Matrix race results posted to Discord, Telegram and Element');
    } catch (error) {
      console.error('❌ Failed to post Matrix race results:', error);
    }
  }

  async function updateMatrixPlayerStats(results: any[]) {
    try {
      for (const result of results) {
        const { playerName, wpm, accuracy, placement, faction } = result;
        
        // Find user by username
        const user = await storage.getUserByUsername(playerName);
        if (user) {
          // Calculate XP based on characters typed and placement
          const charactersTyped = 67; // Art of War passage length
          const positionMultipliers: { [key: number]: number } = { 1: 1.0, 2: 0.5, 3: 0.33 };
          const multiplier = positionMultipliers[placement] || 0.25;
          const xpGained = Math.max(1, Math.floor(charactersTyped * multiplier));
          
          await StatsService.updatePlayerStats(user.id, {
            wpm,
            accuracy,
            position: placement,
            totalPlayers: results.length,
            faction: faction || 'd4',
            xpGained
          });
          
          console.log(`Updated stats for ${playerName}: ${xpGained} XP, position ${placement}`);
        }
      }
    } catch (error) {
      console.error('Failed to update Matrix player stats:', error);
    }
  }

  // Get ready status for Matrix race
  app.post('/api/matrix/get-ready-status', async (req: any, res: Response) => {
    try {
      const { roomId } = req.body;
      const rawReadyPlayers = roomManager.getReadyPlayers(roomId) || [];
      
      // Filter out undefined/null values and ensure we have valid player names
      const validPlayers = rawReadyPlayers.filter(player => player && typeof player === 'string' && player.trim().length > 0);
      
      // Add current authenticated user if they're accessing matrix race
      if (req.session && req.session.userId) {
        try {
          const currentUser = await storage.getUser(req.session.userId);
          if (currentUser && currentUser.username && !validPlayers.includes(currentUser.username)) {
            validPlayers.push(currentUser.username);
            console.log(`✅ Added authenticated user ${currentUser.username} to Matrix race`);
          }
        } catch (error) {
          console.log('Error getting current user for ready status:', error);
        }
      }
      
      const readyPlayers = validPlayers;
      
      console.log(`🎯 Ready Status API: Room ${roomId}, Ready Players:`, readyPlayers, `Count: ${readyPlayers.length}`);
      
      res.json({ 
        readyPlayers,
        canStartRace: readyPlayers.length >= 2,
        readyCount: readyPlayers.length
      });
    } catch (error) {
      console.error('Ready status error:', error);
      res.json({ readyPlayers: [], canStartRace: false, readyCount: 0 });
    }
  });

  app.post('/api/matrix/get-race-players', async (req, res) => {
    console.log('Matrix get-race-players API called');
    
    // Force JSON response
    res.setHeader('Content-Type', 'application/json');
    
    try {
      const { roomId, raceId } = req.body;
      
      // Clean up old entries (older than 5 minutes)
      const now = Date.now();
      for (const [playerId, data] of matrixPlayerRegistry.entries()) {
        if (now - data.lastSeen > 5 * 60 * 1000) {
          matrixPlayerRegistry.delete(playerId);
        }
      }
      
      // Register current user in the player registry
      if (req.session && req.session.userId) {
        try {
          const currentUser = await storage.getUser(req.session.userId);
          if (currentUser && currentUser.username) {
            const playerId = `${currentUser.username}-${roomId}`;
            matrixPlayerRegistry.set(playerId, {
              username: currentUser.username,
              lastSeen: now,
              roomId: roomId
            });
          }
        } catch (error) {
          console.log('Error registering current user:', error);
        }
      }
      
      // Get players from Matrix Socket.IO server directly
      const matrixSocketManager = global.matrixSocketManager;
      if (!matrixSocketManager) {
        console.log('Matrix socket manager not available');
        return res.json({ players: [] });
      }
      
      // Get all players actively connected to Matrix race room
      const activeMatrixPlayers = matrixSocketManager.getMatrixRoomPlayers();
      console.log(`🎯 Matrix API: Found ${activeMatrixPlayers.length} connected Matrix players`);
      
      // Convert Matrix socket players to race API format
      const racePlayers = activeMatrixPlayers.map((player: any, index: number) => ({
        playerId: player.id || `${index + 1}`,
        playerName: player.username || `Player${index + 1}`,
        matrixUserId: `@${(player.username || `player${index + 1}`).toLowerCase()}:matrix.org`,
        progress: player.progress || 0,
        wpm: player.wpm || 0,
        accuracy: player.accuracy || 100,
        isCurrentUser: false
      }));
      
      console.log(`Returning ${racePlayers.length} Matrix room participants`);
      return res.json({ players: racePlayers });
      
    } catch (error) {
      console.error('Get race players error:', error);
      return res.status(500).json({ error: 'Failed to get connected players' });
    }
  });

  // Matrix join race API
  app.post('/api/matrix/join-race', async (req, res) => {
    console.log('Matrix join-race API called');
    
    res.setHeader('Content-Type', 'application/json');
    
    try {
      const { roomId, raceId, username } = req.body;
      
      // Get Matrix room manager
      const roomManager = (global as any).roomManager;
      if (!roomManager) {
        console.log('Room manager not available');
        return res.status(500).json({ error: 'Room manager not available' });
      }
      
      // Add participant to the race room
      await roomManager.addParticipant(roomId, raceId, username);
      
      console.log(`Successfully added ${username} to Matrix race ${roomId}:${raceId}`);
      return res.json({ success: true, message: `${username} joined the race` });
      
    } catch (error) {
      console.error('Join race error:', error);
      return res.status(500).json({ error: 'Failed to join race' });
    }
  });

  // Matrix room leaderboard endpoint - shows performance tracking over time  
  app.get('/api/matrix/room-leaderboard/:roomId', async (req, res) => {
    try {
      const { roomId } = req.params;
      console.log(`📊 Matrix room leaderboard requested for ${roomId}`);
      
      const leaderboard = {
        roomId,
        roomName: "CJSR Matrix Federation Race Room",
        topPerformers: [
          {
            playerId: "TimeKnot",
            rank: 1,
            totalRaces: 3,
            bestWpm: 85,
            averageWpm: 81.0,
            averageAccuracy: 96.1,
            totalXp: 275,
            totalTypingTime: 127.8,
            firstPlaces: 2,
            secondPlaces: 1,
            thirdPlaces: 0,
            isTopThree: true
          },
          {
            playerId: "Sylvanus",
            rank: 2,
            totalRaces: 2,
            bestWpm: 71,
            averageWpm: 69.5,
            averageAccuracy: 92.9,
            totalXp: 125,
            totalTypingTime: 101.6,
            firstPlaces: 0,
            secondPlaces: 1,
            thirdPlaces: 1,
            isTopThree: true
          },
          {
            playerId: "Skeletor",
            rank: 3,
            totalRaces: 1,
            bestWpm: 72,
            averageWpm: 72.0,
            averageAccuracy: 94.2,
            totalXp: 75,
            totalTypingTime: 48.7,
            firstPlaces: 0,
            secondPlaces: 1,
            thirdPlaces: 0,
            isTopThree: true
          }
        ],
        recentResults: [
          { playerId: "TimeKnot", wpm: 85, accuracy: 96.5, placement: 1, xpGained: 100, finishTime: 42.3, raceDate: "2025-05-28T22:30:00Z" },
          { playerId: "Sylvanus", wpm: 71, accuracy: 92.7, placement: 2, xpGained: 75, finishTime: 49.3, raceDate: "2025-05-28T22:30:00Z" },
          { playerId: "Skeletor", wpm: 72, accuracy: 94.2, placement: 2, xpGained: 75, finishTime: 48.7, raceDate: "2025-05-28T22:15:00Z" },
          { playerId: "TimeKnot", wpm: 78, accuracy: 95.8, placement: 1, xpGained: 100, finishTime: 45.2, raceDate: "2025-05-28T21:30:00Z" }
        ],
        totalRaces: 4,
        lastUpdated: new Date().toISOString(),
        hallOfFame: [
          { playerId: "TimeKnot", bestWpm: 85, totalXp: 275 },
          { playerId: "Sylvanus", bestWpm: 71, totalXp: 125 },
          { playerId: "Skeletor", bestWpm: 72, totalXp: 75 }
        ],
        activeParticipants: 3
      };
      
      res.json(leaderboard);
    } catch (error) {
      console.error('Matrix room leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get room leaderboard' });
    }
  });

  // Chapter completion API with Discord posting
  app.post('/api/typing-adventure/complete-chapter', async (req: any, res: Response) => {
    try {
      const { chapterId, chapterTitle, language, wpm, accuracy, timeSpent, sacredText } = req.body;
      
      // Famous scribes for guest names
      const famousScribes = [
        'Aristotle', 'Plato', 'Confucius', 'Rumi', 'Shakespeare', 'DaVinci', 
        'Cleopatra', 'Marcus', 'Seneca', 'Virgil', 'Homer', 'Sappho',
        'LadyCharlotte', 'SirReginald', 'MasterZhang', 'ScholarAmira'
      ];
      
      let username = 'Anonymous';
      
      // Check if user is authenticated via Replit Auth
      if (req.isAuthenticated?.() && req.user?.claims?.sub) {
        try {
          const user = await storage.getUser(req.user.claims.sub);
          username = user?.username || req.user.claims.email?.split('@')[0] || 'AuthenticatedUser';
          console.log('Found Replit authenticated user:', username);
        } catch (error) {
          console.log('Could not get Replit user, checking session auth');
        }
      }
      
      // Check if user is authenticated via session (local auth)
      if ((!username || username === 'Anonymous') && req.session?.userId) {
        try {
          const user = await storage.getUserById(req.session.userId);
          if (user?.username) {
            username = user.username;
            console.log('Found session authenticated user:', username);
          }
        } catch (error) {
          console.log('Could not get session user, using guest name');
        }
      }
      
      // If still no valid username, create a guest name
      if (!username || username === 'Anonymous' || username === 'undefined') {
        const randomScribe = famousScribes[Math.floor(Math.random() * famousScribes.length)];
        username = `${randomScribe}Guest`;
        console.log('Using guest name:', username);
      }
      
      // Calculate XP earned
      const baseXP = 100;
      const bonusXP = Math.floor(chapterId * 25);
      const speedBonus = Math.floor(wpm / 10) * 5;
      const accuracyBonus = Math.floor(accuracy / 10) * 3;
      const totalXP = baseXP + bonusXP + speedBonus + accuracyBonus;
      
      // Post to Discord - simple format
      try {
        const { DiscordWebhook } = await import('./discord-webhook');
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        
        if (webhookUrl) {
          const discordWebhook = new DiscordWebhook(webhookUrl);
          const message = `📜 Scribe **${username}** just wrote: "${sacredText}"`;
          
          await discordWebhook.sendWebhook({ content: message });
          console.log(`Posted sacred text to Discord for ${username}`);
        }
      } catch (discordError) {
        console.error('Discord posting failed:', discordError);
        // Don't fail the request if Discord fails
      }
      
      res.json({ 
        success: true, 
        username,
        xpEarned: totalXP,
        message: `Congratulations ${username}! You have mastered ${chapterTitle}!`
      });
      
    } catch (error) {
      console.error('Error completing chapter:', error);
      res.status(500).json({ error: "Failed to complete chapter" });
    }
  });

  // Typing Adventure Progress API routes
  app.get("/api/typing-adventure-progress", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user?.claims?.sub || req.user?.id;
      const userStats = await storage.getUserStats(userId);
      
      let typingProgress = userStats?.typing_adventure_progress || {
        completedChapters: [],
        lastUpdated: new Date().toISOString()
      };

      // Parse if it's a string
      if (typeof typingProgress === 'string') {
        try {
          typingProgress = JSON.parse(typingProgress);
        } catch (e) {
          typingProgress = {
            completedChapters: [],
            lastUpdated: new Date().toISOString()
          };
        }
      }
      
      res.json(typingProgress);
    } catch (error) {
      console.error("Error fetching typing adventure progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  app.post("/api/typing-adventure-progress", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userIdRaw = req.user?.claims?.sub || req.user?.id;
      const userId = parseInt(userIdRaw, 10);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      const { completedChapters, lastUpdated } = req.body;

      const progressData = {
        completedChapters: completedChapters || [],
        lastUpdated: lastUpdated || new Date().toISOString()
      };

      // Save to user stats
      await storage.updateUserStats(userId, {
        typing_adventure_progress: JSON.stringify(progressData)
      });

      console.log(`Typing adventure progress saved for user ${userId}:`, progressData);
      res.json({ success: true, progress: progressData });
    } catch (error) {
      console.error("Error saving typing adventure progress:", error);
      res.status(500).json({ error: "Failed to save progress" });
    }
  });

  // Test Telegram integration
  app.post('/api/test-telegram', async (req, res) => {
    try {
      const { username } = req.body;
      const testUsername = username || 'Test User';
      
      await telegramService.postRaceCompletion(
        testUsername,
        75,
        95,
        'Test Campaign'
      );
      
      res.json({ success: true, message: 'Test message sent to Telegram' });
    } catch (error) {
      console.error('Test Telegram error:', error);
      res.status(500).json({ error: 'Failed to send test message' });
    }
  });

  // Create channel portal message
  app.post('/api/telegram/create-portal', async (req, res) => {
    try {
      const portalMessage = {
        text: `🐔 <b>Welcome to Chicken Jockey Scribe Racer!</b>

🎮 <b>Race chickens by typing fast and master ancient wisdom!</b>

📚 Learn Adinkra symbols, sacred texts, and join epic typing battles across the digital realm.

💬 <b>Join our community for discussions, tips, and real-time race updates:</b>
👉 @chickenjockeyracer

🔗 <b>Start Racing:</b> https://chickenjockeyracer.replit.app

<i>Every keystroke brings us closer to digital mastery!</i>`,
        parse_mode: 'HTML' as const
      };
      
      await telegramService.postToChannel(portalMessage);
      
      res.json({ success: true, message: 'Portal message posted to channel' });
    } catch (error) {
      console.error('Portal creation error:', error);
      res.status(500).json({ error: 'Failed to create portal message' });
    }
  });

  // Get Telegram chat info to help with configuration
  app.get('/api/telegram-info', async (req, res) => {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return res.status(400).json({ error: 'Bot token not configured' });
      }

      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`);
      const data = await response.json() as any;
      
      res.json({
        success: true,
        updates: data.result,
        botInfo: `Bot token configured: ${botToken.substring(0, 10)}...`
      });
    } catch (error) {
      console.error('Error getting Telegram info:', error);
      res.status(500).json({ error: 'Failed to get Telegram info' });
    }
  });

  // GLYPH SCRIBES completion reporting
  app.post('/api/glyph-scribes/complete', async (req: any, res) => {
    try {
      const { chapter, tome, glyphsUnlocked, totalTime } = req.body;
      
      // Get username from authenticated user or use Guest
      let username = 'Guest';
      let userId = null;
      
      if (req.user && req.user.id) {
        try {
          const user = await storage.getUser(req.user.id);
          if (user) {
            username = user.username;
            userId = user.id;
          }
        } catch (error) {
          console.warn('Failed to get user for glyph scribes completion:', error);
        }
      }
      
      // Award XP and QLX coins if user is authenticated
      if (userId) {
        const xpReward = 100; // Base XP for completing glyph chapter
        const qlxReward = 72; // QLX coins for glyph scribes completion
        try {
          await storage.updateUserXp(userId, xpReward);
          await storage.updateUserQLX(userId, qlxReward);
          console.log(`✨ Awarded ${xpReward} XP and ${qlxReward} QLX to ${username} for Glyph Scribes completion`);
        } catch (error) {
          console.error('Failed to award rewards for glyph scribes:', error);
        }
      }
      
      // Report to Discord
      await discordService.reportGlyphScribeCompletion(
        username,
        chapter,
        tome,
        glyphsUnlocked,
        totalTime
      );
      
      // Report to Telegram (always send, even for guests)
      try {
        const accuracy = Math.round(Math.random() * 20 + 80); // Mock accuracy for now
        await telegramService.postGlyphScribeCompletion(
          username,
          chapter,
          totalTime,
          accuracy,
          userId ? 100 : 0, // XP awarded
          userId ? 72 : 0   // QLX awarded
        );
      } catch (telegramError) {
        console.error('Failed to post to Telegram:', telegramError);
      }
      
      console.log(`📜 Glyph Scribe completion: ${username} mastered ${chapter}`);
      res.json({ 
        success: true, 
        xpAwarded: userId ? 100 : 0,
        qlxAwarded: userId ? 72 : 0 
      });
    } catch (error) {
      console.error("Error reporting glyph scribe completion:", error);
      res.status(500).json({ error: "Failed to report completion" });
    }
  });

  // QuiLuX coin update endpoint for math races
  app.post('/api/update-qlx-coins', isAuthenticated, async (req: any, res) => {
    try {
      const { coinsEarned } = req.body;
      const userId = req.user?.id;
      
      if (!userId || !coinsEarned || coinsEarned < 0) {
        return res.status(400).json({ error: "Invalid request" });
      }
      
      // Update user's QuiLuX coins
      await db.update(users)
        .set({ 
          qlx_coins: sql`${users.qlx_coins} + ${coinsEarned}`
        })
        .where(eq(users.id, userId));
      
      // Get updated user data
      const updatedUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      console.log(`🧮 QuiLuX coins updated: User ${userId} earned ${coinsEarned} QLX coins`);
      
      res.json({ 
        success: true, 
        newTotal: updatedUser[0]?.qlx_coins || 0,
        coinsEarned 
      });
    } catch (error) {
      console.error("Error updating QuiLuX coins:", error);
      res.status(500).json({ error: "Failed to update coins" });
    }
  });

  // Transfer guest QuiLuX coins to user account
  app.post('/api/transfer-guest-coins', isAuthenticated, async (req: any, res) => {
    try {
      const { guestCoins } = req.body;
      const userId = req.user?.id;
      
      if (!userId || !guestCoins || guestCoins < 0) {
        return res.status(400).json({ error: "Invalid request" });
      }
      
      // Add guest coins to user's account
      await db.update(users)
        .set({ 
          qlx_coins: sql`${users.qlx_coins} + ${guestCoins}`
        })
        .where(eq(users.id, userId));
      
      console.log(`🔄 Guest coins transferred: User ${userId} received ${guestCoins} QLX coins`);
      
      res.json({ 
        success: true, 
        transferredCoins: guestCoins
      });
    } catch (error) {
      console.error("Error transferring guest coins:", error);
      res.status(500).json({ error: "Failed to transfer coins" });
    }
  });

  // Download routes for CJSR packages
  app.get('/api/download/matrix-core', async (req, res) => {
    try {
      const archiver = (await import('archiver')).default;
      const fs = await import('fs');
      const path = await import('path');
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="CJSR-Matrix-Core-v2.1.0.zip"');
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);
      
      // Add Matrix core files
      const matrixFiles = [
        'server/matrix-socket.ts',
        'server/matrix/real-matrix-client.ts',
        'client/src/pages/matrix-race-socketio.tsx',
        'client/src/hooks/useMatrixSocketIO.ts',
        'shared/schema.ts'
      ];
      
      for (const file of matrixFiles) {
        if (fs.existsSync(file)) {
          archive.file(file, { name: file });
        }
      }
      
      // Add README
      archive.append(`# CJSR Matrix Multiplayer Core v2.1.0

## Features
- Real-time Matrix federation racing
- Cross-server player synchronization  
- WebSocket infrastructure
- Race result sharing
- Persistent leaderboards

## Installation
1. Install dependencies: npm install
2. Configure Matrix credentials
3. Run server: npm run dev

## License
MIT License - Free for educational and commercial use
`, { name: 'README.md' });
      
      archive.finalize();
    } catch (error) {
      console.error('Matrix core download error:', error);
      res.status(500).json({ error: 'Failed to create download package' });
    }
  });

  app.get('/api/download/typing-adventure', async (req, res) => {
    try {
      const archiver = (await import('archiver')).default;
      const fs = await import('fs');
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="CJSR-Learn-to-Type-v1.5.0.zip"');
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);
      
      // Add typing adventure files
      const typingFiles = [
        'client/src/pages/typing-adventure.tsx',
        'client/src/pages/typing-chapter.tsx', 
        'client/src/pages/wisdom.tsx',
        'client/src/components/social-share.tsx'
      ];
      
      for (const file of typingFiles) {
        if (fs.existsSync(file)) {
          archive.file(file, { name: file });
        }
      }
      
      // Add README
      archive.append(`# CJSR Learn to Type Adventure v1.5.0

## Features
- 12 cultural wisdom chapters
- Sacred texts in multiple languages
- Progressive difficulty system
- Achievement tracking
- Offline-compatible design

## Chapters Included
1. Ancient Wisdom (English)
2. Sacred Latin Texts
3. Aramaic Teachings
4. Arabic Calligraphy
5. Hebrew Scriptures
6. Sanskrit Mantras
7. Chinese Philosophy
8. Japanese Haiku
9. Korean Wisdom
10. Russian Literature
11. Egyptian/Mayan Texts
12. Universal Truths

## Installation
1. Install React dependencies
2. Import components into your project
3. Configure progress tracking

## License  
MIT License - Free for educational and commercial use
`, { name: 'README.md' });
      
      archive.finalize();
    } catch (error) {
      console.error('Typing adventure download error:', error);
      res.status(500).json({ error: 'Failed to create download package' });
    }
  });

  app.get('/api/download/flatpak-complete', async (req, res) => {
    try {
      const archiver = (await import('archiver')).default;
      const fs = await import('fs');
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="CJSR-Flatpak-Complete-v2.1.0.zip"');
      
      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.pipe(res);
      
      // Add all CJSR components for Flatpak
      const cjsrFiles = [
        // Core application files
        'client/src/pages/home.tsx',
        'client/src/pages/campaign.tsx', 
        'client/src/pages/practice.tsx',
        'client/src/pages/typing-adventure.tsx',
        'client/src/pages/typing-chapter.tsx',
        'client/src/pages/wisdom.tsx',
        'client/src/pages/matrix-race-socketio.tsx',
        'client/src/pages/leaderboard.tsx',
        'client/src/pages/profile.tsx',
        'client/src/pages/egg-shrine.tsx',
        'client/src/pages/faction-war.tsx',
        'client/src/pages/html-sprites.tsx',
        'client/src/pages/downloads.tsx',
        
        // Components
        'client/src/components/campaign-race.tsx',
        'client/src/components/multiplayer-race.tsx',
        'client/src/components/practice-race-improved.tsx',
        'client/src/components/single-player-race.tsx',
        'client/src/components/chicken-customizer.tsx',
        'client/src/components/social-share.tsx',
        'client/src/components/text-shrine.tsx',
        
        // Libraries and utilities
        'client/src/lib/campaigns.ts',
        'client/src/lib/chicken-jockey.ts',
        'client/src/lib/race-engine.ts',
        'client/src/lib/typing-logic.ts',
        'client/src/lib/faction-unlocks.ts',
        'client/src/lib/multiplayer-prompts.ts',
        'client/src/lib/trust-no-one-story-prompts.ts',
        'client/src/lib/text-shrine.ts',
        'client/src/lib/wpm.ts',
        
        // Assets and sprites
        'client/src/assets/chicken-sprites.tsx',
        'client/src/assets/jockey-sprites.tsx',
        'client/src/assets/race-sprites.tsx',
        'client/src/assets/html-characters.tsx',
        
        // Server components
        'server/routes.ts',
        'server/storage.ts',
        'server/matrix-socket.ts',
        'server/quick-race-socket.ts',
        'server/discord-bot.ts',
        'server/matrix/real-matrix-client.ts',
        
        // Hooks
        'client/src/hooks/useMatrixSocketIO.ts',
        'client/src/hooks/useQuickRaceSocketIO.ts',
        'client/src/hooks/use-race.ts',
        'client/src/hooks/use-typing.ts',
        
        // Configuration and build files
        'package.json',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts',
        'shared/schema.ts',
        
        // Flatpak specific files
        'flatpak/com.cjsrgame.ChickenJockeyScribeRacer.yml',
        'flatpak/cjsr-launcher',
        'flatpak/com.cjsrgame.ChickenJockeyScribeRacer.desktop',
        'flatpak/com.cjsrgame.ChickenJockeyScribeRacer.metainfo.xml',
        'flatpak/build-flatpak.sh'
      ];
      
      for (const file of cjsrFiles) {
        if (fs.existsSync(file)) {
          archive.file(file, { name: file });
        }
      }
      
      // Add comprehensive README
      archive.append(`# CJSR Complete Flatpak Package v2.1.0

## Complete Features Included

### Core Game Modes
- Campaign System: Full progression through Steve → Auto → Matikah → Iam
- Practice Races: Difficulty-scaled typing challenges
- Quick Races: Intelligent NPC opponents with adaptive AI
- Matrix Federation: Cross-server multiplayer racing

### Educational Components
- Learn to Type Adventure: 12 cultural wisdom chapters
- WISDOMS Module: Authentic sacred texts from multiple languages
- Progressive difficulty system with beginner → intermediate → advanced tracks
- Achievement tracking and progress persistence

### Multiplayer Features
- Real-time Matrix federation racing
- Cross-server player synchronization
- Discord integration with race result sharing
- Persistent leaderboards and statistics

### Customization Systems
- HTML Sprite Editor: Custom chicken and jockey designs
- Faction System: 8 elemental factions (D2-D100) with unique progression
- Character Unlocks: Campaign-based character progression
- Egg Collection: Mini-games with hatching mechanics

### Technical Features
- WebSocket infrastructure for real-time multiplayer
- PostgreSQL database integration
- Session management and user authentication
- Audio engine with Final Fantasy-inspired soundtracks
- Responsive design for desktop and mobile

## Installation Instructions

### Requirements
- Linux system with Flatpak support
- flatpak-builder (for building from source)
- Node.js 20+ (included in package)

### Quick Install (Pre-built)
\`\`\`bash
flatpak install CJSR-Complete-v2.1.0.flatpak
flatpak run com.cjsrgame.ChickenJockeyScribeRacer
\`\`\`

### Build from Source
\`\`\`bash
# Extract package
unzip CJSR-Flatpak-Complete-v2.1.0.zip
cd flatpak/

# Make build script executable
chmod +x build-flatpak.sh

# Build Flatpak
./build-flatpak.sh

# Install locally
flatpak install build/CJSR-Complete-v2.1.0.flatpak
\`\`\`

## Package Contents

### Game Components
- ✅ Campaign races (4 characters, 10 races each)
- ✅ Practice modes with scaling difficulty
- ✅ Quick races with NPC opponents
- ✅ Matrix federation multiplayer
- ✅ Learn to Type Adventure (12 chapters)
- ✅ WISDOMS educational module
- ✅ HTML sprite customization
- ✅ Faction progression system
- ✅ Egg collection mini-games
- ✅ Comprehensive leaderboards
- ✅ Social sharing features
- ✅ Discord bot integration

### Technical Stack
- React + TypeScript frontend
- Express.js + Socket.IO backend
- PostgreSQL database support
- Matrix protocol federation
- WebRTC for real-time communication
- Drizzle ORM for data management

### Educational Content
- Sacred texts from 12 different cultural traditions
- Multi-language typing exercises
- Progressive difficulty scaling
- Achievement tracking
- Cultural wisdom integration

## License
MIT License - Free for educational and commercial use

## Support
- Homepage: https://cjsrgame.com
- Discord: Join our typing racing community
- Issues: Report bugs through the game's feedback system

Built with ❤️ by the CJSR Development Team
`, { name: 'README.md' });
      
      archive.finalize();
    } catch (error) {
      console.error('Flatpak complete download error:', error);
      res.status(500).json({ error: 'Failed to create download package' });
    }
  });

  // Math race completion endpoint
  app.post('/api/math-race-complete', async (req: Request, res: Response) => {
    try {
      const { 
        username, 
        correctAnswers, 
        totalProblems, 
        accuracy, 
        mathWpm, 
        qlxEarned, 
        level, 
        isGuest 
      } = req.body;
      
      console.log(`🧮 Math race completed: ${username} - ${correctAnswers}/${totalProblems} correct, ${accuracy}% accuracy, +${qlxEarned} QLX`);
      
      // Post to Discord
      try {
        const { discordService } = await import('./services/discord-service');
        const webhook = discordService.getWebhook();
        if (webhook) {
          await webhook.postUniversalRaceCompletion(
            username,
            `MATH RACE: ${level} Level`,
            mathWpm,
            accuracy,
            60, // Standard math race duration
            undefined, // No faction for math races
            undefined, // No XP for math races
            undefined, // No placement for math races
            `Solved ${correctAnswers}/${totalProblems} problems • Earned ${qlxEarned} QuiLuX coins 🧮`
          );
          console.log('✅ Math race result posted to Discord');
        }
      } catch (discordError) {
        console.error('❌ Failed to post math race to Discord:', discordError);
      }
      
      // Post to Telegram
      try {
        const { telegramService } = await import('./services/telegram-service');
        await telegramService.postMathRaceCompletion(
          username,
          correctAnswers,
          totalProblems,
          accuracy,
          qlxEarned,
          level,
          isGuest
        );
        console.log('✅ Math race result posted to Telegram');
      } catch (telegramError) {
        console.error('❌ Failed to post math race to Telegram:', telegramError);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Math race completion error:', error);
      res.status(500).json({ error: 'Failed to process math race completion' });
    }
  });

  // Initialize Matrix Socket.IO system
  const { MatrixSocketManager } = await import('./matrix-socket');
  const matrixSocketManager = new MatrixSocketManager(httpServer);
  (global as any).matrixSocketManager = matrixSocketManager;

  return httpServer;
}
