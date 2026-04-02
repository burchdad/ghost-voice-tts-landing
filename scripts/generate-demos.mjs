#!/usr/bin/env node
/**
 * Ghost Voice Intelligence — Demo Audio Generator
 * ------------------------------------------------
 * Generates Before/After WAV pairs for every demo use case in demo-config.json.
 *
 * Usage:
 *   node scripts/generate-demos.mjs                              # placeholder tones (default)
 *   ELEVENLABS_API_KEY=... node scripts/generate-demos.mjs --provider elevenlabs
 *   OPENAI_API_KEY=...    node scripts/generate-demos.mjs --provider openai
 *   node scripts/generate-demos.mjs --provider custom           # use your own voice recording
 *
 * Custom voice recording:
 *   1. Record or export your voice as WAV (16-bit PCM, mono or stereo, any sample rate).
 *   2. Copy the file to:  scripts/source-voices/my-voice.wav
 *      (filename must match "custom.voiceFile" in demo-config.json)
 *   3. Run:  node scripts/generate-demos.mjs --provider custom
 *
 * Output is written to public/audio/ as:
 *   <demo-id>-before.wav   —  provider-default / flat prosody
 *   <demo-id>-after.wav    —  Ghost-controlled / expressive prosody
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// ── Config ──────────────────────────────────────────────────────────────────

const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, "demo-config.json"), "utf8")
);

const provider = process.argv.includes("--provider")
  ? process.argv[process.argv.indexOf("--provider") + 1]
  : config.provider ?? "placeholder";

const OUTPUT_DIR = path.join(ROOT, config.outputDir ?? "public/audio");
const VOICES_DIR = path.join(__dirname, config.sourceVoicesDir ?? "source-voices");

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(VOICES_DIR, { recursive: true });

// ── Wav helpers ──────────────────────────────────────────────────────────────

/**
 * Build a WAV Buffer from a raw Int16 PCM Buffer.
 * @param {Buffer} pcm   — raw 16-bit little-endian mono PCM samples
 * @param {number} rate  — sample rate in Hz
 */
function buildWav(pcm, rate = 16000) {
  const hdr = Buffer.alloc(44);
  hdr.write("RIFF", 0);
  hdr.writeUInt32LE(36 + pcm.length, 4);
  hdr.write("WAVE", 8);
  hdr.write("fmt ", 12);
  hdr.writeUInt32LE(16, 16);       // PCM chunk size
  hdr.writeUInt16LE(1, 20);        // format: PCM
  hdr.writeUInt16LE(1, 22);        // channels: mono
  hdr.writeUInt32LE(rate, 24);
  hdr.writeUInt32LE(rate * 2, 28); // byte rate
  hdr.writeUInt16LE(2, 32);        // block align
  hdr.writeUInt16LE(16, 34);       // bits per sample
  hdr.write("data", 36);
  hdr.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([hdr, pcm]);
}

/**
 * Synthesise a placeholder WAV using a frequency envelope function.
 * @param {number} durationSec
 * @param {(t: number, dur: number) => number} freqFn  — returns Hz at time t
 * @param {number} [rate=16000]
 */
function synth(durationSec, freqFn, rate = 16000) {
  const n = Math.round(durationSec * rate);
  const pcm = Buffer.alloc(n * 2);
  const amp = 0.38; // -8 dBFS — leaves headroom

  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / rate;

    // Fade in / fade out (50 ms) to avoid clicks
    const fadeIn  = Math.min(1, t / 0.05);
    const fadeOut = Math.min(1, (durationSec - t) / 0.05);
    const envelope = fadeIn * fadeOut;

    const freq = freqFn(t, durationSec);
    phase += (2 * Math.PI * freq) / rate;
    const sample = amp * envelope * Math.sin(phase);
    const val = Math.round(sample * 32767);
    pcm.writeInt16LE(Math.max(-32768, Math.min(32767, val)), i * 2);
  }
  return buildWav(pcm, rate);
}

// ── Placeholder frequency profiles ──────────────────────────────────────────
//
// "Before" = flat, monotone — represents uncontrolled baseline TTS
// "After"  = expressive envelope — represents Ghost prosody layer output
//
// Each use case has a distinct pitch range to sound clearly different.

