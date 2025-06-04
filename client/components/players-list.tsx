import { Badge } from "@/components/ui/badge";

interface Player {
  id: string;
  username: string;
  level: number;
  status: "waiting" | "ready" | "typing" | "finished";
  isCurrentPlayer: boolean;
}

interface PlayersListProps {
  players: Player[];
  maxPlayers: number;
}

export function PlayersList({ players, maxPlayers }: PlayersListProps) {
  // Create empty slots to fill up to max players
  const emptySlots = Array(Math.max(0, maxPlayers - players.length))
    .fill(null)
    .map((_, i) => i);

  return (
    <div className="border border-[#3A2E27] bg-black/40 rounded p-2">
      <h3 className="text-sm font-bold mb-2 text-yellow-400">PLAYERS ({players.length}/{maxPlayers})</h3>
      
      <div className="space-y-2">
        {players.map((player) => (
          <div 
            key={player.id}
            className={`flex items-center justify-between p-2 rounded ${
              player.isCurrentPlayer ? "bg-yellow-900/30 border border-yellow-600" : "bg-black/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-xs">
                {player.level}
              </div>
              <span className={player.isCurrentPlayer ? "font-bold text-yellow-400" : ""}>
                {player.username}
                {player.isCurrentPlayer && " (You)"}
              </span>
            </div>
            
            <StatusBadge status={player.status} />
          </div>
        ))}
        
        {/* Empty slots */}
        {emptySlots.map((i) => (
          <div key={`empty-${i}`} className="flex items-center justify-between p-2 rounded bg-black/20 text-gray-500 italic">
            <span>Waiting for player...</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "waiting":
      return <Badge variant="outline" className="bg-gray-800 text-gray-300">Waiting</Badge>;
    case "ready":
      return <Badge variant="outline" className="bg-yellow-800 text-yellow-300">Ready</Badge>;
    case "typing":
      return <Badge variant="outline" className="bg-green-800 text-green-300">Racing</Badge>;
    case "finished":
      return <Badge variant="outline" className="bg-blue-800 text-blue-300">Finished</Badge>;
    default:
      return null;
  }
}