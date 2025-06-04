import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  color?: string;
  className?: string;
  showBackground?: boolean;
}

export function ProgressBar({ 
  progress, 
  color = "#F9BE2A", 
  className,
  showBackground = true
}: ProgressBarProps) {
  return (
    <div 
      className={cn(
        "progress-track w-full",
        className
      )}
    >
      <div 
        className="h-full" 
        style={{ 
          width: `${Math.min(progress, 100)}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
}
