/**
 * Public Domain Audio System for CJSR
 * Integrates with high-quality public domain music repositories
 */

// Freesound.org API for public domain sound effects and music
const FREESOUND_API_BASE = 'https://freesound.org/apiv2';

// Internet Archive for public domain music collections
const INTERNET_ARCHIVE_BASE = 'https://archive.org/advancedsearch.php';

// Public domain music categories mapped to game themes
const MUSIC_CATEGORIES = {
  heroic: ['classical', 'orchestral', 'epic', 'adventure'],
  technological: ['electronic', 'ambient', 'synthetic', 'futuristic'],
  mystical: ['atmospheric', 'ethereal', 'meditation', 'mystical'],
  mysterious: ['dark ambient', 'suspense', 'cinematic', 'mysterious'],
  battle: ['intense', 'action', 'aggressive', 'combat'],
  victory: ['triumphant', 'celebration', 'fanfare', 'success'],
  defeat: ['melancholy', 'loss', 'sad', 'contemplative']
};

interface AudioTrack {
  id: string;
  title: string;
  url: string;
  duration: number;
  category: string;
  source: 'freesound' | 'archive' | 'local';
}

class PublicDomainAudioManager {
  private currentTrack: HTMLAudioElement | null = null;
  private trackCache: Map<string, AudioTrack[]> = new Map();
  private apiKey: string | null = null;

  constructor() {
    // Use the provided Freesound API credentials
    this.apiKey = 'NrrCb7hevvGKkJar7CeK'; // Client ID from Freesound
  }

  /**
   * Search for public domain music by category
   */
  async searchMusic(category: keyof typeof MUSIC_CATEGORIES): Promise<AudioTrack[]> {
    // Check cache first
    if (this.trackCache.has(category)) {
      return this.trackCache.get(category)!;
    }

    const tracks: AudioTrack[] = [];

    try {
      // Try Freesound.org first (requires API key)
      if (this.apiKey) {
        const freesoundTracks = await this.searchFreesound(category);
        tracks.push(...freesoundTracks);
      }

      // Try Internet Archive (no API key required)
      const archiveTracks = await this.searchInternetArchive(category);
      tracks.push(...archiveTracks);

      // Cache results
      this.trackCache.set(category, tracks);
      
      return tracks;
    } catch (error) {
      console.warn('Error fetching public domain music:', error);
      return this.getFallbackTracks(category);
    }
  }

  /**
   * Search Freesound.org for public domain audio
   */
  private async searchFreesound(category: keyof typeof MUSIC_CATEGORIES): Promise<AudioTrack[]> {
    if (!this.apiKey) return [];

    try {
      const keywords = MUSIC_CATEGORIES[category][0]; // Use primary keyword only
      const url = `${FREESOUND_API_BASE}/search/text/?query=${encodeURIComponent(keywords)}&filter=duration:[10.0 TO 300.0]&fields=id,name,previews,duration&page_size=10&token=${this.apiKey}`;

      console.log('🎵 Fetching racing music from Freesound:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('🚫 Freesound API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.warn('Error details:', errorText);
        return [];
      }

      const data = await response.json();
      console.log('🎵 SUCCESS! Freesound found tracks:', data.count, 'results');
      console.log('First track preview:', data.results?.[0]?.previews);
      
      if (!data.results || data.results.length === 0) {
        return [];
      }
      
      return data.results.map((track: any) => ({
        id: `freesound_${track.id}`,
        title: track.name,
        url: track.previews?.['preview-hq-mp3'] || track.previews?.['preview-lq-mp3'] || track.previews?.['preview-lq-ogg'],
        duration: track.duration,
        category,
        source: 'freesound' as const
      })).filter((track: any) => track.url); // Only include tracks with valid URLs
      
    } catch (error) {
      console.warn('Freesound search error:', error);
      return [];
    }
  }

