import { WebSocketServer, WebSocket } from "ws";
import { RaceManager, RaceStatus } from "../game/race-manager";
import { PromptManager } from "../game/prompt-manager";
import { PlayerManager } from "../game/player-manager";
import { handleRaceEvents } from "./race-events";
import { multiplayerLobby } from "../multiplayer-lobby";
import { artOfWarService } from "../art-of-war-service";
import { storage } from "../storage";

// Extended WebSocket interface to add our custom properties
interface CustomWebSocket extends WebSocket {
  id?: string;
  playerId?: string;
  isAlive: boolean;
  matrixUserId?: number;
  matrixUsername?: string;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function initWebSocketHandlers(
  wss: WebSocketServer,
  raceManager: RaceManager,
  promptManager: PromptManager,
  playerManager: PlayerManager
) {
  wss.on("connection", (socket: WebSocket) => {
    // Cast to our custom type with additional properties
    const customSocket = socket as CustomWebSocket;
    
    // Assign a unique ID to this connection
    const connectionId = Math.random().toString(36).substr(2, 9);
    console.log(`New WebSocket connection: ${connectionId}`);
    
    // Set socket data
    customSocket.id = connectionId;
    customSocket.playerId = undefined;
    customSocket.isAlive = true;
    
    // Handle ping/pong to keep connection alive
    customSocket.on("pong", () => {
      customSocket.isAlive = true;
    });
    
    // Store guest player ID for this connection
    let guestPlayerId: string | undefined;
    
    // Handle messages
    customSocket.on("message", async (data: any) => {
      try {
        let message: string | WebSocketMessage;
        
        // Log the received message for debugging
        console.log(`WebSocket message received from ${connectionId}:`, data.toString().substring(0, 100));
        
        // Handle both string and JSON messages
        if (data.toString().startsWith('{')) {
          message = JSON.parse(data.toString());
          console.log(`Processing JSON message type: ${(message as any).type}`);
          
          // Handle Matrix authentication
          if (typeof message === 'object' && (message as any).type === 'matrix_auth') {
            const { userId, username } = (message as any).data;
            console.log(`🔐 Matrix auth attempt - userId: ${userId}, username: ${username}`);
            
            // Store Matrix user info on socket
            customSocket.matrixUserId = userId;
            customSocket.matrixUsername = username;
            
            customSocket.send(JSON.stringify({
              type: 'matrix_authenticated',
              data: { userId, username, faction: 'd4' }
            }));
            
            console.log(`✅ Matrix authenticated: ${username}`);
          }
          
          // Handle Matrix ready status
          if (typeof message === 'object' && (message as any).type === 'matrix_ready') {
            const { roomId, isReady } = (message as any).data;
            console.log(`🎯 Matrix ready status: ${customSocket.matrixUsername} is ${isReady ? 'READY' : 'NOT READY'}`);
            
            // Count ready players
            let readyCount = 0;
            wss.clients.forEach((client) => {
              const matrixClient = client as CustomWebSocket;
              if (matrixClient.readyState === WebSocket.OPEN && matrixClient.matrixUserId) {
                readyCount++;
              }
            });
            
            // Broadcast ready status to all Matrix clients
            wss.clients.forEach((client) => {
              const matrixClient = client as CustomWebSocket;
              if (matrixClient.readyState === WebSocket.OPEN && matrixClient.matrixUserId) {
                matrixClient.send(JSON.stringify({
                  type: 'matrix_ready_update',
                  data: { 
                    username: customSocket.matrixUsername, 
                    isReady,
                    readyCount,
                    canStart: readyCount >= 2
                  }
                }));
              }
            });
          }
          
          // Handle Matrix race start
          if (typeof message === 'object' && (message as any).type === 'matrix_start_race') {
            console.log(`🏁 Matrix race starting initiated by ${customSocket.matrixUsername}`);
            
            // Generate race prompt
            const prompt = artOfWarService.getRandomPassage();
            const raceId = Math.random().toString(36).substr(2, 9);
            
            // Broadcast race start to all Matrix clients
            wss.clients.forEach((client) => {
              const matrixClient = client as CustomWebSocket;
              if (matrixClient.readyState === WebSocket.OPEN && matrixClient.matrixUserId) {
                matrixClient.send(JSON.stringify({
                  type: 'matrix_race_started',
                  data: { 
                    raceId,
                    prompt: prompt.text,
                    startTime: Date.now()
                  }
                }));
              }
            });
          }
          
          // Handle Matrix race progress
          if (typeof message === 'object' && (message as any).type === 'matrix_progress') {
            const { raceId, progress, wpm, accuracy } = (message as any).data;
            
            // Broadcast progress to all Matrix clients
            wss.clients.forEach((client) => {
              const matrixClient = client as CustomWebSocket;
              if (matrixClient.readyState === WebSocket.OPEN && matrixClient.matrixUserId) {
                matrixClient.send(JSON.stringify({
                  type: 'matrix_progress_update',
                  data: { 
                    username: customSocket.matrixUsername,
                    progress,
                    wpm,
                    accuracy
                  }
                }));
              }
            });
          }
          
          // Handle Matrix race completion
          if (typeof message === 'object' && (message as any).type === 'matrix_complete') {
            const { raceId, finalWpm, finalAccuracy, finishTime } = (message as any).data;
            console.log(`🏆 Matrix race completed by ${customSocket.matrixUsername}: ${finalWpm} WPM`);
            
            // Store completion data
            const completedPlayer = {
              username: customSocket.matrixUsername,
              userId: customSocket.matrixUserId,
              finalWpm,
              finalAccuracy,
              finishTime
            };
            
            // Broadcast completion to all Matrix clients
            wss.clients.forEach((client) => {
              const matrixClient = client as CustomWebSocket;
              if (matrixClient.readyState === WebSocket.OPEN && matrixClient.matrixUserId) {
                matrixClient.send(JSON.stringify({
                  type: 'matrix_player_finished',
                  data: completedPlayer
                }));
              }
            });
            
            // Post results to Discord and Element
            try {
              const discordWebhook = require('../discord-webhook');
              const matrixClient = require('../matrix/real-matrix-client');
              
              const raceResults = `🏁 Matrix Race Results:\n${customSocket.matrixUsername}: ${finalWpm} WPM (${finalAccuracy}% accuracy)`;
              
              // Post to Discord
              await discordWebhook.sendMessage(raceResults);
              
              // Post to Element room
              await matrixClient.sendMessage(raceResults);
              
              console.log('✅ Matrix race results posted to Discord and Element');
            } catch (error) {
              console.error('❌ Failed to post Matrix race results:', error);
            }
          }
          
          // Handle private room creation
          if (typeof message === 'object' && (message as any).type === 'create_private_room') {
            const roomData = (message as any).roomData;
            const player = (message as any).player;
            
            if (roomData && player) {
              console.log(`🏠 Player ${player.username} creating private room: ${roomData.name}`);
              
              // Create a private race with custom prompt
              const raceId = raceManager.createPrivateRace(roomData, player);
              
              customSocket.send(JSON.stringify({
                type: "private_room_created",
                roomId: raceId,
                roomData: roomData
              }));
            }
          }
          
          // Handle joining private room
          else if (typeof message === 'object' && (message as any).type === 'join_private_room') {
            const roomId = (message as any).roomId;
            const player = (message as any).player;
            
            if (roomId && player) {
              console.log(`🏠 Player ${player.username} joining private room: ${roomId}`);
              
              // Set player ID on socket for tracking
              customSocket.playerId = player.id;
              
              // Create player data for race system
              const playerData = {
                id: player.id,
                username: player.username,
                level: player.level || 1,
                wpm: player.wpm || 60,
                chickenType: player.chickenType || 'html_steve',
                jockeyType: player.jockeyType || 'html_steve',
                faction: player.faction || 'none'
              };
              
              // Check if this is a guild hall (faction-restricted)
              if (roomId.startsWith('guild_')) {
                console.log(`🏛️ Player ${player.username} attempting to join guild hall: ${roomId}`);
                
                // Extract faction from guild hall ID (e.g., 'guild_d4_fire' -> 'd4')
                const factionMatch = roomId.match(/guild_([^_]+)_/);
                const requiredFaction = factionMatch ? factionMatch[1] : 'none';
                
                // Check if player belongs to this faction
                if (player.faction !== requiredFaction) {
                  console.log(`❌ Access denied: Player ${player.username} faction (${player.faction}) doesn't match guild hall faction (${requiredFaction})`);
                  customSocket.send(JSON.stringify({
                    type: "error",
                    message: `Access denied: You must be a member of the ${requiredFaction.toUpperCase()} faction to enter this guild hall.`
                  }));
                  return;
                }
                
                console.log(`✅ Faction access granted: ${player.username} (${player.faction}) entering ${requiredFaction} guild hall`);
                
                // For guild halls, create a temporary race if one doesn't exist
                let existingRace = raceManager.getRace(roomId);
                
                if (!existingRace) {
                  console.log(`🆕 Creating new race session for guild hall: ${roomId}`);
                  
                  // Create a new race for this guild hall
                  raceManager.createPrivateRace({
                    name: `${requiredFaction.toUpperCase()} Guild Hall Race`,
                    customPrompt: '', // Will use faction-themed prompts
                    maxPlayers: 8,
                    isPasswordProtected: false,
                    faction: requiredFaction,
                    roomId: roomId // Use the guild hall ID
                  });
                  
                  existingRace = raceManager.getRace(roomId);
                }
              }
              // Check if this is a core arena (open to all players)
              else if (roomId.startsWith('arena_')) {
                console.log(`🏟️ Player ${player.username} joining core arena: ${roomId}`);
                
                // For core arenas, create a temporary race if one doesn't exist
                let existingRace = raceManager.getRace(roomId);
                
                if (!existingRace) {
                  console.log(`🆕 Creating new race session for core arena: ${roomId}`);
                  
                  // Create a new race for this core arena
                  raceManager.createPrivateRace({
                    name: `Core Arena Race`,
                    customPrompt: '', // Will use general prompts
                    maxPlayers: 8,
                    isPasswordProtected: false,
                    faction: 'none',
                    roomId: roomId // Use the arena ID
                  });
                  
                  existingRace = raceManager.getRace(roomId);
                }
              } else {
                // Check if the private room exists first (for regular private rooms)
                const existingRace = raceManager.getRace(roomId);
                
                if (!existingRace) {
                  console.log(`❌ Private room ${roomId} does not exist`);
                  customSocket.send(JSON.stringify({
                    type: "error",
                    message: `Private room "${roomId}" does not exist. Please create a room first or check the room ID.`
                  }));
                  return;
                }
              }
              
              // Add player to the private race
              const added = raceManager.addPlayerToPrivateRace(roomId, playerData, customSocket);
              
              if (added) {
                console.log(`✅ Player ${player.username} successfully joined private room ${roomId}`);
                
                customSocket.send(JSON.stringify({
                  type: "joined_private_room",
                  roomId,
                  playerId: player.id
                }));
                
                // Broadcast updated player list to all players in the room
                const race = raceManager.getRace(roomId);
                if (race) {
                  const playerList = race.players.map(p => ({
                    id: p.id,
                    username: p.username,
                    level: p.level,
                    wpm: p.wpm,
                    status: p.status,
                    progress: p.progress,
                    chickenType: p.chickenType,
                    jockeyType: p.jockeyType,
                    isHost: p.id === race.hostId,
                    isReady: p.status === 'ready',
                    isNPC: p.isNPC || false
                  }));
                  
                  // Broadcast to all players in private room
                  race.players.forEach(racePlayer => {
                    if (racePlayer.socket && racePlayer.socket.readyState === WebSocket.OPEN) {
                      racePlayer.socket.send(JSON.stringify({
                        type: "private_room_update",
                        players: playerList,
                        playerCount: race.players.length,
                        roomData: race.customData
                      }));
                    }
                  });
                }
              } else {
                customSocket.send(JSON.stringify({
                  type: "error",
                  message: "Failed to join private room"
                }));
              }
            }
          }
          
          // Handle private room ready state
          else if (typeof message === 'object' && (message as any).type === 'private_room_ready') {
            const roomId = (message as any).roomId;
            const playerId = (message as any).playerId;
            const isReady = (message as any).isReady;
            
            if (roomId && playerId) {
              raceManager.setPlayerReadyState(roomId, playerId, isReady);
              
              // Broadcast updated ready states
              const race = raceManager.getRace(roomId);
              if (race) {
                const playerList = race.players.map(p => ({
                  id: p.id,
                  username: p.username,
                  isHost: p.id === race.hostId,
                  isReady: p.status === 'ready',
                  chickenType: p.chickenType,
                  jockeyType: p.jockeyType
                }));
                
                race.players.forEach(racePlayer => {
                  if (racePlayer.socket && racePlayer.socket.readyState === WebSocket.OPEN) {
                    racePlayer.socket.send(JSON.stringify({
                      type: "private_room_update",
                      players: playerList,
                      playerCount: race.players.length
                    }));
                  }
                });
              }
            }
          }
          
          // Handle start private room race
          else if (typeof message === 'object' && (message as any).type === 'start_private_race') {
            const roomId = (message as any).roomId;
            const hostId = (message as any).hostId;
            
            if (roomId && hostId) {
              const race = raceManager.getRace(roomId);
              // For guild halls and arenas, allow any ready player to start the race
              const isGuildOrArena = roomId.startsWith('guild_') || roomId.startsWith('arena_');
              const canStart = isGuildOrArena || (race && race.hostId === hostId);
              
              if (race && canStart) {
                console.log(`🏁 Starting private room race: ${roomId} with ${race.players.length} players`);
                
                // CRITICAL FIX: Don't override the existing prompt - keep the one set when race was created
                console.log(`📚 Using existing race prompt: "${race.promptText.substring(0, 50)}..."`);
                
                // Keep the existing prompt that was set when the race was created
                race.status = RaceStatus.RACING;
                race.startTime = Date.now();
                
                // Reset all player progress
                race.players.forEach(player => {
                  player.progress = 0;
                  player.status = 'ready'; // Use valid PlayerStatus
                });
                
                console.log(`🚀 Race ${roomId} started with prompt: "${race.promptText.substring(0, 50)}..."`);
                
                // Broadcast race start to all players with synchronized data
                const raceStartMessage = {
                  type: "race_started",
                  raceId: roomId,
                  promptText: race.promptText,
                  startTime: race.startTime,
                  players: race.players.map(p => ({
                    id: p.id,
                    username: p.username,
                    progress: p.progress,
                    status: p.status,
                    chickenType: p.chickenType,
                    jockeyType: p.jockeyType,
                    isNPC: p.isNPC || false
                  }))
                };
                
                console.log(`🎯 Broadcasting race start to ${race.players.length} players with prompt: "${race.promptText.substring(0, 60)}..."`);
                
                race.players.forEach(racePlayer => {
                  if (racePlayer.socket && racePlayer.socket.readyState === WebSocket.OPEN) {
                    console.log(`📤 Sending race start to ${racePlayer.username}: "${race.promptText.substring(0, 60)}..."`);
                    racePlayer.socket.send(JSON.stringify(raceStartMessage));
                  }
                });
                
                console.log(`✅ Race start broadcast sent to ${race.players.length} players`);
              } else {
                console.log(`❌ Invalid race start attempt for room ${roomId}`);
              }
            }
          }
          
          // Handle race completion and XP distribution
          else if (typeof message === 'object' && (message as any).type === 'private_room_complete') {
            const roomId = (message as any).roomId;
            const playerId = (message as any).playerId;
            const results = (message as any).results;
            
            if (roomId && playerId && results) {
              console.log(`🏁 Player ${playerId} completed race in room ${roomId}:`, results);
              
              try {
                // Update player XP in database
                const user = await storage.getUser(playerId);
                if (user && user.current_faction) {
                  await storage.updateUserXp(playerId, user.current_faction, results.xpGained);
                  console.log(`✅ Awarded ${results.xpGained} XP to player ${playerId} for faction ${user.current_faction}`);
                }
                
                // Mark player as finished in race but keep race active for others
                const race = raceManager.getRace(roomId);
                if (race) {
                  const player = race.players.find(p => p.id === playerId);
                  if (player) {
                    player.progress = 100;
                    player.status = 'finished';
                    
                    // Send completion results to just this player
                    if (player.socket && player.socket.readyState === WebSocket.OPEN) {
                      player.socket.send(JSON.stringify({
                        type: "race_complete",
                        playerId: playerId,
                        results: results,
                        position: results.position
                      }));
                    }
                    
                    // Broadcast updated race state to other players (NOT race complete)
                    race.players.forEach(otherPlayer => {
                      if (otherPlayer.id !== playerId && otherPlayer.socket && otherPlayer.socket.readyState === WebSocket.OPEN) {
                        otherPlayer.socket.send(JSON.stringify({
                          type: "player_finished",
                          playerId: playerId,
                          username: player.username,
                          position: results.position,
                          wpm: results.wpm,
                          accuracy: results.accuracy
                        }));
                      }
                    });
                  }
                }
              } catch (error) {
                console.error(`❌ Failed to process race completion for player ${playerId}:`, error);
              }
            }
          }
          
          // Handle join_lobby for multiplayer - directly use race system
          else if (typeof message === 'object' && (message as any).type === 'join_lobby') {
            const player = (message as any).player;
            const mode = (message as any).mode;
            
            if (player) {
              console.log(`🏁 Player ${player.username} joining lobby for mode: ${mode}`);
              
              // Set player ID on socket for tracking
              customSocket.playerId = player.id;
              
              // Create player data for race system
              const playerData = {
                id: player.id,
                username: player.username,
                level: player.level || 1,
                wpm: player.wpm || 60,
                chickenType: player.chickenType || 'white',
                jockeyType: player.jockeyType || 'steve',
                faction: player.faction || 'none'
              };
              
              // Find or create a race using the race manager
              const raceId = raceManager.findOrCreateRace(mode, playerData.wpm);
              console.log(`📍 Found/created race ${raceId} for player ${player.username}`);
              
              // Add player to the race
              const added = raceManager.addPlayerToRace(playerData, customSocket);
              
              if (added) {
                console.log(`✅ Player ${player.username} successfully added to race ${raceId}`);
                
                // Send confirmation to player
                customSocket.send(JSON.stringify({
                  type: "joined_race",
                  raceId,
                  playerId: player.id
                }));
                
                // Get the race and broadcast player list to all players
                const race = raceManager.getRace(raceId);
                if (race) {
                  const playerList = race.players.map(p => ({
                    id: p.id,
                    username: p.username,
                    level: p.level,
                    wpm: p.wpm,
                    status: p.status,
                    progress: p.progress,
                    chickenType: p.chickenType,
                    jockeyType: p.jockeyType,
                    faction: p.faction,
                    isNPC: p.isNPC || false
                  }));
                  
                  // Broadcast to all players in race
                  let broadcastCount = 0;
                  race.players.forEach(racePlayer => {
                    if (racePlayer.socket && racePlayer.socket.readyState === WebSocket.OPEN) {
                      racePlayer.socket.send(JSON.stringify({
                        type: "player_list",
                        players: playerList,
                        playerCount: race.players.length
                      }));
                      broadcastCount++;
                    }
                  });
                  
                  console.log(`📊 Broadcasted player list to ${broadcastCount} players in race ${raceId} (total players: ${race.players.length})`);
                }
              } else {
                console.error(`❌ Failed to add player ${player.username} to race`);
                customSocket.send(JSON.stringify({
                  type: "error",
                  message: "Failed to join race"
                }));
              }
            }
          }
          // Check for guest player ID in message
          else if (typeof message === 'object' && (message as any).type === 'player_ready' && (message as any).guestId) {
            guestPlayerId = message.guestId;
            customSocket.playerId = guestPlayerId;
            
            // Get player customization if provided - use HTML sprites as default
            const chickenType = message.chickenType || 'html_steve';
            const jockeyType = message.jockeyType || 'html_steve';
            console.log(`Registered guest player ${guestPlayerId} for connection ${connectionId} with chicken: ${chickenType}`);
            const guestName = message.guestName || `Player${Math.floor(Math.random() * 1000)}`;
            
            // Add player to race with their customization
            for (const raceId of raceManager.getAllRaces().map(race => race.id)) {
              raceManager.addPlayerToRace({
                id: guestPlayerId || 'guest_unknown',
                username: guestName,
                level: 1,
                wpm: 0,
                chickenType: chickenType || 'html_steve',
                jockeyType: jockeyType || 'html_steve'
              }, customSocket);
            }
            
            console.log(`Registered guest player ${guestPlayerId} for connection ${connectionId} with chicken: ${chickenType}`);
          }
          
        } else {
          // Handle string commands (like "start_race")
          message = data.toString();
          
          console.log(`Processing string command: ${message}`);
          
          // Special handling for the start_race command
          if (message === 'start_race') {
            console.log(`START NOW button pressed`);
            
            // Create a guaranteed prompt (short and simple)
            const emergencyPrompt = {
              id: 9999,
              text: "Type this sentence to race! Chicken jockeys must type quickly and accurately to win the race."
            };
            
            // Create a new race if no races exist
            let raceCreated = false;
            let raceIds: string[] = [];
            
            // First gather all race IDs to avoid iterator issues
            for (const race of raceManager.getAllRaces()) {
              raceIds.push(race.id);
            }
            
            // No races? Create one!
            if (raceIds.length === 0) {
              const newRaceId = raceManager.createRace('multiplayer');
              raceIds.push(newRaceId);
              raceCreated = true;
              console.log(`Created new race ${newRaceId} since none existed`);
            }
            
            // Try to force start each race
            for (const raceId of raceIds) {
              try {
                console.log(`Attempting to force-start race ${raceId}`);
                
                // Set all players to ready
                raceManager.setPlayersReady(raceId);
                
                // Get the race after setting players ready
                const race = raceManager.getRace(raceId);
                if (!race) continue;
                
                // Force start the race
                if (raceManager.startRace(raceId, emergencyPrompt.id, emergencyPrompt.text)) {
                  console.log(`Successfully force-started race ${raceId}`);
                  
                  // Broadcast to each player
                  race.players.forEach(player => {
                    if (player.socket && player.socket.readyState === WebSocket.OPEN) {
                      player.socket.send(JSON.stringify({
                        type: "race_start",
                        prompt: emergencyPrompt.text
                      }));
                    }
                  });
                } else {
                  console.error(`Failed to start race ${raceId}`);
                }
              } catch (err) {
                console.error(`Error in race ${raceId}:`, err);
              }
            }
            
            return;
          }
          
          // Direct passthrough for other string commands
          await handleRaceEvents(
            customSocket,
            message,
            raceManager,
            promptManager,
            playerManager
          );
          return;
        }
        
        // Main message handler for JSON messages
        if (typeof message === 'object') {
          console.log(`Processing JSON message type: ${message.type}`);
          
          // Simply pass all JSON messages to race events handler
          await handleRaceEvents(
            customSocket,
            message,
            raceManager,
            promptManager,
            playerManager
          );
        } else {
          // For string messages, ping/pong or log unknown types
          if (message === "ping") {
            customSocket.send(JSON.stringify({ type: "pong" }));
          } else {
            console.warn(`Unknown message type: ${message}`);
          }
        }
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });
    
    // Handle disconnection
    customSocket.on("close", () => {
      console.log(`WebSocket connection closed: ${connectionId}`);
      
      // Remove from multiplayer lobby
      multiplayerLobby.cleanupDisconnectedPlayer(connectionId);
      
      // If player was in a race, remove them
      if (customSocket.playerId) {
        raceManager.removePlayerFromRace(customSocket.playerId);
      }
    });
    
    // Handle errors
    customSocket.on("error", (error) => {
      console.error(`WebSocket error for ${connectionId}:`, error);
    });
    
    // Send welcome message
    customSocket.send(JSON.stringify({
      type: "welcome",
      message: "Connected to Chicken Jockey WebSocket server"
    }));
  });
  
  // Set up ping interval to keep connections alive
  const pingInterval = setInterval(() => {
    wss.clients.forEach((socket: WebSocket) => {
      const customSocket = socket as CustomWebSocket;
      if (!customSocket.isAlive) {
        return customSocket.terminate();
      }
      
      customSocket.isAlive = false;
      customSocket.ping();
    });
  }, 30000);
  
  // Clean up interval when server closes
  wss.on("close", () => {
    clearInterval(pingInterval);
  });
}
