const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class CJSRStandaloneServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = socketIo(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.port = 3000;
    this.dbPath = path.join(__dirname, 'cjsr-local.db');
    this.federationEnabled = false;
    this.federationUrl = null;
    
    this.initializeDatabase();
    this.setupRoutes();
    this.setupSocketHandlers();
  }

  initializeDatabase() {
    this.db = new sqlite3.Database(this.dbPath);
    
    // Create essential tables for offline play
    this.db.serialize(() => {
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        xp INTEGER DEFAULT 0,
        qlx_coins INTEGER DEFAULT 0,
        races_won INTEGER DEFAULT 0,
        total_races INTEGER DEFAULT 0,
        avg_wpm INTEGER DEFAULT 0,
        accuracy INTEGER DEFAULT 100,
        current_faction TEXT DEFAULT 'd4',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS race_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        wpm INTEGER,
        accuracy INTEGER,
        position INTEGER,
        prompt_text TEXT,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      this.db.run(`CREATE TABLE IF NOT EXISTS federation_sync (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_user_id INTEGER,
        federation_user_id TEXT,
        last_sync DATETIME DEFAULT CURRENT_TIMESTAMP,
        sync_data TEXT,
        FOREIGN KEY (local_user_id) REFERENCES users (id)
      )`);
    });
  }

  setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../dist')));

    // Local user management
    this.app.post('/api/local/register', (req, res) => {
      const { username } = req.body;
      
      this.db.run(
        'INSERT INTO users (username) VALUES (?)',
        [username],
        function(err) {
          if (err) {
            return res.status(400).json({ error: 'Username already exists' });
          }
          res.json({ success: true, userId: this.lastID });
        }
      );
    });

    this.app.get('/api/local/profile/:userId', (req, res) => {
      const { userId } = req.params;
      
      this.db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (err, user) => {
          if (err || !user) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.json(user);
        }
      );
    });

    // Federation endpoints
    this.app.post('/api/federation/connect', async (req, res) => {
      const { federationUrl, authToken } = req.body;
      
      try {
        // Test connection to federation server
        const response = await fetch(`${federationUrl}/api/federation/ping`, {
          headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        });
        
        if (response.ok) {
          this.federationEnabled = true;
          this.federationUrl = federationUrl;
          res.json({ success: true, connected: true });
        } else {
          res.status(400).json({ error: 'Failed to connect to federation' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Federation connection failed' });
      }
    });

    this.app.get('/api/federation/status', (req, res) => {
      res.json({
        enabled: this.federationEnabled,
        url: this.federationUrl,
        connected: this.federationEnabled && this.federationUrl
      });
    });

    // Race completion endpoint
    this.app.post('/api/local/race-complete', (req, res) => {
      const { userId, wpm, accuracy, position, promptText } = req.body;
      
      // Record race locally
      this.db.run(
        'INSERT INTO race_history (user_id, wpm, accuracy, position, prompt_text) VALUES (?, ?, ?, ?, ?)',
        [userId, wpm, accuracy, position, promptText],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to record race' });
          }
          
          // Update user stats
          const xpGained = position === 1 ? 50 : 25;
          const qlxGained = position === 1 ? 10 : 5;
          
          this.db.run(
            'UPDATE users SET xp = xp + ?, qlx_coins = qlx_coins + ?, total_races = total_races + 1, races_won = races_won + ? WHERE id = ?',
            [xpGained, qlxGained, position === 1 ? 1 : 0, userId]
          );
          
          res.json({ success: true, xpGained, qlxGained });
        }
      );
    });

    // Serve the main app
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('Client connected to local CJSR server');

      socket.on('join-local-race', (data) => {
        socket.join('local-race-room');
        socket.emit('race-joined', { roomId: 'local-race-room' });
      });

      socket.on('race-progress', (data) => {
        socket.to('local-race-room').emit('player-progress', data);
      });

      socket.on('race-finished', (data) => {
        socket.to('local-race-room').emit('race-completed', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected from local CJSR server');
      });
    });
  }

  async syncWithFederation(userId) {
    if (!this.federationEnabled || !this.federationUrl) return;

    try {
      // Get local user data
      const user = await new Promise((resolve, reject) => {
        this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (user) {
        // Send data to federation
        await fetch(`${this.federationUrl}/api/federation/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: user.username,
            xp: user.xp,
            qlx_coins: user.qlx_coins,
            races_won: user.races_won,
            total_races: user.total_races
          })
        });
      }
    } catch (error) {
      console.error('Federation sync failed:', error);
    }
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`CJSR Local Server running on http://localhost:${this.port}`);
      console.log('Federation capability: Ready');
    });
  }

  stop() {
    this.server.close();
    this.db.close();
  }
}

module.exports = CJSRStandaloneServer;

// Start server if run directly
if (require.main === module) {
  const server = new CJSRStandaloneServer();
  server.start();
}