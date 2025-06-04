import WebSocket from "ws";

interface LobbyPlayer {
  id: string;
  username: string;
  socket: WebSocket;
  faction: string;
  chickenType: string;
  jockeyType: string;
}

class MultiplayerLobby {
  private lobbies: Map<string, LobbyPlayer[]> = new Map();
  private playerToLobby: Map<string, string> = new Map();

  joinLobby(mode: string, player: LobbyPlayer): void {
    // For multiplayer-only mode, use a shared lobby
    const lobbyId = mode === 'multiplayer-only' ? 'main-lobby' : `lobby-${Date.now()}`;
    
    if (!this.lobbies.has(lobbyId)) {
      this.lobbies.set(lobbyId, []);
    }
    
    const lobby = this.lobbies.get(lobbyId)!;
    
    // Remove player from any existing lobby
    this.leaveLobby(player.id);
    
    // Add player to new lobby
    lobby.push(player);
    this.playerToLobby.set(player.id, lobbyId);
    
    console.log(`Player ${player.username} joined lobby ${lobbyId}. Current players: ${lobby.length}`);
    
    // Broadcast lobby update to all players in this lobby
    this.broadcastLobbyUpdate(lobbyId);
    
    // Auto-start race if we have 2+ players (but only if we just reached the minimum)
    if (lobby.length >= 2 && lobby.length <= 3) {
      console.log(`🏁 Starting race countdown for lobby ${lobbyId} with ${lobby.length} players`);
      setTimeout(() => {
        this.startRace(lobbyId);
      }, 3000); // 3 second delay
    }
  }

  leaveLobby(playerId: string): void {
    const lobbyId = this.playerToLobby.get(playerId);
    if (lobbyId) {
      const lobby = this.lobbies.get(lobbyId);
      if (lobby) {
        const index = lobby.findIndex(p => p.id === playerId);
        if (index !== -1) {
          lobby.splice(index, 1);
          console.log(`Player ${playerId} left lobby ${lobbyId}`);
          
          // Broadcast update
          this.broadcastLobbyUpdate(lobbyId);
          
          // Clean up empty lobbies
          if (lobby.length === 0) {
            this.lobbies.delete(lobbyId);
          }
        }
      }
      this.playerToLobby.delete(playerId);
    }
  }

  private broadcastLobbyUpdate(lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      console.log(`❌ No lobby found for ${lobbyId}`);
      return;
    }

    console.log(`📢 Broadcasting lobby update for ${lobbyId} with ${lobby.length} players`);

    const playerData = lobby.map(p => ({
      id: p.id,
      username: p.username,
      faction: p.faction,
      chickenType: p.chickenType,
      jockeyType: p.jockeyType,
      progress: 0,
      wpm: 0,
      isYou: false // Will be set on client side
    }));

    const message = JSON.stringify({
      type: 'lobby_update',
      players: playerData,
      playerCount: lobby.length
    });

    console.log(`📤 Sending lobby update:`, playerData);

    lobby.forEach(player => {
      if (player.socket && player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(message);
        console.log(`✅ Sent lobby update to ${player.username}`);
      } else {
        console.log(`❌ Failed to send to ${player.username} - socket not ready`);
      }
    });
  }

  private startRace(lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby || lobby.length < 2) return;

    console.log(`🏁 Starting race for lobby ${lobbyId} with ${lobby.length} players`);

    const message = JSON.stringify({
      type: 'race_start'
    });

    lobby.forEach(player => {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(message);
      }
    });
  }

  updatePlayerProgress(playerId: string, progress: number, wpm: number): void {
    const lobbyId = this.playerToLobby.get(playerId);
    if (!lobbyId) return;

    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return;

    const message = JSON.stringify({
      type: 'player_progress',
      playerId,
      progress,
      wpm
    });

    lobby.forEach(player => {
      if (player.socket.readyState === WebSocket.OPEN) {
        player.socket.send(message);
      }
    });
  }

  cleanupDisconnectedPlayer(playerId: string): void {
    this.leaveLobby(playerId);
  }
}

export const multiplayerLobby = new MultiplayerLobby();