// HTML-based character sprites for special unlocks

// Death Mount - Available at 10k Faction XP
export const HTML_DEATH_MOUNT = `
<div class="death-mount" style="position: relative; width: 48px; height: 32px;">
  <!-- Shadow base -->
  <div style="position: absolute; bottom: 0; left: 8px; width: 32px; height: 4px; background: rgba(0,0,0,0.6); border-radius: 50%;"></div>
  
  <!-- Main body - dark ethereal -->
  <div style="position: absolute; top: 8px; left: 12px; width: 24px; height: 16px; background: #1f2937; border: 2px solid #374151;"></div>
  
  <!-- Dark wings spread -->
  <div style="position: absolute; top: 10px; left: 4px; width: 8px; height: 12px; background: #111827; border: 1px solid #374151; transform: skew(-15deg);"></div>
  <div style="position: absolute; top: 10px; right: 4px; width: 8px; height: 12px; background: #111827; border: 1px solid #374151; transform: skew(15deg);"></div>
  
  <!-- Skull-like head -->
  <div style="position: absolute; top: 4px; left: 16px; width: 16px; height: 12px; background: #f3f4f6; border: 2px solid #d1d5db;"></div>
  
  <!-- Eye sockets - glowing red -->
  <div style="position: absolute; top: 6px; left: 18px; width: 3px; height: 3px; background: #dc2626; box-shadow: 0 0 4px #dc2626;"></div>
  <div style="position: absolute; top: 6px; left: 25px; width: 3px; height: 3px; background: #dc2626; box-shadow: 0 0 4px #dc2626;"></div>
  
  <!-- Legs -->
  <div style="position: absolute; top: 20px; left: 16px; width: 4px; height: 8px; background: #374151;"></div>
  <div style="position: absolute; top: 20px; left: 28px; width: 4px; height: 8px; background: #374151;"></div>
  
  <!-- Mystical aura effect -->
  <div style="position: absolute; top: 2px; left: 10px; width: 28px; height: 20px; border: 1px solid #7c3aed; opacity: 0.3; animation: pulse 2s infinite;"></div>
</div>`;

// Golden Champion Jockey - Available at 20k Faction XP
export const HTML_GOLDEN_CHAMPION = `
<div class="golden-champion" style="position: relative; width: 32px; height: 40px;">
  <!-- Head with golden skin -->
  <div style="position: absolute; top: 0px; left: 10px; width: 12px; height: 12px; background: #fbbf24; border: 1px solid #f59e0b;"></div>
  
  <!-- Eyes -->
  <div style="position: absolute; top: 2px; left: 12px; width: 2px; height: 2px; background: white;"></div>
  <div style="position: absolute; top: 2px; left: 16px; width: 2px; height: 2px; background: white;"></div>
  <div style="position: absolute; top: 3px; left: 12px; width: 1px; height: 1px; background: #1f2937;"></div>
  <div style="position: absolute; top: 3px; left: 16px; width: 1px; height: 1px; background: #1f2937;"></div>
  
  <!-- Golden crown -->
  <div style="position: absolute; top: -2px; left: 9px; width: 14px; height: 4px; background: #eab308; border: 1px solid #ca8a04;"></div>
  <div style="position: absolute; top: -4px; left: 13px; width: 2px; height: 3px; background: #eab308;"></div>
  <div style="position: absolute; top: -4px; left: 17px; width: 2px; height: 3px; background: #eab308;"></div>
  
  <!-- Royal garments -->
  <div style="position: absolute; top: 12px; left: 9px; width: 14px; height: 16px; background: #dc2626; border: 1px solid #991b1b;"></div>
  
  <!-- Golden trim -->
  <div style="position: absolute; top: 13px; left: 10px; width: 12px; height: 1px; background: #fbbf24;"></div>
  <div style="position: absolute; top: 16px; left: 10px; width: 12px; height: 1px; background: #fbbf24;"></div>
  <div style="position: absolute; top: 19px; left: 10px; width: 12px; height: 1px; background: #fbbf24;"></div>
  
  <!-- Royal crest -->
  <div style="position: absolute; top: 14px; left: 14px; width: 4px; height: 4px; background: #fbbf24; border: 1px solid #eab308;"></div>
  
  <!-- Arms -->
  <div style="position: absolute; top: 14px; left: 6px; width: 4px; height: 10px; background: #fbbf24;"></div>
  <div style="position: absolute; top: 14px; left: 22px; width: 4px; height: 10px; background: #fbbf24;"></div>
  
  <!-- Legs -->
  <div style="position: absolute; top: 28px; left: 11px; width: 4px; height: 10px; background: #fbbf24;"></div>
  <div style="position: absolute; top: 28px; left: 17px; width: 4px; height: 10px; background: #fbbf24;"></div>
  
  <!-- Royal boots -->
  <div style="position: absolute; top: 36px; left: 10px; width: 6px; height: 4px; background: #7c2d12; border: 1px solid #92400e;"></div>
  <div style="position: absolute; top: 36px; left: 16px; width: 6px; height: 4px; background: #7c2d12; border: 1px solid #92400e;"></div>
  
  <!-- Golden aura -->
  <div style="position: absolute; top: -2px; left: 8px; width: 16px; height: 44px; border: 1px solid #fbbf24; opacity: 0.4; animation: glow 3s infinite;"></div>
</div>`;

