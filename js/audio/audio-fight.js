/* AudioEngine methods: the line-strain voice, fight cues, landing sting, fanfare, coins and the boat engine. */

export const audioFightMethods = {
  /* A continuous line-strain voice for the fight: a low hum plus a filtered creak, both rising with the tension. */
  startLineStrain() {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running' || this.strain) return;
    const ctx = this.ctx, out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
    const hum = ctx.createOscillator(); hum.type = 'triangle'; hum.frequency.value = 90;
    const humLp = ctx.createBiquadFilter(); humLp.type = 'lowpass'; humLp.frequency.value = 700;
    if (!this._strainBuf) {
      const len = ctx.sampleRate, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this._strainBuf = buf;
    }
    const noise = ctx.createBufferSource(); noise.buffer = this._strainBuf; noise.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 7; bp.frequency.value = 600;
    const nGain = ctx.createGain(); nGain.gain.value = 0.55;
    hum.connect(humLp); humLp.connect(out); noise.connect(bp); bp.connect(nGain); nGain.connect(out);
    hum.start(); noise.start();
    this.strain = { out, hum, noise, bp, beat: 0 };
  },
  updateLineStrain(tension, dt) {
    const s = this.strain; if (!s) return;
    const now = this.ctx.currentTime, k = Math.max(0, (tension - 0.35) / 0.65);   // quiet below 35% tension
    s.out.gain.setTargetAtTime(this.enabled ? 0.055 * k * k : 0, now, 0.06);
    s.hum.frequency.setTargetAtTime(75 + 170 * tension, now, 0.06);
    s.bp.frequency.setTargetAtTime(380 + 1900 * tension, now, 0.06);
    if (tension > 0.8) {                                        // heartbeat on the phone, faster as it gets worse
      s.beat -= dt;
      if (s.beat <= 0) { this.vibrate([16, 70, 10]); s.beat = Math.max(0.28, 0.75 - (tension - 0.8) * 2.4); }
    } else s.beat = 0;
  },
  stopLineStrain() {
    const s = this.strain; if (!s) return;
    this.strain = null;
    try { s.out.gain.setTargetAtTime(0, this.ctx.currentTime, 0.04); } catch {}
    setTimeout(() => { try { s.hum.stop(); s.noise.stop(); s.out.disconnect(); } catch {} }, 250);
  },
  /* rarity sting when a catch leaps out of the water: one more note per rarity step */
  playLandingSting(notes) {
    if (!this.enabled) return;
    this.vibrate(notes.length > 3 ? [30, 30, 70] : 25);
    notes.forEach((f, i) => this.playTone({ freq: f, type: 'triangle', duration: 0.2 + i * 0.03, vol: 0.06, delay: 0.08 + i * 0.075 }));
  },
  playFightCue(kind) {
    if (!this.enabled) return;
    if (kind === 'run') { this.playTone({ freq: 760, endFreq: 1180, type: 'sine', duration: 0.45, vol: 0.035 }); this.vibrate(30); }
    else if (kind === 'dive') { this.playTone({ freq: 150, endFreq: 70, type: 'sine', duration: 0.35, vol: 0.09 }); this.vibrate([40, 30, 40]); }
    else if (kind === 'good') { this.playTone({ freq: 660, type: 'triangle', duration: 0.1, vol: 0.06 }); this.playTone({ freq: 990, type: 'triangle', duration: 0.16, vol: 0.06, delay: 0.09 }); this.vibrate(20); }
    else if (kind === 'bad') { this.playTone({ freq: 220, endFreq: 140, type: 'sine', duration: 0.3, vol: 0.07 }); this.vibrate([60, 40, 60]); }
  },

  playLineSnap() {
    this.vibrate([80, 40, 120]);
    this.playTone({ freq: 420, endFreq: 90, type: 'triangle', duration: 0.3, vol: 0.18 });
    this.playNoise({ duration: 0.16, vol: 0.1, filterFreq: 900 });
  },

  playCatchFanfare(isJunk = false) {
    this.vibrate(isJunk ? 30 : [30, 30, 50]);
    if (isJunk) {
      this.playTone({ freq: 310, type: 'triangle', duration: 0.14, vol: 0.14, delay: 0 });
      this.playTone({ freq: 245, type: 'triangle', duration: 0.24, vol: 0.14, delay: 0.14 });
    } else {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, idx) => {
        this.playTone({ freq: n, type: 'sine', duration: 0.24, vol: 0.14, delay: idx * 0.1 });
      });
    }
  },

  playTick() {
    this.vibrate(8);
    this.playTone({ freq: 620, endFreq: 520, type: 'sine', duration: 0.05, vol: 0.05 });
  },

  playBump() {
    this.vibrate(35);
    this.playNoise({ duration: 0.2, vol: 0.16, filterFreq: 260, filterType: 'lowpass' });
    this.playTone({ freq: 140, endFreq: 70, type: 'triangle', duration: 0.18, vol: 0.14 });
  },

  playCoin() {
    this.vibrate(15);
    this.playTone({ freq: 880, type: 'sine', duration: 0.1, vol: 0.13, delay: 0 });
    this.playTone({ freq: 1174.66, type: 'sine', duration: 0.24, vol: 0.12, delay: 0.08 });
  },

  playEngineChug(speedFactor = 1) {
    const now = performance.now();
    const interval = Math.max(95, 190 - speedFactor * 35);
    if (now - this.lastEngineTick < interval) return;
    this.lastEngineTick = now;
    this.playTone({ freq: 58 + speedFactor * 14, endFreq: 44, type: 'sine', duration: 0.09, vol: 0.06 });
  },

  /* the hull slamming into chop: a low thud plus a short wash of spray */
  playHullSlam(I = 0.5) {
    if (!this.enabled) return;
    this.vibrate(Math.round(14 + 30 * I));
    this.playTone({ freq: 95, endFreq: 48, type: 'sine', duration: 0.16, vol: 0.05 + 0.07 * I });
    this.playNoise({ duration: 0.22 + 0.12 * I, vol: 0.04 + 0.05 * I, filterFreq: 1400, filterType: 'bandpass' });
  },

  playRescueHorn() {
    this.vibrate([120, 60, 160]);
    this.playTone({ freq: 185, endFreq: 178, type: 'triangle', duration: 0.5, vol: 0.15, delay: 0 });
    this.playTone({ freq: 146.8, endFreq: 142, type: 'triangle', duration: 0.7, vol: 0.15, delay: 0.55 });
  },
};
