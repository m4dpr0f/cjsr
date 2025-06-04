import { useState, useEffect, useCallback, useRef } from "react";
import { calculateWPM, calculateAccuracy } from "@/lib/utils";

interface TypingStats {
  wpm: number;
  accuracy: number;
  progress: number;
  completed: boolean;
}

export function useTyping(
  prompt: string,
  onProgress?: (progress: number) => void,
  onComplete?: (stats: { wpm: number; accuracy: number; time: number }) => void
) {
  const [typed, setTyped] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 0,
    progress: 0,
    completed: false,
  });
  
  const timerRef = useRef<number | null>(null);
  
  // Reset when prompt changes
  useEffect(() => {
    setTyped("");
    setStartTime(null);
    setElapsedTime(0);
    setIsError(false);
    setIsComplete(false);
    setStats({
      wpm: 0,
      accuracy: 0,
      progress: 0,
      completed: false,
    });
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [prompt]);
  
  // Handle key input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isComplete) return;
    
    // Start timer on first keystroke
    if (startTime === null) {
      setStartTime(Date.now());
      
      // Set up timer to update elapsed time
      timerRef.current = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - (startTime || Date.now())) / 1000));
      }, 1000);
    }
    
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      return;
    }
    
    if (e.key === "Backspace") {
      setTyped(prev => prev.slice(0, -1));
      setIsError(false);
      return;
    }
    
    if (e.key.length === 1) {
      const nextChar = prompt[typed.length];
      
      if (e.key === nextChar) {
        setTyped(prev => prev + e.key);
        setIsError(false);
      } else {
        setIsError(true);
      }
    }
  }, [isComplete, prompt, startTime, typed]);
  
  // Add and remove event listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [handleKeyDown]);
  
  // Update stats when typing progress changes
  useEffect(() => {
    if (!prompt || !startTime) return;
    
    const timeInSeconds = (Date.now() - startTime) / 1000;
    const wpm = calculateWPM(typed, timeInSeconds);
    const accuracy = calculateAccuracy(typed, prompt.substring(0, typed.length));
    const progress = (typed.length / prompt.length) * 100;
    
    // Call onProgress callback
    if (onProgress) {
      onProgress(progress);
    }
    
    // Update stats
    setStats({
      wpm,
      accuracy,
      progress,
      completed: typed.length === prompt.length,
    });
    
    // Check for completion
    if (typed.length === prompt.length && !isComplete) {
      setIsComplete(true);
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      // Call onComplete callback
      if (onComplete) {
        onComplete({
          wpm,
          accuracy,
          time: Math.floor((Date.now() - startTime) / 1000),
        });
      }
    }
  }, [typed, prompt, startTime, isComplete, onProgress, onComplete]);
  
  return {
    typed,
    elapsedTime,
    isError,
    isComplete,
    stats,
  };
}
