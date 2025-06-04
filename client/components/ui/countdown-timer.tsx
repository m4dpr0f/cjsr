import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  value: number;
  className?: string;
}

export function CountdownTimer({ value, className }: CountdownTimerProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center",
        className
      )}
    >
      <div className="font-minecraft text-6xl mb-2">
        {value}
      </div>
      <p className="text-sm text-yellow-400">
        GET READY TO RACE!
      </p>
    </div>
  );
}