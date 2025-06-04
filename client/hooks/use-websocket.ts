import { useState, useEffect, useRef, useCallback } from "react";

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export function useWebSocket() {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  
  // Connect to WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
      setConnected(true);
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setConnected(false);
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, []);
  
  // Send message function - supports both string commands and JSON messages
  const sendMessage = useCallback((messageOrType: string | object, payload: object = {}) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // Handle different message formats
      if (typeof messageOrType === 'string') {
        // If the message is already JSON string, send as is
        if (messageOrType.startsWith('{') && messageOrType.endsWith('}')) {
          socketRef.current.send(messageOrType);
          return true;
        }
        
        // If it's a simple string command (like "start_race"), send directly
        if (!messageOrType.includes('{') && !messageOrType.includes('"')) {
          socketRef.current.send(messageOrType);
          return true;
        }
        
        // Otherwise treat as message type
        const message = JSON.stringify({
          type: messageOrType,
          ...payload,
        });
        socketRef.current.send(message);
        return true;
      } else {
        // For object messages, stringify and send
        socketRef.current.send(JSON.stringify(messageOrType));
        return true;
      }
    }
    return false;
  }, []);
  
  return {
    socket: socketRef.current,
    connected,
    sendMessage,
    lastMessage,
  };
}
