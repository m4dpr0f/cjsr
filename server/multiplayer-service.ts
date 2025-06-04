import { db } from "./db";
import { raceSessions, raceParticipants, users } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { artOfWarService } from "./art-of-war-service";

export class MultiplayerService {
  
  // Create a new multiplayer race session
  async createRaceSession(hostUserId: number, roomCode: string) {
    const promptText = await artOfWarService.getRandomPassage();
    
    const [session] = await db.insert(raceSessions).values({
      room_code: roomCode,
      prompt_text: promptText,
      status: 'waiting',
      host_user_id: hostUserId,
      max_players: 8
    }).returning();
    
    // Add host as first participant
    await db.insert(raceParticipants).values({
      session_id: session.id,
      user_id: hostUserId,
      is_ready: false
    });
    
    return session;
  }
  
  // Join an existing race session
  async joinRaceSession(sessionId: number, userId: number) {
    const session = await this.getRaceSession(sessionId);
    if (!session || session.status !== 'waiting') {
      throw new Error('Race session not available');
    }
    
    const existingParticipant = await db.select()
      .from(raceParticipants)
      .where(and(
        eq(raceParticipants.session_id, sessionId),
        eq(raceParticipants.user_id, userId)
      ))
      .limit(1);
      
    if (existingParticipant.length > 0) {
      return existingParticipant[0];
    }
    
    const [participant] = await db.insert(raceParticipants).values({
      session_id: sessionId,
      user_id: userId,
      is_ready: false
    }).returning();
    
    return participant;
  }
  
  // Get race session with participants
  async getRaceSession(sessionId: number) {
    const [session] = await db.select()
      .from(raceSessions)
      .where(eq(raceSessions.id, sessionId))
      .limit(1);
      
    if (!session) return null;
    
    const participants = await db.select({
      id: raceParticipants.id,
      user_id: raceParticipants.user_id,
      username: users.username,
      is_ready: raceParticipants.is_ready,
      progress: raceParticipants.progress,
      wpm: raceParticipants.wpm,
      accuracy: raceParticipants.accuracy,
      position: raceParticipants.position,
      finish_time: raceParticipants.finish_time,
      xp_gained: raceParticipants.xp_gained
    })
    .from(raceParticipants)
    .leftJoin(users, eq(raceParticipants.user_id, users.id))
    .where(eq(raceParticipants.session_id, sessionId));
    
    return {
      ...session,
      participants
    };
  }
  
  // Update player ready status
  async updatePlayerReady(sessionId: number, userId: number, isReady: boolean) {
    await db.update(raceParticipants)
      .set({ is_ready: isReady })
      .where(and(
        eq(raceParticipants.session_id, sessionId),
        eq(raceParticipants.user_id, userId)
      ));
      
    return this.getRaceSession(sessionId);
  }
  
  // Start the race
  async startRace(sessionId: number, hostUserId: number) {
    const session = await this.getRaceSession(sessionId);
    if (!session || session.host_user_id !== hostUserId) {
      throw new Error('Only host can start the race');
    }
    
    // Check if all players are ready
    const unreadyPlayers = session.participants.filter(p => !p.is_ready);
    if (unreadyPlayers.length > 0) {
      throw new Error('Not all players are ready');
    }
    
    // Update session status and start time
    await db.update(raceSessions)
      .set({ 
        status: 'active',
        start_time: new Date(),
        updated_at: new Date()
      })
      .where(eq(raceSessions.id, sessionId));
      
    return this.getRaceSession(sessionId);
  }
  
  // Update player progress during race
  async updatePlayerProgress(sessionId: number, userId: number, progress: number, wpm: number, accuracy: number) {
    await db.update(raceParticipants)
      .set({ 
        progress,
        wpm,
        accuracy
      })
      .where(and(
        eq(raceParticipants.session_id, sessionId),
        eq(raceParticipants.user_id, userId)
      ));
      
    return this.getRaceSession(sessionId);
  }
  
  // Complete race for a player
  async completeRace(sessionId: number, userId: number, wpm: number, accuracy: number, timeMs: number) {
    const session = await this.getRaceSession(sessionId);
    if (!session) throw new Error('Race session not found');
    
    // Calculate position based on existing finishers
    const finishedPlayers = session.participants.filter(p => p.finish_time !== null);
    const position = finishedPlayers.length + 1;
    
    // Calculate XP based on position and performance
    const baseXP = session.prompt_text.length;
    const positionMultipliers = { 1: 1.0, 2: 0.5, 3: 0.33, 4: 0.25 };
    const multiplier = positionMultipliers[Math.min(position, 4) as keyof typeof positionMultipliers] || 0.25;
    const xpGained = Math.max(1, Math.floor(baseXP * multiplier));
    
    // Update participant with finish data
    await db.update(raceParticipants)
      .set({
        position,
        finish_time: new Date(),
        wpm,
        accuracy,
        xp_gained: xpGained,
        progress: session.prompt_text.length // Set to 100% complete
      })
      .where(and(
        eq(raceParticipants.session_id, sessionId),
        eq(raceParticipants.user_id, userId)
      ));
    
    // Update user's XP
    await db.update(users)
      .set({
        xp: db.raw(`xp + ${xpGained}`),
        total_races: db.raw('total_races + 1'),
        races_won: position === 1 ? db.raw('races_won + 1') : db.raw('races_won')
      })
      .where(eq(users.id, userId));
    
    // Check if race is complete
    const updatedSession = await this.getRaceSession(sessionId);
    const allFinished = updatedSession?.participants.every(p => p.finish_time !== null);
    
    if (allFinished) {
      await db.update(raceSessions)
        .set({ status: 'finished', updated_at: new Date() })
        .where(eq(raceSessions.id, sessionId));
    }
    
    return {
      position,
      xpGained,
      session: updatedSession
    };
  }
  
  // Find race session by room code
  async findSessionByRoomCode(roomCode: string) {
    const [session] = await db.select()
      .from(raceSessions)
      .where(eq(raceSessions.room_code, roomCode))
      .limit(1);
      
    return session ? this.getRaceSession(session.id) : null;
  }
  
  // Clean up old sessions
  async cleanupOldSessions() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    await db.delete(raceSessions)
      .where(eq(raceSessions.created_at, oneDayAgo));
  }
}

export const multiplayerService = new MultiplayerService();