// Peacock Champion Jockey - Available at 100k Faction XP
export const HTML_PEACOCK_CHAMPION = `
<div class="peacock-champion" style="position: relative; width: 32px; height: 40px;">
  <!-- Head with dark blue skin -->
  <div style="position: absolute; top: 0px; left: 10px; width: 12px; height: 12px; background: #1e3a8a; border: 1px solid #1e40af;"></div>
  
  <!-- Eyes -->
  <div style="position: absolute; top: 2px; left: 12px; width: 2px; height: 2px; background: white;"></div>
  <div style="position: absolute; top: 2px; left: 16px; width: 2px; height: 2px; background: white;"></div>
  <div style="position: absolute; top: 3px; left: 12px; width: 1px; height: 1px; background: black;"></div>
  <div style="position: absolute; top: 3px; left: 16px; width: 1px; height: 1px; background: black;"></div>
  
  <!-- Black hair -->
  <div style="position: absolute; top: 0px; left: 9px; width: 14px; height: 4px; background: #1f2937; border: 1px solid #111827;"></div>
  
  <!-- Peacock feather in hair -->
  <div style="position: absolute; top: -3px; left: 18px; width: 1px; height: 8px; background: #8b5cf6;"></div>
  <div style="position: absolute; top: -2px; left: 19px; width: 4px; height: 3px; background: linear-gradient(45deg, #10b981, #3b82f6, #f59e0b); border-radius: 50%;"></div>
  
  <!-- Ornate clothing -->
  <div style="position: absolute; top: 12px; left: 9px; width: 14px; height: 16px; background: #059669; border: 1px solid #047857;"></div>
  
  <!-- Iridescent trim -->
  <div style="position: absolute; top: 13px; left: 10px; width: 12px; height: 1px; background: linear-gradient(90deg, #8b5cf6, #10b981, #3b82f6);"></div>
  <div style="position: absolute; top: 16px; left: 10px; width: 12px; height: 1px; background: linear-gradient(90deg, #3b82f6, #f59e0b, #8b5cf6);"></div>
  <div style="position: absolute; top: 19px; left: 10px; width: 12px; height: 1px; background: linear-gradient(90deg, #10b981, #8b5cf6, #3b82f6);"></div>
  
  <!-- Peacock emblem -->
  <div style="position: absolute; top: 14px; left: 14px; width: 4px; height: 4px; background: radial-gradient(circle, #3b82f6 30%, #10b981 60%, #8b5cf6 90%); border-radius: 50%;"></div>
  
  <!-- Arms with dark blue skin -->
  <div style="position: absolute; top: 14px; left: 6px; width: 4px; height: 10px; background: #1e3a8a;"></div>
  <div style="position: absolute; top: 14px; left: 22px; width: 4px; height: 10px; background: #1e3a8a;"></div>
  
  <!-- Legs with dark blue skin -->
  <div style="position: absolute; top: 28px; left: 11px; width: 4px; height: 10px; background: #1e3a8a;"></div>
  <div style="position: absolute; top: 28px; left: 17px; width: 4px; height: 10px; background: #1e3a8a;"></div>
  
  <!-- Elite boots with peacock colors -->
  <div style="position: absolute; top: 36px; left: 10px; width: 6px; height: 4px; background: #7c3aed; border: 1px solid #10b981;"></div>
  <div style="position: absolute; top: 36px; left: 16px; width: 6px; height: 4px; background: #7c3aed; border: 1px solid #10b981;"></div>
</div>`;

