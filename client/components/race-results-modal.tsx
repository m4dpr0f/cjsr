import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PixelButton } from "@/components/ui/pixel-button";

export interface RaceResult {
  id: string;
  username: string;
  position: number;
  wpm: number;
  accuracy: number;
  isCurrentPlayer: boolean;
  xpGained: number;
}

interface RaceResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: RaceResult[];
  onRaceAgain: () => void;
  onLeave: () => void;
}

export function RaceResultsModal({
  isOpen,
  onClose,
  results,
  onRaceAgain,
  onLeave
}: RaceResultsModalProps) {
  // Sort results by position
  const sortedResults = [...results].sort((a, b) => a.position - b.position);
  
  // Get position styling
  const getPositionStyle = (position: number) => {
    if (position === 1) return "bg-primary";
    if (position === 2) return "bg-secondary";
    if (position === 3) return "bg-accent";
    return "bg-dark border border-light";
  };
  
  const getPositionTextStyle = (position: number) => {
    if (position > 3) return "text-light";
    return "text-dark";
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-dark p-8 pixel-border max-w-md text-light border-0 sm:rounded-0">
        <h2 className="font-pixel text-2xl text-primary mb-6 text-center">RACE RESULTS</h2>
        
        <div className="space-y-4 mb-6">
          {sortedResults.map((result) => (
            <div key={result.id} className="flex items-center">
              <div className={`w-6 h-6 rounded-full ${getPositionStyle(result.position)} flex items-center justify-center font-pixel ${getPositionTextStyle(result.position)} mr-3`}>
                {result.position}
              </div>
              <div className="flex-grow">
                <div className={result.isCurrentPlayer ? "text-primary font-bold" : "text-light font-bold"}>
                  {result.isCurrentPlayer ? "YOU" : result.username}
                </div>
                <div className="text-xs text-light/70">
                  {result.wpm} WPM / {result.accuracy}% accuracy
                </div>
              </div>
              <div className="text-primary font-pixel">+{result.xpGained} XP</div>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <PixelButton 
            className="flex-1" 
            variant="primary"
            onClick={onRaceAgain}
          >
            RACE AGAIN
          </PixelButton>
          <PixelButton 
            className="flex-1" 
            variant="outlined"
            onClick={onLeave}
          >
            LEAVE
          </PixelButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
