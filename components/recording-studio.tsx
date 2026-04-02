import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type InputMode = "record" | "sample";
type VoiceStylePreset = "sales" | "support" | "podcast";
type DemoIntensity = "subtle" | "strong" | "extreme";

const aiVoiceSamples = [
  {
    id: "robotic-sales",
    label: "AI Voice 1 - Robotic Sales",
    description: "Flat robotic delivery for outreach.",
    src: "/audio/ai-voice-1.mp3",
  },
  {
    id: "neutral-sales",
    label: "AI Voice 2 - Neutral Sales",
    description: "Neutral delivery with basic pacing.",
    src: "/audio/ai-voice-2.mp3",
  },
  {
    id: "emotional-sales",
    label: "AI Voice 3 - Slightly Emotional Sales",
    description: "Mildly expressive version of the same script.",
    src: "/audio/ai-voice-3.mp3",
  },
  {
    id: "alt-sales",
    label: "AI Voice 4 - Alternate Sales",
    description: "Alternate synthetic take for A/B demo.",
    src: "/audio/ai-voice-4.mp3",
  },
] as const;

export function RecordingStudio({
  onRecordingComplete,
}: {
  onRecordingComplete?: (blob: Blob, dataUrl: string) => void;
}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordedBlobRef = useRef<Blob | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState("audio/webm");
  const [inputMode, setInputMode] = useState<InputMode>("record");
  const [selectedSampleId, setSelectedSampleId] = useState<string>(aiVoiceSamples[0].id);
  const [selectedStylePreset, setSelectedStylePreset] = useState<VoiceStylePreset>("sales");
  const [demoIntensity, setDemoIntensity] = useState<DemoIntensity>("strong");
  const [enhancedAudio, setEnhancedAudio] = useState<string | null>(null);
  const [enhancedMimeType, setEnhancedMimeType] = useState("audio/wav");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState("");
  const [permissionHint, setPermissionHint] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState("default");
  const [isCheckingDevices, setIsCheckingDevices] = useState(false);
  const [enhancementSource, setEnhancementSource] = useState<"ghost" | "simulated">("simulated");
  const [enhancementDetails, setEnhancementDetails] = useState<{
    templateUsed: string;
    emotionFrom: string;
    emotionTo: string;
    secondaryEmotionTo: string;
    curveFrom: string;
    curveTo: string;
    curveChanged: boolean;
    autoTemplateConfidence: string;
  }>({
    templateUsed: "",
    emotionFrom: "",
    emotionTo: "",
    secondaryEmotionTo: "",
    curveFrom: "",
    curveTo: "",
    curveChanged: false,
    autoTemplateConfidence: "",
  });
  const [processingProof, setProcessingProof] = useState<{
    processingApplied: boolean;
    hashChanged: boolean;
    inputBytes: number;
    outputBytes: number;
  }>({
    processingApplied: false,
    hashChanged: false,
    inputBytes: 0,
    outputBytes: 0,
  });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultDeltas = {
    prosody: "+42%",
    emotionalClarity: "+67%",
    naturalPacing: "optimized",
    emphasisDetection: "active",
  };

  const [intelligenceDeltas, setIntelligenceDeltas] = useState(defaultDeltas);

  const pickRecorderMimeType = () => {
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ];

    for (const type of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return "";
  };

  const selectedSample = aiVoiceSamples.find((sample) => sample.id === selectedSampleId) ?? aiVoiceSamples[0];

  const refreshMicrophones = async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setError("Microphone APIs are not available in this browser.");
      return [];
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((d) => d.kind === "audioinput");
    setMicrophones(mics);

    if (mics.length === 0) {
      setError("No microphone detected. Connect a microphone and try again.");
      return [];
    }

    setError("");
    return mics;
  };

  // Start recording
  const startRecording = async () => {
    try {
      setError("");
      setPermissionHint("");
      setIsCheckingDevices(true);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser does not support microphone access.");
      }

      // 1) Enumerate first so we can tell users clearly when no input device exists.
      const mics = await refreshMicrophones();
      if (mics.length === 0) {
        setIsCheckingDevices(false);
        return;
      }

      // 2) Prompt and acquire using default mic first for maximum compatibility.
      let stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 3) If user selected a specific mic, try switching to it. If that fails, keep default.
      if (selectedMicrophoneId !== "default") {
        try {
          stream.getTracks().forEach((track) => track.stop());
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              deviceId: { ideal: selectedMicrophoneId },
            },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setPermissionHint("Selected microphone unavailable. Using default microphone.");
        }
      }

      setIsCheckingDevices(false);
      streamRef.current = stream;

      const preferredMimeType = pickRecorderMimeType();
      const mediaRecorder = preferredMimeType
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      recordedBlobRef.current = null;
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length === 0) {
          setError("Recording captured no audio data. Please try again.");
          return;
        }

        const mime = mediaRecorder.mimeType || preferredMimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });

        if (blob.size === 0) {
          setError("Recorded audio was empty. Please retry.");
          return;
        }

        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }

        const url = URL.createObjectURL(blob);
        recordedBlobRef.current = blob;
        setRecordedAudioUrl(url);
        setRecordedMimeType(mime);
        setHasRecording(true);
        chunksRef.current = [];

        if (onRecordingComplete) {
          const reader = new FileReader();
          reader.onloadend = () => {
            onRecordingComplete(blob, reader.result as string);
          };
          reader.readAsDataURL(blob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t >= 60) {
            stopRecording();
            return t;
          }
          return t + 1;
        });
      }, 1000);
    } catch (err) {
      setIsCheckingDevices(false);
      if (err instanceof DOMException) {
        if (err.name === "NotFoundError") {
          setError("No microphone found. Connect a microphone and try again.");
          return;
        }
        if (err.name === "NotAllowedError") {
          setError("Microphone permission denied.");
          setPermissionHint("Enable microphone access in your browser site settings, then retry.");
          return;
        }
        if (err.name === "NotReadableError") {
          setError("Microphone is in use by another app.");
          setPermissionHint("Close other apps using the microphone and try again.");
          return;
        }
        if (err.name === "OverconstrainedError") {
          setError("Selected microphone is unavailable.");
          setPermissionHint("Switch to Default Microphone and retry.");
          return;
        }
      }

      setError(err instanceof Error ? err.message : "Failed to access microphone.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  // Clear recording
  const clearRecording = () => {
    chunksRef.current = [];
    recordedBlobRef.current = null;
    setHasRecording(false);

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }
    setRecordedAudioUrl(null);

    if (enhancedAudio) {
      URL.revokeObjectURL(enhancedAudio);
    }
    setEnhancedAudio(null);
    setEnhancedMimeType("audio/wav");

    setIntelligenceDeltas(defaultDeltas);
    setEnhancementSource("simulated");
    setEnhancementDetails({
      templateUsed: "",
      emotionFrom: "",
      emotionTo: "",
      secondaryEmotionTo: "",
      curveFrom: "",
      curveTo: "",
      curveChanged: false,
      autoTemplateConfidence: "",
    });
    setProcessingProof({
      processingApplied: false,
      hashChanged: false,
      inputBytes: 0,
      outputBytes: 0,
    });
    setRecordingTime(0);
    setError("");
    setPermissionHint("");
  };

  // Enhance audio via API
  const enhanceAudio = async () => {
    setIsEnhancing(true);
    try {
      let blob: Blob;
      let inputFilename = "recording.webm";

      if (inputMode === "sample") {
        const sampleRes = await fetch(selectedSample.src);
        if (!sampleRes.ok) {
          throw new Error("Unable to load selected AI sample.");
        }
        blob = await sampleRes.blob();
        const sampleExt = selectedSample.src.split(".").pop() || "mp3";
        inputFilename = `ai-sample.${sampleExt}`;
      } else {
        if (!recordedAudioUrl) {
          setError("Record audio first, then generate enhancement.");
          return;
        }
        blob = recordedBlobRef.current ?? (await (await fetch(recordedAudioUrl)).blob());
        const fileExt = recordedMimeType.includes("ogg")
          ? "ogg"
          : recordedMimeType.includes("mp4")
            ? "m4a"
            : "webm";
        inputFilename = `recording.${fileExt}`;
      }

      // Call backend enhancement API
      const fd = new FormData();
      fd.append("audio", blob, inputFilename);
      fd.append("inputMode", inputMode);
      fd.append("stylePreset", selectedStylePreset);
      fd.append("demoIntensity", demoIntensity);

      const enhanceRes = await fetch("/api/enhance-voice", {
        method: "POST",
        body: fd,
      });

      if (!enhanceRes.ok) throw new Error("Enhancement failed");

      const prosody = enhanceRes.headers.get("X-Ghost-Prosody") ?? defaultDeltas.prosody;
      const emotionalClarity =
        enhanceRes.headers.get("X-Ghost-Emotional-Clarity") ?? defaultDeltas.emotionalClarity;
      const naturalPacing =
        enhanceRes.headers.get("X-Ghost-Natural-Pacing") ?? defaultDeltas.naturalPacing;
      const emphasisDetection =
        enhanceRes.headers.get("X-Ghost-Emphasis-Detection") ?? defaultDeltas.emphasisDetection;
      const source = enhanceRes.headers.get("X-Ghost-Source") === "ghost" ? "ghost" : "simulated";
      const templateUsed = enhanceRes.headers.get("X-Ghost-Template-Used") ?? "";
      const emotionFrom = enhanceRes.headers.get("X-Ghost-Emotion-From") ?? "";
      const emotionTo = enhanceRes.headers.get("X-Ghost-Emotion-To") ?? "";
      const secondaryEmotionTo = enhanceRes.headers.get("X-Ghost-Secondary-Emotion-To") ?? "";
      const curveFrom = enhanceRes.headers.get("X-Ghost-Curve-From") ?? "";
      const curveTo = enhanceRes.headers.get("X-Ghost-Curve-To") ?? "";
      const curveChanged = (enhanceRes.headers.get("X-Ghost-Curve-Changed") ?? "false") === "true";
      const confidenceRaw = enhanceRes.headers.get("X-Ghost-Auto-Template-Confidence") ?? "";
      const confidenceNum = Number(confidenceRaw);
      const autoTemplateConfidence =
        Number.isFinite(confidenceNum) && confidenceNum >= 0
          ? `${Math.round(confidenceNum * 100)}%`
          : "";
      const processingApplied = (enhanceRes.headers.get("X-Ghost-Processing-Applied") ?? "false") === "true";
      const hashChanged = (enhanceRes.headers.get("X-Ghost-Hash-Changed") ?? "false") === "true";
      const inputBytesRaw = Number(enhanceRes.headers.get("X-Ghost-Input-Bytes") ?? "0");
      const outputBytesRaw = Number(enhanceRes.headers.get("X-Ghost-Output-Bytes") ?? "0");

      setIntelligenceDeltas({
        prosody,
        emotionalClarity,
        naturalPacing,
        emphasisDetection,
      });
      setEnhancementSource(source);
      setEnhancementDetails({
        templateUsed,
        emotionFrom,
        emotionTo,
        secondaryEmotionTo,
        curveFrom,
        curveTo,
        curveChanged,
        autoTemplateConfidence,
      });
      setProcessingProof({
        processingApplied,
        hashChanged,
        inputBytes: Number.isFinite(inputBytesRaw) ? inputBytesRaw : 0,
        outputBytes: Number.isFinite(outputBytesRaw) ? outputBytesRaw : 0,
      });

      const enhanced = await enhanceRes.arrayBuffer();
      const contentType = enhanceRes.headers.get("Content-Type") || "audio/wav";

      if (enhancedAudio) {
        URL.revokeObjectURL(enhancedAudio);
      }

      const enhancedUrl = URL.createObjectURL(new Blob([enhanced], { type: contentType }));
      setEnhancedMimeType(contentType);
      setEnhancedAudio(enhancedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Cleanup
  useEffect(() => {
    let mounted = true;

    const initializeDevices = async () => {
      try {
        const mics = await refreshMicrophones();
        if (!mounted) return;
        if (mics.length === 0) {
          setPermissionHint("If your mic is connected, refresh the page after granting microphone permissions.");
        }
      } catch {
        if (!mounted) return;
        setError("Unable to list microphones in this browser.");
      }
    };

    initializeDevices();

    const onDeviceChange = () => {
      refreshMicrophones().catch(() => {
        setError("Unable to refresh microphone list.");
      });
    };

    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);

    return () => {
      mounted = false;
      navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
      if (timerRef.current) clearInterval(timerRef.current);

      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }

      if (enhancedAudio) {
        URL.revokeObjectURL(enhancedAudio);
      }
    };
  }, [recordedAudioUrl, enhancedAudio]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getWaveBar = (filled: number, total = 8) => {
    const safeFilled = Math.max(0, Math.min(total, filled));
    return "█".repeat(safeFilled) + "░".repeat(total - safeFilled);
  };

  const prosodyPercent = Number(intelligenceDeltas.prosody.replace(/[^\d-]/g, "")) || 0;
  const beforeWaveLevel = 3;
  const afterWaveLevel = Math.max(beforeWaveLevel + 1, Math.min(8, Math.round((prosodyPercent / 100) * 8)));

  return (
    <div className="space-y-5">
      <div className="panel p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Experience the difference in intelligence</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            "1. Record",
            "2. Standard Voice Output",
            "3. Ghost Voice Intelligence",
            "4. See what changed",
          ].map((step) => (
            <div key={step} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Recording controls */}
      <div className="panel p-6">
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-500">Step 1: Choose input</p>
        <p className="mb-4 text-sm text-slate-300">Use your microphone or select an AI sample voice with sales wording.</p>

        <div className="mb-5 grid gap-3 md:grid-cols-2">
          <button
            onClick={() => setInputMode("record")}
            className={`rounded-lg border px-4 py-3 text-left transition ${
              inputMode === "record"
                ? "border-sky-400/50 bg-sky-500/12 text-sky-200"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.2em]">Choose Input</p>
            <p className="mt-1 text-sm font-medium">🎤 Record Yourself</p>
          </button>
          <button
            onClick={() => setInputMode("sample")}
            className={`rounded-lg border px-4 py-3 text-left transition ${
              inputMode === "sample"
                ? "border-fuchsia-400/50 bg-fuchsia-500/12 text-fuchsia-200"
                : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.2em]">Choose Input</p>
            <p className="mt-1 text-sm font-medium">🤖 Use AI Voice Sample</p>
          </button>
        </div>

        <div className="mb-5 grid gap-2">
          <label className="text-xs uppercase tracking-[0.22em] text-slate-500">Voice intelligence preset</label>
          <select
            value={selectedStylePreset}
            onChange={(e) => setSelectedStylePreset(e.target.value as VoiceStylePreset)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400/50"
          >
            <option value="sales">Sales Call Voice</option>
            <option value="support">Customer Support Voice</option>
            <option value="podcast">Podcast Voice</option>
          </select>
        </div>

        <div className="mb-5 grid gap-2">
          <label className="text-xs uppercase tracking-[0.22em] text-slate-500">Demo intensity</label>
          <select
            value={demoIntensity}
            onChange={(e) => setDemoIntensity(e.target.value as DemoIntensity)}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-emerald-400/50"
          >
            <option value="subtle">Subtle</option>
            <option value="strong">Strong</option>
            <option value="extreme">Extreme 🔥</option>
          </select>
          <p className="text-xs text-slate-500">
            {demoIntensity === "subtle"
              ? "Production-safe realism with gentle refinement."
              : demoIntensity === "strong"
                ? "Noticeable improvement optimized for clear before/after demos."
                : "Demo mode: pitch + speed + heavy compression + aggressive gain for unmistakable change."}
          </p>
        </div>

        {inputMode === "sample" && (
          <div className="mb-5 grid gap-2">
            <label className="text-xs uppercase tracking-[0.22em] text-slate-500">AI sample source</label>
            <select
              value={selectedSampleId}
              onChange={(e) => {
                setSelectedSampleId(e.target.value);
                setError("");
              }}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-fuchsia-400/50"
            >
              {aiVoiceSamples.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  {sample.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">{selectedSample.description}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        {permissionHint && (
          <div className="mb-4 rounded-lg border border-amber-300/30 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-200">{permissionHint}</p>
          </div>
        )}

        {inputMode === "record" ? (
          <>
            <div className="mb-4 grid gap-2">
              <label className="text-xs uppercase tracking-[0.22em] text-slate-500">Microphone</label>
              <select
                value={selectedMicrophoneId}
                onChange={(e) => setSelectedMicrophoneId(e.target.value)}
                className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200 outline-none transition focus:border-sky-400/50"
              >
                <option value="default">Default Microphone</option>
                {microphones.map((mic, i) => (
                  <option key={mic.deviceId || `mic-${i}`} value={mic.deviceId}>
                    {mic.label || `Microphone ${i + 1}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                {microphones.length > 0
                  ? `${microphones.length} input device${microphones.length > 1 ? "s" : ""} detected`
                  : "No microphone detected"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {!isRecording && !hasRecording && (
                <button
                  onClick={startRecording}
                  disabled={isCheckingDevices || microphones.length === 0}
                  className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/25"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                  </span>
                  {isCheckingDevices ? "Checking devices..." : "Record"}
                </button>
              )}

              {isRecording && (
                <>
                  <div className="flex items-center gap-2 rounded-lg border border-sky-400/30 bg-sky-500/10 px-4 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-3 w-1 rounded-full bg-sky-400"
                          animate={{ scaleY: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.8, delay: i * 0.2, repeat: Infinity }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-sky-300">{formatTime(recordingTime)}</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="rounded-lg border border-slate-500/30 bg-slate-500/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-400/40 hover:bg-slate-500/20"
                  >
                    Stop
                  </button>
                </>
              )}

              {hasRecording && (
                <>
                  <button
                    onClick={clearRecording}
                    className="rounded-lg border border-slate-500/30 bg-slate-500/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-400/40 hover:bg-slate-500/20"
                  >
                    Clear
                  </button>
                  <button
                    onClick={startRecording}
                    className="rounded-lg border border-slate-500/30 bg-slate-500/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-400/40 hover:bg-slate-500/20"
                  >
                    Re-record
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/[0.06] p-4">
            <p className="text-xs text-fuchsia-200">
              AI sample mode selected. Use Generate below to run the same Ghost pipeline on the selected robotic voice.
            </p>
          </div>
        )}
      </div>

      {/* Before: user recording */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Step 2</p>
          <p className="mt-2 text-sm font-medium text-rose-300">❌ Standard Voice Output</p>
          <div className="relative mt-4 overflow-hidden rounded-lg border border-white/6 bg-black/30 p-4">
            {(inputMode === "sample" || hasRecording) ? (
              <audio
                className="w-full"
                controls
                preload="metadata"
                src={inputMode === "sample" ? selectedSample.src : (recordedAudioUrl ?? undefined)}
              />
            ) : (
              <div className="flex h-12 items-center justify-center">
                <p className="text-xs text-slate-500">Record above to display your audio</p>
              </div>
            )}
          </div>
        </div>

        {/* After: enhanced version */}
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Step 3</p>
          <p className="mt-2 text-sm font-medium text-emerald-300">🔥 Ghost Voice Intelligence</p>
          <div className="relative mt-4 overflow-hidden rounded-lg border border-white/6 bg-black/30 p-4">
            {enhancedAudio ? (
              <audio className="w-full" controls preload="metadata">
                <source src={enhancedAudio} type={enhancedMimeType} />
              </audio>
            ) : (
              <div className="flex h-12 items-center justify-center">
                <p className="text-xs text-slate-500">
                  {(inputMode === "sample" || hasRecording)
                    ? "Click Generate below to process intelligence layer"
                    : "No recording yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate button */}
      {(inputMode === "sample" || hasRecording) && !enhancedAudio && (
        <button
          onClick={enhanceAudio}
          disabled={isEnhancing}
          className="w-full rounded-lg border border-sky-400/40 bg-sky-500/15 px-4 py-3 text-sm font-medium text-sky-300 transition hover:border-sky-400/60 hover:bg-sky-500/25 disabled:opacity-50"
        >
          {isEnhancing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
              Processing with Ghost Intelligence...
            </div>
          ) : (
            "Generate Ghost Intelligence Pass"
          )}
        </button>
      )}

      {enhancedAudio && (
        <div className="panel border-emerald-400/20 bg-emerald-500/[0.04] p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Step 4</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">What changed in the output</p>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                enhancementSource === "ghost"
                  ? "border-emerald-300/30 bg-emerald-500/15 text-emerald-200"
                  : "border-amber-300/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              {enhancementSource === "ghost" ? "Live Ghost TTS" : "Local Simulation"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-emerald-200">
              ↑ Prosody: {intelligenceDeltas.prosody}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-emerald-200">
              ↑ Emotional clarity: {intelligenceDeltas.emotionalClarity}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-emerald-200">
              ↑ Natural pacing: {intelligenceDeltas.naturalPacing}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-emerald-200">
              ↑ Emphasis detection: {intelligenceDeltas.emphasisDetection}
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-slate-400">
            Uplift values are computed per recording. With a configured Ghost backend, values come from model output telemetry; otherwise they fall back to local simulated analysis for demo continuity.
          </p>
          <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              Processing applied: {processingProof.processingApplied ? "yes" : "no"}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
              Hash changed: {processingProof.hashChanged ? "true" : "false"}
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 sm:col-span-2">
              Byte delta: {processingProof.inputBytes.toLocaleString()} {"->"} {processingProof.outputBytes.toLocaleString()}
            </div>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-xs text-slate-300">
            <p className="mb-2 uppercase tracking-[0.16em] text-slate-400">Waveform comparison</p>
            <p className="font-mono">Before: {getWaveBar(beforeWaveLevel)}</p>
            <p className="mt-1 font-mono">After:  {getWaveBar(afterWaveLevel)}</p>
          </div>
          <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-3 text-xs text-slate-300">
            <p className="mb-2 uppercase tracking-[0.16em] text-slate-400">What Ghost did</p>
            <p>✔ Increased clarity</p>
            <p>✔ Added conversational pacing</p>
            <p>✔ Enhanced vocal presence</p>
          </div>
          {enhancementSource === "ghost" && (
            <div className="mt-4 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
              {(enhancementDetails.templateUsed || enhancementDetails.autoTemplateConfidence) && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  Template: {enhancementDetails.templateUsed || "auto"}
                  {enhancementDetails.autoTemplateConfidence
                    ? ` (${enhancementDetails.autoTemplateConfidence} confidence)`
                    : ""}
                </div>
              )}
              {(enhancementDetails.emotionFrom || enhancementDetails.emotionTo) && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                  Emotion: {enhancementDetails.emotionFrom || "base"} → {enhancementDetails.emotionTo || "target"}
                  {enhancementDetails.secondaryEmotionTo ? ` + ${enhancementDetails.secondaryEmotionTo}` : ""}
                </div>
              )}
              {(enhancementDetails.curveFrom || enhancementDetails.curveTo || enhancementDetails.curveChanged) && (
                <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 sm:col-span-2">
                  Curve: {enhancementDetails.curveFrom || "current"} → {enhancementDetails.curveTo || "adaptive"}
                  {enhancementDetails.curveChanged ? " (changed)" : " (stable)"}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Retry after enhancement */}
      {enhancedAudio && (
        <button
          onClick={() => setEnhancedAudio(null)}
          className="w-full rounded-lg border border-slate-500/30 bg-slate-500/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-400/40 hover:bg-slate-500/20"
        >
          Generate Again
        </button>
      )}
    </div>
  );
}
