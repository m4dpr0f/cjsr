/**
 * Enhanced WPM calculation library for CJSR
 * Provides accurate real-time WPM tracking that responds to typing pauses
 */

// Store a window of recent typing activity (timestamps of keystrokes)
interface TypingWindow {
  recentKeystrokes: number[]; // Timestamps of recent keystrokes
  windowSize: number;         // Size of the sliding window in milliseconds
}

// Create a typing activity window
export const createTypingWindow = (windowSizeMs: number = 3000): TypingWindow => ({
  recentKeystrokes: [],
  windowSize: windowSizeMs
});

/**
 * Record a keystroke in the typing window
 * @param typingWindow The typing window to update
 * @returns Updated typing window
 */
export const recordKeystroke = (typingWindow: TypingWindow): TypingWindow => {
  const now = Date.now();
  const updatedKeystrokes = [...typingWindow.recentKeystrokes, now];
  
  // Remove keystrokes that are outside the window
  const cutoffTime = now - typingWindow.windowSize;
  const filteredKeystrokes = updatedKeystrokes.filter(timestamp => timestamp >= cutoffTime);
  
  return {
    ...typingWindow,
    recentKeystrokes: filteredKeystrokes
  };
};

/**
 * Calculate current WPM based on recent typing activity
 * @param typingWindow Current typing window with keystroke history
 * @param totalChars Total characters typed so far
 * @param elapsedTimeMs Total elapsed time in milliseconds since typing began
 * @returns Current WPM value
 */
export const calculateCurrentWpm = (
  typingWindow: TypingWindow,
  totalChars: number,
  elapsedTimeMs: number
): number => {
  const now = Date.now();
  
  // If no keystrokes in the recent window, WPM is declining
  if (typingWindow.recentKeystrokes.length === 0) {
    // If typing has stopped, show declining WPM based on total time
    if (totalChars > 0 && elapsedTimeMs > 0) {
      const minutes = elapsedTimeMs / 60000;
      const words = totalChars / 5;
      return Math.max(1, Math.round(words / minutes));
    }
    return 0;
  }
  
  // Calculate WPM based on recent activity
  const oldestKeystroke = Math.min(...typingWindow.recentKeystrokes);
  const recentTimeMs = now - oldestKeystroke;
  
  // If recent window is too small, use a minimum time
  const timeToUse = Math.max(500, recentTimeMs);
  const recentKeystrokeCount = typingWindow.recentKeystrokes.length;
  
  // Calculate WPM: (keystrokes / 5) / minutes
  const minutes = timeToUse / 60000;
  const words = recentKeystrokeCount / 5;
  
  // Calculate instant WPM based on recent keystrokes
  const instantWpm = Math.round(words / minutes);
  
  // If we have enough data, return the instant WPM
  if (recentKeystrokeCount >= 5 && timeToUse >= 1000) {
    return Math.min(250, Math.max(1, instantWpm));
  }
  
  // Otherwise, calculate based on total characters
  const totalMinutes = elapsedTimeMs / 60000;
  const totalWords = totalChars / 5;
  const overallWpm = Math.round(totalWords / totalMinutes);
  
  return Math.min(250, Math.max(1, overallWpm));
};

/**
 * Clean up the typing window by removing old keystrokes
 * @param typingWindow Current typing window
 * @returns Updated typing window with old keystrokes removed
 */
export const cleanupTypingWindow = (typingWindow: TypingWindow): TypingWindow => {
  const now = Date.now();
  const cutoffTime = now - typingWindow.windowSize;
  const filteredKeystrokes = typingWindow.recentKeystrokes.filter(
    timestamp => timestamp >= cutoffTime
  );
  
  return {
    ...typingWindow,
    recentKeystrokes: filteredKeystrokes
  };
};