import type { Express } from "express";
import { db } from "./db";
import { users, playerStats } from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";

export function registerAdminRoutes(app: Express) {
  // Simple admin check - only TimeKnot can access
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const username = req.user.username;
      if (username !== 'TimeKnot') {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };

  // Get admin stats
  app.get("/api/admin/stats", isAdmin, async (req, res) => {
    try {
      const [totalUsersResult] = await db.select({ count: count() }).from(users);
      
      res.json({
        totalUsers: totalUsersResult.count,
        totalRaces: 500, // Placeholder
        totalPrompts: 50, // Placeholder
        totalGuilds: 5, // Placeholder
        activeSeasons: 1
      });
    } catch (error) {
      console.error("Admin stats error:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  // Get all players
  app.get("/api/admin/players", isAdmin, async (req, res) => {
    try {
      // Get users with their stats
      const usersResult = await db.select().from(users).orderBy(desc(users.created_at));
      
      const players = [];
      for (const user of usersResult) {
        try {
          const [stats] = await db.select().from(playerStats).where(eq(playerStats.user_id, user.id));
          
          const maxXp = stats?.faction_xp ? Math.max(...Object.values(stats.faction_xp as any)) : 0;
          
          players.push({
            id: user.id,
            username: user.username,
            email: user.email,
            level: 1, // Calculate from XP later
            faction: stats?.current_faction || 'd4',
            totalRaces: stats?.races_completed || 0,
            avgWpm: stats?.top_wpm || 0,
            xp: maxXp,
            lastActive: user.created_at
          });
        } catch (err) {
          // Skip users without stats
          players.push({
            id: user.id,
            username: user.username,
            email: user.email,
            level: 1,
            faction: 'd4',
            totalRaces: 0,
            avgWpm: 0,
            xp: 0,
            lastActive: user.created_at
          });
        }
      }

      res.json(players);
    } catch (error) {
      console.error("Admin players error:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Update player XP
  app.put("/api/admin/players/:id/xp", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { xp, faction } = req.body;

      // Update faction XP
      const factionXpUpdate = { [faction || 'd4']: xp };
      
      await db
        .update(playerStats)
        .set({ 
          faction_xp: factionXpUpdate,
          current_faction: faction || 'd4'
        })
        .where(eq(playerStats.user_id, parseInt(id)));

      res.json({ message: "Player XP updated successfully" });
    } catch (error) {
      console.error("Admin update XP error:", error);
      res.status(500).json({ message: "Failed to update player XP" });
    }
  });

  // Export player data
  app.get("/api/admin/export/players", isAdmin, async (req, res) => {
    try {
      const usersResult = await db.select().from(users);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=players_export.json');
      res.json(usersResult);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Quick XP boost for testing
  app.post("/api/admin/boost-xp/:id", isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, faction } = req.body;

      // Get current stats
      const [currentStats] = await db.select().from(playerStats).where(eq(playerStats.user_id, parseInt(id)));
      
      const currentXp = currentStats?.faction_xp || {};
      const targetFaction = faction || 'd4';
      const newXp = (currentXp[targetFaction] || 0) + amount;
      
      const updatedFactionXp = { ...currentXp, [targetFaction]: newXp };
      
      await db
        .update(playerStats)
        .set({ 
          faction_xp: updatedFactionXp,
          current_faction: targetFaction
        })
        .where(eq(playerStats.user_id, parseInt(id)));

      res.json({ message: `Added ${amount} XP to ${targetFaction} faction` });
    } catch (error) {
      console.error("XP boost error:", error);
      res.status(500).json({ message: "Failed to boost XP" });
    }
  });
}