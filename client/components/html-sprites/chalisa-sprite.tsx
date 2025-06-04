import React from "react";
import { cn } from "@/lib/utils";

export interface ChalisaSpriteProps {
  size?: "xs" | "sm" | "md" | "lg";
  animation?: "idle" | "run" | "jump" | "attack" | "none";
  direction?: "left" | "right";
  pixelSize?: number;
  showName?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Chalisa colors - based on the artwork, she has golden/cream coloring with darker accents
const chalisaColors = {
  body: "#F4E4BC", // Cream/light golden
  accent: "#E6D3A3", // Slightly darker cream
  wing: "#D4AF37", // Golden
  beak: "#FF8C00", // Orange
  legs: "#CD853F", // Peru/tan
  eyes: "#8B4513", // Saddle brown
};

export function ChalisaSprite({
  size = "md",
  animation = "idle",
  direction = "right",
  pixelSize = 2,
  showName = false,
  name = "Chalisa",
  className,
  style,
}: ChalisaSpriteProps) {
  const isFlipped = direction === "left";
  
  // Animation classes
  const animationClass = animation === "run" ? "animate-bounce" : "";
  
  // Size scaling - same as chocobo
  const sizeScale = {
    xs: 0.1,
    sm: 0.13,
    md: 0.17,
    lg: 0.52,
  }[size];
  
  const baseSize = pixelSize;
  const scale = baseSize * sizeScale;
  
  return (
    <div
      className={cn("relative inline-block", animationClass, className)}
      style={{
        transform: `scale(${scale}) ${isFlipped ? "scaleX(-1)" : ""}`,
        ...style,
      }}
    >
      {/* Chalisa Head - more oval and bird-like */}
      <div
        className="absolute border-2"
        style={{
          width: "12px",
          height: "10px",
          backgroundColor: chalisaColors.body,
          borderColor: chalisaColors.accent,
          top: "0px",
          left: "20px",
        }}
      />

      {/* Head feathers/crest */}
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "4px",
          backgroundColor: chalisaColors.wing,
          borderColor: chalisaColors.accent,
          top: "-2px",
          left: "22px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "6px",
          backgroundColor: chalisaColors.wing,
          borderColor: chalisaColors.accent,
          top: "-3px",
          left: "25px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "4px",
          backgroundColor: chalisaColors.wing,
          borderColor: chalisaColors.accent,
          top: "-2px",
          left: "28px",
        }}
      />

      {/* Eyes */}
      <div
        className="absolute"
        style={{
          width: "2px",
          height: "2px",
          backgroundColor: chalisaColors.eyes,
          top: "3px",
          left: "26px",
        }}
      />

      {/* Beak */}
      <div
        className="absolute border"
        style={{
          width: "4px",
          height: "3px",
          backgroundColor: chalisaColors.beak,
          borderColor: "#D97706",
          top: "6px",
          left: "32px",
        }}
      />

      {/* Long Neck */}
      <div
        className="absolute border-2"
        style={{
          width: "6px",
          height: "12px",
          backgroundColor: chalisaColors.body,
          borderColor: chalisaColors.accent,
          top: "8px",
          left: "18px",
        }}
      />

      {/* Main Body - large oval */}
      <div
        className="absolute border-2"
        style={{
          width: "20px",
          height: "16px",
          backgroundColor: chalisaColors.body,
          borderColor: chalisaColors.accent,
          top: "16px",
          left: "4px",
        }}
      />

      {/* Wing feathers on body */}
      <div
        className="absolute border"
        style={{
          width: "12px",
          height: "8px",
          backgroundColor: chalisaColors.wing,
          borderColor: chalisaColors.accent,
          top: "18px",
          left: "6px",
        }}
      />

      {/* Tail feathers - multiple layers */}
      <div
        className="absolute border"
        style={{
          width: "3px",
          height: "10px",
          backgroundColor: chalisaColors.wing,
          borderColor: chalisaColors.accent,
          top: "20px",
          left: "-2px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "3px",
          height: "12px",
          backgroundColor: chalisaColors.wing,
          borderColor: chalisaColors.accent,
          top: "18px",
          left: "0px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "3px",
          height: "8px",
          backgroundColor: chalisaColors.wing,
          borderColor: chalisaColors.accent,
          top: "22px",
          left: "2px",
        }}
      />

      {/* Long Chalisa Legs */}
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "22px",
          backgroundColor: chalisaColors.legs,
          borderColor: "#D97706",
          top: "32px",
          left: "10px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "22px",
          backgroundColor: chalisaColors.legs,
          borderColor: "#D97706",
          top: "32px",
          left: "16px",
        }}
      />

      {/* Chalisa Feet - three-toed */}
      <div
        className="absolute border"
        style={{
          width: "6px",
          height: "2px",
          backgroundColor: chalisaColors.legs,
          borderColor: "#D97706",
          top: "54px",
          left: "8px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "6px",
          height: "2px",
          backgroundColor: chalisaColors.legs,
          borderColor: "#D97706",
          top: "54px",
          left: "14px",
        }}
      />

      {showName && name && (
        <div className="text-xs font-minecraft mt-1 text-center bg-black/50 px-1 rounded text-white">
          {name}
        </div>
      )}
    </div>
  );
}