// Peacock Mount - Available at 1000+ Faction XP
export const HTML_PEACOCK_MOUNT = `
<div class="peacock-mount" style="position: relative; width: 48px; height: 32px;">
  <!-- Shadow -->
  <div style="position: absolute; bottom: 0; left: 8px; width: 32px; height: 4px; background: rgba(0,0,0,0.3); border-radius: 50%;"></div>
  
  <!-- Main body with peacock colors -->
  <div style="position: absolute; top: 8px; left: 12px; width: 24px; height: 16px; background: linear-gradient(45deg, #10b981, #3b82f6); border: 2px solid #059669;"></div>
  
  <!-- Peacock tail feathers -->
  <div style="position: absolute; top: 6px; left: 32px; width: 12px; height: 20px; background: linear-gradient(135deg, #8b5cf6, #10b981, #3b82f6, #f59e0b); border-radius: 0 50% 50% 0;"></div>
  
  <!-- Tail feather eyes -->
  <div style="position: absolute; top: 10px; left: 36px; width: 3px; height: 3px; background: #1e40af; border: 1px solid #f59e0b; border-radius: 50%;"></div>
  <div style="position: absolute; top: 16px; left: 38px; width: 3px; height: 3px; background: #1e40af; border: 1px solid #f59e0b; border-radius: 50%;"></div>
  
  <!-- Head with crown of feathers -->
  <div style="position: absolute; top: 4px; left: 8px; width: 12px; height: 10px; background: #059669; border: 2px solid #047857;"></div>
  
  <!-- Feather crown -->
  <div style="position: absolute; top: 0px; left: 10px; width: 2px; height: 6px; background: #8b5cf6;"></div>
  <div style="position: absolute; top: 1px; left: 13px; width: 2px; height: 5px; background: #3b82f6;"></div>
  <div style="position: absolute; top: 0px; left: 16px; width: 2px; height: 6px; background: #10b981;"></div>
  
  <!-- Eyes -->
  <div style="position: absolute; top: 6px; left: 10px; width: 2px; height: 2px; background: #f59e0b;"></div>
  <div style="position: absolute; top: 6px; left: 14px; width: 2px; height: 2px; background: #f59e0b;"></div>
  
  <!-- Beak -->
  <div style="position: absolute; top: 8px; left: 6px; width: 3px; height: 2px; background: #f59e0b;"></div>
  
  <!-- Legs -->
  <div style="position: absolute; top: 20px; left: 16px; width: 3px; height: 8px; background: #f59e0b;"></div>
  <div style="position: absolute; top: 20px; left: 25px; width: 3px; height: 8px; background: #f59e0b;"></div>
  
  <!-- Iridescent shimmer effect -->
  <div style="position: absolute; top: 4px; left: 8px; width: 36px; height: 24px; background: linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.2), transparent); animation: shimmer 4s infinite;"></div>
</div>`;

// CSS animations for the special effects
export const SPECIAL_CHARACTER_STYLES = `
<style>
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px #fbbf24; }
  50% { box-shadow: 0 0 15px #fbbf24, 0 0 25px #f59e0b; }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>`;

// Character info for the unlock system
export const SPECIAL_CHARACTER_INFO = {
  death: {
    id: 'death',
    name: 'Death',
    type: 'mount',
    description: 'A mysterious ethereal mount that transcends the mortal realm.',
    rarity: 'epic',
    unlockXp: 10000
  },
  golden_champion: {
    id: 'golden_champion', 
    name: 'Golden Champion',
    type: 'jockey',
    description: 'A legendary warrior adorned in royal gold, master of all elements.',
    rarity: 'legendary',
    unlockXp: 20000
  },
  peacock_champion: {
    id: 'peacock_champion',
    name: 'Peacock Champion', 
    type: 'jockey',
    description: 'Elite rider with dark blue skin and vibrant peacock feather. Grace personified.',
    rarity: 'legendary',
    unlockXp: 100000
  },
  peacock_mount: {
    id: 'peacock_mount',
    name: 'Peacock Mount',
    type: 'mount', 
    description: 'A magnificent Garu with iridescent peacock plumage that shimmers in the light.',
    rarity: 'legendary',
    unlockXp: 100000
  }
};