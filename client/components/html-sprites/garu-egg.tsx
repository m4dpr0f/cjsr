import React from 'react';
import { cn } from '@/lib/utils';

interface GaruEggProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * HTML/CSS-based Garu Egg sprite component
 * 
 * This component renders a Garu Egg using HTML and CSS only, no external images.
 * Each egg type has its own unique appearance and color scheme.
 */
export const GaruEgg: React.FC<GaruEggProps> = ({ 
  type = 'flameheart',
  size = 'md',
  className 
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'w-10 h-12',
    md: 'w-16 h-20',
    lg: 'w-24 h-28',
  };

  // Main egg shape (oval)
  const baseEggClasses = cn(
    'relative rounded-[50%] transform rotate-[20deg] overflow-hidden border',
    sizeClasses[size],
    className
  );

  // Get egg style based on type
  const getEggStyle = () => {
    switch (type) {
      case 'flameheart':
        return {
          baseColor: 'bg-orange-500',
          borderColor: 'border-orange-700',
          patternClasses: 'after:bg-orange-300 after:rotate-[30deg] after:skew-x-12 after:opacity-70',
          highlightClasses: 'before:bg-yellow-300 before:opacity-60 before:rounded-full before:blur-sm'
        };
      case 'aquafrost':
        return {
          baseColor: 'bg-cyan-500',
          borderColor: 'border-cyan-700',
          patternClasses: 'after:bg-cyan-300 after:rotate-[45deg] after:opacity-60',
          highlightClasses: 'before:bg-blue-200 before:opacity-70 before:rounded-full before:blur-sm'
        };
      case 'terraverde':
        return {
          baseColor: 'bg-lime-700',
          borderColor: 'border-green-900',
          patternClasses: 'after:bg-lime-500 after:rotate-[60deg] after:opacity-70',
          highlightClasses: 'before:bg-lime-300 before:opacity-50 before:rounded-full before:blur-sm'
        };
      case 'skywisp':
        return {
          baseColor: 'bg-gray-300',
          borderColor: 'border-gray-400',
          patternClasses: 'after:bg-white after:rotate-[15deg] after:opacity-70',
          highlightClasses: 'before:bg-white before:opacity-70 before:rounded-full before:blur-sm'
        };
      case 'stonehide':
        return {
          baseColor: 'bg-gray-500',
          borderColor: 'border-gray-700',
          patternClasses: 'after:bg-gray-400 after:rotate-[45deg] after:opacity-60',
          highlightClasses: 'before:bg-gray-300 before:opacity-50 before:rounded-full before:blur-sm'
        };
      case 'leafshade':
        return {
          baseColor: 'bg-green-500',
          borderColor: 'border-green-700',
          patternClasses: 'after:bg-green-400 after:rotate-[30deg] after:skew-x-12 after:opacity-70',
          highlightClasses: 'before:bg-lime-300 before:opacity-60 before:rounded-full before:blur-sm'
        };
      case 'sunglow':
        return {
          baseColor: 'bg-yellow-500',
          borderColor: 'border-yellow-600',
          patternClasses: 'after:bg-yellow-300 after:rotate-[30deg] after:opacity-60',
          highlightClasses: 'before:bg-yellow-200 before:opacity-70 before:rounded-full before:blur-sm'
        };
      case 'voidmyst':
        return {
          baseColor: 'bg-purple-900',
          borderColor: 'border-purple-950',
          patternClasses: 'after:bg-purple-700 after:rotate-[45deg] after:opacity-50',
          highlightClasses: 'before:bg-purple-500 before:opacity-30 before:rounded-full before:blur-sm'
        };
      case 'naturevine':
        return {
          baseColor: 'bg-lime-500',
          borderColor: 'border-lime-700',
          patternClasses: 'after:bg-lime-400 after:rotate-[60deg] after:opacity-60',
          highlightClasses: 'before:bg-lime-300 before:opacity-60 before:rounded-full before:blur-sm'
        };
      case 'ironclad':
        return {
          baseColor: 'bg-slate-600',
          borderColor: 'border-slate-800',
          patternClasses: 'after:bg-slate-500 after:rotate-[30deg] after:opacity-60',
          highlightClasses: 'before:bg-slate-400 before:opacity-40 before:rounded-full before:blur-sm'
        };
      case 'shadowrift':
        return {
          baseColor: 'bg-purple-700',
          borderColor: 'border-purple-900',
          patternClasses: 'after:bg-purple-500 after:rotate-[135deg] after:opacity-50',
          highlightClasses: 'before:bg-purple-400 before:opacity-30 before:rounded-full before:blur-sm'
        };
      case 'ethereal':
        return {
          baseColor: 'bg-indigo-300',
          borderColor: 'border-indigo-400',
          patternClasses: 'after:bg-pink-200 after:rotate-[30deg] after:opacity-50',
          highlightClasses: 'before:bg-blue-200 before:opacity-60 before:rounded-full before:blur-sm'
        };
      default:
        return {
          baseColor: 'bg-gray-400',
          borderColor: 'border-gray-600',
          patternClasses: 'after:bg-gray-300 after:rotate-[30deg] after:opacity-60',
          highlightClasses: 'before:bg-white before:opacity-50 before:rounded-full before:blur-sm'
        };
    }
  };

  const eggStyle = getEggStyle();

  return (
    <div 
      className={cn(
        baseEggClasses,
        eggStyle.baseColor,
        eggStyle.borderColor,
        'before:content-[""] before:absolute before:w-1/2 before:h-1/2 before:top-1/4 before:left-1/4 before:transform before:rotate-[30deg]',
        eggStyle.highlightClasses,
        'after:content-[""] after:absolute after:w-full after:h-2/3 after:bottom-0 after:left-0 after:transform',
        eggStyle.patternClasses
      )}
    />
  );
};

export default GaruEgg;