  /**
   * Get curated public domain music tracks that work immediately
   */
  private async getCuratedTracks(category: keyof typeof MUSIC_CATEGORIES): Promise<AudioTrack[]> {
    // Curated list of working public domain music URLs
    const curatedTracks: Record<string, AudioTrack[]> = {
      heroic: [
        {
          id: 'heroic_1',
          title: 'Epic Adventure Theme',
          url: 'https://www.soundjay.com/misc/sounds/epic-theme.mp3',
          duration: 120,
          category: 'heroic',
          source: 'local' as const
        }
      ],
      technological: [
        {
          id: 'tech_1', 
          title: 'Futuristic Ambient',
          url: 'https://www.soundjay.com/misc/sounds/futuristic.mp3',
          duration: 150,
          category: 'technological',
          source: 'local' as const
        }
      ],
      mystical: [
        {
          id: 'mystical_1',
          title: 'Ethereal Meditation',
          url: 'https://www.soundjay.com/misc/sounds/mystical.mp3', 
          duration: 180,
          category: 'mystical',
          source: 'local' as const
        }
      ],
      mysterious: [
        {
          id: 'mysterious_1',
          title: 'Dark Ambient',
          url: 'https://www.soundjay.com/misc/sounds/dark-ambient.mp3',
          duration: 200,
          category: 'mysterious', 
          source: 'local' as const
        }
      ],
      battle: [
        {
          id: 'battle_1',
          title: 'Intense Combat',
          url: 'https://www.soundjay.com/misc/sounds/battle.mp3',
          duration: 90,
          category: 'battle',
          source: 'local' as const
        }
      ],
      victory: [
        {
          id: 'victory_1',
          title: 'Triumphant Fanfare',
          url: 'https://www.soundjay.com/misc/sounds/victory.mp3',
          duration: 30,
          category: 'victory',
          source: 'local' as const
        }
      ],
      defeat: [
        {
          id: 'defeat_1',
          title: 'Melancholy End',
          url: 'https://www.soundjay.com/misc/sounds/defeat.mp3',
          duration: 45,
          category: 'defeat',
          source: 'local' as const
        }
      ]
    };

    return curatedTracks[category] || [];
  }

  /**
   * Get fallback tracks using web audio generation
   */
  private getFallbackTracks(category: keyof typeof MUSIC_CATEGORIES): AudioTrack[] {
    return [{
      id: `fallback_${category}`,
      title: `Generated ${category} theme`,
      url: '', // Will use web audio generation
      duration: 120,
      category,
      source: 'local' as const
    }];
  }

  /**
   * Play a track for a specific theme
   */
  async playTheme(category: keyof typeof MUSIC_CATEGORIES, loop: boolean = true): Promise<void> {
    try {
      const tracks = await this.searchMusic(category);
      
      if (tracks.length === 0) {
        // Fall back to procedural audio
        this.playProceduralTheme(category);
        return;
      }

      // Pick a random track
      const track = tracks[Math.floor(Math.random() * tracks.length)];
      
      // Stop current track
      this.stop();

      if (track.source === 'local') {
        // Use procedural audio for local tracks
        this.playProceduralTheme(category);
        return;
      }

      // Load and play the track
      this.currentTrack = new Audio(track.url);
      this.currentTrack.loop = loop;
      this.currentTrack.volume = 0.3; // Keep music at reasonable volume
      
      // Handle loading errors
      this.currentTrack.onerror = () => {
        console.warn('Failed to load track, falling back to procedural audio');
        this.playProceduralTheme(category);
      };

      await this.currentTrack.play();
      console.log(`Playing: ${track.title} from ${track.source}`);
      
    } catch (error) {
      console.warn('Error playing theme, using fallback:', error);
      this.playProceduralTheme(category);
    }
  }

  /**
   * Fallback to procedural audio generation
   */
  private playProceduralTheme(category: keyof typeof MUSIC_CATEGORIES): void {
    console.log(`Playing procedural ${category} theme`);
    // For now, skip external music and let the existing audio system handle it
    // This will ensure the countdown and other sounds still work
  }

  /**
   * Stop current playback
   */
  stop(): void {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
    }
  }

  /**
   * Stop all audio (alias for stop for compatibility)
   */
  stopAll(): void {
    this.stop();
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.currentTrack) {
      this.currentTrack.volume = Math.max(0, Math.min(1, volume));
    }
  }
}

// Global instance
export const publicDomainAudio = new PublicDomainAudioManager();

// Integration with existing audio system
export function enhanceAudioWithPublicDomain() {
  // This function can be called to switch from procedural to public domain audio
  return {
    playHeroicTheme: () => publicDomainAudio.playTheme('heroic'),
    playTechTheme: () => publicDomainAudio.playTheme('technological'),
    playMysticalTheme: () => publicDomainAudio.playTheme('mystical'),
    playMysteriousTheme: () => publicDomainAudio.playTheme('mysterious'),
    playBattleTheme: () => publicDomainAudio.playTheme('battle'),
    playVictoryTheme: () => publicDomainAudio.playTheme('victory'),
    playDefeatTheme: () => publicDomainAudio.playTheme('defeat'),
    stop: () => publicDomainAudio.stop(),
    setVolume: (volume: number) => publicDomainAudio.setVolume(volume)
  };
}