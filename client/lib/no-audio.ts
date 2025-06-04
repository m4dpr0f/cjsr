// Audio system disabled for React Jam submission
// This keeps the app lightweight and fast-loading

export const simpleAudio = {
  // All audio functions are no-ops for performance
  playRaceStart: () => {},
  playRaceFinish: () => {},
  playError: () => {},
  playSuccess: () => {},
  playCampaignTheme: () => {},
  playTypingSound: () => {},
  setEnabled: () => {},
  isEnabled: () => false,
  stop: () => {},
  pause: () => {},
  resume: () => {},
};

export const audioEngine = {
  playSuccessSound: () => {},
  playErrorSound: () => {},
  playTypingRhythm: () => {},
  setEnabled: () => {},
  isAudioEnabled: () => false,
};

export const publicDomainAudio = {
  playTheme: () => Promise.resolve(),
  stop: () => {},
  setEnabled: () => {},
  isEnabled: () => false,
};

export const localAudio = {
  playTheme: () => Promise.resolve(),
  stop: () => {},
  setEnabled: () => {},
  isEnabled: () => false,
};