const PROFILES = {
  sales: {
    before: (t) => 155,
    after: (t, dur) => {
      // Confident opener → emphasis peak at ~40% → question lift at end
      const progress = t / dur;
      if (progress < 0.15) return 150 + progress * 60;          // rise into greeting
      if (progress < 0.45) return 160 + Math.sin(progress * Math.PI) * 35; // emphasis arc
      if (progress < 0.75) return 155 + (progress - 0.45) * 20; // info delivery
      return 160 + (progress - 0.75) * 160;                     // question lift at end
    },
  },
  support: {
    before: (t) => 145,
    after: (t, dur) => {
      // Empathetic dip → warm resolution → reassuring close
      const progress = t / dur;
      if (progress < 0.20) return 150 - progress * 40;          // empathetic downward
      if (progress < 0.55) return 130 + (progress - 0.20) * 80; // warm rise
      if (progress < 0.80) return 158 + Math.sin((progress - 0.55) * Math.PI * 2) * 12;
      return 162 - (progress - 0.80) * 30;                      // gentle close
    },
  },
  assistant: {
    before: (t) => 165,
    after: (t, dur) => {
      // Crisp confirmation beats → list cadence → upward question at end
      const progress = t / dur;
      const beat = Math.sin(progress * Math.PI * 6) * 15;       // rhythmic list pacing
      if (progress < 0.70) return 160 + beat;
      return 165 + (progress - 0.70) * 200;                     // rising confirmation
    },
  },
};

// ── Provider implementations ─────────────────────────────────────────────────

async function generatePlaceholder(demo) {
  const profile = PROFILES[demo.id] ?? { before: () => 160, after: () => 175 };
  const before = synth(5.5, profile.before);
  const after  = synth(5.5, profile.after);
  return { before, after };
}

async function generateElevenLabs(demo) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ELEVENLABS_API_KEY env var is not set.");

  const { voiceId, modelId, beforeSettings, afterSettings } = config.elevenlabs;

  async function tts(text, voiceSettings) {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=pcm_16000`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: voiceSettings,
        }),
      }
    );
    if (!res.ok) throw new Error(`ElevenLabs error ${res.status}: ${await res.text()}`);
    const raw = Buffer.from(await res.arrayBuffer());
    // Response is raw PCM — wrap in WAV
    return buildWav(raw, 16000);
  }

  const before = await tts(demo.script, beforeSettings);
  const after  = await tts(demo.script, afterSettings);
  return { before, after };
}

async function generateOpenAI(demo) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY env var is not set.");

  const { voice, model, beforeSpeed, afterSpeed } = config.openai;

  async function tts(text, speed) {
    const res = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, voice, input: text, speed, response_format: "wav" }),
    });
    if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
    return Buffer.from(await res.arrayBuffer());
  }

  const before = await tts(demo.script, beforeSpeed);
  const after  = await tts(demo.script, afterSpeed);
  return { before, after };
}

async function generateCustom(demo) {
  const voiceFile = path.join(VOICES_DIR, config.custom?.voiceFile ?? "my-voice.wav");
  if (!fs.existsSync(voiceFile)) {
    console.warn(
      `  ⚠  Custom voice not found at ${path.relative(ROOT, voiceFile)}\n` +
      `     Falling back to placeholder for "${demo.label}".`
    );
    return generatePlaceholder(demo);
  }
  // For custom voice: "before" is the recording as-is; "after" is a placeholder
  // indicating where Ghost-layer processed audio should be dropped in.
  const raw = fs.readFileSync(voiceFile);
  return {
    before: raw,
    after: synth(5.5, PROFILES[demo.id]?.after ?? ((t) => 175)),
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────

const generators = {
  placeholder: generatePlaceholder,
  elevenlabs: generateElevenLabs,
  openai: generateOpenAI,
  custom: generateCustom,
};

const generate = generators[provider];
if (!generate) {
  console.error(`Unknown provider "${provider}". Choose: placeholder | elevenlabs | openai | custom`);
  process.exit(1);
}

console.log(`\nGhost Demo Generator — provider: ${provider}\n`);

for (const demo of config.demos) {
  process.stdout.write(`  Generating "${demo.label}" ... `);
  try {
    const { before, after } = await generate(demo);

    const beforePath = path.join(OUTPUT_DIR, `${demo.id}-before.wav`);
    const afterPath  = path.join(OUTPUT_DIR, `${demo.id}-after.wav`);

    fs.writeFileSync(beforePath, before);
    fs.writeFileSync(afterPath, after);

    console.log(
      `done  (${Math.round(before.length / 1024)}KB before / ${Math.round(after.length / 1024)}KB after)`
    );
  } catch (err) {
    console.error(`FAILED\n    ${err.message}`);
  }
}

console.log(`\nAudio written to: ${path.relative(ROOT, OUTPUT_DIR)}/\n`);
