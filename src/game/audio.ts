/** Tiny WebAudio chiptune SFX + music engine — no assets, no network, works offline. */

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let muted = false;

const STORAGE_KEY = "parth-quest-muted";
const MIX_KEY = "paq.audio.v1";

export type AudioMix = {
  /** 0 - 1 background music volume (0 = off) */
  music: number;
  /** 0 - 1 sound effect volume (0 = off) */
  sfx: number;
};

export const DEFAULT_MIX: AudioMix = { music: 0.55, sfx: 0.9 };

const clamp01 = (v: number) => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));

let mix: AudioMix = { ...DEFAULT_MIX };

function applyMix() {
  if (sfxBus) sfxBus.gain.value = muted ? 0 : mix.sfx * 0.24;
  if (musicBus) musicBus.gain.value = muted ? 0 : mix.music * 0.12;
}

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    sfxBus = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus.connect(master);
    musicBus.connect(master);
    applyMix();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

type ToneOpts = {
  from: number;
  to?: number;
  duration: number;
  wave?: Wave;
  gain?: number;
  delay?: number;
};

function tone({ from, to, duration, wave = "square", gain = 1, delay = 0 }: ToneOpts) {
  const ac = ensure();
  if (!ac || !sfxBus || muted || mix.sfx <= 0) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(from, t0);
  if (to && to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(env).connect(sfxBus);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noise(duration: number, gain = 0.6, delay = 0) {
  const ac = ensure();
  if (!ac || !sfxBus || muted || mix.sfx <= 0) return;
  const frames = Math.floor(ac.sampleRate * duration);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const env = ac.createGain();
  env.gain.value = gain;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1400;
  src.connect(filter).connect(env).connect(sfxBus);
  src.start(ac.currentTime + delay);
}

/* ----------------------------- background music ----------------------------- */

const A2 = 110, C3 = 130.81, F3 = 174.61, G3 = 196;
const A3 = 220, B3 = 246.94, C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392;
const A4 = 440, C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99;

/** 8-bar loop: bass root + arpeggio, gentle anime-adventure feel. */
const CHORDS: { root: number; notes: number[] }[] = [
  { root: A2, notes: [A3, C4, E4, C4] },
  { root: F3, notes: [F3, A3, C4, A3] },
  { root: C3, notes: [C4, E4, G4, E4] },
  { root: G3, notes: [G3, B3, D4, B3] },
];

const MELODY: number[] = [
  E5, C5, D5, 0, E5, G5, 0, E5,
  A4, C5, D5, 0, C5, A4, 0, 0,
  G4, C5, E5, 0, D5, C5, 0, G4,
  A4, D5, C5, 0, G4, 0, E4, 0,
];

const STEP = 0.19; // seconds per 16th-ish step
let musicTimer: number | null = null;
let step = 0;
let nextTime = 0;
let musicOn = false;

function voice(freq: number, dur: number, at: number, wave: Wave, gain: number) {
  const ac = ctx;
  if (!ac || !musicBus) return;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, at);
  env.gain.setValueAtTime(0.0001, at);
  env.gain.exponentialRampToValueAtTime(gain, at + 0.02);
  env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(env).connect(musicBus);
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function scheduleStep(i: number, at: number) {
  const chord = CHORDS[Math.floor(i / 8) % CHORDS.length] ?? CHORDS[0]!;
  if (i % 8 === 0 || i % 8 === 4) voice(chord.root, STEP * 2.6, at, "triangle", 0.5);
  const arp = chord.notes[((i / 2) | 0) % chord.notes.length] ?? chord.root;
  if (i % 2 === 0) voice(arp, STEP * 1.4, at, "square", 0.14);
  const mel = MELODY[i % MELODY.length] ?? 0;
  if (mel) voice(mel, STEP * 1.7, at, "triangle", 0.22);
}


function pump() {
  const ac = ensure();
  if (!ac || !musicOn) return;
  while (nextTime < ac.currentTime + 0.6) {
    scheduleStep(step, Math.max(nextTime, ac.currentTime + 0.02));
    step = (step + 1) % (CHORDS.length * 8);
    nextTime += STEP;
  }
}

function startMusic() {
  if (musicOn) return;
  const ac = ensure();
  if (!ac) return;
  musicOn = true;
  nextTime = ac.currentTime + 0.1;
  pump();
  musicTimer = window.setInterval(pump, 200);
}

function stopMusic() {
  musicOn = false;
  if (musicTimer != null) window.clearInterval(musicTimer);
  musicTimer = null;
}

function syncMusic() {
  if (!muted && mix.music > 0) startMusic();
  else stopMusic();
}

function persistMix() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MIX_KEY, JSON.stringify(mix));
  } catch {
    /* ignore */
  }
}

