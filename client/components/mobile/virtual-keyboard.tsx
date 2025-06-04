import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  className?: string;
}

export function VirtualKeyboard({
  onKeyPress,
  onBackspace,
  onSpace,
  className
}: VirtualKeyboardProps) {
  const [layout, setLayout] = useState<'letters' | 'numbers'>('letters');
  const [shiftActive, setShiftActive] = useState(false);
  
  // Define keyboard layouts
  const letterKeys = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.']
  ];
  
  const letterKeysUpper = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>']
  ];
  
  const numberKeys = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '=']
  ];
  
  const symbolKeys = [
    ['!', '@', '#', '$', '%', '¢', '&', '*', '(', ')'],
    ['_', '\\', '|', '~', '<', '>', '?', "'", '"', '`'],
    ['{', '}', '≈', '≠', '≤', '≥', '±', '÷', '×', '¶']
  ];
  
  const handleKeyPress = (key: string) => {
    onKeyPress(key);
    
    // Auto-disable shift after one character
    if (shiftActive) {
      setShiftActive(false);
    }
  };
  
  const toggleLayout = () => {
    setLayout(layout === 'letters' ? 'numbers' : 'letters');
    setShiftActive(false); // Reset shift when changing layouts
  };
  
  const toggleShift = () => {
    setShiftActive(!shiftActive);
  };
  
  // Get the current keyboard layout based on state
  const getCurrentKeyboardLayout = () => {
    if (layout === 'letters') {
      return shiftActive ? letterKeysUpper : letterKeys;
    } else {
      return shiftActive ? symbolKeys : numberKeys;
    }
  };
  
  return (
    <div className={cn('virtual-keyboard max-w-full bg-gray-800/80 p-1 rounded-lg', className)}>
      <div className="flex flex-col space-y-1">
        {/* Display current layout */}
        {getCurrentKeyboardLayout().map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex justify-center space-x-1">
            {row.map(key => (
              <button
                key={key}
                className="virtual-key text-sm sm:text-lg bg-gray-700 text-gray-200 rounded-md min-w-[2.2rem] sm:min-w-[2.6rem] h-12 sm:h-14 flex items-center justify-center hover:bg-gray-600 shadow-sm"
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
        
        {/* Bottom row with special keys */}
        <div className="flex justify-center space-x-1">
          <button
            className={cn(
              "virtual-key bg-gray-600 text-gray-200 rounded-md px-2 h-12 sm:h-14 flex-1 hover:bg-gray-500 text-lg font-bold shadow-sm",
              shiftActive && "bg-primary/70 text-dark"
            )}
            onClick={toggleShift}
          >
            ⇧
          </button>
          
          <button
            className="virtual-key bg-gray-600 text-gray-200 rounded-md px-2 h-12 sm:h-14 flex-1 hover:bg-gray-500 shadow-sm"
            onClick={toggleLayout}
          >
            {layout === 'letters' ? '123' : 'ABC'}
          </button>
          
          <button
            className="virtual-key bg-gray-600 text-gray-200 rounded-md h-12 sm:h-14 flex-[3] hover:bg-gray-500 shadow-sm"
            onClick={onSpace}
          >
            Space
          </button>
          
          <button
            className="virtual-key bg-gray-600 text-gray-200 rounded-md px-2 h-12 sm:h-14 flex-1 hover:bg-gray-500 text-lg font-bold shadow-sm"
            onClick={onBackspace}
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}