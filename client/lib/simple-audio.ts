// Audio system - enabled for Chocobo SOLDIER campaign with FF music tracks
let currentMusic: HTMLAudioElement | null = null;
let audioEnabled = localStorage.getItem('soundEnabled') !== 'false'; // Default to enabled
let audioUnlocked = false; // Track if user has interacted to unlock audio

export const simpleAudio = {
  // Music playback for campaign chapters
  playMusic: (trackPath: string, volume: number = 0.3) => {
    if (!audioEnabled) return;
    
    try {
      // Stop current music if playing
      if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
      }
      
      // Create new audio element
      currentMusic = new Audio(trackPath);
      currentMusic.volume = volume;
      currentMusic.loop = true; // Loop campaign music continuously
      
      // Prevent interruption during race
      currentMusic.addEventListener('ended', () => {
        if (currentMusic) {
          currentMusic.currentTime = 0;
          currentMusic.play().catch(e => console.log('Loop restart failed:', e));
        }
      });
      
      // Try to play, handle autoplay policy
      const playPromise = currentMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('🎵 Click anywhere to start the music!', error);
          // Add click listener to start music on first user interaction
          const startMusic = () => {
            if (currentMusic) {
              currentMusic.play().catch(e => console.log('Manual play failed:', e));
              console.log('🎵 Music started! Enjoy the Chocobo theme!');
              audioUnlocked = true;
            }
            document.removeEventListener('click', startMusic);
            document.removeEventListener('keydown', startMusic);
          };
          document.addEventListener('click', startMusic);
          document.addEventListener('keydown', startMusic);
        });
      } else {
        audioUnlocked = true;
      }
    } catch (error) {
      console.log('Music loading failed:', error);
    }
  },
  
  stopMusic: () => {
    if (currentMusic) {
      currentMusic.pause();
      currentMusic.currentTime = 0;
      currentMusic = null;
    }
  },
  
  // Calm and festive countdown timer (3-2-1) - DON'T INTERRUPT MUSIC
  playRaceCountdown: () => {
    if (!audioEnabled) return;
    
    // Create a gentle, festive countdown sound that doesn't interrupt background music
    const playCountdownBeep = (frequency: number) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine'; // Gentle sine wave
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05); // Lower volume to not interfere
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        // Clean up context quickly to not interfere with music
        setTimeout(() => {
          try {
            audioContext.close();
          } catch (e) {
            // Ignore cleanup errors
          }
        }, 500);
      } catch (error) {
        // Don't let countdown errors stop the music
        console.log('Countdown beep failed, continuing with music');
      }
    };
    
    // Play countdown sequence: 3-2-1 with different gentle tones
    setTimeout(() => playCountdownBeep(800), 0);    // 3 - higher tone
    setTimeout(() => playCountdownBeep(600), 1000); // 2 - medium tone  
    setTimeout(() => playCountdownBeep(400), 2000); // 1 - lower tone
  },

  // Victory/defeat jingles with campaign-specific music
  playRaceResult: (isWinner: boolean, position: number, campaignCharacter?: string) => {
    if (!audioEnabled) return;
    
    try {
      // STOP background music completely when victory/defeat plays
      if (currentMusic) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
        currentMusic = null;
      }
      
      // Play appropriate sound based on position and campaign type
      let soundPath = "";
      
      // Special victory music for Chocobo SOLDIER campaign
      if (campaignCharacter === 'zack_chocobo' && position <= 3) {
        soundPath = "/12. Crystal Legend.mp3"; // Victory fanfare for SOLDIER campaign
      } 
      // Regular campaigns and multiplayer - use CJSR1stplace for victories
      else if (position <= 3) {
        soundPath = "/cjsr1stPlace.mp3"; // All podium finishes get victory sound
      } else {
        soundPath = "/5_defeat_jingle.wav"; // 4th place and below gets defeat sound
      }
      
      const resultSound = new Audio(soundPath);
      resultSound.volume = 0.6;
      resultSound.play().catch(e => console.log('Result sound play failed:', e));
      
      // Don't resume campaign music - race is over
    } catch (error) {
      console.log('Result sound loading failed:', error);
    }
  },
  
  // Placeholder functions for compatibility
  playRaceStart: () => {},
  playRaceFinish: () => {},
  playError: () => {},
  playSuccess: () => {},
  playCampaignTheme: (character: string) => {
    if (!audioEnabled) return;
    
    // Play specific music for Chocobo SOLDIER campaign with FF tracks
    if (character === 'zack_chocobo') {
      const musicPath = "/03. Chocobo's Theme.mp3";
      console.log(`🎵 Playing Chocobo SOLDIER theme: ${musicPath}`);
      simpleAudio.playMusic(musicPath, 0.4);
    }
    // Regular campaigns get their own themes
    else if (character === 'steve') {
      const musicPath = "/06. Pleasant Journey.mp3";
      console.log(`🎵 Playing Steve's heroic theme: ${musicPath}`);
      simpleAudio.playMusic(musicPath, 0.3);
    }
    else if (character === 'auto') {
      const musicPath = "/07. Golem's Theme.mp3";
      console.log(`🎵 Playing Auto's tech theme: ${musicPath}`);
      simpleAudio.playMusic(musicPath, 0.3);
    }
    else if (character === 'matikah') {
      const musicPath = "/11. White Mage's Theme.mp3";
      console.log(`🎵 Playing Matikah's mystical theme: ${musicPath}`);
      simpleAudio.playMusic(musicPath, 0.3);
    }
    else if (character === 'iam') {
      const musicPath = "/09. Bizarre Mystery.mp3";
      console.log(`🎵 Playing Iam's mysterious theme: ${musicPath}`);
      simpleAudio.playMusic(musicPath, 0.3);
    }
  },
  playTypingSound: () => {},
  playErrorSound: () => {},
  playMultiplayerTheme: () => {},
  playHeroicTheme: () => {},
  playTechTheme: () => {},
  playMysticalTheme: () => {},
  playMysteriousTheme: () => {},
  playBattleTheme: () => {},
  playVictoryTheme: () => {},
  playDefeatTheme: () => {},
  stopAllAudio: () => { simpleAudio.stopMusic(); },
  setEnabled: (enabled: boolean) => { 
    audioEnabled = enabled; 
    localStorage.setItem('soundEnabled', enabled.toString());
  },
  isEnabled: () => audioEnabled,
  stop: () => { simpleAudio.stopMusic(); },
  pause: () => { if (currentMusic) currentMusic.pause(); },
  resume: () => { if (currentMusic) currentMusic.play().catch(e => console.log('Resume failed:', e)); },
};