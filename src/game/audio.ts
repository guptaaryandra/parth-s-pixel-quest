/** Tiny WebAudio chiptune SFX engine — no assets, no network, works offline. */

type Wave = OscillatorType;

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

const STORAGE_KEY = "parth-quest-muted";

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.22;
    master.connect(ctx.destination);
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
  if (!ac || !master || muted) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const env = ac.createGain();
  osc.type = wave;
  osc.frequency.setValueAtTime(from, t0);
  if (to && to !== from) osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + duration);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(env).connect(master);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

function noise(duration: number, gain = 0.6, delay = 0) {
  const ac = ensure();
  if (!ac || !master || muted) return;
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
  src.connect(filter).connect(env).connect(master);
  src.start(ac.currentTime + delay);
}

export const sfx = {
  unlock() {
    ensure();
  },
  isMuted() {
    return muted;
  },
  setMuted(next: boolean) {
    muted = next;
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
    return muted;
  },
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
