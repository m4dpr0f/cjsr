import { cn } from "@/lib/utils";

interface PlayerCardProps {
  username: string;
  level: number;
  wpm: number;
  status: "waiting" | "ready" | "typing" | "finished";
  isCurrentPlayer?: boolean;
  isNPC?: boolean;
  className?: string;
}

export function PlayerCard({
  username,
  level,
  wpm,
  status,
  isCurrentPlayer = false,
  isNPC = false,
  className,
}: PlayerCardProps) {
  const statusColorMap = {
    waiting: "text-gray-400",
    ready: "text-yellow-400",
    typing: "text-green-400",
    finished: "text-blue-400"
  };
  
  const statusTextMap = {
    waiting: "Waiting...",
    ready: "Ready",
    typing: "Racing...",
    finished: "Finished!"
  };

  // Format the username to show NPC label for AI players
  const displayName = isNPC 
    ? `[CPU] ${username}` 
    : isCurrentPlayer 
      ? `${username} (YOU)` 
      : username;

  // Use different styling for NPCs vs human players
  const playerStyle = isCurrentPlayer 
    ? "bg-yellow-900/30 border border-yellow-600" 
    : isNPC 
      ? "bg-purple-900/20 border border-purple-800/50" 
      : "bg-black/30 border border-[#3A2E27]";

  const nameStyle = isCurrentPlayer 
    ? "text-yellow-400" 
    : isNPC 
      ? "text-purple-300" 
      : "text-white";

  return (
    <div className={cn(
      "flex items-center p-2 rounded", 
      playerStyle,
      className
    )}>
      <div className="w-8 h-8 bg-gray-800 mr-2 flex items-center justify-center rounded-sm">
        <span className="text-white font-minecraft text-xs">{level}</span>
      </div>
      <div className="flex-grow">
        <div className={cn(
          "font-bold",
          nameStyle
        )}>
          {displayName}
        </div>
        <div className="text-xs text-gray-400">{wpm > 0 ? `${wpm} WPM` : "No races yet"}</div>
      </div>
      <div className={cn(
        "text-xs font-bold px-2 py-1 rounded-sm bg-black/50",
        statusColorMap[status]
      )}>
        {statusTextMap[status]}
      </div>
    </div>
  );
}
