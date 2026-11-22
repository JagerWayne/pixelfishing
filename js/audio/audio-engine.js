/* Web Audio engine (class): the audio context, master gain and the ambient sea loop. Its other sounds join
   from the audio-ambient, audio-fishing and audio-fight method groups. */
import { addMethods } from '../utils.js';
import { settings } from '../core/settings.js';
import { audioAmbientMethods } from './audio-ambient.js';
import { audioFishingMethods } from './audio-fishing.js';
import { audioFightMethods } from './audio-fight.js';

/* =========================================================================
   SECTION A: MOBILE-SAFE WEB AUDIO, AMBIENT SOUNDSCAPE & HAPTIC SYNTHESIZER
   ========================================================================= */
export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = settings.sound;
    this.hapticsEnabled = settings.haptics;
    this.lastEngineTick = 0;
    this.lastReelTick = 0;
    this.ambientStarted = false;
    this.surfGain = null;
    this.rainGain = null;
    this.seagullTimer = 6.0;
    this.underwater = false;   // diving: muffles the surface and fades in the underwater beds
    this.uwDepth = 0;          // 0..1 how deep the diver is
    this.subGain = null;
    this.hissGain = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.ctx && !this.ambientStarted) {
      this.setupAmbientLoop();
    }
  }

  setupAmbientLoop() {
    this.ambientStarted = true;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = data[i];
      data[i] *= 2.5;
    }

    const surfSrc = this.ctx.createBufferSource();
    surfSrc.buffer = buffer;
    surfSrc.loop = true;

    const surfFilter = this.ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.value = 340;

    this.surfGain = this.ctx.createGain();
    this.surfGain.gain.value = 0.018;

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.14;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain);
    lfoGain.connect(this.surfGain.gain);

    surfSrc.connect(surfFilter);
    surfFilter.connect(this.surfGain);
    this.surfGain.connect(this.ctx.destination);
    surfSrc.start();
    lfo.start();

    const rainSrc = this.ctx.createBufferSource();
    rainSrc.buffer = buffer;
    rainSrc.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.value = 2400;
    rainFilter.Q.value = 0.7;

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.value = 0.0;

    rainSrc.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.ctx.destination);
    rainSrc.start();

    // underwater beds: a deep pressure rumble and a faint hiss of distant bubbles (silent until you dive)
    const subSrc = this.ctx.createBufferSource();
    subSrc.buffer = buffer; subSrc.loop = true; subSrc.playbackRate.value = 0.6;
    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass'; subFilter.frequency.value = 130;
    this.subGain = this.ctx.createGain(); this.subGain.gain.value = 0;
    subSrc.connect(subFilter); subFilter.connect(this.subGain); this.subGain.connect(this.ctx.destination);
    subSrc.start();
    const hissSrc = this.ctx.createBufferSource();
    hissSrc.buffer = buffer; hissSrc.loop = true; hissSrc.playbackRate.value = 1.4;
    const hissFilter = this.ctx.createBiquadFilter();
    hissFilter.type = 'bandpass'; hissFilter.frequency.value = 1900; hissFilter.Q.value = 1.2;
    this.hissGain = this.ctx.createGain(); this.hissGain.gain.value = 0;
    hissSrc.connect(hissFilter); hissFilter.connect(this.hissGain); this.hissGain.connect(this.ctx.destination);
    hissSrc.start();
  }
}

export function init() {
  addMethods(AudioEngine, audioAmbientMethods, null);
  addMethods(AudioEngine, audioFishingMethods, null);
  addMethods(AudioEngine, audioFightMethods, null);
}
