import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { PixelButton } from "@/components/ui/pixel-button";

export interface GlyphUnlock {
  symbol: string;
  name: string;
  unicode: string;
  unlocked: boolean;
  unlockedAt?: Date;
  element: 'air' | 'earth' | 'fire' | 'water' | 'ether';
  description: string;
}

const SACRED_GLYPHS: GlyphUnlock[] = [
  {
    symbol: '🪞',
    name: 'MIRROR',
    unicode: 'U+1FA9E',
    unlocked: false,
    element: 'ether',
    description: 'Reflects the true nature of the scribe'
  },
  {
    symbol: '🪶',
    name: 'FEATHER',
    unicode: 'U+1FAB6',
    unlocked: false,
    element: 'air',
    description: 'The quill of ancient wisdom'
  },
  {
    symbol: '✨',
    name: 'SPARKLES',
    unicode: 'U+2728',
    unlocked: false,
    element: 'fire',
    description: 'The light of inspiration'
  },
  {
    symbol: '🌀',
    name: 'CYCLONE',
    unicode: 'U+1F300',
    unlocked: false,
    element: 'air',
    description: 'The whirlwind of thought'
  },
  {
    symbol: '🕸️',
    name: 'SPIDER_WEB',
    unicode: 'U+1F578 U+FE0F',
    unlocked: false,
    element: 'earth',
    description: 'The interconnected threads of knowledge'
  },
  {
    symbol: '—',
    name: 'EM_DASH',
    unicode: 'U+2014',
    unlocked: false,
    element: 'ether',
    description: 'The pause between thoughts'
  },
  {
    symbol: '\u2018',
    name: 'LEFT_QUOTE',
    unicode: 'U+2018',
    unlocked: false,
    element: 'water',
    description: 'The beginning of sacred speech'
  },
  {
    symbol: '\u2019',
    name: 'RIGHT_QUOTE',
    unicode: 'U+2019',
    unlocked: false,
    element: 'water',
    description: 'The completion of sacred speech'
  },
  {
    symbol: '"',
    name: 'LEFT_DQUOTE',
    unicode: 'U+201C',
    unlocked: false,
    element: 'water',
    description: 'The vessel of deeper truth'
  },
  {
    symbol: '"',
    name: 'RIGHT_DQUOTE',
    unicode: 'U+201D',
    unlocked: false,
    element: 'water',
    description: 'The seal of deeper truth'
  }
];

interface GlyphToolkitProps {
  isVisible: boolean;
  onToggle: () => void;
  onGlyphSelect?: (glyph: string) => void;
  onGlyphUnlock?: (glyphName: string) => void;
  unlockedGlyphs?: string[];
}

