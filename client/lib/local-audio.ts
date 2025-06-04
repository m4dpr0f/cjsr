/**
 * Local Audio System for CJSR
 * Uses uploaded MP3 files for authentic racing music
 */

// Import your uploaded racing tracks
import chocobosTheme from "@assets/03 Chocobo's Theme.mp3";
import dashDeChocobo from "@assets/01 Dash de Chocobo.mp3";
import cidsTestTrack from "@assets/05 Cid's Test Track.mp3";
import chocobooChoosIn from "@assets/02 Chocobo Choosin'.mp3";
import losersRequiem from "@assets/30 Loser's Requiem.mp3";
import victoryFanfare from "@assets/final-fantasy-vii-victory-fanfare-1.mp3";

// Audio track mappings for different themes
const AUDIO_TRACKS = {
  heroic: [chocobosTheme, dashDeChocobo],
  technological: [cidsTestTrack],
  mystical: [chocobooChoosIn],
  mysterious: [chocobooChoosIn],
  battle: [dashDeChocobo],
  victory: [victoryFanfare],
  defeat: [losersRequiem]
};

class LocalAudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private isEnabled: boolean = true;

  /**
   * Play a theme using uploaded MP3 files
   */
  async playTheme(theme: keyof typeof AUDIO_TRACKS): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Stop any currently playing audio
      this.stop();

      // Get tracks for this theme
      const tracks = AUDIO_TRACKS[theme];
      if (!tracks || tracks.length === 0) {
        console.warn(`No tracks available for theme: ${theme}`);
        return;
      }

      // Pick a random track from the theme
      const selectedTrack = tracks[Math.floor(Math.random() * tracks.length)];
      
      console.log(`🎵 Playing ${theme} theme:`, selectedTrack);

      // Create and play the audio
      this.currentAudio = new Audio(selectedTrack);
      this.currentAudio.volume = 0.6; // Good volume level
      
      // Victory and defeat music should play once, racing music loops
      if (theme === 'victory' || theme === 'defeat') {
        this.currentAudio.loop = false; // Play once for victory/defeat
        this.currentAudio.currentTime = 0; // Start from beginning
      } else {
        this.currentAudio.loop = true; // Loop the music during races
        this.currentAudio.currentTime = 15; // Start 15 seconds in for racing music
      }
      
      // Play the audio
      await this.currentAudio.play();
      
      console.log(`✅ Successfully playing ${theme} racing music!`);
      
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  /**
   * Stop currently playing music
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Enable/disable audio
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean {
    return !!(this.currentAudio && !this.currentAudio.paused);
  }
}

export const localAudio = new LocalAudioManager();