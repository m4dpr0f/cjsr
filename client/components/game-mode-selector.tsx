import { PixelButton } from "@/components/ui/pixel-button";
import { useLocation } from "wouter";

interface GameModeSelectorProps {
  selectedMode: string;
  onModeSelect: (mode: string) => void;
}

export function GameModeSelector({ 
  selectedMode, 
  onModeSelect 
}: GameModeSelectorProps) {
  const [, setLocation] = useLocation();

  const gameModes = [
    { id: "practice", name: "PRACTICE", available: true, path: "/practice" },
    { id: "campaign", name: "CAMPAIGN", available: true, path: "/campaign-selector" },
    { id: "multiplayer", name: "GUEST MULTIPLAYER", available: true, path: "/multiplayer", isNewMode: true },
    { id: "tournaments", name: "TOURNAMENTS", available: false },
    { id: "teams", name: "TEAMS", available: false }
  ];
  
  const handleModeSelect = (mode: typeof gameModes[0]) => {
    if (!mode.available) return;
    
    // Update the selected mode
    onModeSelect(mode.id);
    
    // If it has a path, navigate to that page
    if (mode.path) {
      setLocation(mode.path);
    }
  };
  
  // Group modes by category
  const mainModes = gameModes.filter(mode => !mode.isNewMode && mode.id !== "tournaments" && mode.id !== "teams");
  const otherModes = gameModes.filter(mode => mode.id === "tournaments" || mode.id === "teams");

  return (
    <div className="bg-dark p-4 pixel-border game-mode-selector">
      <h2 className="font-minecraft text-sm text-secondary mb-2">GAME MODE</h2>
      <div className="text-xs font-minecraft text-accent mb-4 bg-black/50 p-1 text-center">
        New guest multiplayer mode with NPCs! Live experimental version. Full functionality + player profiles coming in v1.0
      </div>
      
      {/* All Game Modes */}
      <div className="space-y-2 mb-4">
        {/* Main Game Modes */}
        {mainModes.map((mode) => (
          <div key={mode.id} className="relative">
            <PixelButton
              fullWidth
              variant={selectedMode === mode.id ? "default" : "outline"}
              onClick={() => handleModeSelect(mode)}
              disabled={!mode.available}
              className={mode.id === "multiplayer" ? "bg-green-700 hover:bg-green-600" : ""}
            >
              {mode.name}
              {mode.id === "multiplayer" && (
                <span className="ml-2 bg-yellow-500 text-black text-[10px] px-1 py-0 rounded">NEW!</span>
              )}
            </PixelButton>
            {!mode.available && (
              <div className="absolute right-0 top-0 bg-accent text-white text-xs px-2 font-minecraft rotate-12 transform translate-x-2 -translate-y-1">
                COMING SOON
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Coming Soon Modes */}
      <div className="space-y-2">
        <h3 className="font-minecraft text-xs text-primary">COMING SOON</h3>
        {otherModes.map((mode) => (
          <div key={mode.id} className="relative">
            <PixelButton
              fullWidth
              variant={selectedMode === mode.id ? "default" : "outline"}
              onClick={() => handleModeSelect(mode)}
              disabled={!mode.available}
            >
              {mode.name}
            </PixelButton>
            {!mode.available && (
              <div className="absolute right-0 top-0 bg-accent text-white text-xs px-2 font-minecraft rotate-12 transform translate-x-2 -translate-y-1">
                COMING SOON
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
