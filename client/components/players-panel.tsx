import { PlayerCard } from "@/components/ui/player-card";

export interface RacePlayer {
  id: string;
  username: string;
  level: number;
  wpm: number;
  status: "waiting" | "ready" | "typing" | "finished";
  isCurrentPlayer: boolean;
  isNPC?: boolean;
}

interface PlayersPanelProps {
  players: RacePlayer[];
  maxPlayers: number;
}

export function PlayersPanel({ 
  players,
  maxPlayers
}: PlayersPanelProps) {
  return (
    <div className="minecraft-border p-4 bg-black/40">
      <h2 className="font-minecraft text-sm text-yellow-400 mb-4">
        RACER QUEUE ({players.length}/{maxPlayers})
      </h2>
      <div className="space-y-2">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            username={player.username}
            level={player.level}
            wpm={player.wpm}
            status={player.status}
            isCurrentPlayer={player.isCurrentPlayer}
            isNPC={player.isNPC}
          />
        ))}
        
        {/* Empty slots */}
        {Array(Math.max(0, maxPlayers - players.length))
          .fill(null)
          .map((_, i) => (
            <div 
              key={`empty-${i}`} 
              className="flex items-center p-2 rounded bg-black/20 text-gray-500 italic border border-[#3A2E27]/50"
            >
              <span>Waiting for player...</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}
