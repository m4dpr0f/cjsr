import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface MatrixPlayer {
  username: string;
  faction: string;
  isReady: boolean;
  chickenName?: string;
  chickenType?: string;
  jockeyType?: string;
}

interface MatrixSocketState {
  isConnected: boolean;
  isAuthenticated: boolean;
  players: MatrixPlayer[];
  readyCount: number;
  canStart: boolean;
  raceActive: boolean;
  racePrompt: string;
  playerProgress: Record<string, { progress: number; wpm: number; accuracy: number }>;
  raceResults: any[];
}

interface MatrixSocketOptions {
  userId?: number;
  username?: string;
}

export function useMatrixSocketIO({ userId, username }: MatrixSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<MatrixSocketState>({
    isConnected: false,
    isAuthenticated: false,
    players: [],
    readyCount: 0,
    canStart: false,
    raceActive: false,
    racePrompt: '',
    playerProgress: {},
    raceResults: []
  });

  useEffect(() => {
    if (!userId || !username) return;

    // Connect to Matrix Socket.IO server
    const socket = io({
      path: '/matrix-socket'
    });
    
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔌 Connected to Matrix Socket.IO');
      setState(prev => ({ ...prev, isConnected: true }));
      
      // Authenticate immediately
      socket.emit('authenticate', { userId, username });
    });

    socket.on('authenticated', (data) => {
      console.log('✅ Matrix authenticated:', data.player.username);
      setState(prev => ({ ...prev, isAuthenticated: true }));
    });

    socket.on('auth_error', (error) => {
      console.error('❌ Matrix auth error:', error.message);
    });

    socket.on('player_list_update', (data) => {
      setState(prev => ({
        ...prev,
        players: data.players,
        readyCount: data.readyCount,
        canStart: data.canStart
      }));
    });

    socket.on('race_started', (data) => {
      console.log('🏁 Matrix race started!');
      setState(prev => ({
        ...prev,
        raceActive: true,
        racePrompt: data.prompt,
        playerProgress: {},
        raceResults: []
      }));
    });

    socket.on('player_progress', (data) => {
      setState(prev => ({
        ...prev,
        playerProgress: {
          ...prev.playerProgress,
          [data.username]: {
            progress: data.progress,
            wpm: data.wpm,
            accuracy: data.accuracy
          }
        }
      }));
    });

    socket.on('player_finished', (data) => {
      console.log(`🏆 ${data.username} finished: ${data.finalWpm} WPM`);
    });

    socket.on('race_complete', (data) => {
      console.log('🏁 Matrix race completed!', data.results);
      console.log('Race results structure:', JSON.stringify(data.results, null, 2));
      setState(prev => ({
        ...prev,
        raceActive: false,
        raceResults: data.results || [],
        playerProgress: {} // Clear all player progress when race ends
      }));
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Matrix Socket.IO');
      setState(prev => ({ ...prev, isConnected: false, isAuthenticated: false }));
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, username]);

  const toggleReady = () => {
    socketRef.current?.emit('ready_toggle');
  };

  const startRace = () => {
    if (state.canStart) {
      socketRef.current?.emit('start_race');
    }
  };

  const sendProgress = (progress: number, wpm: number, accuracy: number) => {
    socketRef.current?.emit('race_progress', { progress, wpm, accuracy });
  };

  const completeRace = (finalWpm: number, finalAccuracy: number) => {
    socketRef.current?.emit('race_complete', { finalWpm, finalAccuracy });
  };

  return {
    ...state,
    toggleReady,
    startRace,
    sendProgress,
    completeRace
  };
}