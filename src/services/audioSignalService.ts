// ============================================================================
// Service Traitement du Signal & Synthèse Audio Web Audio API
// Démonstrateur d'amélioration vocale et de débruitage KALA VOICE QA
// ============================================================================

export type AudioPlayMode = 'ORIGINAL_NOISY' | 'KALA_DENOISED';

class AudioSignalService {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private playMode: AudioPlayMode = 'KALA_DENOISED';
  private currentTime: number = 0;
  private duration: number = 125;
  private animFrameId: number | null = null;
  private lastTimestamp: number = 0;
  private noiseNode: AudioNode | null = null;
  private voiceGainNode: GainNode | null = null;
  private noiseGainNode: GainNode | null = null;
  private timeListeners: ((time: number) => void)[] = [];
  private stateListeners: ((isPlaying: boolean) => void)[] = [];

  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public setPlayMode(mode: AudioPlayMode): void {
    this.playMode = mode;
    if (this.noiseGainNode) {
      // Si mode débruité, couper ou atténuer drastiquement le bruit (-24dB)
      const targetGain = mode === 'ORIGINAL_NOISY' ? 0.18 : 0.008;
      this.noiseGainNode.gain.setTargetAtTime(targetGain, this.audioCtx?.currentTime || 0, 0.05);
    }
  }

  public getPlayMode(): AudioPlayMode {
    return this.playMode;
  }

  public play(startFrom?: number, durationSeconds?: number): void {
    const ctx = this.initAudioContext();
    if (this.isPlaying) return;

    if (startFrom !== undefined) {
      this.currentTime = startFrom;
    }
    if (durationSeconds !== undefined) {
      this.duration = durationSeconds;
    }

    this.isPlaying = true;
    this.lastTimestamp = performance.now();
    this.notifyState();

    // Démarrage de la synthèse audio réaliste (bruit ambiant + harmonique vocale)
    try {
      this.startSynthesizedAudio(ctx);
    } catch {
      // Fallback si l'audio context est bloqué
    }

    this.startTimerLoop();
  }

  public pause(): void {
    this.isPlaying = false;
    this.notifyState();
    this.stopSynthesizedAudio();
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public seek(seconds: number): void {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    this.notifyTime();
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startTimerLoop(): void {
    const loop = (timestamp: number) => {
      if (!this.isPlaying) return;

      const delta = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      this.currentTime += delta;
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.pause();
        this.notifyTime();
        return;
      }

      this.notifyTime();
      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private startSynthesizedAudio(ctx: AudioContext): void {
    // 1. Générateur de bruit (Pink / Brown noise simulant le plateau téléphonique bruité)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }

    const whiteNoiseSource = ctx.createBufferSource();
    whiteNoiseSource.buffer = noiseBuffer;
    whiteNoiseSource.loop = true;

    // Filtre passe-bande simulant la compression téléphonique (300Hz - 3400Hz)
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1200;
    bandpass.Q.value = 1.2;

    this.noiseGainNode = ctx.createGain();
    // En fonction du mode (Original bruité vs Débruité KALA)
    this.noiseGainNode.gain.value = this.playMode === 'ORIGINAL_NOISY' ? 0.18 : 0.005;

    whiteNoiseSource.connect(bandpass);
    bandpass.connect(this.noiseGainNode);
    this.noiseGainNode.connect(ctx.destination);
    whiteNoiseSource.start();
    this.noiseNode = whiteNoiseSource;

    // 2. Oscillateur vocal simulé (fondamentale de voix humaine ~ 180 Hz)
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);

    this.voiceGainNode = ctx.createGain();
    this.voiceGainNode.gain.setValueAtTime(0.08, ctx.currentTime);

    osc.connect(this.voiceGainNode);
    this.voiceGainNode.connect(ctx.destination);
    osc.start();
  }

  private stopSynthesizedAudio(): void {
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioBufferSourceNode).stop();
        this.noiseNode.disconnect();
      } catch {
        // Déjà arrêté
      }
      this.noiseNode = null;
    }
    if (this.voiceGainNode) {
      try {
        this.voiceGainNode.disconnect();
      } catch {
        // Ignorer
      }
      this.voiceGainNode = null;
    }
  }

  public onTimeUpdate(cb: (time: number) => void): () => void {
    this.timeListeners.push(cb);
    return () => {
      this.timeListeners = this.timeListeners.filter(l => l !== cb);
    };
  }

  public onStateChange(cb: (isPlaying: boolean) => void): () => void {
    this.stateListeners.push(cb);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== cb);
    };
  }

  private notifyTime(): void {
    this.timeListeners.forEach(cb => cb(this.currentTime));
  }

  private notifyState(): void {
    this.stateListeners.forEach(cb => cb(this.isPlaying));
  }

  // --- Algorithmes d'analyse acoustique & SNR ---
  public static calculateSNR(signalEnergy: number, noiseEnergy: number): number {
    if (noiseEnergy <= 0) return 30.0;
    return Math.round(10 * Math.log10(signalEnergy / noiseEnergy) * 10) / 10;
  }

  public static estimateNoiseLevel(snrDb: number): 'FAIBLE' | 'MODÉRÉ' | 'SÉVÈRE' | 'CRITIQUE' {
    if (snrDb >= 20) return 'FAIBLE';
    if (snrDb >= 12) return 'MODÉRÉ';
    if (snrDb >= 7) return 'SÉVÈRE';
    return 'CRITIQUE';
  }
}

export const audioSignalService = new AudioSignalService();
