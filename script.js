const playButton = document.querySelector("#playButton");
const playLabel = document.querySelector("#playLabel");
const nextTrackButton = document.querySelector("#nextTrack");
const trackChip = document.querySelector("#trackChip");
const focusTimer = document.querySelector("#focusTimer");
const volume = document.querySelector("#volume");
const body = document.body;

let audioContext;
let masterGain;
let noiseGain;
let noiseSource;
let drumTimer;
let chordTimer;
let melodyTimer;
let trackTimer;
let focusTimerInterval;
let focusStartedAt = 0;
let elapsedBeforePause = 0;
let isPlaying = false;
let trackIndex = 0;

const tracks = [
  {
    title: "01 Refactor Rain",
    nowPlaying: "Codex FM - Refactor Rain",
    bpm: 74,
    chordMs: 3600,
    melodyMs: 980,
    melodyChance: 0.54,
    noise: 0.11,
    chordGain: 0.041,
    hatGain: 0.018,
    kickGain: 0.32,
    filter: 760,
    wave: "triangle",
    chords: [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [246.94, 293.66, 369.99, 440.0],
      [196.0, 246.94, 293.66, 392.0],
    ],
    notes: [329.63, 392.0, 440.0, 493.88, 523.25],
    beat: [1, 0, 0, 0, 1, 0, 0, 0],
  },
  {
    title: "02 Terminal Glow",
    nowPlaying: "Codex FM - Terminal Glow",
    bpm: 86,
    chordMs: 2800,
    melodyMs: 720,
    melodyChance: 0.68,
    noise: 0.13,
    chordGain: 0.034,
    hatGain: 0.026,
    kickGain: 0.4,
    filter: 920,
    wave: "sawtooth",
    chords: [
      [174.61, 261.63, 329.63, 392.0],
      [196.0, 246.94, 293.66, 369.99],
      [220.0, 277.18, 329.63, 440.0],
      [164.81, 246.94, 329.63, 392.0],
    ],
    notes: [392.0, 440.0, 493.88, 587.33, 659.25],
    beat: [1, 0, 1, 0, 1, 0, 0, 1],
  },
  {
    title: "03 Green Check Dawn",
    nowPlaying: "Codex FM - Green Check Dawn",
    bpm: 68,
    chordMs: 4200,
    melodyMs: 1100,
    melodyChance: 0.48,
    noise: 0.09,
    chordGain: 0.047,
    hatGain: 0.014,
    kickGain: 0.28,
    filter: 680,
    wave: "triangle",
    chords: [
      [293.66, 369.99, 440.0, 587.33],
      [246.94, 329.63, 392.0, 493.88],
      [261.63, 349.23, 440.0, 523.25],
      [220.0, 293.66, 369.99, 440.0],
    ],
    notes: [369.99, 440.0, 523.25, 587.33, 659.25, 783.99],
    beat: [1, 0, 0, 0, 0, 0, 1, 0],
  },
  {
    title: "04 Night Build",
    nowPlaying: "Codex FM - Night Build",
    bpm: 78,
    chordMs: 3400,
    melodyMs: 860,
    melodyChance: 0.42,
    noise: 0.15,
    chordGain: 0.038,
    hatGain: 0.02,
    kickGain: 0.35,
    filter: 540,
    wave: "sine",
    chords: [
      [146.83, 220.0, 293.66, 349.23],
      [164.81, 246.94, 329.63, 392.0],
      [130.81, 196.0, 261.63, 329.63],
      [174.61, 261.63, 349.23, 440.0],
    ],
    notes: [261.63, 293.66, 329.63, 392.0, 440.0],
    beat: [1, 0, 0, 1, 0, 0, 1, 0],
  },
  {
    title: "05 Diff Review",
    nowPlaying: "Codex FM - Diff Review",
    bpm: 92,
    chordMs: 3000,
    melodyMs: 640,
    melodyChance: 0.36,
    noise: 0.1,
    chordGain: 0.03,
    hatGain: 0.024,
    kickGain: 0.3,
    filter: 1040,
    wave: "triangle",
    chords: [
      [220.0, 277.18, 329.63, 415.3],
      [246.94, 311.13, 369.99, 466.16],
      [196.0, 246.94, 293.66, 392.0],
      [261.63, 329.63, 392.0, 523.25],
    ],
    notes: [329.63, 369.99, 415.3, 493.88, 554.37, 659.25],
    beat: [1, 1, 0, 1, 0, 1, 0, 1],
  },
];

function currentTrack() {
  return tracks[trackIndex];
}

function updateTrackLabel() {
  const track = currentTrack();
  trackChip.textContent = track.title;
}

function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateFocusTimer() {
  const runningElapsed = isPlaying && focusStartedAt ? Date.now() - focusStartedAt : 0;
  focusTimer.textContent = formatElapsed(elapsedBeforePause + runningElapsed);
}

