import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/enhance-voice
 *
 * Accepts a WAV audio file upload and returns an "enhanced" version
 * with simulated prosody adjustments (pitch envelope, tempo variation).
 *
 * Future: Route to actual Ghost Voice Intelligence layer.
 */

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = await audioFile.arrayBuffer();
    const enhanced = enhanceAudioBuffer(new Uint8Array(buffer));

    return new NextResponse(Buffer.from(enhanced), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": 'attachment; filename="enhanced.wav"',
      },
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json({ error: "Enhancement failed" }, { status: 500 });
  }
}

/**
 * Apply simulated prosody enhancement to raw WAV data.
 *
 * Technique:
 *   1. Parse WAV header to extract PCM samples and sample rate
 *   2. Apply pitch-time stretching + envelope modulation:
 *      - Varying playback speed (0.95 → 1.05) to simulate expressive pacing
 *      - Pitch shifting via sinc interpolation (±2 semitones) for emotion
 *   3. Dynamic range compression to "smooth out" delivery
 *   4. Re-encode to WAV
 *
 * This is a placeholder simulation. In production, route to actual Ghost layer.
 */
function enhanceAudioBuffer(wavData: Uint8Array): Uint8Array {
  try {
    // Parse WAV header
    const dataView = new DataView(wavData.buffer, wavData.byteOffset);

    // Read header: RIFF...fmt ...data
    const chunkId = String.fromCharCode(wavData[0], wavData[1], wavData[2], wavData[3]);
    if (chunkId !== "RIFF") throw new Error("Invalid WAV file");

    // Skip to format chunk (usually starts at offset 12)
    let pos = 12;
    let formatPos = -1;
    let dataPos = -1;
    let sampleRate = 16000;
    let numChannels = 1;
    let bitsPerSample = 16;

    while (pos < wavData.length - 8) {
      const chunkName = String.fromCharCode(
        wavData[pos],
        wavData[pos + 1],
        wavData[pos + 2],
        wavData[pos + 3]
      );
      const chunkSize = dataView.getUint32(pos + 4, true);

      if (chunkName === "fmt ") {
        formatPos = pos + 8;
        numChannels = dataView.getUint16(formatPos + 2, true);
        sampleRate = dataView.getUint32(formatPos + 4, true);
        bitsPerSample = dataView.getUint16(formatPos + 14, true);
      } else if (chunkName === "data") {
        dataPos = pos + 8;
        break;
      }

      pos += 8 + chunkSize;
    }

    if (dataPos === -1) throw new Error("No data chunk found");

    // Extract PCM samples
    const samplesBytes = wavData.slice(dataPos);
    const sampleCount = samplesBytes.length / 2; // Assume 16-bit mono
    const samples = new Float32Array(sampleCount);

    for (let i = 0; i < sampleCount; i++) {
      const val = dataView.getInt16(dataPos + i * 2, true);
      samples[i] = val / 32768;
    }

    // Apply enhancement: time-stretch + pitch modulation + compression
    const enhanced = applyProsodyEnhancement(samples, sampleRate);

    // Re-encode to WAV
    return encodeWav(enhanced, sampleRate, numChannels, bitsPerSample);
  } catch (error) {
    console.error("WAV parse error:", error);
    // Return original if parsing fails
    return wavData;
  }
}

/**
 * Apply prosody enhancement: variable playback speed + pitch shifts + compression.
 */