export const sfx = {
  unlock() {
    ensure();
    syncMusic();
  },
  isMuted() {
    return muted;
  },
  setMuted(next: boolean) {
    muted = next;
    applyMix();
    syncMusic();
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
    }
  },
  loadMuted() {
    if (typeof window === "undefined") return false;
    try {
      muted = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      muted = false;
    }
    applyMix();
    return muted;
  },
  /** Current music/sfx mix. */
  getMix(): AudioMix {
    return { ...mix };
  },
  loadMix(): AudioMix {
    if (typeof window === "undefined") return { ...mix };
    try {
      const raw = window.localStorage.getItem(MIX_KEY);
      const parsed = raw ? (JSON.parse(raw) as Partial<AudioMix>) : null;
      mix = {
        music: clamp01(parsed?.music ?? DEFAULT_MIX.music),
        sfx: clamp01(parsed?.sfx ?? DEFAULT_MIX.sfx),
      };
    } catch {
      mix = { ...DEFAULT_MIX };
    }
    applyMix();
    return { ...mix };
  },
  setMix(next: Partial<AudioMix>): AudioMix {
    mix = {
      music: clamp01(next.music ?? mix.music),
      sfx: clamp01(next.sfx ?? mix.sfx),
    };
    persistMix();
    applyMix();
    syncMusic();
    return { ...mix };
  },
  /** Start the loop (call after a user gesture). */
  startMusic() {
    syncMusic();
  },
  stopMusic,
  jump() {
    tone({ from: 320, to: 720, duration: 0.16, wave: "square", gain: 0.5 });
  },
  coin() {
    tone({ from: 880, duration: 0.06, wave: "square", gain: 0.4 });
    tone({ from: 1320, duration: 0.12, wave: "square", gain: 0.35, delay: 0.06 });
  },
  crystal() {
    [660, 990, 1320, 1760].forEach((f, i) =>
      tone({ from: f, duration: 0.16, wave: "triangle", gain: 0.42, delay: i * 0.07 }),
    );
  },
  hurt() {
    tone({ from: 400, to: 90, duration: 0.4, wave: "sawtooth", gain: 0.5 });
    noise(0.24, 0.35);
  },
  land() {
    noise(0.09, 0.18);
  },
  levelClear() {
    [523, 659, 784, 1046].forEach((f, i) =>
      tone({ from: f, duration: 0.22, wave: "square", gain: 0.4, delay: i * 0.12 }),
    );
  },
  victory() {
    [523, 659, 784, 1046, 1318].forEach((f, i) =>
      tone({ from: f, duration: 0.3, wave: "triangle", gain: 0.45, delay: i * 0.16 }),
    );
    [261, 329, 392].forEach((f, i) =>
      tone({ from: f, duration: 0.9, wave: "square", gain: 0.16, delay: 0.3 + i * 0.16 }),
    );
  },
  gameOver() {
    [440, 349, 262, 196].forEach((f, i) =>
      tone({ from: f, to: f * 0.94, duration: 0.34, wave: "sawtooth", gain: 0.34, delay: i * 0.2 }),
    );
  },
  click() {
    tone({ from: 620, to: 880, duration: 0.07, wave: "square", gain: 0.3 });
  },
};
