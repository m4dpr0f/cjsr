import { ProgressBar } from "@/components/ui/progress-bar";

interface PlayerStatsProps {
  level: number;
  xpProgress: number;
  racesWon: number;
  avgWpm: number;
  accuracy: number;
  promptsAdded: number;
}

export function PlayerStats({
  level,
  xpProgress,
  racesWon,
  avgWpm,
  accuracy,
  promptsAdded
}: PlayerStatsProps) {
  return (
    <div className="bg-dark p-4 pixel-border">
      <h2 className="font-pixel text-sm text-secondary mb-4">YOUR STATS</h2>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between">
            <span className="text-primary">Level:</span>
            <span className="font-bold">{level}</span>
          </div>
          <div className="h-2 bg-dark border border-primary mt-1">
            <div 
              className="h-full bg-secondary" 
              style={{ width: `${xpProgress}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-primary">Races Won:</span>
          <span className="font-bold">{racesWon}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary">Avg. WPM:</span>
          <span className="font-bold">{avgWpm}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary">Accuracy:</span>
          <span className="font-bold">{accuracy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-primary">Prompts Added:</span>
          <span className="font-bold">{promptsAdded}</span>
        </div>
      </div>
    </div>
  );
}
