// Fork selection and management for CJSR

export type PlayerCharacter = "Matikah" | "Auto" | "Iam" | "Steve" | null;

export interface ForkState {
  selectedCharacter: PlayerCharacter;
  hasStartedFork: boolean;
  currentForkRace: number;
  completedRaces: number[];
}

const DEFAULT_FORK_STATE: ForkState = {
  selectedCharacter: null,
  hasStartedFork: false,
  currentForkRace: -1, // -1 means character selection screen, 0 is first race
  completedRaces: [],
};

/**
 * Get the current fork state from localStorage
 */
export function getForkState(): ForkState {
  const savedState = localStorage.getItem('forkState');
  if (savedState) {
    return JSON.parse(savedState);
  }
  return DEFAULT_FORK_STATE;
}

/**
 * Save the fork state to localStorage
 */
export function saveForkState(state: ForkState): void {
  localStorage.setItem('forkState', JSON.stringify(state));
}

/**
 * Select a character for the fork campaign
 */
export function selectCharacter(character: PlayerCharacter): void {
  const state = getForkState();
  
  // If character is "Iam", randomly select one of the other characters
  let selectedCharacter = character;
  if (character === "Iam") {
    selectedCharacter = Math.random() < 0.5 ? "Matikah" : "Auto";
  }
  
  state.selectedCharacter = selectedCharacter;
  state.hasStartedFork = true;
  state.currentForkRace = 0; // Start with race 0 (introduction) after character selection
  
  saveForkState(state);
}

/**
 * Mark a fork race as completed
 */
export function markForkRaceCompleted(raceId: number): void {
  const state = getForkState();
  
  if (!state.completedRaces.includes(raceId)) {
    state.completedRaces.push(raceId);
  }
  
  // Move to the next race
  state.currentForkRace = raceId + 1;
  
  saveForkState(state);
}

/**
 * Reset the fork state
 */
export function resetForkState(): void {
  localStorage.removeItem('forkState');
}

/**
 * Get character-specific dialogue for a given scene
 */
export function getCharacterDialogue(character: PlayerCharacter, scene: string): string {
  const dialogues: Record<string, Record<string, string>> = {
    "intro": {
      "Matikah": "I am Matikah, seeker of knowledge and defender of truth. With my wisdom, we shall solve the mysteries of the Chicken Jockey legends.",
      "Auto": "Auto reporting for duty! With my technical expertise and logical approach, we'll optimize our racing strategy for maximum efficiency!",
      "Iam": "Choose your character to begin the adventure...",
      "Steve": "I've been racing chickens since I was a boy. My father taught me before the Empire outlawed our traditions. Now I race in secret, keeping our culture alive.",
    },
    "race1": {
      "Matikah": "These ancient scrolls speak of the First Feather's origins. We must understand our past to forge our future.",
      "Auto": "My algorithms detect patterns in these racing techniques. Implementing optimal strategy protocols now.",
      "Iam": "Character not selected",
    },
    // Add more scenes as needed
  };
  
  if (!character) {
    return "Choose your character to begin the adventure...";
  }
  
  return dialogues[scene]?.[character] || "No dialogue available for this scene.";
}

// Initialize fork state when this module loads
getForkState();