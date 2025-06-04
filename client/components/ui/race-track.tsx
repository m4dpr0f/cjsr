import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChickenAvatar } from "./chicken-avatar";
import { ProgressBar } from "./progress-bar";
import { getRaceBackground } from "@/assets/race-backgrounds";

export interface Player {
  id: string;
  username: string;
  progress: number;
  chickenType: string;
  jockeyType: string;
  color: string;
  isCurrentPlayer: boolean;
}

interface RaceTrackProps {
  players: Player[];
  raceFinished: boolean;
  backgroundType: string;
}

export function RaceTrack({ 
  players, 
  raceFinished,
  backgroundType
}: RaceTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  
  // Sort players by progress for display (higher progress first)
  const sortedPlayers = [...players].sort((a, b) => b.progress - a.progress);
  
  // Create a fixed array of 8 lanes for all potential racers
  const MAX_LANES = 8;
  const lanes = Array(MAX_LANES).fill(null);
  
  // Calculate optimal spacing for player lanes based on player count
  const activePlayers = sortedPlayers.filter(p => p !== null);
  const activePlayerCount = activePlayers.length;
  
  // If we have players, distribute them evenly across available lanes
  if (activePlayerCount > 0) {
    // Get player IDs to ensure we don't put players with the same ID in the same lane
    const playerIds = activePlayers.map(p => p.id);
    
    // Distribute lanes evenly with increased spacing between players
    if (activePlayerCount <= 4) {
      // For 1-4 players, use every other lane
      activePlayers.forEach((player, idx) => {
        const lanePosition = idx * 2; // Skip every other lane
        if (lanePosition < MAX_LANES) {
          lanes[lanePosition] = player;
        }
      });
    } else {
      // For 5-8 players, calculate spacing to distribute evenly
      const spacing = Math.max(1, Math.floor(MAX_LANES / activePlayerCount));
      
      // Ensure the current player (if present) gets their own lane
      const currentPlayerIndex = activePlayers.findIndex(p => p.isCurrentPlayer);
      if (currentPlayerIndex !== -1) {
        // Place current player in the middle lane
        const middleLane = Math.floor(MAX_LANES / 2);
        lanes[middleLane] = activePlayers[currentPlayerIndex];
        
        // Remove current player from the array to place others
        const remainingPlayers = [...activePlayers];
        remainingPlayers.splice(currentPlayerIndex, 1);
        
        // Place remaining players in other lanes
        let laneIndex = 0;
        remainingPlayers.forEach((player) => {
          // Skip the middle lane where current player is
          if (laneIndex === middleLane) laneIndex++;
          
          // Make sure we don't exceed lane count
          if (laneIndex < MAX_LANES) {
            lanes[laneIndex] = player;
            laneIndex += spacing;
          }
        });
      } else {
        // No current player, just space them evenly
        activePlayers.forEach((player, idx) => {
          const lanePosition = idx * spacing;
          if (lanePosition < MAX_LANES) {
            lanes[lanePosition] = player;
          }
        });
      }
    }
  }

  return (
    <div className="bg-dark p-4 pixel-border relative">
      <h2 className="font-pixel text-sm text-secondary mb-4">RACE TRACK</h2>
      
      {/* Race track background with lanes */}
      <div 
        ref={trackRef}
        className="h-64 bg-dark relative overflow-hidden"
        style={{
          backgroundImage: `url(${getRaceBackground(backgroundType)})`,
          backgroundSize: "cover"
        }}
      >
        {/* Race lanes - always show 8 lanes with added top padding */}
        <div className="absolute inset-0 flex flex-col pt-10 space-y-2">
          {lanes.map((player, index) => (
            <div 
              key={`lane-${index}`}
              className={cn(
                "flex-1 relative",
                index < MAX_LANES - 1 && "border-b-2 border-dashed border-primary/50"
              )}
            >
              {player ? (
                // Show player and chicken in the lane
                <div 
                  className="absolute top-1/2 transform -translate-y-1/2 transition-all duration-500"
                  style={{ 
                    left: `${Math.min(player.progress * 0.8, 80)}%`
                  }}
                >
                  <ChickenAvatar 
                    chickenType={player.chickenType || "racer01"}
                    jockeyType={player.jockeyType || "combined"}
                    size="md"
                    animation={raceFinished ? "idle" : "run"}
                  />
                  <div 
                    className="text-xs font-pixel text-center mt-1 bg-dark/70 px-1"
                    style={{ color: player.color }}
                  >
                    {player.isCurrentPlayer ? "YOU" : player.username}
                  </div>
                </div>
              ) : (
                // Empty lane - show a placeholder text
                <div className="absolute top-1/2 transform -translate-y-1/2 left-4">
                  <span className="text-xs text-gray-500 italic font-pixel">Waiting for player...</span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Finish line */}
        <div className="absolute top-0 bottom-0 right-10 w-10 bg-white/20 backdrop-filter backdrop-blur-sm flex items-center justify-center">
          <div className="font-pixel text-xl text-dark rotate-90">FINISH</div>
        </div>
      </div>
      
      {/* Race progress indicators */}
      <div className="mt-4 space-y-2">
        {sortedPlayers.map((player) => (
          <div key={player.id}>
            <div className="flex justify-between text-xs mb-1">
              <span 
                className="font-bold"
                style={{ color: player.color }}
              >
                {player.isCurrentPlayer ? "YOU" : player.username}
              </span>
              <span>{Math.round(player.progress)}%</span>
            </div>
            <ProgressBar 
              progress={player.progress} 
              color={player.color}
            />
          </div>
        ))}
      </div>
    </div>
  );
}