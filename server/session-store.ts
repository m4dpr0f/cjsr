import { Store } from "express-session";
import { Pool } from "@neondatabase/serverless";
import { pool } from "./db";

/**
 * PostgreSQL-based session store for Express
 * Stores session data in the database for persistence across restarts
 */
export class PgStore extends Store {
  private db: Pool;
  private tableName = "sessions";

  constructor(db?: Pool) {
    super();
    this.db = db || pool;
    this.initializeTable().catch(err => {
      console.error("Error initializing session table:", err);
    });
  }

  /**
   * Create the sessions table if it doesn't exist
   */
  private async initializeTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        sid VARCHAR(255) PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      )
    `;
    
    try {
      await this.db.query(query);
      console.log("Session table initialized");
    } catch (error) {
      console.error("Error creating session table:", error);
      throw error;
    }
  }

  /**
   * Get session data by ID
   */
  get(sid: string, callback: (err: any, session?: any) => void): void {
    const query = `
      SELECT sess FROM ${this.tableName} 
      WHERE sid = $1 AND expire > NOW()
    `;
    
    this.db.query(query, [sid])
      .then(result => {
        if (result.rows.length === 0) {
          return callback(null);
        }
        
        try {
          const session = result.rows[0].sess;
          return callback(null, session);
        } catch (error) {
          return callback(error);
        }
      })
      .catch(err => {
        return callback(err);
      });
  }

  /**
   * Set session data
   */
  set(sid: string, session: any, callback?: (err?: any) => void): void {
    const maxAge = session.cookie?.maxAge || 86400000; // Default to 1 day
    const expiry = new Date(Date.now() + maxAge);
    
    const query = `
      INSERT INTO ${this.tableName} (sid, sess, expire) 
      VALUES ($1, $2, $3)
      ON CONFLICT (sid) DO UPDATE 
      SET sess = $2, expire = $3
    `;
    
    this.db.query(query, [sid, session, expiry])
      .then(() => {
        if (callback) callback();
      })
      .catch(err => {
        if (callback) callback(err);
      });
  }

  /**
   * Destroy a session
   */
  destroy(sid: string, callback?: (err?: any) => void): void {
    const query = `DELETE FROM ${this.tableName} WHERE sid = $1`;
    
    this.db.query(query, [sid])
      .then(() => {
        if (callback) callback();
      })
      .catch(err => {
        if (callback) callback(err);
      });
  }

  /**
   * Clean up expired sessions
   */
  touch(sid: string, session: any, callback?: (err?: any) => void): void {
    const maxAge = session.cookie?.maxAge || 86400000;
    const expiry = new Date(Date.now() + maxAge);
    
    const query = `
      UPDATE ${this.tableName} 
      SET expire = $1 
      WHERE sid = $2
    `;
    
    this.db.query(query, [expiry, sid])
      .then(() => {
        if (callback) callback();
      })
      .catch(err => {
        if (callback) callback(err);
      });
  }
}