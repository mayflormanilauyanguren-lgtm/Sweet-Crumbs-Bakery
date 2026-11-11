// Audio notification chime using native Web Audio API (no external MP3/WAV dependencies)
export function playOrderStatusChime(type: 'out_for_delivery' | 'completed') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'out_for_delivery') {
      // Ascending two-tone dispatch chime: D5 (587.33Hz) -> A5 (880Hz) -> D6 (1174.66Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.16);

      osc2.frequency.setValueAtTime(880, now + 0.16);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.36);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.65);
    } else {
      // Warm joyful celebration arpeggio: C5, E5, G5, C6 (523.25, 659.25, 783.99, 1046.50)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.1;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.16, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.5);
      });
    }
  } catch {
    // Autoplay policy or unsupported audio environment - fails silently
  }
}
