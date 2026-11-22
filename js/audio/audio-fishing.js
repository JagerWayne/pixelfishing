/* AudioEngine methods: tones and noise bursts, the cast, splash, bite alert and reel ticks. */

export const audioFishingMethods = {
  // Smooth, rounded tones: harsh square/sawtooth waves are mapped to softer ones, every note
  // fades in over a few milliseconds (no clicks) and is low-pass filtered to remove the buzzy highs.
  playTone({ freq = 440, endFreq = null, type = 'sine', duration = 0.12, vol = 0.12, delay = 0 }) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const SOFT_WAVE = { square: 'sine', sawtooth: 'triangle' };
    const wave = SOFT_WAVE[type] || type;
    const now = this.ctx.currentTime + delay;
    const attack = Math.min(0.025, duration * 0.3);
    const level = vol * 0.8;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const lp = this.ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = Math.min(2400, Math.max(500, freq * 3));
    lp.Q.value = 0.4;
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.04);
    osc.connect(lp);
    lp.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.06);
  },

  playNoise({ duration = 0.18, vol = 0.12, filterFreq = 900, filterType = 'bandpass' }) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx || this.ctx.state !== 'running') return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = Math.min(filterFreq, 1400);
    filter.Q.value = 0.5;

    // Extra low-pass takes the hiss off the top so bursts sound like soft whooshes, not static.
    const soften = this.ctx.createBiquadFilter();
    soften.type = 'lowpass';
    soften.frequency.value = 1800;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    const attack = Math.min(0.03, duration * 0.3);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(vol * 0.75, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(soften);
    soften.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  },

  playCast() {
    this.vibrate(20);
    this.playTone({ freq: 260, endFreq: 720, type: 'triangle', duration: 0.18, vol: 0.14 });
    this.playNoise({ duration: 0.2, vol: 0.08, filterFreq: 900 });
  },

  playSplash() {
    this.playNoise({ duration: 0.25, vol: 0.16, filterFreq: 650, filterType: 'lowpass' });
    this.playTone({ freq: 190, endFreq: 85, type: 'sine', duration: 0.15, vol: 0.12 });
  },

  playBiteAlert() {
    this.vibrate([45, 40, 65]);
    this.playTone({ freq: 587.33, type: 'sine', duration: 0.14, vol: 0.14, delay: 0 });
    this.playTone({ freq: 783.99, type: 'sine', duration: 0.22, vol: 0.15, delay: 0.12 });
  },

  playReelTick(tensionRatio = 0.5) {
    const now = performance.now();
    if (now - this.lastReelTick < 80) return;
    this.lastReelTick = now;
    if (tensionRatio > 0.8) this.vibrate(8);
    const pitch = 280 + tensionRatio * 420;
    this.playTone({ freq: pitch * 0.7, endFreq: pitch * 0.6, type: 'sine', duration: 0.06, vol: 0.05 });
  },
};
