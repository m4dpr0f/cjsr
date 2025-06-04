import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface MatrixSocketOptions {
  userId?: number;
  username?: string;
  roomId: string;
  onRaceComplete?: () => void;
}

export function useMatrixSocket({ userId, username, roomId, onRaceComplete }: MatrixSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [connectedPlayers, setConnectedPlayers] = useState<any[]>([]);
  const [canStartRace, setCanStartRace] = useState(false);
  const [raceActive, setRaceActive] = useState(false);
  
  const socketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !username) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${protocol}//${window.location.host}/ws`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      console.log('🔌 Connected to Matrix WebSocket');
      
      // Authenticate with user data using existing WebSocket message format
      socket.send(JSON.stringify({
        type: 'matrix_auth',
        data: { userId, username }
      }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleSocketMessage(message);
      } catch (error) {
        console.error('Socket message error:', error);
      }
    };

    socket.onerror = (error) => {
      console.error('Matrix socket error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to Matrix race server",
        variant: "destructive"
      });
    };

    socket.onclose = () => {
      setIsConnected(false);
      setIsAuthenticated(false);
      console.log('🔌 Matrix socket disconnected');
    };

    return () => {
      socket.close();
    };
  }, [userId, username]);

  const handleSocketMessage = (message: any) => {
    const { event, data } = message;

    switch (event) {
      case 'authenticated':
        setIsAuthenticated(true);
        console.log(`✅ Authenticated as ${data.username}`);
        
        // Join room
        socketRef.current?.send(JSON.stringify({
          event: 'join',
          data: { room: roomId }
        }));
        break;

      case 'room:update':
        setConnectedPlayers(data.players || []);
        break;

      case 'matrix:ready_update':
        setReadyPlayers(data.readyPlayers?.map((p: any) => p.username) || []);
        setCanStartRace((data.readyPlayers?.length || 0) >= 2);
        break;

      case 'matrix:race_started':
        setRaceActive(true);
        toast({
          title: "🏁 Race Started!",
          description: `Matrix race began - type fast!`,
        });
        break;

      case 'matrix:player_progress':
        // Update other players' progress
        setConnectedPlayers(prev => 
          prev.map(p => 
            p.username === data.username 
              ? { ...p, progress: data.progress, wpm: data.wpm, accuracy: data.accuracy }
              : p
          )
        );
        break;

      case 'matrix:race_complete':
        setRaceActive(false);
        toast({
          title: "🏆 Race Complete!",
          description: `${data.username} finished with ${data.wpm} WPM!`,
        });
        // Trigger text clearing callback if provided
        if (onRaceComplete) {
          onRaceComplete();
        }
        break;

      case 'matrix:race_ended':
      case 'race_ended':
      case 'clear_text':
        setRaceActive(false);
        toast({
          title: "🏁 Race Ended",
          description: "Race completed - calculating final results",
        });
        // Clear text for all players when race ends
        if (onRaceComplete) {
          onRaceComplete();
        }
        break;

      case 'auth_error':
        toast({
          title: "Authentication Failed",
          description: data.message || "Unable to authenticate",
          variant: "destructive"
        });
        break;
    }
  };

  const toggleReady = (isReady: boolean) => {
    if (!isAuthenticated) return;
    
    socketRef.current?.send(JSON.stringify({
      event: 'matrix:ready',
      data: { roomId, isReady }
    }));
  };

  const startRace = () => {
    if (!isAuthenticated) return;
    
    socketRef.current?.send(JSON.stringify({
      event: 'matrix:start',
      data: { roomId }
    }));
  };

  const sendProgress = (progress: number, wpm: number, accuracy: number) => {
    if (!isAuthenticated || !raceActive) return;
    
    socketRef.current?.send(JSON.stringify({
      event: 'matrix:progress',
      data: { roomId, progress, wpm, accuracy }
    }));
  };

  const completeRace = (wpm: number, accuracy: number) => {
    if (!isAuthenticated) return;
    
    socketRef.current?.send(JSON.stringify({
      event: 'matrix:complete',
      data: { roomId, wpm, accuracy }
    }));
  };

  return {
    isConnected,
    isAuthenticated,
    readyPlayers,
    connectedPlayers,
    canStartRace,
    raceActive,
    toggleReady,
    startRace,
    sendProgress,
    completeRace
  };
}