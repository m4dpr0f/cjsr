import { useState, useEffect, useRef } from "react";
import { PixelButton } from "@/components/ui/pixel-button";
import { formatTime } from "@/lib/utils";

interface MultiplayerRaceProps {
  prompt: string;
  onProgress: (progress: number, wpm: number, accuracy: number) => void;
  onComplete: (stats: { wpm: number; accuracy: number; time: number }) => void;
  onBack: () => void;
  isActive: boolean;
  startTime: number | null;
}

export function MultiplayerRace({
  prompt,
  onProgress,
  onComplete,
  onBack,
  isActive,
  startTime
}: MultiplayerRaceProps) {
  const [typed, setTyped] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeypresses, setTotalKeypresses] = useState(0);
  const [error, setError] = useState(false);
  const [mustCorrectError, setMustCorrectError] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordStart, setWordStart] = useState(0);
  const [wordEnd, setWordEnd] = useState(0);
  
  const inputRef = useRef<HTMLDivElement>(null);
  const promptContainerRef = useRef<HTMLDivElement>(null);
  
  // Split prompt into words for highlighting
  const words = prompt.split(/\s+/);
  
  // Find word boundaries
  useEffect(() => {
    if (!isActive) return;
    
    let start = 0;
    let currentIndex = 0;
    
    // Find the current word based on typed length
    for (let i = 0; i < words.length; i++) {
      const wordLength = words[i].length;
      const spacer = i < words.length - 1 ? 1 : 0; // Space after word except last
      
      if (typed.length <= start + wordLength + spacer) {
        currentIndex = i;
        break;
      }
      
      start += wordLength + spacer;
    }
    
    // Calculate start and end position of current word in the prompt
    let wordStartPos = 0;
    for (let i = 0; i < currentIndex; i++) {
      wordStartPos += words[i].length + 1; // +1 for space
    }
    
    const wordEndPos = wordStartPos + words[currentIndex].length;
    
    setCurrentWordIndex(currentIndex);
    setWordStart(wordStartPos);
    setWordEnd(wordEndPos);
    
  }, [typed, words, isActive]);
  
  // Timer effect
  useEffect(() => {
    if (!isActive || !startTime) return;
    
    const timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setCurrentTime(elapsed);
    }, 1000);
    
    return () => clearInterval(timerInterval);
  }, [isActive, startTime]);
  
  // Normalize hyphens in prompt
  const normalizeHyphen = (char: string): string => {
    // Convert any dash-like character (em dash, en dash) to regular hyphen
    if (char === '—' || char === '–' || char === '−') {
      return '-';
    }
    return char;
  };
  
  // Auto-scroll the prompt when typing
  useEffect(() => {
    if (promptContainerRef.current && typed.length > 0) {
      const container = promptContainerRef.current;
      const currentWordElement = container.querySelector('.current-word');
      
      if (currentWordElement) {
        const containerRect = container.getBoundingClientRect();
        const wordRect = currentWordElement.getBoundingClientRect();
        
        // Check if the current word is below the visible area
        if (wordRect.bottom > containerRect.bottom) {
          container.scrollTop += wordRect.bottom - containerRect.bottom + 10;
        }
        
        // Check if the current word is above the visible area
        if (wordRect.top < containerRect.top) {
          container.scrollTop -= containerRect.top - wordRect.top + 10;
        }
      }
    }
  }, [currentWordIndex, typed]);
  
  // Keyboard input handler
  useEffect(() => {
    if (!isActive || isComplete) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser quick find when typing apostrophe (') or slash (/)
      if (e.key === "'" || e.key === "/" || e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        
        // If it's apostrophe or slash, we still want to process the character for typing
        if (e.key === "'" || e.key === "/") {
          // Continue with normal character processing
        } else {
          return; // For Tab and Enter, just prevent default and return
        }
      }
      
      // Handle backspace
      if (e.key === "Backspace") {
        if (typed.length > 0) {
          setTyped((prev) => prev.slice(0, -1));
          // If we're in error correction mode and we've deleted enough, clear the error
          if (mustCorrectError && typed.length <= wordEnd) {
            setMustCorrectError(false);
            setError(false);
          }
        }
        return;
      }
      
      // If we must correct an error first, don't allow typing ahead
      if (mustCorrectError && e.key.length === 1) {
        // Increment total keypress count for accuracy tracking
        setTotalKeypresses(prev => prev + 1);
        
        const nextChar = normalizeHyphen(prompt[typed.length]);
        const isCorrect = e.key === nextChar || 
                          (e.key === '-' && ['—', '–', '−'].includes(prompt[typed.length]));
        
        if (isCorrect) {
          setTyped((prev) => prev + e.key);
          // If we've corrected up to the error position, clear the error state
          if (typed.length + 1 >= wordEnd) {
            setMustCorrectError(false);
            setError(false);
          }
        } else {
          // Count errors for accuracy calculation
          setErrorCount(prev => prev + 1);
        }
        return;
      }
      
      // Normal typing
      if (e.key.length === 1) {
        // Increment total keypress count for accuracy tracking
        setTotalKeypresses(prev => prev + 1);
        
        const nextChar = normalizeHyphen(prompt[typed.length]);
        const isCorrect = e.key === nextChar || 
                          (e.key === '-' && ['—', '–', '−'].includes(prompt[typed.length]));
        
        if (!isCorrect) {
          setError(true);
          setMustCorrectError(true);
          // Count errors for accuracy calculation
          setErrorCount(prev => prev + 1);
        } else {
          setError(false);
          setTyped((prev) => prev + e.key);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isComplete, typed, prompt, mustCorrectError, wordEnd]);
  
  // Progress calculation
  useEffect(() => {
    if (!isActive) return;
    
    // Calculate WPM
    const elapsedMinutes = currentTime / 60 || 0.01; // Avoid division by zero
    const words = typed.length / 5; // Estimate words based on characters (standard is 5 chars per word)
    const currentWpm = Math.round(words / elapsedMinutes);
    
    // Calculate accuracy
    let currentAccuracy = 100;
    if (totalKeypresses > 0) {
      currentAccuracy = Math.max(0, Math.min(100, Math.round(((totalKeypresses - errorCount) / totalKeypresses) * 100)));
    }
    
    setWpm(currentWpm);
    setAccuracy(currentAccuracy);
    
    // Calculate progress
    const progress = Math.min(100, Math.floor((typed.length / prompt.length) * 100));
    onProgress(progress, currentWpm, currentAccuracy);
    
    // Check for completion
    if (typed.length === prompt.length) {
      setIsComplete(true);
      
      // Calculate final stats
      const stats = {
        wpm: currentWpm,
        accuracy: currentAccuracy,
        time: currentTime,
      };
      
      onComplete(stats);
    }
  }, [typed, currentTime, prompt, isActive, onProgress, onComplete]);
  
  // Auto-focus the input when race becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);
  
  // Generate the colored and highlighted text for the prompt - TypeRacer style
  const renderPrompt = () => {
    if (!isActive || isComplete) {
      // When not active, show the full prompt
      return <span className="text-gray-700">{prompt}</span>;
    }
    
    // TypeRacer style - only show correctly typed text and current/upcoming text
    return (
      <>
        {/* Already typed text in green */}
        {typed.length > 0 && (
          <span className="text-green-500 font-medium">{prompt.substring(0, typed.length)}</span>
        )}
        
        {/* Current word with highlight - show in red background if error */}
        <span className={`current-word ${error ? 'bg-red-200 text-red-800 font-bold' : 'bg-yellow-200/50 text-dark'} underline`}>
          {prompt.substring(typed.length, wordEnd)}
        </span>
        
        {/* Upcoming text */}
        <span className="text-gray-700">{prompt.substring(wordEnd)}</span>
      </>
    );
  };
  
  return (
    <div className="bg-dark-800 p-4 minecraft-border rounded-lg shadow-lg w-full max-w-4xl mx-auto">
      {/* Stats bar */}
      <div className="flex justify-between items-center mb-3 bg-dark-900 p-2 rounded">
        <div className="font-minecraft flex space-x-4">
          <div>
            <span className="text-secondary text-sm">WPM: </span>
            <span className="text-primary font-bold">{wpm}</span>
          </div>
          <div>
            <span className="text-secondary text-sm">Accuracy: </span>
            <span className="text-primary font-bold">{accuracy}%</span>
          </div>
        </div>
        <div className="text-primary font-minecraft">
          <span className="text-secondary text-sm">Time: </span>
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-minecraft text-primary uppercase text-lg">SCRIBING ARENA</h2>
      </div>
      
      {/* TypeRacer-style race interface */}
      <div className="bg-dark-900 rounded-lg p-4 mb-4 shadow-inner">
        {/* Prompt display area with highlighted text - TypeRacer style */}
        <div 
          ref={promptContainerRef}
          className="bg-light p-4 rounded-lg mb-4 leading-relaxed min-h-[100px] max-h-[150px] overflow-y-auto" 
          style={{ fontFamily: "'Courier New', monospace", fontSize: "18px" }}
        >
          {renderPrompt()}
        </div>
        
        {/* Typing input area - TypeRacer style */}
        <div className="relative mt-2">
          <div
            ref={inputRef}
            tabIndex={0}
            className={`bg-white border-2 p-3 rounded-md text-dark text-lg focus:ring-2 focus:ring-primary ${
              error ? "border-red-500 bg-red-50" : "border-primary/50"
            }`}
            style={{ fontFamily: "'Courier New', monospace", fontSize: "18px" }}
          >
            {typed}
            <span className={`typing-cursor ${error ? "text-red-500" : "text-primary"}`}></span>
            {error && (
              <div className="absolute -top-8 left-0 bg-red-600 text-white px-3 py-1 rounded text-sm animate-pulse font-bold shadow-lg">
                Error! Backspace and correct
              </div>
            )}
          </div>
          
          {/* Error indicator with clearer instructions */}
          {error && (
            <div className="bg-red-100 text-red-700 border border-red-300 rounded-md p-2 mt-2 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Press <span className="bg-gray-200 text-red-800 px-1 rounded font-mono mx-1">Backspace</span> to delete and correct the error. You need to fix errors before continuing.
            </div>
          )}
        </div>
      </div>
      
      {/* Race controls */}
      <div className="flex justify-between items-center">
        <PixelButton onClick={onBack} variant="secondary" className="px-6">
          Quit Race
        </PixelButton>
        
        <div className="text-xs text-gray-400 italic">
          Type the text above exactly as shown. Errors must be corrected.
        </div>
      </div>
    </div>
  );
}