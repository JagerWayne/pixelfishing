/* AudioEngine methods: ambience by place and weather, the diving sounds, gulls, thunder, haptics and mute. */

export const audioAmbientMethods = {
  updateAmbient(dt, weatherId, nearShore) {
    if (!this.ctx || !this.ambientStarted) return;
    const now = this.ctx.currentTime;
    if (!this.enabled) {
      this.surfGain.gain.setTargetAtTime(0, now, 0.2);
      this.rainGain.gain.setTargetAtTime(0, now, 0.2);
      if (this.subGain) this.subGain.gain.setTargetAtTime(0, now, 0.2);
      if (this.hissGain) this.hissGain.gain.setTargetAtTime(0, now, 0.2);
      return;
    }
    const uw = this.underwater;
    const targetSurf = (weatherId === 'STORM' ? 0.036 : 0.02) * (uw ? 0.22 : 1);
    const targetRain = uw ? 0 : (weatherId === 'STORM' ? 0.045 : (weatherId === 'RAIN' ? 0.028 : 0.0));
    this.surfGain.gain.setTargetAtTime(targetSurf, now, 0.4);
    this.rainGain.gain.setTargetAtTime(targetRain, now, 0.4);
    if (this.subGain) this.subGain.gain.setTargetAtTime(uw ? 0.05 + 0.07 * this.uwDepth : 0, now, 0.5);
    if (this.hissGain) this.hissGain.gain.setTargetAtTime(uw ? 0.012 : 0, now, 0.5);

    if (nearShore && !uw && weatherId !== 'STORM') {
      this.seagullTimer -= dt;
      if (this.seagullTimer <= 0) {
        this.seagullTimer = 11 + Math.random() * 14;
        this.playSeagull();
      }
    }
  },

  /* ---- diving & spearfishing sounds ---- */
  playDiveSplash() {
    this.vibrate(30);
    this.playNoise({ duration: 0.45, vol: 0.2, filterFreq: 520, filterType: 'lowpass' });
    this.playTone({ freq: 220, endFreq: 70, type: 'sine', duration: 0.3, vol: 0.14 });
    this.playNoise({ duration: 0.5, vol: 0.07, filterFreq: 2600, filterType: 'bandpass' });
  },
  playBubble() {
    const f = 380 + Math.random() * 520;
    this.playTone({ freq: f, endFreq: f * 1.7, type: 'sine', duration: 0.07, vol: 0.05 });
  },
  playBubbleBurst() {
    for (let i = 0; i < 5; i++) {
      const f = 300 + Math.random() * 700;
      this.playTone({ freq: f, endFreq: f * 1.6, type: 'sine', duration: 0.06, vol: 0.05, delay: i * 0.045 });
    }
  },
  playSpearShot() {
    this.vibrate(35);
    this.playNoise({ duration: 0.14, vol: 0.16, filterFreq: 1700, filterType: 'bandpass' });
    this.playTone({ freq: 520, endFreq: 140, type: 'sawtooth', duration: 0.16, vol: 0.1 });
  },
  playSpearHit() {
    this.vibrate([30, 30, 50]);
    this.playTone({ freq: 160, endFreq: 70, type: 'square', duration: 0.12, vol: 0.14 });
    this.playNoise({ duration: 0.12, vol: 0.12, filterFreq: 900, filterType: 'lowpass' });
  },
  playSpearBounce() {
    this.playTone({ freq: 900, endFreq: 500, type: 'triangle', duration: 0.1, vol: 0.12 });
    this.playTone({ freq: 700, endFreq: 380, type: 'triangle', duration: 0.1, vol: 0.09, delay: 0.07 });
  },
  playSpearReel() {
    const now = performance.now();
    if (this.lastSpearReel && now - this.lastSpearReel < 90) return;
    this.lastSpearReel = now;
    this.playTone({ freq: 340, endFreq: 420, type: 'square', duration: 0.04, vol: 0.04 });
  },
  playAirWarn(urgent = false) {
    this.vibrate(urgent ? [60, 40, 60] : 40);
    this.playTone({ freq: urgent ? 980 : 740, type: 'square', duration: 0.12, vol: 0.09 });
    this.playTone({ freq: urgent ? 980 : 740, type: 'square', duration: 0.12, vol: 0.09, delay: 0.18 });
  },
  playWhaleCall() {
    this.playTone({ freq: 95, endFreq: 190, type: 'sine', duration: 2.2, vol: 0.075 });
    this.playTone({ freq: 140, endFreq: 70, type: 'sine', duration: 2.6, vol: 0.05, delay: 1.2 });
  },
  playSonarPing() {
    this.playTone({ freq: 1320, endFreq: 1290, type: 'sine', duration: 0.5, vol: 0.05 });
  },

  playSeagull() {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;
    this.playTone({ freq: 1450, endFreq: 1950, type: 'sine', duration: 0.14, vol: 0.025, delay: 0 });
    this.playTone({ freq: 1850, endFreq: 1120, type: 'sine', duration: 0.22, vol: 0.025, delay: 0.14 });
  },

  playThunder() {
    if (!this.enabled) return;
    this.vibrate([90, 40, 140]);
    this.playNoise({ duration: 1.35, vol: 0.22, filterFreq: 180, filterType: 'lowpass' });
    this.playTone({ freq: 62, endFreq: 28, type: 'sawtooth', duration: 0.9, vol: 0.14 });
  },

  vibrate(pattern) {
    if (this.hapticsEnabled && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch {}
    }
  },

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) this.init();
    return this.enabled;
  },
};
