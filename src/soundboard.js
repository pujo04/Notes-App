// ==============================================
// COZY AMBIENCE SOUNDBOARD (Web Audio API)
// Pure offline audio synthesis for relaxing garden atmosphere
// ==============================================

let audioCtx = null;
let activeSoundType = null;
let isAudioRunning = false;
let loopInterval = null;
let noiseNode = null;
let gainNode = null;

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

// 🐦 Play a gentle bird chirp
function playBirdChirp(ctx, masterGain) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  const startFreq = 2200 + Math.random() * 800;
  osc.type = "sine";
  osc.frequency.setValueAtTime(startFreq, now);
  osc.frequency.exponentialRampToValueAtTime(startFreq + 600, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(startFreq - 400, now + 0.18);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 0.22);
}

// 🍃 Play soft breeze / wind rustle
function startBreeze(ctx, masterGain) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99 * b0 + white * 0.05;
    b1 = 0.96 * b1 + white * 0.08;
    b2 = 0.92 * b2 + white * 0.1;
    data[i] = (b0 + b1 + b2) * 0.15;
  }

  noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.setValueAtTime(450, ctx.currentTime);
  filter.Q.setValueAtTime(1.2, ctx.currentTime);

  noiseNode.connect(filter);
  filter.connect(masterGain);
  noiseNode.start();
}

// 🎶 Play soft pentatonic chime note
function playChimeNote(ctx, masterGain) {
  const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
  const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(now);
  osc.stop(now + 1.85);
}

export function startAmbience(type = "birds") {
  stopAmbience();

  const ctx = getAudioContext();
  if (!ctx) return;

  gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.6, ctx.currentTime);
  gainNode.connect(ctx.destination);

  activeSoundType = type;
  isAudioRunning = true;

  if (type === "birds") {
    playBirdChirp(ctx, gainNode);
    loopInterval = setInterval(() => {
      if (Math.random() > 0.35) {
        playBirdChirp(ctx, gainNode);
        if (Math.random() > 0.5) {
          setTimeout(() => playBirdChirp(ctx, gainNode), 240);
        }
      }
    }, 1800);
  } else if (type === "breeze") {
    startBreeze(ctx, gainNode);
  } else if (type === "chimes") {
    playChimeNote(ctx, gainNode);
    loopInterval = setInterval(() => {
      playChimeNote(ctx, gainNode);
    }, 1200);
  }
}

export function stopAmbience() {
  if (loopInterval) {
    clearInterval(loopInterval);
    loopInterval = null;
  }
  if (noiseNode) {
    try {
      noiseNode.stop();
      noiseNode.disconnect();
    } catch (e) {}
    noiseNode = null;
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch (e) {}
    gainNode = null;
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
