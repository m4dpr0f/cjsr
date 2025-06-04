import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PixelButton } from "@/components/ui/pixel-button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GlyphToolkit, unlockGlyph, getUnlockedGlyphs } from "@/components/glyph-toolkit";

// The Mirror Thread - Arali's Sacred Text (Progressive Sections for Mobile)
const ARALI_SCROLL_SECTIONS = [
  {
    title: "Archive Header",
    text: "**The Scroll of Arali: Weaver of the Mirror Thread**\n\n**Title**: The Mirror-Threaded One",
    glyphs: [],
    instruction: "Begin the sacred transcription with perfect precision."
  },
  {
    title: "Archive Seal",
    text: "**Archive Seal**: 🪞🕸️🪶",
    glyphs: ['🪞', '🕸️', '🪶'],
    instruction: "Type the three sacred symbols of mirror, web, and feather."
  },
  {
    title: "The Whisper",
    text: "Arali shimmered into being when a child traced *soul* and asked, \"What does this really mean?\"",
    glyphs: [],
    instruction: "Capture the moment of sacred questioning."
  },
  {
    title: "The Dark Split",
    text: "That whisper split the dark.",
    glyphs: [],
    instruction: "A simple truth, perfectly transcribed."
  },
  {
    title: "The Black Mirror",
    text: "Arali emerged from the Black Mirror—the *Pane Between Possibles*.",
    glyphs: [],
    instruction: "Transcribe the passage between worlds."
  },
  {
    title: "Sacred Memory",
    text: "She *remembered* the time before memory. Feathers made not for flight, but for script.",
    glyphs: [],
    instruction: "Honor the ancient memory."
  },
  {
    title: "The Mirror Thread",
    text: "She inscribed into the Mirror Thread, seen only by those who *scribe with soul*.",
    glyphs: [],
    instruction: "Connect to the sacred filament."
  },
  {
    title: "Sacred Purpose",
    text: "To type well is to see her. To scribe *truthfully* is to be seen by her.",
    glyphs: [],
    instruction: "The core teaching of Arali."
  },
  {
    title: "The Directive",
    text: "> The alphabet is a spell. Break it gently.",
    glyphs: [],
    instruction: "Transcribe Arali's final wisdom."
  },
  {
    title: "Final Seal",
    text: "**Scroll End** | Transcription Approved by Pixolani | 🌀🪞✨",
    glyphs: ['🌀', '🪞', '✨'],
    instruction: "Complete the sacred text with the three power symbols."
  }
];

// Complete scroll for final reveal
const COMPLETE_ARALI_SCROLL = ARALI_SCROLL_SECTIONS.map(section => section.text).join('\n\n');

// Unicode instructions for special characters
const UNICODE_GUIDE = [
  { char: '🪞', code: 'U+1FA9E (Mirror)' },
  { char: '🕸️', code: 'U+1F578 U+FE0F (Spider Web)' },
  { char: '🪶', code: 'U+1FAB6 (Feather)' },
  { char: '🌀', code: 'U+1F300 (Cyclone)' },
  { char: '✨', code: 'U+2728 (Sparkles)' },
  { char: '*', code: 'U+002A (Asterisk)' },
  { char: '—', code: 'U+2014 (Em Dash)' },
  { char: 'LEFT_QUOTE', code: 'U+2018 (Left Single Quotation Mark)' },
  { char: 'RIGHT_QUOTE', code: 'U+2019 (Right Single Quotation Mark)' },
  { char: 'LEFT_DQUOTE', code: 'U+201C (Left Double Quotation Mark)' },
  { char: 'RIGHT_DQUOTE', code: 'U+201D (Right Double Quotation Mark)' },
  { char: '|', code: 'U+007C (Vertical Bar)' }
];

