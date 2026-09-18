// ==============================================
// COZY AMBIENCE SOUNDBOARD (Web Audio API)
// High-Fidelity Melodious Songbird & Garden Audio Engine
// ==============================================

let audioCtx = null;
let activeSoundType = null;
let isAudioRunning = false;
let loopTimer = null;
let backgroundNoiseNode = null;
let backgroundNoiseGain = null;
let masterGain = null;
let gardenReverbNode = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// 🌿 Algorithmic Garden Courtyard Impulse Response (Warm Reverb)
function getGardenReverb(ctx) {
  if (gardenReverbNode) return gardenReverbNode;
  try {
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * 1.5); // 1.5s natural decay
    const impulse = ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (rate * 0.28));
      left[i] = (Math.random() * 2 - 1) * decay * 0.4;
      right[i] = (Math.random() * 2 - 1) * decay * 0.4;
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    gardenReverbNode = convolver;
    return gardenReverbNode;
  } catch (e) {
    return null;
  }
}

// 🍃 Subtle gentle breeze buffer for warm garden ambiance bed
function createGentleBreezeNode(ctx, volume = 0.04) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99 * b0 + white * 0.04;
    b1 = 0.96 * b1 + white * 0.07;
    b2 = 0.92 * b2 + white * 0.09;
    data[i] = (b0 + b1 + b2) * 0.12;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(380, ctx.currentTime);
  filter.Q.setValueAtTime(1.0, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.5);

  noise.connect(filter);
  filter.connect(gain);

  return { source: noise, gainNode: gain };
}

// 🐦 Synthesize a single fluted, melodious songbird note with syrinx vibrato
function playFluteSyllable(ctx, destination, startFreq, endFreq, duration, startTime, pan = 0, warbleRate = 28) {
  const osc = ctx.createOscillator();
  const oscOvertone = ctx.createOscillator();
  const noteGain = ctx.createGain();
  const overtoneGain = ctx.createGain();

  osc.type = "sine";
  oscOvertone.type = "sine";

  // Dynamic pitch trajectory
  const peakTime = startTime + duration * 0.4;
  const peakFreq = Math.max(startFreq, endFreq) + (endFreq > startFreq ? 250 : 350);

  osc.frequency.setValueAtTime(startFreq, startTime);
  osc.frequency.exponentialRampToValueAtTime(peakFreq, peakTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1200, endFreq), startTime + duration);

  // Subtle 2nd harmonic for wooden flute timbre
  oscOvertone.frequency.setValueAtTime(startFreq * 2, startTime);
  oscOvertone.frequency.exponentialRampToValueAtTime(peakFreq * 2, peakTime);
  oscOvertone.frequency.exponentialRampToValueAtTime(Math.max(2400, endFreq * 2), startTime + duration);

  // Syrinx Vibrato / Flutter (FM modulation)
  if (warbleRate > 0) {
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = warbleRate + Math.random() * 6;
    lfoGain.gain.value = 110 + Math.random() * 50; // Pitch vibrato depth
    lfo.connect(osc.frequency);
    lfo.start(startTime);
    lfo.stop(startTime + duration);
  }

  // Smooth bell envelope (eliminates any clicking)
  noteGain.gain.setValueAtTime(0, startTime);
  noteGain.gain.linearRampToValueAtTime(0.12, startTime + 0.015);
  noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  overtoneGain.gain.setValueAtTime(0, startTime);
  overtoneGain.gain.linearRampToValueAtTime(0.02, startTime + 0.015);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0004, startTime + duration);

  osc.connect(noteGain);
  oscOvertone.connect(overtoneGain);

  let panner = null;
  if (ctx.createStereoPanner) {
    panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(pan, startTime);
    noteGain.connect(panner);
    overtoneGain.connect(panner);
    panner.connect(destination);
  } else {
    noteGain.connect(destination);
    overtoneGain.connect(destination);
  }

  osc.start(startTime);
  oscOvertone.start(startTime);
  osc.stop(startTime + duration + 0.03);
  oscOvertone.stop(startTime + duration + 0.03);
}