function startFocusTimer() {
  window.clearInterval(focusTimerInterval);
  focusStartedAt = Date.now();
  updateFocusTimer();
  focusTimerInterval = window.setInterval(updateFocusTimer, 1000);
}

function stopFocusTimer() {
  if (focusStartedAt) {
    elapsedBeforePause += Date.now() - focusStartedAt;
  }
  focusStartedAt = 0;
  window.clearInterval(focusTimerInterval);
  updateFocusTimer();
}

function createAudioGraph() {
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = Number(volume.value) / 100;
  masterGain.connect(audioContext.destination);

  const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 2, audioContext.sampleRate);
  const channel = noiseBuffer.getChannelData(0);

  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * 0.16;
  }

  noiseSource = audioContext.createBufferSource();
  const noiseFilter = audioContext.createBiquadFilter();
  noiseGain = audioContext.createGain();

  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  noiseFilter.type = "lowpass";
  noiseFilter.frequency.value = 900;
  noiseGain.gain.value = currentTrack().noise;

  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);
  noiseSource.start();
}

function playTone(frequency, start, duration, type, gainValue, filterFrequency, destination = masterGain) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(filterFrequency, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.04);
}

function playKick(time, gainValue) {
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(105, time);
  oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.26);
  gain.gain.setValueAtTime(gainValue, time);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.32);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(time);
  oscillator.stop(time + 0.35);
}

function playHat(time, gainValue) {
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.12, audioContext.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < channel.length; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * (1 - i / channel.length);
  }

  const source = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.45;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(gainValue, time + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.11);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);
  source.start(time);
}

function scheduleChords() {
  let index = 0;
  const playNextChord = () => {
    const track = currentTrack();
    const now = audioContext.currentTime + 0.08;
    track.chords[index % track.chords.length].forEach((frequency, offset) => {
      playTone(frequency, now + offset * 0.018, track.chordMs / 1150, track.wave, track.chordGain, track.filter);
    });
    index += 1;
  };

  playNextChord();
  chordTimer = window.setInterval(playNextChord, currentTrack().chordMs);
}

function scheduleBeat() {
  let step = 0;
  drumTimer = window.setInterval(() => {
    const track = currentTrack();
    const now = audioContext.currentTime + 0.04;
    if (track.beat[step % track.beat.length]) playKick(now, track.kickGain);
    if (step % 4 === 2 && Math.random() > 0.35) playHat(now + 0.01, track.hatGain);
    step += 1;
  }, 60000 / currentTrack().bpm / 2);
}

function scheduleMelody() {
  melodyTimer = window.setInterval(() => {
    const track = currentTrack();
    if (Math.random() > track.melodyChance) return;
    const frequency = track.notes[Math.floor(Math.random() * track.notes.length)];
    playTone(frequency, audioContext.currentTime + 0.06, 0.42, "sine", 0.028, track.filter + 360);
  }, currentTrack().melodyMs);
}

function startTrackRotation() {
  window.clearInterval(trackTimer);
  trackTimer = window.setInterval(() => {
    nextTrack();
  }, 150000);
}

function startSchedulers() {
  stopSchedulers();
  if (noiseGain) {
    noiseGain.gain.setTargetAtTime(currentTrack().noise, audioContext.currentTime, 0.08);
  }
  scheduleChords();
  scheduleBeat();
  scheduleMelody();
  startTrackRotation();
  updateTrackLabel();
}

function stopSchedulers() {
  window.clearInterval(drumTimer);
  window.clearInterval(chordTimer);
  window.clearInterval(melodyTimer);
  window.clearInterval(trackTimer);
}

function nextTrack() {
  trackIndex = (trackIndex + 1) % tracks.length;
  updateTrackLabel();
  if (!isPlaying) return;
  startSchedulers();
}

function startRadio() {
  if (!audioContext) {
    createAudioGraph();
  }

  audioContext.resume();
  startSchedulers();
  isPlaying = true;
  startFocusTimer();
  body.classList.add("is-playing");
  playButton.setAttribute("aria-pressed", "true");
  playLabel.textContent = "Pause";
}

function stopRadio() {
  if (!audioContext) return;
  isPlaying = false;
  stopFocusTimer();
  stopSchedulers();
  audioContext.suspend();
  body.classList.remove("is-playing");
  playButton.setAttribute("aria-pressed", "false");
  playLabel.textContent = "Play";
}

playButton.addEventListener("click", () => {
  if (isPlaying) {
    stopRadio();
    return;
  }

  startRadio();
});

nextTrackButton.addEventListener("click", () => {
  nextTrack();
});

volume.addEventListener("input", () => {
  if (!masterGain) return;
  masterGain.gain.setTargetAtTime(Number(volume.value) / 100, audioContext.currentTime, 0.04);
});

window.addEventListener("beforeunload", () => {
  stopSchedulers();
  window.clearInterval(focusTimerInterval);
});

updateTrackLabel();
updateFocusTimer();
