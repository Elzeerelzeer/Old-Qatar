/**
 * Web Audio API Sound Generator & Manager for Qatar Lowwal
 * Operates offline without external audio files, with placeholders for custom MP3/WAV files.
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isEnabled: boolean = false;
  private volume: number = 0.5;
  private ambientSeaNode: GainNode | null = null;
  private ambientNoiseSource: AudioNode | null = null;

  constructor() {
    // Audio starts disabled until user explicitly clicks "تفعيل الصوت"
    this.isEnabled = false;
  }

  public init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isEnabled = true;
  }

  public setEnabled(enabled: boolean) {
    if (enabled && !this.ctx) {
      this.init();
    }
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAmbientSea();
    }
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ambientSeaNode && this.ctx) {
      this.ambientSeaNode.gain.setValueAtTime(this.volume * 0.12, this.ctx.currentTime);
    }
  }

  // 1. صوت فتح الباب التراثي (Traditional heavy door opening / creak)
  public playDoorOpen() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Low wooden thud & resonant squeak
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.9);

      // Lowpass filter for wooden warmth
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(700, now + 0.4);
      filter.frequency.linearRampToValueAtTime(300, now + 1.0);

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
  }

  // 2. صوت الخطوات في الرمل والحصى (Footsteps on sand/gravel)
  public playFootstep() {
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
  }

  // 3. صوت بحر اللؤلؤ وأمواج الشاطئ (Gentle sea breeze & waves)
  public startAmbientSea() {
    if (!this.isEnabled || !this.ctx || this.ambientSeaNode) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02; // Pink-brown noise
        lastOut = data[i];
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(this.volume * 0.08, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
      this.ambientSeaNode = gain;
      this.ambientNoiseSource = noise;
    } catch {
      // fallback
    }
  }

  public stopAmbientSea() {
    if (this.ambientNoiseSource) {
      try {
        (this.ambientNoiseSource as AudioBufferSourceNode).stop();
        this.ambientNoiseSource.disconnect();
      } catch {
        // ignore
      }
      this.ambientNoiseSource = null;
    }
    this.ambientSeaNode = null;
  }

  // 4. صوت النجاح / الختم / الوصول (Celebration / stamp / chime)
  public playSuccess() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Pentatonic Arabian style harmonic chime (D, F#, A, B, D)
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
  }

  // 5. صوت الاقتراب من مبنى تراثي (Approaching building glow chime)
  public playProximityChime() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.2); // E5

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
  }

  // 6. صوت النقر على الأزرار (UI Click)
  public playClick() {
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
  }

  // 7. صوت رنة المجلس والعود التراثي (Oud/string pluck ambiance)
  public playMajlisChime() {
    if (!this.isEnabled || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const baseFreq = 220; // A3
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
  }
}

export const soundManager = new SoundSystem();