export function GlyphToolkit({ 
  isVisible, 
  onToggle, 
  onGlyphSelect, 
  onGlyphUnlock,
  unlockedGlyphs = []
}: GlyphToolkitProps) {
  const [glyphs, setGlyphs] = useState<GlyphUnlock[]>(SACRED_GLYPHS);

  useEffect(() => {
    // Load unlocked glyphs from localStorage or props
    const savedGlyphs = localStorage.getItem('unlockedGlyphs');
    if (savedGlyphs) {
      const unlocked = JSON.parse(savedGlyphs);
      setGlyphs(prev => prev.map(glyph => ({
        ...glyph,
        unlocked: unlocked.includes(glyph.name) || unlockedGlyphs.includes(glyph.name)
      })));
    } else if (unlockedGlyphs.length > 0) {
      setGlyphs(prev => prev.map(glyph => ({
        ...glyph,
        unlocked: unlockedGlyphs.includes(glyph.name)
      })));
    }
  }, [unlockedGlyphs]);

  const unlockGlyph = (glyphName: string) => {
    setGlyphs(prev => prev.map(glyph => {
      if (glyph.name === glyphName) {
        const unlocked = { ...glyph, unlocked: true, unlockedAt: new Date() };
        // Save to localStorage
        const currentUnlocked = JSON.parse(localStorage.getItem('unlockedGlyphs') || '[]');
        if (!currentUnlocked.includes(glyphName)) {
          currentUnlocked.push(glyphName);
          localStorage.setItem('unlockedGlyphs', JSON.stringify(currentUnlocked));
        }
        onGlyphUnlock?.(glyphName);
        return unlocked;
      }
      return glyph;
    }));
  };

  const getElementColor = (element: string) => {
    const colors = {
      air: 'from-cyan-500 to-blue-500',
      earth: 'from-green-500 to-emerald-500',
      fire: 'from-red-500 to-orange-500',
      water: 'from-blue-500 to-indigo-500',
      ether: 'from-purple-500 to-violet-500'
    };
    return colors[element as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const unlockedCount = glyphs.filter(g => g.unlocked).length;

  if (!isVisible) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <PixelButton 
          onClick={onToggle}
          className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white p-3 rounded-lg shadow-lg"
          title="Open Sacred Glyph Toolkit"
        >
          <span className="text-lg">📜</span>
          <span className="ml-2 text-sm">{unlockedCount}/{glyphs.length}</span>
        </PixelButton>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Card className="bg-gray-900/95 border-purple-500/50 backdrop-blur-md shadow-2xl">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-minecraft text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                PERSONAL GLYPH TOOLKIT
              </h3>
              <p className="text-sm text-gray-400">
                {unlockedCount}/{glyphs.length} Sacred Symbols Mastered
              </p>
            </div>
            <PixelButton 
              onClick={onToggle}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2"
            >
              ✕
            </PixelButton>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(unlockedCount / glyphs.length) * 100}%` }}
            />
          </div>

          {/* Glyph Grid */}
          <div className="grid grid-cols-5 gap-3 mb-4">
            {glyphs.map((glyph, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => glyph.unlocked && onGlyphSelect?.(glyph.symbol)}
                  disabled={!glyph.unlocked}
                  className={`
                    w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg
                    transition-all duration-200 group relative
                    ${glyph.unlocked 
                      ? `bg-gradient-to-br ${getElementColor(glyph.element)} border-transparent hover:scale-110 cursor-pointer shadow-lg` 
                      : 'bg-gray-800 border-gray-600 cursor-not-allowed'
                    }
                  `}
                  title={glyph.unlocked ? `${glyph.name}: ${glyph.description}` : `Locked: ${glyph.name}`}
                >
                  {glyph.unlocked ? (
                    <span className="text-white drop-shadow-lg">{glyph.symbol}</span>
                  ) : (
                    <span className="text-gray-500">🔒</span>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                      <div className="font-semibold">{glyph.name}</div>
                      <div className="text-gray-300">{glyph.unicode}</div>
                      {glyph.unlocked && (
                        <div className="text-gray-400 text-xs">{glyph.description}</div>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="bg-gray-800/50 p-3 rounded text-xs text-gray-400">
            <p className="mb-2">
              <span className="text-purple-400">✨ Unlock glyphs</span> by typing them correctly in sacred texts.
            </p>
            <p>
              <span className="text-cyan-400">🖱️ Click unlocked glyphs</span> to insert them in compatible fields.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Export function to unlock a glyph programmatically
export const unlockGlyph = (glyphName: string) => {
  const currentUnlocked = JSON.parse(localStorage.getItem('unlockedGlyphs') || '[]');
  if (!currentUnlocked.includes(glyphName)) {
    currentUnlocked.push(glyphName);
    localStorage.setItem('unlockedGlyphs', JSON.stringify(currentUnlocked));
    return true;
  }
  return false;
};

// Export function to check if a glyph is unlocked
export const isGlyphUnlocked = (glyphName: string): boolean => {
  const currentUnlocked = JSON.parse(localStorage.getItem('unlockedGlyphs') || '[]');
  return currentUnlocked.includes(glyphName);
};

// Export function to get all unlocked glyphs
export const getUnlockedGlyphs = (): string[] => {
  return JSON.parse(localStorage.getItem('unlockedGlyphs') || '[]');
};