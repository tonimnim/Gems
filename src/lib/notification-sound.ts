// Subtle notification sound using Web Audio API
// Creates a pleasant two-tone chime

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioContext;
}

export async function playNotificationSound(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Resume if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const now = ctx.currentTime;

    // Create a pleasant two-note chime
    // First note: Higher pitch
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.value = 830; // G#5
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.15, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second note: Lower pitch, slightly delayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 622; // D#5
    gain2.gain.setValueAtTime(0, now + 0.1);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);

    // Add subtle harmonic overtone for richness
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.value = 1245; // D#6 (octave up)
    gain3.gain.setValueAtTime(0, now);
    gain3.gain.linearRampToValueAtTime(0.05, now + 0.02);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now);
    osc3.stop(now + 0.2);

  } catch (error) {
    // Silently fail - notification sounds are not critical
    console.warn('Could not play notification sound:', error);
  }
}

// Preload/warm up the audio context on user interaction
export function initNotificationSound(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    // Will be resumed on next user interaction
  }
}
