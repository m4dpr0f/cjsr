import { useState, useEffect, useRef } from 'react';
import { VirtualKeyboard } from './virtual-keyboard';
import { cn } from '@/lib/utils';

interface MobileTypingInterfaceProps {
  text: string;
  onProgress: (progress: number) => void;
  isRaceStarted: boolean;
  isRaceFinished: boolean;
  className?: string;
}

export function MobileTypingInterface({
  text,
  onProgress,
  isRaceStarted,
  isRaceFinished,
  className
}: MobileTypingInterfaceProps) {
  const [typedText, setTypedText] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [error, setError] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Split the text into words for better tracking
  const words = text.split(' ');
  
  // Calculate progress
  useEffect(() => {
    if (text && typedText) {
      const progress = (typedText.length / text.length) * 100;
      onProgress(Math.min(progress, 100));
      
      // Automatically scroll the container to keep the current word visible
      if (containerRef.current) {
        const currentWordElement = containerRef.current.querySelector('.current-word');
        if (currentWordElement) {
          currentWordElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        }
      }
    }
  }, [text, typedText, onProgress]);
  
  // Reset state when race starts
  useEffect(() => {
    if (isRaceStarted && !isRaceFinished) {
      setTypedText('');
      setCurrentWordIndex(0);
      setCurrentCharIndex(0);
      setError(false);
      
      // Show keyboard when race starts on mobile
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setShowKeyboard(true);
      }
    }
    
    if (isRaceFinished) {
      setShowKeyboard(false);
    }
  }, [isRaceStarted, isRaceFinished]);
  
  // Handle physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRaceStarted || isRaceFinished) return;
      
      // Only process if not being handled by an input element
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      // Process key input
      processKeyInput(e.key);
      
      // Prevent default for typing keys to avoid scrolling
      if (e.key !== 'Tab') {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRaceStarted, isRaceFinished, currentWordIndex, currentCharIndex, error, words]);
  
  // Process key input from either physical or virtual keyboard
  const processKeyInput = (key: string) => {
    if (!isRaceStarted || isRaceFinished) return;
    
    // Handle Tab key for word skip
    if (key === 'Tab') {
      // If there's an error, clear it and move to the next word
      if (error) {
        const currentWord = words[currentWordIndex];
        setTypedText(typedText + currentWord.substring(currentCharIndex) + ' ');
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentCharIndex(0);
        setError(false);
        return;
      }
      return;
    }
    
    // Handle Backspace
    if (key === 'Backspace') {
      if (currentCharIndex > 0 || currentWordIndex > 0) {
        if (currentCharIndex > 0) {
          // Remove the last character from the current word
          setTypedText(typedText.slice(0, -1));
          setCurrentCharIndex(currentCharIndex - 1);
        } else if (currentWordIndex > 0) {
          // Move to the previous word
          const prevWord = words[currentWordIndex - 1];
          setTypedText(typedText.slice(0, -(prevWord.length + 1)));
          setCurrentWordIndex(currentWordIndex - 1);
          setCurrentCharIndex(prevWord.length);
        }
        setError(false);
      }
      return;
    }
    
    // Handle Space
    if (key === ' ') {
      if (!error && currentCharIndex === words[currentWordIndex].length) {
        // Correct word completed, move to next word
        setTypedText(typedText + ' ');
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentCharIndex(0);
      }
      return;
    }
    
    // Normal key press
    const currentWord = words[currentWordIndex];
    const expectedChar = currentWord[currentCharIndex];
    
    if (key === expectedChar) {
      // Correct key
      setTypedText(typedText + key);
      setCurrentCharIndex(currentCharIndex + 1);
      setError(false);
      
      // Check if word completed
      if (currentCharIndex + 1 === currentWord.length && currentWordIndex + 1 < words.length) {
        // Auto add space and move to next word
        setTypedText(typedText + key + ' ');
        setCurrentWordIndex(currentWordIndex + 1);
        setCurrentCharIndex(0);
      }
      
      // Check if all text completed
      if (currentWordIndex === words.length - 1 && currentCharIndex + 1 === currentWord.length) {
        // Race finished!
        onProgress(100);
      }
    } else {
      // Wrong key
      setError(true);
    }
  };
  
  // Handle virtual keyboard input
  const handleVirtualKeyPress = (key: string) => {
    processKeyInput(key);
  };
  
  const handleVirtualBackspace = () => {
    processKeyInput('Backspace');
  };
  
  const handleVirtualSpace = () => {
    processKeyInput(' ');
  };
  
  // Toggle keyboard visibility
  const toggleKeyboard = () => {
    setShowKeyboard(!showKeyboard);
  };
  
  return (
    <div className={cn('mobile-typing-interface flex flex-col', className)}>
      {/* Text display area */}
      <div 
        ref={containerRef}
        className={cn(
          'text-display p-4 rounded-md bg-gray-800/60 text-lg leading-relaxed overflow-auto',
          error ? 'border-2 border-red-500' : 'border border-gray-700',
          showKeyboard ? 'max-h-32 sm:max-h-40' : 'max-h-64 sm:max-h-96'
        )}
      >
        {words.map((word, wordIndex) => {
          // Determine word status
          const isCurrentWord = wordIndex === currentWordIndex;
          const isPastWord = wordIndex < currentWordIndex;
          
          return (
            <span
              key={`word-${wordIndex}`}
              className={cn(
                'inline-block mr-1 px-1 py-0.5 rounded',
                isCurrentWord && 'current-word bg-primary/20',
                isPastWord && 'text-gray-400'
              )}
            >
              {word.split('').map((char, charIndex) => {
                // Determine character status for the current word
                const isCurrentChar = isCurrentWord && charIndex === currentCharIndex;
                const isPastChar = isPastWord || (isCurrentWord && charIndex < currentCharIndex);
                const isFutureChar = !isCurrentWord || charIndex > currentCharIndex;
                
                return (
                  <span
                    key={`char-${wordIndex}-${charIndex}`}
                    className={cn(
                      isCurrentChar && 'bg-primary text-dark font-bold',
                      isPastChar && 'text-primary',
                      isFutureChar && 'text-gray-300',
                      error && isCurrentChar && 'bg-red-500 text-white'
                    )}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
      
      {/* Toggle keyboard button - only shown on mobile */}
      <div className="flex justify-center my-2 md:hidden">
        <button
          onClick={toggleKeyboard}
          className="px-4 py-2 text-sm bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
        >
          {showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
        </button>
      </div>
      
      {/* Virtual keyboard */}
      {showKeyboard && isRaceStarted && !isRaceFinished && (
        <VirtualKeyboard
          onKeyPress={handleVirtualKeyPress}
          onBackspace={handleVirtualBackspace}
          onSpace={handleVirtualSpace}
          className="mt-2"
        />
      )}
      
      {/* Progress indicator */}
      <div className="progress-bar h-2 bg-gray-700 mt-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${(typedText.length / text.length) * 100}%` }}
        />
      </div>
    </div>
  );
}