import React from "react";
import { cn } from "@/lib/utils";

export interface ChocoboSpriteProps {
  variant: string;
  colorScheme: string;
  size?: "xs" | "sm" | "md" | "lg";
  animation?: "idle" | "run" | "jump" | "attack" | "none";
  direction?: "left" | "right";
  pixelSize?: number;
  showName?: boolean;
  name?: string;
  className?: string;
  style?: React.CSSProperties;
}

// Chocobo color schemes
const getChocoboColors = (colorScheme: string) => {
  switch (colorScheme.toLowerCase()) {
    case "blue":
    case "darkblue":
      return {
        body: "#1E3A8A", // Dark blue
        accent: "#3B82F6", // Lighter blue
        wing: "#1D4ED8", // Medium blue
        beak: "#F59E0B", // Orange
        legs: "#EA580C", // Orange-red
        eyes: "#10B981", // Mako green
      };
    case "red":
      return {
        body: "#DC2626", // Red
        accent: "#EF4444", // Lighter red
        wing: "#B91C1C", // Darker red
        beak: "#F59E0B", // Orange
        legs: "#EA580C", // Orange-red
        eyes: "#10B981", // Mako green
      };
    case "silver":
      return {
        body: "#6B7280", // Gray
        accent: "#9CA3AF", // Lighter gray
        wing: "#4B5563", // Darker gray
        beak: "#F59E0B", // Orange
        legs: "#EA580C", // Orange-red
        eyes: "#10B981", // Mako green
      };
    case "black":
      return {
        body: "#1F2937", // Dark gray/black
        accent: "#374151", // Lighter black
        wing: "#111827", // True black
        beak: "#F59E0B", // Orange
        legs: "#EA580C", // Orange-red
        eyes: "#10B981", // Mako green
      };
    default:
      return {
        body: "#FCD34D", // Golden yellow
        accent: "#FEF3C7", // Light yellow
        wing: "#F59E0B", // Orange-yellow
        beak: "#F59E0B", // Orange
        legs: "#EA580C", // Orange-red
        eyes: "#10B981", // Mako green
      };
  }
};

export function ChocoboSprite({
  variant,
  colorScheme,
  size = "md",
  animation = "idle",
  direction = "right",
  pixelSize = 2,
  showName = false,
  name,
  className,
  style,
}: ChocoboSpriteProps) {
  const colors = getChocoboColors(colorScheme);
  const isFlipped = direction === "left";

  // Animation classes
  const animationClass = animation === "run" ? "animate-bounce" : "";

  // Size scaling - made 33% smaller
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
      {/* Chocobo Head - more oval and bird-like */}
      <div
        className="absolute border-2"
        style={{
          width: "12px",
          height: "10px",
          backgroundColor: colors.body,
          borderColor: colors.accent,
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
          backgroundColor: colors.wing,
          borderColor: colors.accent,
          top: "-2px",
          left: "22px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "6px",
          backgroundColor: colors.wing,
          borderColor: colors.accent,
          top: "-3px",
          left: "25px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "4px",
          backgroundColor: colors.wing,
          borderColor: colors.accent,
          top: "-2px",
          left: "28px",
        }}
      />

      {/* Mako Eyes */}
      <div
        className="absolute"
        style={{
          width: "2px",
          height: "2px",
          backgroundColor: colors.eyes,
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
          backgroundColor: colors.beak,
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
          backgroundColor: colors.body,
          borderColor: colors.accent,
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
          backgroundColor: colors.body,
          borderColor: colors.accent,
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
          backgroundColor: colors.wing,
          borderColor: colors.accent,
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
          backgroundColor: colors.wing,
          borderColor: colors.accent,
          top: "20px",
          left: "-2px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "3px",
          height: "12px",
          backgroundColor: colors.wing,
          borderColor: colors.accent,
          top: "18px",
          left: "0px",
        }}
      />
      <div
        className="absolute border"
        style={{
          width: "3px",
          height: "8px",
          backgroundColor: colors.wing,
          borderColor: colors.accent,
          top: "22px",
          left: "2px",
        }}
      />

      {/* Long Chocobo Legs - much longer and thinner */}
      <div
        className="absolute border"
        style={{
          width: "2px",
          height: "22px",
          backgroundColor: colors.legs,
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
          backgroundColor: colors.legs,
          borderColor: "#D97706",
          top: "32px",
          left: "16px",
        }}
      />

      {/* Chocobo Feet - three-toed */}
      <div
        className="absolute border"
        style={{
          width: "6px",
          height: "2px",
          backgroundColor: colors.legs,
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
          backgroundColor: colors.legs,
          borderColor: "#D97706",
          top: "54px",
          left: "14px",
        }}
      />

      {/* Three toes on each foot */}
      <div
        className="absolute"
        style={{
          width: "1px",
          height: "2px",
          backgroundColor: colors.legs,
          top: "56px",
          left: "8px",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "1px",
          height: "2px",
          backgroundColor: colors.legs,
          top: "56px",
          left: "10px",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "1px",
          height: "2px",
          backgroundColor: colors.legs,
          top: "56px",
          left: "12px",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "1px",
          height: "2px",
          backgroundColor: colors.legs,
          top: "56px",
          left: "16px",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "1px",
          height: "2px",
          backgroundColor: colors.legs,
          top: "56px",
          left: "18px",
        }}
      />
      <div
        className="absolute"
        style={{
          width: "1px",
          height: "2px",
          backgroundColor: colors.legs,
          top: "56px",
          left: "20px",
        }}
      />

      {/* Name display */}
      {showName && name && (
        <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-xs font-pixel text-white bg-black/50 px-1 rounded whitespace-nowrap">
          {name}
        </div>
      )}
    </div>
  );
}