// 🎼 Melodious Bird Song Motif 1: Sweet Canary Morning Song
function playCanarySong(ctx, destination) {
  const now = ctx.currentTime;
  const pan = -0.3 + Math.random() * 0.2; // slightly left

  // Rapid sweet introductory calls
  playFluteSyllable(ctx, destination, 3100, 3600, 0.09, now, pan, 24);
  playFluteSyllable(ctx, destination, 3300, 3800, 0.09, now + 0.14, pan, 26);
  playFluteSyllable(ctx, destination, 3500, 4200, 0.11, now + 0.28, pan, 30);

  // Cascading melodious warble (trill)
  const trillStart = now + 0.44;
  const pitches = [4000, 3800, 3500, 3700, 3400, 3100];
  pitches.forEach((freq, idx) => {
    playFluteSyllable(ctx, destination, freq, freq + 150, 0.07, trillStart + idx * 0.075, pan, 32);
  });

  // Finishing sweet ascending flourish
  playFluteSyllable(ctx, destination, 3200, 4300, 0.18, trillStart + 0.52, pan, 26);
}

// 🎼 Melodious Bird Song Motif 2: Nightingale Warble & Arpeggio
function playNightingaleSong(ctx, destination) {
  const now = ctx.currentTime;
  const pan = 0.2 + Math.random() * 0.3; // slightly right

  // Smooth warm flute notes
  playFluteSyllable(ctx, destination, 2600, 3200, 0.14, now, pan, 22);
  playFluteSyllable(ctx, destination, 3000, 3700, 0.13, now + 0.18, pan, 24);
  playFluteSyllable(ctx, destination, 3500, 4300, 0.15, now + 0.36, pan, 28);

  // Rapid joyful trill
  const trillStart = now + 0.55;
  for (let i = 0; i < 4; i++) {
    playFluteSyllable(ctx, destination, 4100, 4400, 0.06, trillStart + i * 0.07, pan, 34);
  }

  // Soft descending flourish
  playFluteSyllable(ctx, destination, 4200, 2900, 0.2, trillStart + 0.34, pan, 20);
}

// 🎼 Melodious Bird Song Motif 3: Forest Robin Call & Response Duet
function playRobinDuet(ctx, destination) {
  const now = ctx.currentTime;

  // Bird A (Far Left): Calling tweet
  playFluteSyllable(ctx, destination, 3300, 4100, 0.12, now, -0.6, 26);
  playFluteSyllable(ctx, destination, 3600, 4300, 0.14, now + 0.16, -0.6, 28);

  // Bird B (Far Right): Melodious answering warble
  const answerTime = now + 0.42;
  playFluteSyllable(ctx, destination, 2800, 3400, 0.11, answerTime, 0.6, 24);
  playFluteSyllable(ctx, destination, 3200, 3900, 0.12, answerTime + 0.15, 0.6, 28);
  playFluteSyllable(ctx, destination, 3700, 4400, 0.16, answerTime + 0.31, 0.6, 32);
}

// 🎼 Melodious Bird Song Motif 4: Gentle Pipit Garden Flourish
function playPipitFlourish(ctx, destination) {
  const now = ctx.currentTime;
  const pan = -0.1 + Math.random() * 0.2;

  playFluteSyllable(ctx, destination, 2900, 3400, 0.08, now, pan, 20);
  playFluteSyllable(ctx, destination, 3200, 3800, 0.08, now + 0.11, pan, 24);
  playFluteSyllable(ctx, destination, 3600, 4200, 0.13, now + 0.23, pan, 28);
}

// 🍃 Full Breeze Mode
function startBreezeMode(ctx, destination) {
  const { source, gainNode } = createGentleBreezeNode(ctx, 0.18);
  backgroundNoiseNode = source;
  backgroundNoiseGain = gainNode;
  gainNode.connect(destination);
  source.start();
}

// 🎶 Play soft pentatonic chime note
function playChimeNote(ctx, destination) {
  const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66]; // C5 to D6
  const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

  osc.connect(gain);

  if (ctx.createStereoPanner) {
    const panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(-0.4 + Math.random() * 0.8, now);
    gain.connect(panner);
    panner.connect(destination);
  } else {
    gain.connect(destination);
  }

  osc.start(now);
  osc.stop(now + 2.3);
}

