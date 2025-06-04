import React from 'react';
import { BaseSprite, PixelBlock } from './base-sprite';
import { cn } from '@/lib/utils';

// Specific props for jockey sprites
export interface JockeySpriteProps {
  character: 'matikah' | 'death' | 'auto' | 'iam' | 'steve' | 'teacherGuru' | 'zombie' | 'generic' | 'custom';
  skinColor?: string; // For custom characters
  hairColor?: string; // For custom characters
  outfitColor?: string; // For custom characters
  accessory?: 'none' | 'sword' | 'hat' | 'cape' | 'glasses' | 'shield' | 'scroll' | 'bow' | 'staff';
  accessoryColor?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  animation?: 'idle' | 'run' | 'jump' | 'attack' | 'none';
  direction?: 'left' | 'right';
  pixelSize?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  equipment?: string[]; // Equipment items the jockey is wearing
  name?: string;
  showName?: boolean;
}

// Generate jockey blocks based on character and props
function generateJockeyBlocks(props: JockeySpriteProps): PixelBlock[] {
  const { 
    character, 
    skinColor = '#FFA726', 
    hairColor = '#5D4037',
    outfitColor = '#1976D2',
    accessory, 
    accessoryColor = '#FFC107',
    equipment 
  } = props;
  
  // Start with an empty blocks array
  let blocks: PixelBlock[] = [];
  
  // Define character-specific blocks - profile view facing right
  switch(character) {
    case 'teacherGuru': // Special Teacher Guru character
      blocks = [
        // Head - profile view with wise, aged appearance
        { x: 12, y: 1, color: '#EFEBE9', size: 3, layer: 1 }, // Head base - elderly complexion
        
        // Facial features - wise appearance
        { x: 14, y: 1, color: '#3E2723', size: 1, layer: 2 }, // Eye
        { x: 13, y: 3, color: '#5D4037', size: 2, layer: 2 }, // Mouth
        
        // Beard - sage-like white beard
        { x: 14, y: 4, color: '#ECEFF1', size: 2, layer: 2 },
        { x: 13, y: 5, color: '#ECEFF1', size: 3, layer: 2 },
        
        // Wisdom robes - sage green/brown
        { x: 11, y: 4, color: '#689F38', size: 3, layer: 1 }, // Upper robe
        { x: 10, y: 5, color: '#689F38', size: 4, layer: 1 }, // Middle robe
        { x: 9, y: 6, color: '#689F38', size: 6, layer: 1 }, // Lower robe
        { x: 8, y: 7, color: '#689F38', size: 7, layer: 1 }, // Bottom robe
        
        // Robe details - decorative border
        { x: 11, y: 5, color: '#FFC107', size: 1, layer: 2 },
        { x: 10, y: 6, color: '#FFC107', size: 1, layer: 2 },
        { x: 14, y: 6, color: '#FFC107', size: 1, layer: 2 },
        
        // Arm holding scroll
        { x: 7, y: 6, color: '#EFEBE9', size: 2, layer: 1 }, // Hand
        
        // Legs - barely visible under robe
        { x: 9, y: 8, color: '#5D4037', size: 2, layer: 1 },
        { x: 12, y: 8, color: '#5D4037', size: 2, layer: 1 }
      ];
      
      // Add the scroll accessory by default
      blocks.push(
        { x: 6, y: 6, color: '#F5F5F5', size: 1, layer: 2 }, // Scroll top
        { x: 5, y: 7, color: '#F5F5F5', size: 2, layer: 2 }, // Scroll middle
        { x: 6, y: 8, color: '#F5F5F5', size: 1, layer: 2 }  // Scroll bottom
      );
      break;
      
    case 'matikah': // Updated Matikah based on reference image
      blocks = [
        // Head - profile view with darker skin tone
        { x: 12, y: 1, color: '#8D5524', size: 3, layer: 1 }, // Head base
        
        // Facial features - profile view
        { x: 14, y: 1, color: '#3E2723', size: 1, layer: 2 }, // Eye
        { x: 13, y: 3, color: '#5D4037', size: 2, layer: 2 }, // Mouth
        
        // Colorful feathered headdress - profile view
        { x: 10, y: 0, color: '#00BCD4', size: 1, layer: 2 }, // Teal feather
        { x: 11, y: -1, color: '#009688', size: 1, layer: 2 }, // Green feather
        { x: 12, y: -2, color: '#FF5722', size: 1, layer: 2 }, // Orange feather
        { x: 13, y: -1, color: '#009688', size: 1, layer: 2 }, // Green feather
        { x: 14, y: 0, color: '#00BCD4', size: 1, layer: 2 }, // Teal feather
        { x: 15, y: -1, color: '#FF5722', size: 1, layer: 2 }, // Orange feather
        
        // Curly hair
        { x: 11, y: 0, color: '#3E2723', size: 4, layer: 1 }, // Hair top
        { x: 10, y: 1, color: '#3E2723', size: 1, layer: 1 }, // Hair back
        { x: 15, y: 1, color: '#3E2723', size: 1, layer: 1 }, // Hair front
        { x: 9, y: 2, color: '#3E2723', size: 1, layer: 1 }, // Hair curl
        { x: 15, y: 2, color: '#3E2723', size: 1, layer: 1 }, // Hair curl
        
        // Turquoise and orange outfit - profile view
        { x: 11, y: 4, color: '#00838F', size: 3, layer: 1 }, // Upper body - teal
        { x: 10, y: 6, color: '#00838F', size: 4, layer: 1 }, // Lower body - teal
        
        // Orange accents on outfit
        { x: 11, y: 5, color: '#FF5722', size: 1, layer: 2 }, // Orange detail
        { x: 13, y: 5, color: '#FF5722', size: 1, layer: 2 }, // Orange detail
        { x: 11, y: 7, color: '#FF5722', size: 1, layer: 2 }, // Orange detail
        { x: 13, y: 7, color: '#FF5722', size: 1, layer: 2 }, // Orange detail
        
        // Arms - profile view
        { x: 9, y: 4, color: '#8D5524', size: 2, layer: 1 }, // Back arm
        { x: 14, y: 4, color: '#8D5524', size: 2, layer: 1 }, // Front arm
        { x: 8, y: 5, color: '#8D5524', size: 2, layer: 1 }, // Back hand
        { x: 15, y: 5, color: '#8D5524', size: 2, layer: 1 }, // Front hand
        
        // Teal & orange bracelets
        { x: 8, y: 4, color: '#00BCD4', size: 1, layer: 2 }, // Teal bracelet
        { x: 16, y: 4, color: '#FF5722', size: 1, layer: 2 }, // Orange bracelet
        
        // Legs - profile view
        { x: 10, y: 8, color: '#8D5524', size: 2, layer: 1 }, // Back leg
        { x: 12, y: 8, color: '#8D5524', size: 2, layer: 1 }, // Front leg
        { x: 9, y: 9, color: '#00838F', size: 2, layer: 1 }, // Back foot/sandal
        { x: 13, y: 9, color: '#00838F', size: 2, layer: 1 }, // Front foot/sandal
      ];
      break;
      
    case 'death': // Dark/spectral character - profile view
      blocks = [
        // Hooded head - profile view
        { x: 12, y: 1, color: '#212121', size: 3, layer: 1 }, // Hood
        
        // Facial features - glowing eye (one visible)
        { x: 13, y: 2, color: '#F44336', size: 1, layer: 2 }, // Visible eye
        
        // Robe body - profile view
        { x: 10, y: 4, color: '#424242', size: 5, layer: 1 }, // Upper robe
        { x: 9, y: 6, color: '#212121', size: 6, layer: 1 }, // Lower robe
        
        // Arms - profile view
        { x: 8, y: 5, color: '#212121', size: 2, layer: 1 }, // Back arm
        { x: 15, y: 5, color: '#212121', size: 2, layer: 1 }, // Front arm
        { x: 7, y: 6, color: '#424242', size: 2, layer: 1 }, // Back hand
        { x: 16, y: 6, color: '#424242', size: 2, layer: 1 }, // Front hand
        
        // Scythe (optional accessory, included by default for Death)
        { x: 17, y: 3, color: '#795548', size: 1, layer: 2 }, // Handle top
        { x: 17, y: 4, color: '#795548', size: 1, layer: 2 }, // Handle
        { x: 17, y: 5, color: '#795548', size: 1, layer: 2 }, // Handle
        { x: 17, y: 6, color: '#795548', size: 1, layer: 2 }, // Handle
        { x: 17, y: 7, color: '#795548', size: 1, layer: 2 }, // Handle
        { x: 16, y: 2, color: '#BDBDBD', size: 2, layer: 2 }, // Blade
        { x: 18, y: 2, color: '#BDBDBD', size: 1, layer: 2 }, // Blade tip
        { x: 18, y: 3, color: '#BDBDBD', size: 1, layer: 2 }, // Blade curve
      ];
      break;
      
    case 'auto': // Updated Auto based on reference image
      blocks = [
        // Hooded head - profile view
        { x: 12, y: 1, color: '#4A4A4A', size: 3, layer: 1 }, // Hood base
        
        // Golden face (from reference image)
        { x: 13, y: 2, color: '#FFD700', size: 1, layer: 2 }, // Golden face/mask
        { x: 14, y: 2, color: '#FFD700', size: 1, layer: 2 }, // Extended golden face
        { x: 13, y: 3, color: '#B8860B', size: 1, layer: 2 }, // Lower gold face
        
        // Cloak/robe body - dark
        { x: 10, y: 4, color: '#333333', size: 5, layer: 1 }, // Upper cloak
        { x: 9, y: 6, color: '#222222', size: 6, layer: 1 }, // Lower cloak
        
        // Arms - profile view
        { x: 9, y: 4, color: '#333333', size: 1, layer: 1 }, // Back arm
        { x: 15, y: 4, color: '#333333', size: 1, layer: 1 }, // Front arm
        { x: 8, y: 5, color: '#222222', size: 2, layer: 1 }, // Back hand
        { x: 16, y: 5, color: '#222222', size: 1, layer: 1 }, // Front hand
        
        // Legs - mostly hidden by cloak
        { x: 10, y: 9, color: '#333333', size: 1, layer: 1 }, // Barely visible leg
        { x: 14, y: 9, color: '#333333', size: 1, layer: 1 }, // Barely visible leg
        
        // Golden sword (from reference image)
        { x: 17, y: 2, color: '#FFD700', size: 1, layer: 2 }, // Sword top
        { x: 17, y: 3, color: '#FFD700', size: 1, layer: 2 }, // Sword middle
        { x: 17, y: 4, color: '#FFD700', size: 1, layer: 2 }, // Sword middle
        { x: 17, y: 5, color: '#FFD700', size: 1, layer: 2 }, // Sword middle
        { x: 17, y: 6, color: '#B8860B', size: 1, layer: 2 }, // Sword handle
        { x: 17, y: 7, color: '#B8860B', size: 1, layer: 2 }, // Sword handle
        
        // Subtle golden glow effects
        { x: 18, y: 2, color: '#FFD700', size: 1, layer: 1, opacity: 0.3 }, // Glow
        { x: 18, y: 3, color: '#FFD700', size: 1, layer: 1, opacity: 0.3 }, // Glow
        { x: 16, y: 2, color: '#FFD700', size: 1, layer: 1, opacity: 0.3 }, // Glow
      ];
      break;
      
    case 'iam': // Mysterious/shadowy character - profile view
      blocks = [
        // Hooded/masked head - profile view
        { x: 12, y: 1, color: '#9C27B0', size: 3, layer: 1 }, // Head base
        
        // Face - mostly concealed - profile view
        { x: 13, y: 2, color: '#E1BEE7', size: 1, layer: 2 }, // Eye glow
        
        // Cloaked body - profile view
        { x: 10, y: 4, color: '#7B1FA2', size: 5, layer: 1 }, // Upper body
        { x: 9, y: 6, color: '#6A1B9A', size: 6, layer: 1 }, // Lower cloak
        
        // Arms - profile view
        { x: 8, y: 5, color: '#9C27B0', size: 2, layer: 1 }, // Back arm
        { x: 15, y: 5, color: '#9C27B0', size: 2, layer: 1 }, // Front arm
        
        // Mystical effects - profile view
        { x: 8, y: 3, color: '#CE93D8', size: 1, layer: 2 }, // Back wisp
        { x: 15, y: 3, color: '#CE93D8', size: 1, layer: 2 }, // Front wisp
        { x: 7, y: 7, color: '#CE93D8', size: 1, layer: 2 }, // Lower back wisp
        { x: 16, y: 7, color: '#CE93D8', size: 1, layer: 2 }, // Lower front wisp
        { x: 10, y: 9, color: '#CE93D8', size: 1, layer: 2 }, // Bottom wisp
        { x: 14, y: 9, color: '#CE93D8', size: 1, layer: 2 }, // Bottom wisp
      ];
      break;
      
    case 'steve': // Blocky/classic character - profile view
      blocks = [
        // Blocky head - profile view
        { x: 12, y: 1, color: '#FFA726', size: 3, layer: 1 }, // Head
        
        // Face - profile view
        { x: 14, y: 1, color: '#3E2723', size: 1, layer: 2 }, // Eye
        { x: 15, y: 2, color: '#5D4037', size: 1, layer: 2 }, // Nose
        { x: 14, y: 3, color: '#3E2723', size: 1, layer: 2 }, // Mouth/beard
        
        // Hair - profile view
        { x: 12, y: 0, color: '#5D4037', size: 3, layer: 2 }, // Hair top
        
        // Body - profile view
        { x: 11, y: 4, color: '#1976D2', size: 3, layer: 1 }, // Blue shirt
        { x: 11, y: 7, color: '#795548', size: 3, layer: 1 }, // Brown pants
        
        // Arms - profile view
        { x: 9, y: 4, color: '#1976D2', size: 2, layer: 1 }, // Back arm
        { x: 14, y: 4, color: '#1976D2', size: 2, layer: 1 }, // Front arm
        { x: 8, y: 5, color: '#FFA726', size: 2, layer: 1 }, // Back hand
        { x: 15, y: 5, color: '#FFA726', size: 2, layer: 1 }, // Front hand
        
        // Legs - profile view
        { x: 10, y: 9, color: '#5D4037', size: 2, layer: 1 }, // Back boot
        { x: 13, y: 9, color: '#5D4037', size: 2, layer: 1 }, // Front boot
      ];
      break;
      
    case 'zombie': // Green zombie jockey - the default starter jockey
      blocks = [
        // Zombie head - profile view
        { x: 12, y: 1, color: '#6B8E23', size: 3, layer: 1 }, // Olive green zombie skin
        
        // Zombie face - profile view with more definition
        { x: 14, y: 1, color: '#DC143C', size: 1, layer: 2 }, // Bright red glowing eye
        { x: 14, y: 3, color: '#2F2F2F', size: 2, layer: 2 }, // Dark gaping mouth
        { x: 13, y: 2, color: '#8B4513', size: 1, layer: 2 }, // Prominent scar
        { x: 12, y: 3, color: '#8B4513', size: 1, layer: 2 }, // Additional decay mark
        
        // Disheveled zombie hair - profile view
        { x: 12, y: 0, color: '#556B2F', size: 3, layer: 2 }, // Dark olive hair
        { x: 11, y: 1, color: '#556B2F', size: 1, layer: 2 }, // Hair back
        { x: 10, y: 0, color: '#556B2F', size: 1, layer: 2 }, // Messy hair strand
        { x: 15, y: 0, color: '#556B2F', size: 1, layer: 2 }, // Hair strand front
        
        // Ragged zombie clothing - profile view
        { x: 11, y: 4, color: '#654321', size: 3, layer: 1 }, // Brown torn shirt
        { x: 10, y: 7, color: '#2F2F2F', size: 4, layer: 1 }, // Dark tattered pants
        
        // Zombie arms - profile view
        { x: 9, y: 4, color: '#654321', size: 2, layer: 1 }, // Back arm (tattered sleeve)
        { x: 14, y: 4, color: '#654321', size: 2, layer: 1 }, // Front arm (tattered sleeve)
        { x: 8, y: 5, color: '#6B8E23', size: 2, layer: 1 }, // Back zombie hand
        { x: 15, y: 5, color: '#6B8E23', size: 2, layer: 1 }, // Front zombie hand
        
        // Worn zombie boots - profile view
        { x: 10, y: 9, color: '#2F2F2F', size: 2, layer: 1 }, // Back worn boot
        { x: 13, y: 9, color: '#2F2F2F', size: 2, layer: 1 }, // Front worn boot
        
        // Enhanced zombie decay effects
        { x: 13, y: 4, color: '#556B2F', size: 1, layer: 2 }, // Decay spot on shirt
        { x: 11, y: 8, color: '#556B2F', size: 1, layer: 2 }, // Decay spot on pants
        { x: 12, y: 6, color: '#8B4513', size: 1, layer: 2 }, // Additional decay on torso
        { x: 14, y: 8, color: '#8B4513', size: 1, layer: 2 }, // Leg decay mark
      ];
      break;
      
    case 'generic': // Fallback to zombie for backwards compatibility
      blocks = [
        // Zombie head - profile view
        { x: 12, y: 1, color: '#6B8E23', size: 3, layer: 1 }, // Olive green zombie skin
        
        // Zombie face - profile view with more definition
        { x: 14, y: 1, color: '#DC143C', size: 1, layer: 2 }, // Bright red glowing eye
        { x: 14, y: 3, color: '#2F2F2F', size: 2, layer: 2 }, // Dark gaping mouth
        { x: 13, y: 2, color: '#8B4513', size: 1, layer: 2 }, // Prominent scar
        { x: 12, y: 3, color: '#8B4513', size: 1, layer: 2 }, // Additional decay mark
        
        // Disheveled zombie hair - profile view
        { x: 12, y: 0, color: '#556B2F', size: 3, layer: 2 }, // Dark olive hair
        { x: 11, y: 1, color: '#556B2F', size: 1, layer: 2 }, // Hair back
        { x: 10, y: 0, color: '#556B2F', size: 1, layer: 2 }, // Messy hair strand
        { x: 15, y: 0, color: '#556B2F', size: 1, layer: 2 }, // Hair strand front
        
        // Ragged zombie clothing - profile view
        { x: 11, y: 4, color: '#654321', size: 3, layer: 1 }, // Brown torn shirt
        { x: 10, y: 7, color: '#2F2F2F', size: 4, layer: 1 }, // Dark tattered pants
        
        // Zombie arms - profile view
        { x: 9, y: 4, color: '#654321', size: 2, layer: 1 }, // Back arm (tattered sleeve)
        { x: 14, y: 4, color: '#654321', size: 2, layer: 1 }, // Front arm (tattered sleeve)
        { x: 8, y: 5, color: '#6B8E23', size: 2, layer: 1 }, // Back zombie hand
        { x: 15, y: 5, color: '#6B8E23', size: 2, layer: 1 }, // Front zombie hand
        
        // Worn zombie boots - profile view
        { x: 10, y: 9, color: '#2F2F2F', size: 2, layer: 1 }, // Back worn boot
        { x: 13, y: 9, color: '#2F2F2F', size: 2, layer: 1 }, // Front worn boot
        
        // Enhanced zombie decay effects
        { x: 13, y: 4, color: '#556B2F', size: 1, layer: 2 }, // Decay spot on shirt
        { x: 11, y: 8, color: '#556B2F', size: 1, layer: 2 }, // Decay spot on pants
        { x: 12, y: 6, color: '#8B4513', size: 1, layer: 2 }, // Additional decay on torso
        { x: 14, y: 8, color: '#8B4513', size: 1, layer: 2 }, // Leg decay mark
      ];
      break;
      
    case 'custom': // Custom character with user-specified colors - profile view
      blocks = [
        // Head - profile view
        { x: 12, y: 1, color: skinColor, size: 3, layer: 1 },
        
        // Face - profile view
        { x: 14, y: 1, color: '#3E2723', size: 1, layer: 2 }, // Eye
        { x: 14, y: 3, color: '#5D4037', size: 1, layer: 2 }, // Mouth
        
        // Hair - profile view
        { x: 12, y: 0, color: hairColor, size: 3, layer: 2 }, // Hair top
        { x: 11, y: 1, color: hairColor, size: 1, layer: 2 }, // Hair back
        
        // Body - profile view
        { x: 11, y: 4, color: outfitColor, size: 3, layer: 1 }, // Upper body
        { x: 10, y: 7, color: outfitColor, size: 4, layer: 1 }, // Lower body
        
        // Arms - profile view
        { x: 9, y: 4, color: outfitColor, size: 2, layer: 1 }, // Back arm
        { x: 14, y: 4, color: outfitColor, size: 2, layer: 1 }, // Front arm
        { x: 8, y: 5, color: skinColor, size: 2, layer: 1 }, // Back hand
        { x: 15, y: 5, color: skinColor, size: 2, layer: 1 }, // Front hand
        
        // Legs - profile view
        { x: 10, y: 9, color: '#5D4037', size: 2, layer: 1 }, // Back boot
        { x: 13, y: 9, color: '#5D4037', size: 2, layer: 1 }, // Front boot
      ];
      break;
  }
  
  // Add accessory if specified
  if (accessory && accessory !== 'none') {
    switch(accessory) {
      case 'sword':
        blocks.push(
          { x: 12, y: 5, color: '#BDBDBD', size: 1, layer: 3 }, // Blade
          { x: 12, y: 6, color: '#BDBDBD', size: 1, layer: 3 }, // Blade
          { x: 12, y: 7, color: '#BDBDBD', size: 1, layer: 3 }, // Blade
          { x: 12, y: 8, color: accessoryColor, size: 1, layer: 3 }, // Handle
          { x: 12, y: 9, color: accessoryColor, size: 1, layer: 3 } // Handle
        );
        break;
      case 'hat':
        blocks.push(
          { x: 5, y: 0, color: accessoryColor, size: 6, layer: 3 }, // Brim
          { x: 6, y: -1, color: accessoryColor, size: 4, layer: 3 }, // Top
          { x: 7, y: -2, color: accessoryColor, size: 2, layer: 3 } // Point
        );
        break;
      case 'cape':
        blocks.push(
          { x: 5, y: 5, color: accessoryColor, size: 6, layer: 0 }, // Upper cape
          { x: 6, y: 6, color: accessoryColor, size: 4, layer: 0 }, // Mid cape
          { x: 7, y: 7, color: accessoryColor, size: 2, layer: 0 } // Lower cape
        );
        break;
      case 'glasses':
        blocks.push(
          { x: 6, y: 2, color: accessoryColor, size: 2, layer: 3 }, // Left lens
          { x: 8, y: 2, color: accessoryColor, size: 2, layer: 3 }, // Right lens
          { x: 8, y: 2, color: accessoryColor, size: 1, layer: 3 } // Bridge
        );
        break;
      case 'shield':
        blocks.push(
          { x: 2, y: 5, color: accessoryColor, size: 2, layer: 3 }, // Shield top
          { x: 1, y: 6, color: accessoryColor, size: 3, layer: 3 }, // Shield middle
          { x: 2, y: 7, color: accessoryColor, size: 2, layer: 3 } // Shield bottom
        );
        break;
      case 'bow':
        blocks.push(
          // Bow structure
          { x: 16, y: 3, color: accessoryColor, size: 1, layer: 3 }, // Top curve
          { x: 17, y: 4, color: accessoryColor, size: 1, layer: 3 }, // Upper curve
          { x: 17, y: 5, color: accessoryColor, size: 1, layer: 3 }, // Middle
          { x: 17, y: 6, color: accessoryColor, size: 1, layer: 3 }, // Lower curve
          { x: 16, y: 7, color: accessoryColor, size: 1, layer: 3 }, // Bottom curve
          
          // Bowstring
          { x: 15, y: 4, color: '#E0E0E0', size: 1, layer: 3 }, // String top
          { x: 15, y: 5, color: '#E0E0E0', size: 1, layer: 3 }, // String middle
          { x: 15, y: 6, color: '#E0E0E0', size: 1, layer: 3 }, // String bottom
          
          // Arrow
          { x: 14, y: 5, color: '#795548', size: 1, layer: 3 }, // Arrow shaft
          { x: 13, y: 5, color: '#795548', size: 1, layer: 3 }, // Arrow shaft
          { x: 12, y: 5, color: accessoryColor, size: 1, layer: 3 } // Arrow head
        );
        break;
      case 'staff':
        blocks.push(
          // Staff pole
          { x: 16, y: 2, color: '#8D6E63', size: 1, layer: 3 }, // Staff top
          { x: 16, y: 3, color: '#8D6E63', size: 1, layer: 3 }, // Staff upper
          { x: 16, y: 4, color: '#8D6E63', size: 1, layer: 3 }, // Staff middle
          { x: 16, y: 5, color: '#8D6E63', size: 1, layer: 3 }, // Staff lower
          { x: 16, y: 6, color: '#8D6E63', size: 1, layer: 3 }, // Staff bottom
          { x: 16, y: 7, color: '#8D6E63', size: 1, layer: 3 }, // Staff extension
          { x: 16, y: 8, color: '#8D6E63', size: 1, layer: 3 }, // Staff extension
          
          // Staff orb/crystal
          { x: 15, y: 1, color: accessoryColor, size: 3, layer: 3 }, // Magical orb
          
          // Magical glow effect
          { x: 14, y: 0, color: accessoryColor, size: 1, layer: 3, opacity: 0.5 }, // Glow
          { x: 18, y: 0, color: accessoryColor, size: 1, layer: 3, opacity: 0.5 }, // Glow
          { x: 14, y: 2, color: accessoryColor, size: 1, layer: 3, opacity: 0.5 }, // Glow
          { x: 18, y: 2, color: accessoryColor, size: 1, layer: 3, opacity: 0.5 }, // Glow
        );
        break;
    }
  }
  
  // Apply equipment if specified
  if (equipment && equipment.length > 0) {
    equipment.forEach(item => {
      if (item === 'armor') {
        blocks.push(
          { x: 6, y: 5, color: '#78909C', size: 4, layer: 2 }, // Chest armor
          { x: 4, y: 5, color: '#78909C', size: 2, layer: 2 }, // Left shoulder
          { x: 10, y: 5, color: '#78909C', size: 2, layer: 2 } // Right shoulder
        );
      } else if (item === 'helmet') {
        blocks.push(
          { x: 6, y: 1, color: '#78909C', size: 4, layer: 2 } // Helmet
        );
      } else if (item === 'boots') {
        blocks.push(
          { x: 6, y: 13, color: '#5D4037', size: 2, layer: 2 }, // Left boot
          { x: 8, y: 13, color: '#5D4037', size: 2, layer: 2 } // Right boot
        );
      }
    });
  }
  
  return blocks;
}

// Main Jockey Sprite Component
export function JockeySprite(props: JockeySpriteProps) {
  const {
    size = 'md',
    animation = 'idle',
    direction = 'right',
    pixelSize = 2,
    className,
    style,
    onClick,
    name,
    showName = false
  } = props;
  
  // Get jockey blocks based on props
  const jockeyBlocks = generateJockeyBlocks(props);
  
  // Set size based on prop
  const sizeMap = {
    xs: { width: 12, height: 12, pixelSize: pixelSize * 0.5 },
    sm: { width: 16, height: 16, pixelSize: pixelSize * 0.75 },
    md: { width: 20, height: 20, pixelSize },
    lg: { width: 24, height: 24, pixelSize: pixelSize * 1.25 }
  };
  
  const { width, height, pixelSize: adjustedPixelSize } = sizeMap[size];
  
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <BaseSprite
        blocks={jockeyBlocks}
        width={width}
        height={height}
        pixelSize={adjustedPixelSize}
        animation={animation}
        direction={direction}
        style={style}
        onClick={onClick}
      />
      
      {showName && name && (
        <div className="text-xs font-minecraft mt-1 text-center bg-black/50 px-1 rounded text-white">
          {name}
        </div>
      )}
    </div>
  );
}