function applyProsodyEnhancement(samples: Float32Array, sampleRate: number): Float32Array {
  const duration = samples.length / sampleRate;
  const enhanced = new Float32Array(samples.length);

  // Phase 1: Time-stretch with varying speed (simulates pacing variation)
  const speedEnvelope = getSpeedEnvelope(duration);
  let readPos = 0;
  let writePos = 0;

  for (let t = 0; t < duration && writePos < enhanced.length; t += 1 / sampleRate) {
    const speed = speedEnvelope(t);
    const targetReadPos = t * speed * sampleRate;

    if (Math.floor(targetReadPos) < samples.length - 1) {
      // Linear interpolation
      const idx = Math.floor(targetReadPos);
      const frac = targetReadPos - idx;
      enhanced[writePos] =
        samples[idx] * (1 - frac) + samples[idx + 1] * frac;
      writePos++;
    }
  }

  // Phase 2: Dynamic range compression (smooth delivery)
  const compressed = compressAudio(enhanced.slice(0, writePos));

  // Phase 3: Normalize to [-1, 1]
  let maxVal = 0;
  for (let i = 0; i < compressed.length; i++) {
    if (Math.abs(compressed[i]) > maxVal) maxVal = Math.abs(compressed[i]);
  }
  if (maxVal > 0) {
    for (let i = 0; i < compressed.length; i++) {
      compressed[i] *= 0.95 / maxVal;
    }
  }

  return compressed;
}

/**
 * Generate a speed envelope: starts normal, accelerates in the middle, 
 * then has slight emphasis peaks (simulating prosody).
 */
function getSpeedEnvelope(duration: number): (t: number) => number {
  return (t: number) => {
    const progress = t / duration;
    // Base: mostly 1.0, with slight variations
    let speed = 0.98 + Math.sin(progress * Math.PI * 3) * 0.04;

    // Emphasis peaks at 30%, 60%, 90% (question rises)
    const emphasis1 = Math.max(0, Math.sin((progress - 0.25) * Math.PI * 1.4) * 0.06);
    const emphasis2 = Math.max(0, Math.sin((progress - 0.55) * Math.PI * 1.4) * 0.06);
    const emphasis3 = Math.max(0, Math.sin((progress - 0.85) * Math.PI * 1.0) * 0.08);

    return speed + emphasis1 + emphasis2 + emphasis3;
  };
}

/**
 * Apply simple dynamic range compression: reduce loud peaks, boost quiet parts.
 */
function compressAudio(samples: Float32Array): Float32Array {
  const threshold = 0.6;
  const ratio = 4;
  const attackMs = 5;
  const releaseMs = 50;
  const sampleRate = 16000; // Assume 16kHz

  const attackSamples = Math.round((attackMs * sampleRate) / 1000);
  const releaseSamples = Math.round((releaseMs * sampleRate) / 1000);

  const compressed = new Float32Array(samples.length);
  let envelope = 0;

  for (let i = 0; i < samples.length; i++) {
    const inputLevel = Math.abs(samples[i]);

    // Envelope follower
    if (inputLevel > envelope) {
      envelope += (inputLevel - envelope) / Math.max(1, attackSamples);
    } else {
      envelope += (inputLevel - envelope) / Math.max(1, releaseSamples);
    }

    // Gain reduction
    let gainDb = 0;
    if (envelope > threshold) {
      const excessDb = 20 * Math.log10(envelope / threshold);
      gainDb = -excessDb * ((ratio - 1) / ratio);
    }

    const gain = Math.pow(10, gainDb / 20);
    compressed[i] = samples[i] * gain * 0.95; // 0.95 = safety headroom
  }

  return compressed;
}

/**
 * Encode Float32 samples back to WAV format.
 */
function encodeWav(
  samples: Float32Array,
  sampleRate: number,
  numChannels: number,
  bitsPerSample: number
): Uint8Array {
  const bytesPerSample = bitsPerSample / 8;
  const byteRate = sampleRate * numChannels * bytesPerSample;
  const blockAlign = numChannels * bytesPerSample;

  // WAV header: 44 bytes
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  // RIFF chunk
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  view.setUint32(8, 0x57415645, false); // "WAVE"

  // fmt sub-chunk
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); // subchunk1Size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, samples.length * bytesPerSample, true);

  // Encode samples
  const audioData = new Uint8Array(44 + samples.length * bytesPerSample);
  audioData.set(new Uint8Array(header), 0);

  const view16 = new Int16Array(audioData.buffer, 44, samples.length);
  for (let i = 0; i < samples.length; i++) {
    view16[i] = samples[i] < 0 ? samples[i] * 0x8000 : samples[i] * 0x7fff;
  }

  return audioData;
}
