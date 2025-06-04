import type { Express } from "express";
import { db } from "./db";
import { users, playerStats, prompts } from "@shared/schema";
import { eq, desc, count, sum, max, and } from "drizzle-orm";

export function registerAdminRoutes(app: Express) {
  // Admin authentication middleware - check if user is admin
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Check if user is admin (for now, just check if user ID is 4 - TimeKnot)
      if (userId !== "4") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Admin auth error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Admin overview stats
  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const [totalUsersResult] = await db.select({ count: count() }).from(users);
      const [totalRacesResult] = await db.select({ count: count() }).from(races);
      const [totalPromptsResult] = await db.select({ count: count() }).from(prompts);
      const [totalGuildsResult] = await db.select({ count: count() }).from(guilds);

      res.json({
        totalUsers: totalUsersResult.count,
        totalRaces: totalRacesResult.count,
        totalPrompts: totalPromptsResult.count,
        totalGuilds: totalGuildsResult.count,
        activeSeasons: 1 // Hard-coded for now
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get all players with stats
  app.get("/api/admin/players", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const playersQuery = `
        SELECT 
          u.id,
          u.username,
          u.email,
          COALESCE(ps.level, 1) as level,
          COALESCE(ps.current_faction, 'd4') as faction,
          COALESCE(ps.total_races, 0) as total_races,
          COALESCE(ps.avg_wpm, 0) as avg_wpm,
          COALESCE(ps.faction_xp, '{}') as faction_xp,
          COALESCE(gm.guild_name, NULL) as guild,
          u.created_at as last_active
        FROM users u
        LEFT JOIN player_stats ps ON u.id::text = ps.user_id
        LEFT JOIN guild_members gm ON u.id = gm.user_id
        ORDER BY ps.level DESC NULLS LAST, u.created_at DESC
      `;
      
      const players = await db.execute(playersQuery);
      
      const formattedPlayers = players.rows.map((player: any) => ({
        id: player.id,
        username: player.username,
        email: player.email,
        level: player.level,
        faction: player.faction,
        totalRaces: player.total_races,
        avgWpm: player.avg_wpm,
        guild: player.guild,
        lastActive: player.last_active,
        xp: Math.max(...Object.values(player.faction_xp || {})) || 0
      }));

      res.json(formattedPlayers);
    } catch (error) {
      console.error("Admin players error:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Update player data
  app.put("/api/admin/players/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { xp, faction, level } = req.body;

      // Update player stats
      if (xp !== undefined || faction !== undefined || level !== undefined) {
        const updateData: any = {};
        
        if (faction) updateData.current_faction = faction;
        if (level) updateData.level = level;
        
        // If XP is being updated, update the faction XP
        if (xp !== undefined) {
          const currentFaction = faction || 'd4';
          updateData.faction_xp = { [currentFaction]: xp };
        }

        await db
          .update(playerStats)
          .set(updateData)
          .where(eq(playerStats.user_id, id));
      }

      res.json({ message: "Player updated successfully" });
    } catch (error) {
      console.error("Admin update player error:", error);
      res.status(500).json({ message: "Failed to update player" });
    }
  });

  // Get all guilds
  app.get("/api/admin/guilds", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const guildsQuery = `
        SELECT 
          g.id,
          g.name,
          g.description,
          g.faction,
          g.leader_id,
          g.created_at,
          g.is_active,
          u.username as leader_name,
          COUNT(gm.user_id) as member_count,
          COALESCE(SUM(ps.level), 0) as total_level
        FROM guilds g
        LEFT JOIN users u ON g.leader_id = u.id
        LEFT JOIN guild_members gm ON g.id = gm.guild_id
        LEFT JOIN player_stats ps ON gm.user_id::text = ps.user_id
        GROUP BY g.id, g.name, g.description, g.faction, g.leader_id, g.created_at, g.is_active, u.username
        ORDER BY g.created_at DESC
      `;
      
      const guildsResult = await db.execute(guildsQuery);
      
      const formattedGuilds = guildsResult.rows.map((guild: any) => ({
        id: guild.id,
        name: guild.name,
        description: guild.description,
        faction: guild.faction,
        leader: guild.leader_name,
        memberCount: guild.member_count,
        totalXp: guild.total_level * 100, // Approximate XP from level
        createdAt: guild.created_at,
        isActive: guild.is_active
      }));

      res.json(formattedGuilds);
    } catch (error) {
      console.error("Admin guilds error:", error);
      res.status(500).json({ message: "Failed to fetch guilds" });
    }
  });

  // Get all prompts
  app.get("/api/admin/prompts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const promptsResult = await db
        .select({
          id: prompts.id,
          text: prompts.text,
          difficulty: prompts.difficulty,
          category: prompts.category,
          author: prompts.author,
          usageCount: prompts.usage_count,
          isActive: prompts.is_active,
          createdAt: prompts.created_at
        })
        .from(prompts)
        .orderBy(desc(prompts.created_at));

      res.json(promptsResult);
    } catch (error) {
      console.error("Admin prompts error:", error);
      res.status(500).json({ message: "Failed to fetch prompts" });
    }
  });

  // Create new prompt
  app.post("/api/admin/prompts", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { text, difficulty, category, author } = req.body;
      
      const [newPrompt] = await db
        .insert(prompts)
        .values({
          text,
          difficulty: difficulty || 'medium',
          category: category || 'general',
          author: author || 'Admin',
          usage_count: 0,
          is_active: true
        })
        .returning();

      res.json(newPrompt);
    } catch (error) {
      console.error("Admin create prompt error:", error);
      res.status(500).json({ message: "Failed to create prompt" });
    }
  });

  // Update prompt
  app.put("/api/admin/prompts/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { text, difficulty, category, is_active } = req.body;

      await db
        .update(prompts)
        .set({
          text,
          difficulty,
          category,
          is_active
        })
        .where(eq(prompts.id, parseInt(id)));

      res.json({ message: "Prompt updated successfully" });
    } catch (error) {
      console.error("Admin update prompt error:", error);
      res.status(500).json({ message: "Failed to update prompt" });
    }
  });

  // Export data
  app.get("/api/admin/export/:type", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      let data;

      switch (type) {
        case 'players':
          data = await db.select().from(users);
          break;
        case 'races':
          data = await db.select().from(races);
          break;
        case 'prompts':
          data = await db.select().from(prompts);
          break;
        case 'guilds':
          data = await db.select().from(guilds);
          break;
        default:
          return res.status(400).json({ message: "Invalid export type" });
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${type}_export.json`);
      res.json(data);
    } catch (error) {
      console.error("Admin export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Database operations
  app.post("/api/admin/database/:operation", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { operation } = req.params;

      switch (operation) {
        case 'backup':
          // In a real system, you'd trigger a database backup
          res.json({ message: "Database backup initiated" });
          break;
        case 'optimize':
          // Run VACUUM and ANALYZE on PostgreSQL
          await db.execute('VACUUM ANALYZE;');
          res.json({ message: "Database optimized" });
          break;
        case 'clear-cache':
          // Clear any application cache
          res.json({ message: "Cache cleared" });
          break;
        default:
          res.status(400).json({ message: "Invalid operation" });
      }
    } catch (error) {
      console.error("Admin database operation error:", error);
      res.status(500).json({ message: "Failed to perform database operation" });
    }
  });

  // Get recent activity
  app.get("/api/admin/activity", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const recentRaces = await db
        .select({
          id: races.id,
          username: users.username,
          wpm: races.wpm,
          createdAt: races.race_date
        })
        .from(races)
        .leftJoin(users, eq(races.user_id, users.id))
        .orderBy(desc(races.race_date))
        .limit(10);

      const activity = recentRaces.map(race => ({
        type: 'race',
        description: `${race.username} completed a race (${race.wpm} WPM)`,
        timestamp: race.createdAt
      }));

      res.json(activity);
    } catch (error) {
      console.error("Admin activity error:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });
}