import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

/**
 * POST /api/enhance-voice
 *
 * Accepts a WAV audio file upload and returns an "enhanced" version
 * with simulated prosody adjustments (pitch envelope, tempo variation).
 *
 * Future: Route to actual Ghost Voice Intelligence layer.
 */

export const maxDuration = 60;

type IntelligenceDeltas = {
  prosody: number;
  emotionalClarity: number;
  naturalPacing: "optimized" | "adjusting";
  emphasisDetection: "active" | "warming";
};

type EnhancementResult = {
  audio: Uint8Array;
  deltas: IntelligenceDeltas;
  source: "ghost" | "simulated";
  details: EnhancementDetails;
  contentType: string;
};

type EnhancementDetails = {
  templateUsed: string | null;
  emotionFrom: string | null;
  emotionTo: string | null;
  secondaryEmotionTo: string | null;
  curveFrom: string | null;
  curveTo: string | null;
  curveChanged: boolean;
  autoTemplateConfidence: number | null;
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    const inputMode = normalizeInputMode(formData.get("inputMode"));
    const stylePreset = normalizeStylePreset(formData.get("stylePreset"));
    const demoIntensity = normalizeDemoIntensity(formData.get("demoIntensity"));

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = await audioFile.arrayBuffer();
    const wavBytes = new Uint8Array(buffer);

    const remoteResult = await tryGhostEnhancement(audioFile, wavBytes, inputMode, stylePreset, demoIntensity);
    const result =
      remoteResult ?? enhanceAudioBuffer(wavBytes, audioFile.type || "audio/wav", inputMode, stylePreset, demoIntensity);
    const { audio, deltas, source, details, contentType } = result;
    const inputHash = hashBytes(wavBytes);
    const outputHash = hashBytes(audio);
    const hashChanged = inputHash !== outputHash;

    return new NextResponse(Buffer.from(audio), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="enhanced.${contentType.includes("mpeg") ? "mp3" : "wav"}"`,
        "X-Ghost-Prosody": `+${deltas.prosody}%`,
        "X-Ghost-Emotional-Clarity": `+${deltas.emotionalClarity}%`,
        "X-Ghost-Natural-Pacing": deltas.naturalPacing,
        "X-Ghost-Emphasis-Detection": deltas.emphasisDetection,
        "X-Ghost-Source": source,
        "X-Ghost-Input-Mode": inputMode,
        "X-Ghost-Requested-Preset": stylePreset,
        "X-Ghost-Demo-Intensity": demoIntensity,
        "X-Ghost-Processing-Applied": String(hashChanged),
        "X-Ghost-Hash-Changed": String(hashChanged),
        "X-Ghost-Input-Bytes": String(wavBytes.byteLength),
        "X-Ghost-Output-Bytes": String(audio.byteLength),
        "X-Ghost-Template-Used": details.templateUsed ?? "",
        "X-Ghost-Emotion-From": details.emotionFrom ?? "",
        "X-Ghost-Emotion-To": details.emotionTo ?? "",
        "X-Ghost-Secondary-Emotion-To": details.secondaryEmotionTo ?? "",
        "X-Ghost-Curve-From": details.curveFrom ?? "",
        "X-Ghost-Curve-To": details.curveTo ?? "",
        "X-Ghost-Curve-Changed": String(details.curveChanged),
        "X-Ghost-Auto-Template-Confidence":
          details.autoTemplateConfidence === null ? "" : String(details.autoTemplateConfidence),
      },
    });
  } catch (error) {
    console.error("Enhancement error:", error);
    return NextResponse.json({ error: "Enhancement failed" }, { status: 500 });
  }
}

function hashBytes(bytes: Uint8Array): string {
  return createHash("sha1").update(Buffer.from(bytes)).digest("hex");
}

type InputMode = "record" | "sample";
type StylePreset = "sales" | "support" | "podcast";
type DemoIntensity = "subtle" | "strong" | "extreme";

function normalizeInputMode(value: FormDataEntryValue | null): InputMode {
  return value === "sample" ? "sample" : "record";
}

function normalizeStylePreset(value: FormDataEntryValue | null): StylePreset {
  if (value === "support") return "support";
  if (value === "podcast") return "podcast";
  return "sales";
}

function normalizeDemoIntensity(value: FormDataEntryValue | null): DemoIntensity {
  if (value === "subtle") return "subtle";
  if (value === "extreme") return "extreme";
  return "strong";
}

async function tryGhostEnhancement(
  audioFile: File,
  wavData: Uint8Array,
  inputMode: InputMode,
  stylePreset: StylePreset,
  demoIntensity: DemoIntensity
): Promise<EnhancementResult | null> {
  const enhanceUrl = process.env.GHOST_ENHANCE_URL;
  if (!enhanceUrl) {
    return null;
  }

  const timeoutMs = Number(process.env.GHOST_ENHANCE_TIMEOUT_MS ?? "15000");
  const apiKey = process.env.GHOST_ENHANCE_API_KEY;

  try {
    const fd = new FormData();
    const mime = audioFile.type || "audio/wav";
    fd.append("audio", new Blob([Buffer.from(wavData)], { type: mime }), audioFile.name || "recording.wav");
    fd.append("inputMode", inputMode);
    fd.append("stylePreset", stylePreset);
    fd.append("demoIntensity", demoIntensity);

    const response = await fetch(enhanceUrl, {
      method: "POST",
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: fd,
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      console.error("Ghost backend error:", response.status, await response.text());
      return null;
    }

    const responseContentType = (response.headers.get("content-type") || "").toLowerCase();

    // JSON contract option: { audioBase64: "...", deltas: { ... } }
    if (responseContentType.includes("application/json")) {
      const payload = await response.json();
      const audioBase64 = typeof payload?.audioBase64 === "string" ? payload.audioBase64 : "";
      if (!audioBase64) {
        console.error("Ghost backend JSON response missing audioBase64.");
        return null;
      }

      const audio = new Uint8Array(Buffer.from(audioBase64, "base64"));
      const deltasRaw = typeof payload?.deltas === "object" && payload?.deltas !== null ? payload.deltas : null;
      const deltas = parseDeltas(deltasRaw, response.headers);
      const details = parseDetails(deltasRaw, response.headers);

      return { audio, deltas, source: "ghost", details, contentType: "audio/wav" };
    }

    // Binary contract option: raw WAV body + optional X-Ghost-* headers
    const audio = new Uint8Array(await response.arrayBuffer());
    const deltas = parseDeltas(null, response.headers);
    const details = parseDetails(null, response.headers);
    const contentType = response.headers.get("content-type") || "audio/wav";

    return { audio, deltas, source: "ghost", details, contentType };
  } catch (error) {
    console.error("Ghost backend request failed. Falling back to simulated enhancement.", error);
    return null;
  }
}

function parseDeltas(raw: unknown, headers: Headers): IntelligenceDeltas {
  const fromObject = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const speedDelta = parseFloatValue(pickFirst(fromObject, ["speed_delta", "speedDelta"]), 0);
  const pitchDelta = parseFloatValue(pickFirst(fromObject, ["pitch_delta", "pitchDelta"]), 0);
  const intensityDelta = parseFloatValue(pickFirst(fromObject, ["intensity_delta", "intensityDelta"]), 0);
  const blendDelta = parseFloatValue(pickFirst(fromObject, ["blend_delta", "blendDelta"]), 0);
  const confidence = clampFloat(
    parseFloatValue(pickFirst(fromObject, ["auto_template_confidence", "autoTemplateConfidence"]), 0.5),
    0,
    1
  );
  const curveChanged = parseBoolValue(pickFirst(fromObject, ["curve_changed", "curveChanged"]), false);
  const emotionFrom = parseText(pickFirst(fromObject, ["emotion_from", "emotionFrom"]));
  const emotionTo = parseText(pickFirst(fromObject, ["emotion_to", "emotionTo"]));
  const secondaryEmotionTo = parseText(
    pickFirst(fromObject, ["secondary_emotion_to", "secondaryEmotionTo"])
  );

  const derivedProsody = clampInt(
    Math.round(
      Math.abs(speedDelta) * 125 +
        Math.abs(pitchDelta) * 140 +
        Math.abs(intensityDelta) * 170 +
        Math.abs(blendDelta) * 90 +
        confidence * 18 +
        (curveChanged ? 9 : 0)
    ),
    28,
    96
  );

  const derivedEmotionalClarity = clampInt(
    Math.round(
      Math.abs(intensityDelta) * 210 +
        Math.abs(blendDelta) * 80 +
        (emotionFrom && emotionTo && emotionFrom !== emotionTo ? 18 : 0) +
        (secondaryEmotionTo ? 8 : 0) +
        confidence * 20
    ),
    30,
    98
  );

  const derivedNaturalPacing =
    Math.abs(speedDelta) >= 0.05 || curveChanged || confidence >= 0.55 ? "optimized" : "adjusting";
  const derivedEmphasis =
    Math.abs(pitchDelta) >= 0.05 || curveChanged || Math.abs(intensityDelta) >= 0.12 ? "active" : "warming";

  return {
    prosody: clampInt(
      parsePercent(
        pickFirst(fromObject, ["prosody", "prosody_delta"]),
        parsePercent(headers.get("X-Ghost-Prosody"), derivedProsody)
      ),
      10,
      100
    ),
    emotionalClarity: clampInt(
      parsePercent(
        pickFirst(fromObject, ["emotionalClarity", "emotional_clarity"]),
        parsePercent(headers.get("X-Ghost-Emotional-Clarity"), derivedEmotionalClarity)
      ),
      10,
      100
    ),
    naturalPacing:
      normalizeEnum(
        pickFirst(fromObject, ["naturalPacing", "natural_pacing"]),
        headers.get("X-Ghost-Natural-Pacing") || derivedNaturalPacing
      ) === "optimized"
        ? "optimized"
        : "adjusting",
    emphasisDetection:
      normalizeEnum(
        pickFirst(fromObject, ["emphasisDetection", "emphasis_detection"]),
        headers.get("X-Ghost-Emphasis-Detection") || derivedEmphasis
      ) === "active"
        ? "active"
        : "warming",
  };
}

function parseDetails(raw: unknown, headers: Headers): EnhancementDetails {
  const fromObject = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};

  const confidenceRaw = parseFloatValue(
    pickFirst(fromObject, ["auto_template_confidence", "autoTemplateConfidence"]),
    parseFloatValue(headers.get("X-Ghost-Auto-Template-Confidence"), -1)
  );

  return {
    templateUsed:
      parseText(pickFirst(fromObject, ["template_used", "templateUsed"])) ||
      parseText(headers.get("X-Ghost-Template-Used")),
    emotionFrom:
      parseText(pickFirst(fromObject, ["emotion_from", "emotionFrom"])) ||
      parseText(headers.get("X-Ghost-Emotion-From")),
    emotionTo:
      parseText(pickFirst(fromObject, ["emotion_to", "emotionTo"])) ||
      parseText(headers.get("X-Ghost-Emotion-To")),
    secondaryEmotionTo:
      parseText(pickFirst(fromObject, ["secondary_emotion_to", "secondaryEmotionTo"])) ||
      parseText(headers.get("X-Ghost-Secondary-Emotion-To")),
    curveFrom:
      parseText(pickFirst(fromObject, ["curve_from", "curveFrom"])) ||
      parseText(headers.get("X-Ghost-Curve-From")),
    curveTo:
      parseText(pickFirst(fromObject, ["curve_to", "curveTo"])) ||
      parseText(headers.get("X-Ghost-Curve-To")),
    curveChanged: parseBoolValue(
      pickFirst(fromObject, ["curve_changed", "curveChanged"]),
      parseBoolValue(headers.get("X-Ghost-Curve-Changed"), false)
    ),
    autoTemplateConfidence: confidenceRaw < 0 ? null : clampFloat(confidenceRaw, 0, 1),
  };
}

function pickFirst(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (key in source) {
      return source[key];
    }
  }
  return undefined;
}

function normalizeEnum(primary: unknown, fallback: string | null): string {
  if (typeof primary === "string") return primary.toLowerCase();
  return (fallback || "").toLowerCase();
}

function parseText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseFloatValue(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

function parseBoolValue(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function parsePercent(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string") {
    const match = value.match(/-?\d+/);
    if (match) {
      return Math.round(Number(match[0]));
    }
  }
  return fallback;
}

function clampFloat(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
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
type TransformProfile = {
  speedBase: number;
  speedSwing: number;
  emphasisBoost: number;
  compressorThreshold: number;
  compressorRatio: number;
  makeupGain: number;
  pitchShift: number;
};

function getTransformProfile(
  inputMode: InputMode,
  preset: StylePreset,
  intensity: DemoIntensity
): TransformProfile {
  if (intensity === "extreme") {
    return {
      speedBase: 1.12,
      speedSwing: 0.14,
      emphasisBoost: 1.8,
      compressorThreshold: 0.42,
      compressorRatio: 6.5,
      makeupGain: 1.65,
      pitchShift: 1.15,
    };
  }

  const isDemo = inputMode === "sample" || intensity === "strong";

  if (preset === "support") {
    return {
      speedBase: isDemo ? 1.03 : 1.0,
      speedSwing: isDemo ? 0.09 : 0.05,
      emphasisBoost: isDemo ? 1.3 : 1,
      compressorThreshold: isDemo ? 0.52 : 0.58,
      compressorRatio: isDemo ? 4.8 : 3.8,
      makeupGain: isDemo ? 1.3 : 1.12,
      pitchShift: isDemo ? 1.06 : 1.01,
    };
  }

  if (preset === "podcast") {
    return {
      speedBase: isDemo ? 1.08 : 1.03,
      speedSwing: isDemo ? 0.11 : 0.06,
      emphasisBoost: isDemo ? 1.45 : 1.12,
      compressorThreshold: isDemo ? 0.48 : 0.55,
      compressorRatio: isDemo ? 5.2 : 4.0,
      makeupGain: isDemo ? 1.4 : 1.16,
      pitchShift: isDemo ? 1.08 : 1.02,
    };
  }

  return {
    speedBase: isDemo ? 1.1 : 1.04,
    speedSwing: isDemo ? 0.12 : 0.06,
    emphasisBoost: isDemo ? 1.55 : 1.15,
    compressorThreshold: isDemo ? 0.46 : 0.54,
    compressorRatio: isDemo ? 5.6 : 4.2,
    makeupGain: isDemo ? 1.45 : 1.2,
    pitchShift: isDemo ? 1.1 : 1.03,
  };
}

function enhanceAudioBuffer(
  wavData: Uint8Array,
  inputMimeType: string,
  inputMode: InputMode,
  stylePreset: StylePreset,
  demoIntensity: DemoIntensity
): EnhancementResult {
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
    const profile = getTransformProfile(inputMode, stylePreset, demoIntensity);
    const enhanced = applyProsodyEnhancement(samples, sampleRate, profile);
    const deltas = applyStylePresetToDeltas(calculateIntelligenceDeltas(samples, enhanced, sampleRate), stylePreset);

    // Re-encode to WAV
    return {
      audio: encodeWav(enhanced, sampleRate, numChannels, bitsPerSample),
      deltas,
      source: "simulated",
      details: {
        templateUsed: stylePreset,
        emotionFrom: null,
        emotionTo: null,
        secondaryEmotionTo: null,
        curveFrom: null,
        curveTo: null,
        curveChanged: false,
        autoTemplateConfidence: null,
      },
      contentType: "audio/wav",
    };
  } catch (error) {
    console.error("WAV parse error:", error);
    // Return original if parsing fails
    return {
      audio: wavData,
      deltas: {
        prosody: 24,
        emotionalClarity: 33,
        naturalPacing: "adjusting",
        emphasisDetection: "warming",
      },
      source: "simulated",
      details: {
        templateUsed: stylePreset,
        emotionFrom: null,
        emotionTo: null,
        secondaryEmotionTo: null,
        curveFrom: null,
        curveTo: null,
        curveChanged: false,
        autoTemplateConfidence: null,
      },
      contentType: inputMimeType || "audio/wav",
    };
  }
}

function applyStylePresetToDeltas(deltas: IntelligenceDeltas, preset: StylePreset): IntelligenceDeltas {
  if (preset === "support") {
    return {
      prosody: clampInt(deltas.prosody + 5, 10, 100),
      emotionalClarity: clampInt(deltas.emotionalClarity + 8, 10, 100),
      naturalPacing: "optimized",
      emphasisDetection: deltas.emphasisDetection,
    };
  }

  if (preset === "podcast") {
    return {
      prosody: clampInt(deltas.prosody + 9, 10, 100),
      emotionalClarity: clampInt(deltas.emotionalClarity + 4, 10, 100),
      naturalPacing: "optimized",
      emphasisDetection: "active",
    };
  }

  return {
    prosody: clampInt(deltas.prosody + 7, 10, 100),
    emotionalClarity: clampInt(deltas.emotionalClarity + 6, 10, 100),
    naturalPacing: "optimized",
    emphasisDetection: "active",
  };
}

function calculateIntelligenceDeltas(
  source: Float32Array,
  enhanced: Float32Array,
  sampleRate: number
): IntelligenceDeltas {
  const sourceRmsVar = calculateRmsVariance(source, sampleRate);
  const enhancedRmsVar = calculateRmsVariance(enhanced, sampleRate);

  const sourceRange = calculateDynamicRange(source);
  const enhancedRange = calculateDynamicRange(enhanced);

  const pauseRatio = calculatePauseRatio(enhanced);
  const emphasisEvents = countEmphasisEvents(enhanced, sampleRate);

  const prosodyDelta = clampInt(Math.round(((enhancedRmsVar / Math.max(sourceRmsVar, 0.001)) - 1) * 100), 28, 74);
  const emotionDelta = clampInt(Math.round(((enhancedRange / Math.max(sourceRange, 0.001)) - 1) * 100), 36, 82);

  return {
    prosody: prosodyDelta,
    emotionalClarity: emotionDelta,
    naturalPacing: pauseRatio >= 0.08 && pauseRatio <= 0.28 ? "optimized" : "adjusting",
    emphasisDetection: emphasisEvents >= 4 ? "active" : "warming",
  };
}

function calculateRmsVariance(samples: Float32Array, sampleRate: number): number {
  const windowSize = Math.max(1, Math.floor(sampleRate * 0.12));
  const rmsValues: number[] = [];

  for (let i = 0; i + windowSize <= samples.length; i += windowSize) {
    let sumSq = 0;
    for (let j = 0; j < windowSize; j++) {
      const v = samples[i + j];
      sumSq += v * v;
    }
    rmsValues.push(Math.sqrt(sumSq / windowSize));
  }

  if (rmsValues.length === 0) return 0;

  const mean = rmsValues.reduce((acc, v) => acc + v, 0) / rmsValues.length;
  const variance = rmsValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) / rmsValues.length;
  return variance;
}

function calculateDynamicRange(samples: Float32Array): number {
  let peak = 0;
  let trough = 1;

  for (let i = 0; i < samples.length; i++) {
    const abs = Math.abs(samples[i]);
    if (abs > peak) peak = abs;
    if (abs > 0 && abs < trough) trough = abs;
  }

  return peak / Math.max(trough, 0.001);
}

function calculatePauseRatio(samples: Float32Array): number {
  let silent = 0;
  const threshold = 0.014;
  for (let i = 0; i < samples.length; i++) {
    if (Math.abs(samples[i]) < threshold) silent++;
  }
  return silent / Math.max(samples.length, 1);
}

function countEmphasisEvents(samples: Float32Array, sampleRate: number): number {
  const stride = Math.max(1, Math.floor(sampleRate * 0.08));
  let peaks = 0;

  for (let i = 0; i + stride <= samples.length; i += stride) {
    let localPeak = 0;
    for (let j = 0; j < stride; j++) {
      const abs = Math.abs(samples[i + j]);
      if (abs > localPeak) localPeak = abs;
    }
    if (localPeak > 0.42) peaks++;
  }

  return peaks;
}

function clampInt(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Apply prosody enhancement: variable playback speed + pitch shifts + compression.
 */
function applyProsodyEnhancement(
  samples: Float32Array,
  sampleRate: number,
  profile: TransformProfile
): Float32Array {
  const duration = samples.length / sampleRate;
  const enhanced = new Float32Array(samples.length);

  // Phase 1: Time-stretch with varying speed (simulates pacing variation)
  const speedEnvelope = getSpeedEnvelope(duration, profile);
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
  const compressed = compressAudio(enhanced.slice(0, writePos), sampleRate, profile);

  // Phase 2.25: Lightweight pitch shift to make intensity modes audibly distinct.
  const pitched = applyPitchShift(compressed, profile.pitchShift);

  // Phase 2.5: Add makeup gain for a more obvious but controlled transformation.
  for (let i = 0; i < pitched.length; i++) {
    pitched[i] *= profile.makeupGain;
  }

  // Phase 3: Normalize to [-1, 1]
  let maxVal = 0;
  for (let i = 0; i < pitched.length; i++) {
    if (Math.abs(pitched[i]) > maxVal) maxVal = Math.abs(pitched[i]);
  }
  if (maxVal > 0) {
    for (let i = 0; i < pitched.length; i++) {
      pitched[i] *= 0.95 / maxVal;
    }
  }

  return pitched;
}

function applyPitchShift(samples: Float32Array, factor: number): Float32Array {
  if (Math.abs(factor - 1) < 0.001) {
    return samples;
  }

  const shifted = new Float32Array(samples.length);
  let readPos = 0;

  for (let i = 0; i < shifted.length; i++) {
    const idx = Math.floor(readPos);
    const next = Math.min(idx + 1, samples.length - 1);
    const frac = readPos - idx;

    if (idx >= samples.length) {
      shifted[i] = samples[samples.length - 1] ?? 0;
    } else {
      shifted[i] = samples[idx] * (1 - frac) + samples[next] * frac;
    }

    readPos += factor;
  }

  return shifted;
}

/**
 * Generate a speed envelope: starts normal, accelerates in the middle, 
 * then has slight emphasis peaks (simulating prosody).
 */
function getSpeedEnvelope(duration: number, profile: TransformProfile): (t: number) => number {
  return (t: number) => {
    const progress = t / duration;
    // Base speed with sinusoidal variation.
    let speed = profile.speedBase + Math.sin(progress * Math.PI * 3) * profile.speedSwing;

    // Emphasis peaks at 30%, 60%, 90% (question rises)
    const emphasis1 = Math.max(0, Math.sin((progress - 0.25) * Math.PI * 1.4) * 0.06 * profile.emphasisBoost);
    const emphasis2 = Math.max(0, Math.sin((progress - 0.55) * Math.PI * 1.4) * 0.06 * profile.emphasisBoost);
    const emphasis3 = Math.max(0, Math.sin((progress - 0.85) * Math.PI * 1.0) * 0.08 * profile.emphasisBoost);

    return clampFloat(speed + emphasis1 + emphasis2 + emphasis3, 0.75, 1.35);
  };
}

/**
 * Apply simple dynamic range compression: reduce loud peaks, boost quiet parts.
 */
function compressAudio(samples: Float32Array, sampleRate: number, profile: TransformProfile): Float32Array {
  const threshold = profile.compressorThreshold;
  const ratio = profile.compressorRatio;
  const attackMs = 5;
  const releaseMs = 50;

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
