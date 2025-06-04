import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedTypingInterface } from '@/components/ui/enhanced-typing-interface';
import { PixelButton } from '@/components/ui/pixel-button';
import { getRandomPrompt, generateEgg, GaruEgg, TextPrompt, savePlayerEgg, TypingPerformance } from '@/lib/text-shrine';

export function TextShrine() {
  const [currentPrompt, setCurrentPrompt] = useState<TextPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [typingProgress, setTypingProgress] = useState(0);
  const [typingStats, setTypingStats] = useState<TypingPerformance | null>(null);
  const [generatedEgg, setGeneratedEgg] = useState<GaruEgg | null>(null);
  const [showEggResult, setShowEggResult] = useState(false);

  // Load a random prompt when the component mounts
  useEffect(() => {
    async function loadPrompt() {
      setIsLoading(true);
      const prompt = await getRandomPrompt();
      setCurrentPrompt(prompt);
      setIsLoading(false);
    }
    
    loadPrompt();
  }, []);

  // Handle starting the typing challenge
  const handleStartTyping = () => {
    setIsTyping(true);
  };

  // Handle progress updates during typing
  const handleProgress = (progress: number) => {
    setTypingProgress(progress);
  };

  // Handle completion of the typing challenge
  const handleComplete = (stats: { wpm: number; accuracy: number; time: number }) => {
    setIsTyping(false);
    setIsComplete(true);
    
    if (currentPrompt) {
      const performance: TypingPerformance = {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        text: currentPrompt.text
      };
      
      setTypingStats(performance);
      
      // Generate the egg based on performance
      const egg = generateEgg(performance, currentPrompt);
      setGeneratedEgg(egg);
      
      // Save the egg to player collection
      savePlayerEgg(egg);
      
      // Show egg result after a short delay for dramatic effect
      setTimeout(() => {
        setShowEggResult(true);
      }, 1500);
    }
  };

  // Handle getting a new prompt
  const handleNewPrompt = async () => {
    setIsLoading(true);
    setIsComplete(false);
    setShowEggResult(false);
    setGeneratedEgg(null);
    setTypingStats(null);
    
    const prompt = await getRandomPrompt();
    setCurrentPrompt(prompt);
    setIsLoading(false);
  };

  // Determine the quality class for the egg based on performance
  const getEggQualityClass = () => {
    if (!typingStats) return 'text-gray-400';
    
    if (typingStats.accuracy >= 95 && typingStats.wpm >= 45) {
      return 'text-gold animate-pulse';
    } else if (typingStats.accuracy >= 85 && typingStats.wpm >= 30) {
      return 'text-silver';
    } else {
      return 'text-bronze';
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card className="bg-dark border-primary">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-minecraft text-primary">
            The Codex Crucible
          </CardTitle>
          <CardDescription className="text-center font-pixel text-secondary">
            Scribe the ancient texts to summon forth powerful Garu Eggs
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center p-12">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-light font-pixel">Consulting the ancient tomes...</p>
            </div>
          ) : !isTyping && !isComplete ? (
            <div className="space-y-6">
              <div className="bg-black/70 p-4 border-2 border-secondary rounded-md">
                <h3 className="font-minecraft text-secondary mb-2">SELECTED TEXT:</h3>
                <p className="font-pixel text-light text-sm">"{currentPrompt?.text}"</p>
                
                <div className="mt-2 text-xs text-light/70">
                  <span>From: {currentPrompt?.title} by {currentPrompt?.author}</span>
                </div>
              </div>
              
              <div className="text-center">
                <PixelButton size="lg" onClick={handleStartTyping}>
                  Begin Scribing
                </PixelButton>
              </div>
            </div>
          ) : isTyping ? (
            <div>
              <h3 className="font-minecraft text-primary mb-2 text-center">SCRIBING IN PROGRESS</h3>
              
              <EnhancedTypingInterface
                prompt={currentPrompt?.text || ""}
                onProgress={handleProgress}
                onComplete={handleComplete}
                isRaceActive={true}
                raceStartTime={null}
                singlePlayerMode={true}
              />
            </div>
          ) : showEggResult && generatedEgg ? (
            <div className="text-center space-y-6">
              <h3 className="font-minecraft text-primary text-xl">A NEW GARU EGG EMERGES!</h3>
              
              <div className="relative mx-auto w-32 h-32 bg-dark-800 rounded-full border-4 border-primary flex items-center justify-center">
                <div className={`text-5xl ${getEggQualityClass()}`}>🥚</div>
                <div className="absolute inset-0 rounded-full animate-ping-slow opacity-20 bg-primary"></div>
              </div>
              
              <div className="space-y-2 max-w-md mx-auto">
                <h3 className={`font-minecraft text-lg ${getEggQualityClass()}`}>
                  {generatedEgg.name}
                </h3>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/50 p-2 rounded">
                    <span className="text-secondary font-pixel">Element:</span>
                    <span className="block text-light font-pixel">{generatedEgg.element}</span>
                  </div>
                  <div className="bg-black/50 p-2 rounded">
                    <span className="text-secondary font-pixel">Color:</span>
                    <span className="block text-light font-pixel">{generatedEgg.color}</span>
                  </div>
                </div>
                
                <div className="bg-black/50 p-2 rounded text-sm">
                  <span className="text-secondary font-pixel">Special Effect:</span>
                  <span className="block text-light font-pixel">{generatedEgg.bonus}</span>
                </div>
                
                <div className="bg-black/70 p-3 rounded italic text-light/80 text-sm">
                  "{generatedEgg.lore}"
                </div>
                
                <div className="pt-4">
                  <h4 className="font-minecraft text-secondary text-sm mb-2">YOUR SCRIBING PERFORMANCE:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/40 p-2 rounded">
                      <span className="block text-light font-pixel">Speed: {typingStats?.wpm} WPM</span>
                    </div>
                    <div className="bg-black/40 p-2 rounded">
                      <span className="block text-light font-pixel">Accuracy: {typingStats?.accuracy}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-12">
              <h3 className="font-minecraft text-primary mb-4">PROCESSING SCRIBING RESULTS</h3>
              <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {!isTyping && (isComplete || !isLoading) && (
            <div className="space-x-2">
              {isComplete && (
                <PixelButton onClick={handleNewPrompt}>
                  Try Another Text
                </PixelButton>
              )}
              
              {!isComplete && !isLoading && (
                <PixelButton variant="outline" onClick={handleNewPrompt}>
                  Different Text
                </PixelButton>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}