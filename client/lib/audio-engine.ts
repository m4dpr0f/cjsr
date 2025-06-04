// CJSR Dynamic Audio Engine
// Generates procedural music based on campaign text and race events

class CJSRAudioEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isEnabled: boolean = false;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.connect(this.audioCtx.destination);
      this.masterGain.gain.value = 0.2; // Master volume
      this.isEnabled = true;
    } catch (error) {
      console.warn('Audio not available:', error);
      this.isEnabled = false;
    }
  }

  // Convert text content to musical scales and themes
  private analyzeTextForMusic(text: string): MelodyTheme {
    // Analyze text characteristics
    const wordCount = text.split(' ').length;
    const avgWordLength = text.replace(/\s/g, '').length / wordCount;
    const punctuationDensity = (text.match(/[.!?;:,]/g) || []).length / text.length;
    const emotionalWords = text.toLowerCase().match(/\b(battle|victory|speed|power|magic|fire|water|earth|air|chaos|order|ancient|legend|quest|adventure|challenge|triumph|glory)\b/g) || [];
    
    // Generate musical characteristics based on text analysis
    const tempo = Math.max(80, Math.min(140, 100 + (avgWordLength * 10) - (punctuationDensity * 50)));
    
    // Choose scale based on emotional content
    let scale: number[];
    let character: string;
    
    if (emotionalWords.includes('battle') || emotionalWords.includes('chaos')) {
      scale = [0, 2, 3, 5, 7, 8, 10]; // Natural minor (dramatic)
      character = 'dramatic';
    } else if (emotionalWords.includes('victory') || emotionalWords.includes('triumph')) {
      scale = [0, 2, 4, 5, 7, 9, 11]; // Major (triumphant)
      character = 'triumphant';
    } else if (emotionalWords.includes('magic') || emotionalWords.includes('ancient')) {
      scale = [0, 1, 4, 6, 7, 8, 11]; // Mixolydian (mystical)
      character = 'mystical';
    } else {
      scale = [0, 2, 4, 7, 9]; // Pentatonic (neutral/adventure)
      character = 'adventure';
    }

    return {
      scale,
      tempo,
      baseFreq: 220, // A3
      character
    };
  }

  // Generate faction-specific audio characteristics
  private getFactionTheme(faction: string): { baseFreq: number; timbre: string; scale: number[] } {
    const factionThemes = {
      'd2': { baseFreq: 164.81, timbre: 'sine', scale: [0, 7] }, // Simple, pure (E3)
      'd4': { baseFreq: 196.00, timbre: 'triangle', scale: [0, 3, 7, 10] }, // Fire (G3)
      'd6': { baseFreq: 174.61, timbre: 'sawtooth', scale: [0, 2, 4, 5, 7, 9] }, // Earth (F3)
      'd8': { baseFreq: 220.00, timbre: 'square', scale: [0, 2, 4, 7, 9, 11] }, // Air (A3)
      'd10': { baseFreq: 246.94, timbre: 'sine', scale: [0, 1, 4, 6, 8, 10] }, // Chaos (B3)
      'd12': { baseFreq: 293.66, timbre: 'triangle', scale: [0, 2, 3, 5, 7, 8, 11] }, // Ether (D4)
      'd20': { baseFreq: 329.63, timbre: 'sawtooth', scale: [0, 2, 4, 6, 8, 10] }, // Water (E4)
      'd100': { baseFreq: 440.00, timbre: 'square', scale: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] } // Order (A4)
    };
    
    return factionThemes[faction as keyof typeof factionThemes] || factionThemes['d2'];
  }

  // Create an oscillator with specified parameters
  private createOscillator(frequency: number, duration: number, volume: number = 0.5, type: OscillatorType = 'sine'): void {
    if (!this.audioCtx || !this.masterGain || !this.isEnabled) return;

    const oscillator = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.frequency.setValueAtTime(frequency, this.audioCtx.currentTime);
    oscillator.type = type;
    
    // ADSR envelope
    gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, this.audioCtx.currentTime + duration * 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + duration);
    
    oscillator.start(this.audioCtx.currentTime);
    oscillator.stop(this.audioCtx.currentTime + duration);
  }

  // Play race start countdown
  playRaceStart(campaignText: string): void {
    if (!this.isEnabled) return;
    
    const theme = this.analyzeTextForMusic(campaignText);
    const noteInterval = 60 / theme.tempo;
    
    // Countdown beeps
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createOscillator(theme.baseFreq * 1.5, 0.2, 0.3, 'square');
      }, i * 1000);
    }
    
    // Start signal
    setTimeout(() => {
      this.createOscillator(theme.baseFreq * 2, 0.5, 0.4, 'triangle');
    }, 3000);
  }

  // Play dynamic background music during race
  playRaceBackground(campaignText: string, faction: string): void {
    if (!this.isEnabled) return;
    
    const theme = this.analyzeTextForMusic(campaignText);
    const factionTheme = this.getFactionTheme(faction);
    
    // Create a subtle background drone based on text analysis
    const playBackgroundLoop = () => {
      // Combine text theme with faction characteristics
      const scale = theme.scale;
      const baseFreq = factionTheme.baseFreq;
      
      // Play a subtle chord progression
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const noteIndex = scale[i % scale.length];
          const frequency = baseFreq * Math.pow(2, noteIndex / 12);
          this.createOscillator(frequency, 2, 0.1, factionTheme.timbre as OscillatorType);
        }, i * 2000);
      }
    };
    
    // Play background loop every 6 seconds
    playBackgroundLoop();
    const interval = setInterval(playBackgroundLoop, 6000);
    
    // Clean up after 2 minutes
    setTimeout(() => clearInterval(interval), 120000);
  }

  // Play victory jingle based on performance and text
  playVictoryJingle(campaignText: string, position: number, wpm: number): void {
    if (!this.isEnabled) return;
    
    const theme = this.analyzeTextForMusic(campaignText);
    const noteInterval = 60 / (theme.tempo * 2); // Faster for victory
    
    // Generate melody based on text and performance
    const melodyLength = Math.max(5, Math.min(10, Math.floor(wpm / 10)));
    const scale = theme.scale;
    
    // Performance-based modifications
    const volumeBoost = position === 1 ? 1.2 : position === 2 ? 1.0 : 0.8;
    const tempoBoost = Math.min(1.5, wpm / 60);
    
    // Play victory melody
    for (let i = 0; i < melodyLength; i++) {
      setTimeout(() => {
        // Create melody based on text characteristics
        const textChar = campaignText.charCodeAt(i * 10) % scale.length;
        const noteIndex = scale[textChar];
        const octaveBoost = position === 1 ? 1 : 0;
        const frequency = theme.baseFreq * Math.pow(2, (noteIndex + octaveBoost * 12) / 12);
        
        this.createOscillator(
          frequency, 
          noteInterval * 2, 
          0.4 * volumeBoost, 
          position === 1 ? 'triangle' : 'sine'
        );
      }, i * noteInterval * 1000 / tempoBoost);
    }
    
    // Final victory chord
    setTimeout(() => {
      const chord = [0, 4, 7].map(note => 
        theme.baseFreq * Math.pow(2, (note + 12) / 12)
      );
      chord.forEach(freq => 
        this.createOscillator(freq, 1, 0.3 * volumeBoost, 'triangle')
      );
    }, melodyLength * noteInterval * 1000 / tempoBoost);
  }

  // Play error sound
  playErrorSound(): void {
    if (!this.isEnabled) return;
    
    this.createOscillator(150, 0.15, 0.2, 'sawtooth');
  }

  // Play typing rhythm enhancement
  playTypingRhythm(character: string, wpm: number): void {
    if (!this.isEnabled) return;
    
    // Subtle click based on character and current speed
    const frequency = 800 + (character.charCodeAt(0) % 200);
    const volume = Math.min(0.05, wpm / 2000); // Very subtle
    
    this.createOscillator(frequency, 0.05, volume, 'square');
  }

  // Enable/disable audio
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Check if audio is available
  isAudioEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const audioEngine = new CJSRAudioEngine();