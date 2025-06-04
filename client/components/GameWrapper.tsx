import React, { useState } from 'react';
import TypingOverlay from './TypingOverlay';
import FirstPersonCamera from './FirstPersonCamera';

const phrases = [
  "Achieve transcendence through rapid keystroke mastery",
  "The truth travels faster than illusion",
  "Swift wings trust steady hands",
  "Type your way through the digital realm",
  "Fingers dancing across keys like lightning",
  "Navigate the cybernetic highway with skill",
  "Unleash the power of your digital dexterity"
];

export default function GameWrapper() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const handleComplete = () => {
    setProgress((prev) => prev + 100);
    setIndex((prev) => (prev + 1) % phrases.length);
  };

  return (
    <div className="relative w-full h-screen">
      <FirstPersonCamera progress={progress} />
      <TypingOverlay phrase={phrases[index]} onComplete={handleComplete} />
    </div>
  );
}