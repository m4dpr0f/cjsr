// WebSocket client for multiplayer racing
// This provides real-time communication between players in the same race

let socket: WebSocket | null = null;
let isConnected = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY = 2000; // 2 seconds

// Event listeners
const eventListeners: {[key: string]: Function[]} = {};

/**
 * Initialize the WebSocket connection
 */
export function initializeWebSocket() {
  if (socket && socket.readyState === WebSocket.CONNECTING) {
    // Already connecting, wait for it to complete
    return;
  }
  
  if (socket && socket.readyState === WebSocket.OPEN) {
    // Already connected
    return;
  }
  
  try {
    // Close any existing connection first
    if (socket) {
      socket.close();
      socket = null;
    }
    
    // Get the correct WebSocket URL based on the current protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log(`🔌 Connecting to WebSocket at ${wsUrl}`);
    socket = new WebSocket(wsUrl);
    
    // Add connection timeout
    const connectionTimeout = setTimeout(() => {
      if (socket && socket.readyState === WebSocket.CONNECTING) {
        console.error('❌ WebSocket connection timeout');
        socket.close();
        attemptReconnect();
      }
    }, 10000); // 10 second timeout
    
    // Setup event handlers
    socket.onopen = (event) => {
      clearTimeout(connectionTimeout);
      handleOpen(event);
    };
    socket.onmessage = handleMessage;
    socket.onclose = handleClose;
    socket.onerror = (event) => {
      clearTimeout(connectionTimeout);
      handleError(event);
    };
  } catch (error) {
    console.error('❌ Error initializing WebSocket:', error);
    attemptReconnect();
  }
}

/**
 * Connect to the WebSocket server
 */
export function connect() {
  initializeWebSocket();
}

/**
 * Disconnect from the WebSocket server
 */
export function disconnect() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close();
  }
  socket = null;
  isConnected = false;
}

/**
 * Handle successful WebSocket connection
 */
function handleOpen(event: Event) {
  console.log('WebSocket connection established');
  isConnected = true;
  reconnectAttempts = 0;
  
  // Trigger any open event listeners
  triggerEvent('open', event);
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(event: MessageEvent) {
  try {
    const data = JSON.parse(event.data);
    // console.log('WebSocket message received:', data);
    
    // Trigger event listeners for this message type
    if (data.type) {
      triggerEvent(data.type, data);
    }
    
    // Always trigger the generic 'message' event
    triggerEvent('message', data);
  } catch (error) {
    console.error('Error parsing WebSocket message:', error, event.data);
  }
}

/**
 * Handle WebSocket connection close
 */
function handleClose(event: CloseEvent) {
  console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
  isConnected = false;
  socket = null;
  
  // Attempt to reconnect if it wasn't a normal closure
  if (event.code !== 1000 && event.code !== 1001) {
    attemptReconnect();
  }
  
  // Trigger close event listeners
  triggerEvent('close', event);
}

/**
 * Handle WebSocket errors
 */
function handleError(event: Event) {
  console.error('WebSocket error:', event);
  
  // Trigger error event listeners
  triggerEvent('error', event);
}

/**
 * Attempt to reconnect to the WebSocket server
 */
function attemptReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.log('Maximum reconnection attempts reached');
    return;
  }
  
  reconnectAttempts++;
  console.log(`Attempting to reconnect (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
  
  setTimeout(() => {
    initializeWebSocket();
  }, RECONNECT_DELAY);
}

/**
 * Send a message to the WebSocket server
 */
export function sendMessage(type: string, data: any = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('Cannot send message: WebSocket is not connected');
    return false;
  }
  
  try {
    // Combine type with data
    const message = JSON.stringify({
      type,
      ...data
    });
    
    socket.send(message);
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
}

/**
 * Register an event listener
 */
export function on(event: string, callback: Function) {
  if (!eventListeners[event]) {
    eventListeners[event] = [];
  }
  
  eventListeners[event].push(callback);
}

/**
 * Remove an event listener
 */
export function off(event: string, callback: Function) {
  if (!eventListeners[event]) {
    return;
  }
  
  eventListeners[event] = eventListeners[event].filter(cb => cb !== callback);
}

/**
 * Trigger event listeners for a specific event
 */
function triggerEvent(event: string, data: any) {
  if (!eventListeners[event]) {
    return;
  }
  
  for (const callback of eventListeners[event]) {
    try {
      callback(data);
    } catch (error) {
      console.error(`Error in WebSocket event listener for "${event}":`, error);
    }
  }
}

/**
 * Join a multiplayer lobby
 */
export function joinLobby(lobbyId: string) {
  return sendMessage('join_lobby', { lobbyId });
}

/**
 * Join a multiplayer race
 */
export function joinRace(playerInfo: {
  guestId: string,
  guestName: string,
  chickenType: string,
  jockeyType: string
}) {
  return sendMessage('player_ready', playerInfo);
}

/**
 * Update player progress in a race
 */
export function updateProgress(progress: number, wpm: number, accuracy: number) {
  return sendMessage('player_progress', { progress, wpm, accuracy });
}

/**
 * Send player finished race event
 */
export function playerFinished(wpm: number, accuracy: number, time: number) {
  return sendMessage('player_finished', { wpm, accuracy, time });
}

/**
 * Get active players count (simulated)
 */
export function getActivePlayers(): number {
  // Return a random number between 5 and 30 for demo purposes
  // In a real app, this would come from the server
  return Math.floor(Math.random() * 25) + 5;
}

/**
 * Close the WebSocket connection
 */
export function closeConnection() {
  if (socket) {
    socket.close(1000, 'Normal closure');
    socket = null;
    isConnected = false;
  }
}

/**
 * Get WebSocket connection status
 */
export function getConnectionStatus() {
  return {
    isConnected,
    readyState: socket ? socket.readyState : -1
  };
}