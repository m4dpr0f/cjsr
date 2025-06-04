import * as React from "react";
import { cn } from "@/lib/utils";

interface PixelCardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PixelCard({ className, ...props }: PixelCardProps) {
  return (
    <div
      className={cn(
        "minecraft-border bg-[#2F2F2F]/80 text-white p-4 rounded",
        className
      )}
      {...props}
    />
  );
}