/**
 * Web Audio API & Native Audio Engine for Qatar Lowwal (قطر لوّل)
 * Handles instant playback, preloaded WAV heritage assets, and procedural synthesis fallback.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = true;
  private volume: number = 0.6;
  private audioBuffers: Map<string, AudioBuffer> = new Map();
  private isLoadingBuffers: boolean = false;
  private hasPreloaded: boolean = false;

  // Ambience nodes / elements
  private ambientSeaNode: AudioBufferSourceNode | null = null;
  private ambientSeaGain: GainNode | null = null;
  private ambientSeaAudio: HTMLAudioElement | null = null;
  private isAmbientSeaPlaying: boolean = false;

  private ambientVillageAudio: HTMLAudioElement | null = null;
  private isAmbientVillagePlaying: boolean = false;

  private ambientSouqAudio: HTMLAudioElement | null = null;
  private isAmbientSouqPlaying: boolean = false;
  private autoplayUnlockAttached: boolean = false;

  constructor() {
    this.isEnabled = true;
    if (typeof window !== 'undefined') {
      this.attachAutoplayUnlock();
      // Preload in background
      window.setTimeout(() => {
        this.preloadAllSounds();
      }, 100);
    }
  }

  /**
   * Listen for user interaction to unlock audio context across all browsers (iOS/Safari/Chrome)
   */
  private attachAutoplayUnlock() {
    if (this.autoplayUnlockAttached || typeof window === 'undefined') return;
    this.autoplayUnlockAttached = true;

    const unlock = () => {
      this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      if (this.isAmbientSouqPlaying && this.ambientSouqAudio) {
        this.ambientSouqAudio.play().catch(() => {});
      }
      if (this.isAmbientSeaPlaying && this.ambientSeaAudio) {
        this.ambientSeaAudio.play().catch(() => {});
      }
      if (this.isAmbientVillagePlaying && this.ambientVillageAudio) {
        this.ambientVillageAudio.play().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
      this.autoplayUnlockAttached = false;
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('click', unlock, { once: true, passive: true });
  }

  public init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    this.isEnabled = true;

    if (!this.hasPreloaded) {
      this.preloadAllSounds();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (enabled) {
      this.init();
      if (this.isAmbientSouqPlaying && this.ambientSouqAudio) {
        this.ambientSouqAudio.play().catch(() => {});
      }
      if (this.isAmbientSeaPlaying && this.ambientSeaAudio) {
        this.ambientSeaAudio.play().catch(() => {});
      }
      if (this.isAmbientVillagePlaying && this.ambientVillageAudio) {
        this.ambientVillageAudio.play().catch(() => {});
      }
    } else {
      this.stopAmbientSea();
      if (this.ambientSouqAudio) {
        try {
          this.ambientSouqAudio.pause();
        } catch {
          // ignore
        }
      }
      if (this.ambientVillageAudio) {
        try {
          this.ambientVillageAudio.pause();
        } catch {
          // ignore
        }
      }
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientSeaGain && this.ctx) {
      this.ambientSeaGain.gain.setValueAtTime(this.volume * 0.2, this.ctx.currentTime);
    }
    if (this.ambientSeaAudio) {
      this.ambientSeaAudio.volume = Math.max(0, Math.min(1, this.volume * 0.25));
    }
    if (this.ambientSouqAudio) {
      this.ambientSouqAudio.volume = Math.max(0, Math.min(1, this.volume * 0.38));
    }
    if (this.ambientVillageAudio) {
      this.ambientVillageAudio.volume = Math.max(0, Math.min(1, this.volume * 0.30));
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Preload and decode all key sound effects into memory for instant zero-latency playback
   */
  public async preloadAllSounds() {
    if (this.isLoadingBuffers || typeof window === 'undefined') return;
    this.isLoadingBuffers = true;

    const sfxList = [
      { key: 'click', url: '/sounds/click.wav' },
      { key: 'door_open', url: '/sounds/door_open.wav' },
      { key: 'footstep', url: '/sounds/footstep.wav' },
      { key: 'success', url: '/sounds/success.wav' },
      { key: 'chime', url: '/sounds/chime.wav' },
      { key: 'sea_waves', url: '/sounds/sea_waves.wav' },
      { key: 'majlis_oud', url: '/sounds/majlis_oud.wav' },
    ];

    // Preload SFX buffers
    for (const item of sfxList) {
      if (this.audioBuffers.has(item.key)) continue;
      try {
        const response = await fetch(item.url);
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          if (this.ctx) {
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer.slice(0));
            this.audioBuffers.set(item.key, audioBuffer);
          }
        }
      } catch (err) {
        console.warn(`Could not preload sound ${item.key}:`, err);
      }
    }

    // Also prefetch ambient & narration sounds into browser cache
    const narrationList = [
      'jar', 'pot', 'dallah', 'basket', 'cardamom', 'saffron', 'cinnamon',
      'palm', 'fabric', 'scale', 'box', 'lantern', 'falcon', 'glove', 'perch'
    ];

    if ('caches' in window) {
      try {
        const cache = await caches.open('qatar-lowwal-audio-v1');
        const urlsToCache = [
          '/sounds/village_ambient_music.wav',
          '/sounds/souq_ambience.wav',
          ...narrationList.map((id) => `/sounds/narration/${id}.wav`),
        ];
        cache.addAll(urlsToCache).catch(() => {});
      } catch {
        // cache storage fallback
      }
    }

    this.hasPreloaded = true;
    this.isLoadingBuffers = false;
  }

  /**
   * Helper to play preloaded AudioBuffer with zero latency, or fallback to procedural synthesis
   */
  private playBuffer(key: string, volMultiplier: number = 1.0, fallbackSynth?: () => void) {
    if (!this.isEnabled) return;
    if (!this.ctx) {
      this.init();
    }

    const buffer = this.audioBuffers.get(key);
    if (buffer && this.ctx) {
      try {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(this.volume * volMultiplier, this.ctx.currentTime);
        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return;
      } catch (err) {
        console.warn(`Error playing buffer ${key}:`, err);
      }
    }

    // Fallback if buffer not loaded or Web Audio not ready
    if (fallbackSynth) {
      fallbackSynth();
    } else {
      // Direct Audio element fallback
      try {
        const audio = new Audio(`/sounds/${key}.wav`);
        audio.volume = Math.max(0, Math.min(1, this.volume * volMultiplier));
        audio.play().catch(() => {});
      } catch {
        // ignore
      }
    }
  }

  // 1. صوت فتح الباب التراثي (Traditional heavy door opening / creak)
  public playDoorOpen() {
    this.playBuffer('door_open', 0.85, () => {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.9);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.1);
      } catch {
        // safe fallback
      }
    });
  }

  // 2. صوت الخطوات في الرمل والحصى (Footsteps on sand/gravel)
  public playFootstep() {
    this.playBuffer('footstep', 0.55, () => {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.08;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(900 + Math.random() * 300, now);
        filter.Q.value = 2.5;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(this.volume * 0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start(now);
      } catch {
        // fallback
      }
    });
  }

  // 3. صوت بحر اللؤلؤ وأمواج الشاطئ (Gentle sea breeze & waves)
  public startAmbientSea() {
    this.isAmbientSeaPlaying = true;
    if (!this.isEnabled) {
      this.init();
    }

    if (!this.ambientSeaAudio && typeof Audio !== 'undefined') {
      try {
        this.ambientSeaAudio = new Audio('/sounds/sea_waves.wav');
        this.ambientSeaAudio.loop = true;
        this.ambientSeaAudio.preload = 'auto';
      } catch (err) {
        console.warn('Could not initialize Sea audio element', err);
      }
    }

    if (this.ambientSeaAudio) {
      this.ambientSeaAudio.volume = Math.max(0, Math.min(1, this.volume * 0.28));
      this.ambientSeaAudio.loop = true;
      this.ambientSeaAudio.play().catch(() => {
        this.attachAutoplayUnlock();
      });
    }
  }

  public stopAmbientSea() {
    this.isAmbientSeaPlaying = false;
    if (this.ambientSeaAudio) {
      try {
        this.ambientSeaAudio.pause();
        this.ambientSeaAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }
    if (this.ambientSeaNode) {
      try {
        this.ambientSeaNode.stop();
        this.ambientSeaNode.disconnect();
      } catch {
        // ignore
      }
      this.ambientSeaNode = null;
    }
    this.ambientSeaGain = null;
  }

  // 3b. صوت أجواء سوق واقف القديم المتكرر
  public startAmbientSouq() {
    this.isAmbientSouqPlaying = true;
    if (!this.isEnabled) {
      this.init();
    }

    if (!this.ambientSouqAudio && typeof Audio !== 'undefined') {
      try {
        this.ambientSouqAudio = new Audio('/sounds/souq_ambience.wav');
        this.ambientSouqAudio.loop = true;
        this.ambientSouqAudio.preload = 'auto';
      } catch (err) {
        console.warn('Could not initialize Souq audio element', err);
      }
    }

    if (this.ambientSouqAudio) {
      this.ambientSouqAudio.volume = Math.max(0, Math.min(1, this.volume * 0.38));
      this.ambientSouqAudio.loop = true;
      this.ambientSouqAudio.play().catch(() => {
        this.attachAutoplayUnlock();
      });
    }
  }

  public stopAmbientSouq() {
    this.isAmbientSouqPlaying = false;
    if (this.ambientSouqAudio) {
      try {
        this.ambientSouqAudio.pause();
        this.ambientSouqAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }

  public toggleAmbientSouq(): boolean {
    if (this.isAmbientSouqPlaying) {
      this.stopAmbientSouq();
      return false;
    } else {
      this.startAmbientSouq();
      return true;
    }
  }

  public isSouqAmbientActive(): boolean {
    return this.isAmbientSouqPlaying;
  }

  // 3c. الموسيقى التراثية الهادئة لقرية قطر لوّل (Traditional gentle ambient village music loop)
  public startAmbientVillageMusic() {
    this.isAmbientVillagePlaying = true;
    if (!this.isEnabled) {
      return;
    }
    this.init();

    if (!this.ambientVillageAudio && typeof Audio !== 'undefined') {
      try {
        this.ambientVillageAudio = new Audio('/sounds/village_ambient_music.wav');
        this.ambientVillageAudio.loop = true;
        this.ambientVillageAudio.preload = 'auto';
      } catch (err) {
        console.warn('Could not initialize Village Music audio element', err);
      }
    }

    if (this.ambientVillageAudio) {
      this.ambientVillageAudio.volume = Math.max(0, Math.min(1, this.volume * 0.30));
      this.ambientVillageAudio.loop = true;
      this.ambientVillageAudio.play().catch(() => {
        this.attachAutoplayUnlock();
      });
    }
  }

  public stopAmbientVillageMusic() {
    this.isAmbientVillagePlaying = false;
    if (this.ambientVillageAudio) {
      try {
        this.ambientVillageAudio.pause();
        this.ambientVillageAudio.currentTime = 0;
      } catch {
        // ignore
      }
    }
  }

  public startVillageMusic() {
    this.startAmbientVillageMusic();
  }

  public stopVillageMusic() {
    this.stopAmbientVillageMusic();
  }

  public isVillageAmbientActive(): boolean {
    return this.isAmbientVillagePlaying;
  }

  public isVillageMusicPlaying(): boolean {
    return this.isAmbientVillagePlaying && this.isEnabled;
  }

  // 4. صوت النجاح / الختم / الوصول (Celebration / stamp / chime)
  public playSuccess() {
    this.playBuffer('success', 0.95, () => {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const notes = [293.66, 369.99, 440.0, 493.88, 587.33];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0, now + idx * 0.09);
          gain.gain.linearRampToValueAtTime(this.volume * 0.28, now + idx * 0.09 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.8);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.85);
        });
      } catch {
        // fallback
      }
    });
  }

  // 5. صوت الاقتراب من مبنى تراثي (Approaching building glow chime)
  public playProximityChime() {
    this.playBuffer('chime', 0.8, () => {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } catch {
        // fallback
      }
    });
  }

  // 6. صوت النقر على الأزرار (UI Click)
  public playClick() {
    this.playBuffer('click', 0.75, () => {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(this.volume * 0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } catch {
        // fallback
      }
    });
  }

  // 7. صوت رنة المجلس والعود التراثي (Oud/string pluck ambiance)
  public playMajlisChime() {
    this.playBuffer('majlis_oud', 0.9, () => {
      if (!this.isEnabled || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const baseFreq = 220;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        gain.gain.setValueAtTime(this.volume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      } catch {
        // fallback
      }
    });
  }
}

export const soundManager = new SoundSystem();