// ==============================================
// PUBLIC AMBIENCE CONTROL APIS
// ==============================================

export function startAmbience(type = "birds") {
  stopAmbience();

  const ctx = getAudioContext();
  if (!ctx) return;

  masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.75, ctx.currentTime);
  masterGain.connect(ctx.destination);

  // Set up reverb bus for natural acoustic space
  const reverb = getGardenReverb(ctx);
  let audioBus = masterGain;

  if (reverb) {
    const dryGain = ctx.createGain();
    const wetGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.75, ctx.currentTime);
    wetGain.gain.setValueAtTime(0.35, ctx.currentTime);

    dryGain.connect(masterGain);
    reverb.connect(wetGain);
    wetGain.connect(masterGain);

    const splitter = ctx.createGain();
    splitter.connect(dryGain);
    splitter.connect(reverb);
    audioBus = splitter;
  }

  activeSoundType = type;
  isAudioRunning = true;

  if (type === "birds") {
    // 1. Add faint warm garden breeze bed in background
    const breeze = createGentleBreezeNode(ctx, 0.035);
    backgroundNoiseNode = breeze.source;
    backgroundNoiseGain = breeze.gainNode;
    breeze.gainNode.connect(masterGain);
    breeze.source.start();

    // 2. Play initial welcoming bird song immediately
    playCanarySong(ctx, audioBus);

    // 3. Natural irregular scheduling of rich melodic songbird motifs
    const songMotifs = [
      playCanarySong,
      playNightingaleSong,
      playRobinDuet,
      playPipitFlourish,
    ];

    let lastMotifIndex = 0;

    const scheduleNextSong = () => {
      if (!isAudioRunning || activeSoundType !== "birds") return;

      // Pick a different motif each time for melodic variety
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * songMotifs.length);
      } while (nextIndex === lastMotifIndex && songMotifs.length > 1);
      lastMotifIndex = nextIndex;

      songMotifs[nextIndex](ctx, audioBus);

      // Natural pause between bird song phrases (2.2s to 4.2s)
      const delay = 2200 + Math.random() * 2000;
      loopTimer = setTimeout(scheduleNextSong, delay);
    };

    loopTimer = setTimeout(scheduleNextSong, 2800);
  } else if (type === "breeze") {
    startBreezeMode(ctx, masterGain);
  } else if (type === "chimes") {
    playChimeNote(ctx, audioBus);
    const scheduleNextChime = () => {
      if (!isAudioRunning || activeSoundType !== "chimes") return;
      playChimeNote(ctx, audioBus);
      const delay = 1400 + Math.random() * 1200;
      loopTimer = setTimeout(scheduleNextChime, delay);
    };
    loopTimer = setTimeout(scheduleNextChime, 1800);
  }
}

export function stopAmbience() {
  if (loopTimer) {
    clearTimeout(loopTimer);
    loopTimer = null;
  }

  if (backgroundNoiseNode) {
    try {
      if (backgroundNoiseGain && audioCtx) {
        backgroundNoiseGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      }
      setTimeout(() => {
        try {
          backgroundNoiseNode.stop();
          backgroundNoiseNode.disconnect();
        } catch (e) {}
        backgroundNoiseNode = null;
      }, 350);
    } catch (e) {
      backgroundNoiseNode = null;
    }
  }

  if (masterGain && audioCtx) {
    try {
      masterGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      setTimeout(() => {
        try {
          masterGain.disconnect();
        } catch (e) {}
        masterGain = null;
      }, 350);
    } catch (e) {
      masterGain = null;
    }
  }

  isAudioRunning = false;
  activeSoundType = null;
}

export function toggleAmbience(type = "birds") {
  if (isAudioRunning && activeSoundType === type) {
    stopAmbience();
    return false;
  } else {
    startAmbience(type);
    return true;
  }
}

export function isAmbienceRunning() {
  return isAudioRunning;
}

export function getActiveAmbienceType() {
  return activeSoundType;
}
