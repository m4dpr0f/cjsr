import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface QuickRacePlayer {
  id: string;
  username: string;
  progress: number;
  wpm: number;
  accuracy: number;
  isFinished: boolean;
  finishTime?: number;
  isNPC?: boolean;
  faction?: string;
}

interface QuickRaceState {
  isConnected: boolean;
  players: QuickRacePlayer[];
  raceText: string;
  raceActive: boolean;
  countdownStarted: boolean;
  countdown: number;
  raceFinished: boolean;
  raceResults: any[];
  playerFinished: boolean;
}

export function useQuickRaceSocketIO() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [state, setState] = useState<QuickRaceState>({
    isConnected: false,
    players: [],
    raceText: '',
    raceActive: false,
    countdownStarted: false,
    countdown: 0,
    raceFinished: false,
    raceResults: [],
    playerFinished: false,
  });

  useEffect(() => {
    // Create socket connection to Quick Race namespace
    const newSocket = io('/quick-race-socket', {
      autoConnect: true,
    });

    // Connection events
    newSocket.on('connect', () => {
      setState(prev => ({ ...prev, isConnected: true }));
    });

    newSocket.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // Quick Race specific events
    newSocket.on('race-state', (data) => {
      setState(prev => ({
        ...prev,
        players: data.players || [],
        raceText: data.raceText || '',
        raceActive: data.raceActive || false,
        raceFinished: data.raceFinished || false,
      }));
    });

    newSocket.on('countdown-started', (data) => {
      setState(prev => ({
        ...prev,
        countdownStarted: true,
        countdown: data.countdown,
      }));
    });

    newSocket.on('countdown-update', (data) => {
      setState(prev => ({
        ...prev,
        countdown: data.countdown,
      }));
    });

    newSocket.on('race-started', (data) => {
      setState(prev => ({
        ...prev,
        raceActive: true,
        countdownStarted: false,
        countdown: 0,
        raceText: data.raceText,
        playerFinished: false,
      }));
    });

    newSocket.on('player-progress', (data) => {
      setState(prev => ({
        ...prev,
        players: prev.players.map(player =>
          player.id === data.playerId
            ? { ...player, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy }
            : player
        ),
      }));
    });

    newSocket.on('player-finished', (data) => {
      setState(prev => ({
        ...prev,
        players: prev.players.map(player =>
          player.id === data.playerId
            ? { ...player, isFinished: true, finishTime: data.finishTime }
            : player
        ),
      }));
    });

    newSocket.on('race-completed', (data) => {
      setState(prev => ({
        ...prev,
        raceFinished: true,
        raceResults: data.results || [],
      }));
    });

    newSocket.on('error', (error) => {
      console.error('Quick Race Socket Error:', error);
    });

    setSocket(newSocket);

    // Auto-join race when connected
    newSocket.emit('join-quick-race');

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const sendProgress = (progress: number, wpm: number, accuracy: number) => {
    if (socket && state.raceActive) {
      socket.emit('player-progress', { progress, wpm, accuracy });
    }
  };

  const finishRace = (finalWpm: number, finalAccuracy: number, finishTime: number) => {
    if (socket && state.raceActive && !state.playerFinished) {
      socket.emit('finish-race', { finalWpm, finalAccuracy, finishTime });
      setState(prev => ({ ...prev, playerFinished: true }));
    }
  };

  const startCountdown = () => {
    if (socket && !state.countdownStarted && !state.raceActive) {
      socket.emit('start-countdown');
    }
  };

  return {
    ...state,
    sendProgress,
    finishRace,
    startCountdown,
  };
}