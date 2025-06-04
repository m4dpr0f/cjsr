import React, { useState, useEffect } from 'react';

export default function TypingOverlay({ phrase, onComplete }: { phrase: string, onComplete: () => void }) {
  const [input, setInput] = useState('');
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    if (input === phrase) {
      onComplete();
      setInput('');
    }
  }, [input, phrase, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);
    const correct = phrase.slice(0, val.length);
    const match = val === correct;
    setAccuracy(match ? 100 : Math.max(0, (correct.length - Math.abs(correct.length - val.length)) / correct.length * 100));
  };

  return (
    <div className="absolute top-1/2 left-1/2 w-3/4 transform -translate-x-1/2 -translate-y-1/2 text-center text-white z-50">
      <div className="text-2xl font-mono bg-black bg-opacity-70 p-4 rounded">
        <p className="mb-2">{phrase}</p>
        <input
          className="bg-gray-800 text-white w-full px-2 py-1 rounded text-xl"
          type="text"
          value={input}
          onChange={handleChange}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <p className="text-sm text-green-300">Accuracy: {accuracy.toFixed(0)}%</p>
      </div>
    </div>
  );
}