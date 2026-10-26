// Web Audio API Synthesizer for FocusFlow
// Provides zero-latency, reliable retro & ambient soundscapes without external audio files

class SoundService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Soft wooden click for button interaction / start / pause
  playClick(volume = 0.5): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio click failed', e);
    }
  }

  // 8-bit / Chiptune Victory Celebration Melody (Inspired by Reference 1 Retro CRT aesthetic)
  playCompletionChime(volume = 0.7): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.12 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.12 }, // G5
        { freq: 1046.50, time: 0.36, dur: 0.32 }, // C6
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        gain.gain.setValueAtTime(0, ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(volume * 0.25, ctx.currentTime + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur + 0.02);
      });
    } catch (e) {
      console.warn('Audio completion failed', e);
    }
  }

  // Gentle meditative bell chime (for break end or calming mode)
  playGentleBell(volume = 0.7): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 harmonic
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        const initialGain = (volume * 0.3) / (idx + 1);
        gain.gain.setValueAtTime(initialGain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 1.9);
      });
    } catch (e) {
      console.warn('Audio bell failed', e);
    }
  }
}

export const soundService = new SoundService();
