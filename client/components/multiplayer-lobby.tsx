import { useState } from "react";
import { PixelButton } from "@/components/ui/pixel-button";
import { useToast } from "@/hooks/use-toast";

interface MultiplayerLobbyProps {
  players: {
    id: string;
    username: string;
    level: number;
    status: "waiting" | "ready" | "typing" | "finished";
    isCurrentPlayer: boolean;
    isNPC?: boolean;
    difficulty?: string;
  }[];
  maxPlayers: number;
  isConnected: boolean;
  promptText: string | null;
  countdownActive: boolean;
  raceActive: boolean;
  onReady: () => void;
  onLeave: () => void;
  onCommand: (command: string) => void;
  raceTimer: number | null;
}

export function MultiplayerLobby({
  players,
  maxPlayers,
  isConnected,
  promptText,
  countdownActive,
  raceActive,
  onReady,
  onLeave,
  onCommand,
  raceTimer
}: MultiplayerLobbyProps) {
  const [command, setCommand] = useState("");
  const { toast } = useToast();
  
  const handleCommandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommand(e.target.value);
  };
  
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (command.trim()) {
      onCommand(command.trim());
      setCommand("");
    }
  };

  return (
    <div className="w-full">
      <div className="bg-dark minecraft-border p-4 mb-4">
        <h2 className="font-minecraft text-center text-xl text-white mb-4">
          MULTIPLAYER RACE
        </h2>
        
        <p className="text-center text-blue-400 mb-4">
          {raceActive ? "Race in progress!" :
           countdownActive ? "Countdown active!" :
           raceTimer ? `Race starting in ${raceTimer}s...` :
           isConnected ? `Waiting for players (${players.length}/${maxPlayers})` :
           "Connecting to server..."}
        </p>
        
        <div className="bg-black/40 p-2 minecraft-border mb-4">
          <h3 className="font-minecraft text-yellow-500 mb-2">PLAYERS ({players.length}/{maxPlayers})</h3>
          
          {Array.from({ length: maxPlayers }).map((_, index) => {
            const player = players[index];
            
            return (
              <div 
                key={index} 
                className="bg-black/60 p-2 mb-1"
              >
                {player ? (
                  <div className="flex justify-between">
                    <span className={player.isNPC ? 'text-gray-400' : 'text-green-400'}>
                      {player.isNPC ? `[CPU] ${player.username} (${player.difficulty})` : player.username}
                    </span>
                    <span className="text-xs opacity-70">
                      {player.status === 'ready' ? '(Ready)' : '(Waiting)'}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">Waiting for player...</span>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Command input */}
        <form onSubmit={handleCommandSubmit} className="mb-4">
          <div className="flex">
            <input
              type="text"
              value={command}
              onChange={handleCommandChange}
              placeholder="Type /ready to start racing"
              className="flex-grow px-3 py-2 rounded-l bg-black/30 border border-primary text-white font-mono"
            />
            <PixelButton type="submit" className="rounded-l-none">
              SEND
            </PixelButton>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <span className="mr-2"><span className="text-primary">/ready</span> → claim a slot</span>
            <span className="mr-2"><span className="text-primary">/summon npc_peaceful</span> → add peaceful NPC</span>
          </div>
        </form>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <PixelButton onClick={() => onCommand("/ready")} size="sm">
            JOIN RACE
          </PixelButton>
          <PixelButton onClick={() => onCommand("/summon npc_peaceful")} size="sm" variant="secondary">
            ADD ROOKIE
          </PixelButton>
          <PixelButton onClick={() => onCommand("/summon npc_easy")} size="sm" variant="secondary">
            ADD EASY
          </PixelButton>
          <PixelButton onClick={() => onCommand("/summon npc_normal")} size="sm" variant="secondary">
            ADD NORMAL
          </PixelButton>
          <PixelButton onClick={() => onCommand("/summon npc_hard")} size="sm" variant="destructive">
            ADD HARD
          </PixelButton>
          <PixelButton onClick={() => onCommand("/summon npc_insane")} size="sm" variant="destructive">
            ADD INSANE
          </PixelButton>
        </div>
        
        {raceTimer !== null && (
          <div className="text-center mb-4">
            <PixelButton 
              onClick={() => {
                // Keep it simple with just the start_race command
                onCommand("start_race");
                
                // Also notify the user that we're trying to start
                console.log("START NOW button clicked, sending start_race command");
              }} 
              variant="destructive"
            >
              START NOW
            </PixelButton>
          </div>
        )}
        
        <div className="text-center">
          <PixelButton 
            onClick={onLeave}
            variant="destructive"
          >
            LEAVE RACE
          </PixelButton>
        </div>
      </div>
    </div>
  );
}