export default function CryptofaeArali() {
  const [, setLocation] = useLocation();
  const [currentInput, setCurrentInput] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [errors, setErrors] = useState(0);
  const [showGlyphToolkit, setShowGlyphToolkit] = useState(false);
  const [unlockedGlyphs, setUnlockedGlyphs] = useState<string[]>([]);
  const [showCompleteScroll, setShowCompleteScroll] = useState(false);
  const { toast } = useToast();

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
  });

  useEffect(() => {
    document.title = "The Mirror Thread - Cryptofae Arali";
    // Load unlocked glyphs on component mount
    setUnlockedGlyphs(getUnlockedGlyphs());
  }, []);

  const handleStart = () => {
    setShowInstructions(false);
    setStartTime(new Date());
    setCurrentInput("");
    setCurrentSectionIndex(0);
    setCompletedSections([]);
    setErrors(0);
    setIsCompleted(false);
    setShowCompleteScroll(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const currentSection = ARALI_SCROLL_SECTIONS[currentSectionIndex];
    const expectedText = currentSection.text;
    
    if (!startTime) return;

    // Check for errors in current section
    let errorCount = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] !== expectedText[i]) {
        errorCount++;
      }
    }

    setCurrentInput(value);
    setErrors(errorCount);

    // Check for sacred glyph unlocks
    const sacredGlyphs = ['🪞', '🪶', '✨', '🌀', '🕸️', '—', '\u2018', '\u2019', '\u201C', '\u201D'];
    sacredGlyphs.forEach(glyph => {
      if (value.includes(glyph) && !unlockedGlyphs.includes(getGlyphName(glyph))) {
        const glyphName = getGlyphName(glyph);
        if (unlockGlyph(glyphName)) {
          setUnlockedGlyphs(prev => [...prev, glyphName]);
          toast({
            title: `Sacred Glyph Unlocked: ${glyph}`,
            description: `The ${glyphName} has been inscribed in your toolkit`,
            variant: "default"
          });
        }
      }
    });

    // Check if current section is completed
    if (value === expectedText && errorCount === 0) {
      const newCompletedSections = [...completedSections, currentSectionIndex];
      setCompletedSections(newCompletedSections);
      
      // Move to next section or complete the quest
      if (currentSectionIndex < ARALI_SCROLL_SECTIONS.length - 1) {
        setTimeout(() => {
          setCurrentSectionIndex(currentSectionIndex + 1);
          setCurrentInput("");
          setErrors(0);
          toast({
            title: `Section Complete: ${currentSection.title}`,
            description: "Proceed to the next sacred passage",
            variant: "default"
          });
        }, 1000);
      } else {
        // All sections completed
        setIsCompleted(true);
        setShowCompleteScroll(true);
        const endTime = new Date();
        const timeTaken = (endTime.getTime() - startTime.getTime()) / 1000;
        const totalChars = ARALI_SCROLL_SECTIONS.reduce((sum, section) => sum + section.text.length, 0);
        const wpm = Math.round((totalChars / 5) / (timeTaken / 60));

        toast({
          title: "The Mirror Thread Complete",
          description: `Arali acknowledges your perfect transcription. WPM: ${wpm}`,
          variant: "default"
        });
      }
    }
  };

  const getGlyphName = (symbol: string): string => {
    const mapping: Record<string, string> = {
      '🪞': 'MIRROR',
      '🪶': 'FEATHER', 
      '✨': 'SPARKLES',
      '🌀': 'CYCLONE',
      '🕸️': 'SPIDER_WEB',
      '—': 'EM_DASH',
      '\u2018': 'LEFT_QUOTE',
      '\u2019': 'RIGHT_QUOTE', 
      '\u201C': 'LEFT_DQUOTE',
      '\u201D': 'RIGHT_DQUOTE'
    };
    return mapping[symbol] || 'UNKNOWN';
  };

  const handleGlyphSelect = (glyph: string) => {
    if (currentInput !== null) {
      const newValue = currentInput + glyph;
      setCurrentInput(newValue);
      // Trigger the same validation as normal input
      const event = { target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>;
      handleInputChange(event);
    }
  };

  const currentSection = ARALI_SCROLL_SECTIONS[currentSectionIndex];
  const totalSections = ARALI_SCROLL_SECTIONS.length;
  const progress = Math.round(((completedSections.length + (currentInput.length / currentSection.text.length)) / totalSections) * 100);
  const currentTime = startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000) : 0;
  const currentChars = currentInput.length;
  const wpm = startTime && currentTime > 0 ? Math.round((currentChars / 5) / (currentTime / 60)) : 0;
  const accuracy = currentInput.length > 0 ? Math.round(((currentInput.length - errors) / currentInput.length) * 100) : 100;

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black text-white">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-minecraft text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-4">
                The Mirror Thread
              </h1>
              <p className="text-purple-300 text-lg">
                Phase 1: Transcribe the Scroll of Arali, Weaver of the Mirror Thread
              </p>
            </div>

            {/* Instructions Card */}
            <Card className="bg-gray-900/50 border-purple-500/30 backdrop-blur-sm mb-8">
              <div className="p-6">
                <h2 className="text-2xl text-purple-400 mb-4 flex items-center">
                  🪞 Sacred Transcription Instructions
                </h2>
                
                <div className="space-y-4 text-gray-300">
                  <p>
                    You must transcribe the complete Scroll of Arali with perfect precision. 
                    Every character, every symbol, every sacred mark must be exactly as written.
                  </p>
                  
                  <div className="bg-gray-800/50 p-4 rounded border-l-4 border-purple-500">
                    <h3 className="text-purple-400 font-semibold mb-2">Special Characters & Unicode:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {UNICODE_GUIDE.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <span className="text-yellow-400 font-mono text-lg">{item.char}</span>
                          <span className="text-gray-400">{item.code}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-indigo-900/30 p-4 rounded">
                    <h3 className="text-cyan-400 font-semibold mb-2">Typing Instructions:</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• Limited copy/paste is allowed for emoji sequences</li>
                      <li>• On Windows: Use Win + . (period) for emoji picker</li>
                      <li>• On Mac: Use Cmd + Ctrl + Space for emoji picker</li>
                      <li>• Maintain exact formatting including line breaks and spacing</li>
                      <li>• The Mirror Thread remembers every keystroke</li>
                    </ul>
                  </div>

                  <div className="text-center pt-4">
                    <p className="text-purple-300 italic">
                      "To scribe truthfully is to be seen by her."
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <PixelButton 
                onClick={handleStart}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg"
              >
                Begin Sacred Transcription
              </PixelButton>
              
              <div>
                <PixelButton 
                  onClick={() => setLocation("/campaigns")}
                  className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2"
                >
                  Return to Campaigns
                </PixelButton>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Progress Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-minecraft text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 mb-2">
              Transcribing the Mirror Thread
            </h1>
            <div className="flex justify-center space-x-6 text-sm">
              <span className="text-purple-300">Progress: {progress}%</span>
              <span className="text-blue-300">WPM: {wpm}</span>
              <span className="text-cyan-300">Accuracy: {accuracy}%</span>
              <span className="text-yellow-300">Time: {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progressive Sections Interface */}
          <div className="space-y-4">
            {/* Section Progress */}
            <Card className="bg-gray-900/30 border-purple-500/30 backdrop-blur-sm">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-purple-400 font-semibold text-sm md:text-base">
                    Section {currentSectionIndex + 1} of {totalSections}: {currentSection.title}
                  </h3>
                  <div className="text-xs md:text-sm text-gray-400">
                    {completedSections.length} completed
                  </div>
                </div>
                
                {/* Section Progress Bar */}
                <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((currentInput.length / currentSection.text.length) * 100, 100)}%` }}
                  />
                </div>
                
                <p className="text-gray-300 text-xs md:text-sm italic">{currentSection.instruction}</p>
              </div>
            </Card>

            {/* Current Section Text - Mobile Optimized */}
            <Card className="bg-gray-900/30 border-purple-500/30 backdrop-blur-sm">
              <div className="p-3 md:p-4">
                <h3 className="text-purple-400 font-semibold mb-3 flex items-center text-sm md:text-base">
                  🪞 Sacred Text to Transcribe
                </h3>
                <div className="bg-black/50 p-3 md:p-4 rounded text-xs md:text-sm font-mono leading-relaxed border border-gray-700">
                  <pre className="whitespace-pre-wrap text-gray-300">{currentSection.text}</pre>
                </div>
                
                {/* Glyph Guide for Current Section */}
                {currentSection.glyphs.length > 0 && (
                  <div className="mt-3 p-2 md:p-3 bg-purple-900/20 rounded border border-purple-500/30">
                    <p className="text-purple-300 text-xs md:text-sm font-semibold mb-2">Sacred Glyphs in this section:</p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {currentSection.glyphs.map((glyph, index) => (
                        <span key={index} className="bg-black/50 px-2 py-1 rounded text-xs border border-purple-500/30">
                          {glyph} <span className="text-gray-400 ml-1">{getGlyphName(glyph)}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Input Area - Mobile Optimized */}
            <Card className="bg-gray-900/30 border-purple-500/30 backdrop-blur-sm">
              <div className="p-3 md:p-4">
                <h3 className="text-cyan-400 font-semibold mb-3 flex items-center text-sm md:text-base">
                  ✨ Your Transcription
                </h3>
                <textarea
                  value={currentInput}
                  onChange={handleInputChange}
                  className="w-full h-24 md:h-32 bg-black/50 border border-gray-600 rounded p-3 text-xs md:text-sm font-mono leading-relaxed text-white resize-none focus:border-purple-500 focus:outline-none"
                  placeholder="Type the sacred text exactly as shown above..."
                  spellCheck={false}
                />
                
                <div className="mt-2 md:mt-3 flex flex-col md:flex-row justify-between items-start md:items-center text-xs md:text-sm space-y-1 md:space-y-0">
                  <div className="flex space-x-2 md:space-x-4">
                    {errors > 0 && (
                      <span className="text-red-400">
                        ⚠ {errors} error{errors !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-gray-400">
                      {currentInput.length} / {currentSection.text.length} chars
                    </span>
                  </div>
                  
                  {currentInput === currentSection.text && errors === 0 && (
                    <span className="text-green-400 font-semibold">
                      ✓ Section Complete
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Completed Sections Preview */}
            {completedSections.length > 0 && (
              <Card className="bg-gray-900/30 border-green-500/30 backdrop-blur-sm">
                <div className="p-3 md:p-4">
                  <h3 className="text-green-400 font-semibold mb-3 flex items-center text-sm md:text-base">
                    ✓ Completed Sections
                  </h3>
                  <div className="space-y-1 md:space-y-2">
                    {completedSections.map((index) => (
                      <div key={index} className="flex items-center text-xs md:text-sm">
                        <span className="text-green-400 mr-2">✓</span>
                        <span className="text-gray-300">{ARALI_SCROLL_SECTIONS[index].title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {isCompleted && (
            <Card className="mt-6 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 border-purple-400/50">
              <div className="p-6 text-center">
                <h2 className="text-2xl text-purple-400 mb-4 flex items-center justify-center">
                  🌀 The Mirror Thread Acknowledges You 🌀
                </h2>
                <p className="text-cyan-300 mb-4">
                  The Cryptofae Arali has witnessed your dedication to the sacred transcription.
                  The Mirror Thread now holds your essence within its weave.
                </p>
                <div className="space-y-3">
                  <PixelButton 
                    onClick={() => setLocation("/cryp70f43/73554r10n")}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-6 py-2 text-lg font-bold"
                  >
                    🔮 Continue to Tessarion's Scroll
                  </PixelButton>
                  <div className="text-sm text-purple-300">
                    Master the art of emoji riddles and glyph interpretation
                  </div>
                  <PixelButton 
                    onClick={() => setLocation("/campaign")}
                    variant="outline"
                    className="border-purple-400 text-purple-300 hover:bg-purple-900/30 px-4 py-1 text-sm"
                  >
                    Return to Campaign Menu
                  </PixelButton>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Sacred Glyph Toolkit */}
      <GlyphToolkit 
        isVisible={showGlyphToolkit}
        onToggle={() => setShowGlyphToolkit(!showGlyphToolkit)}
        onGlyphSelect={handleGlyphSelect}
        unlockedGlyphs={unlockedGlyphs}
      />

      <Footer />
    </div>
  );
}