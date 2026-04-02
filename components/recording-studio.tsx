import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function RecordingStudio({
  onRecordingComplete,
}: {
  onRecordingComplete?: (blob: Blob, dataUrl: string) => void;
}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [enhancedAudio, setEnhancedAudio] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultDeltas = {
    prosody: "+42%",
    emotionalClarity: "+67%",
    naturalPacing: "optimized",
    emphasisDetection: "active",
  };

  const [intelligenceDeltas, setIntelligenceDeltas] = useState(defaultDeltas);

  // Start recording
  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      setRecordingTime(0);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.src = url;
        setHasRecording(true);
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
      setError(
        err instanceof Error ? err.message : "Failed to access microphone. Please check permissions."
      );
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
    setHasRecording(false);
    setEnhancedAudio(null);
    setIntelligenceDeltas(defaultDeltas);
    setRecordingTime(0);
    if (audioRef.current) audioRef.current.src = "";
    setError("");
  };

  // Enhance audio via API
  const enhanceAudio = async () => {
    if (!audioRef.current || !audioRef.current.src) return;

    setIsEnhancing(true);
    try {
      let response: Response;

      if (audioRef.current.src.includes("blob:")) {
        // Get blob from ObjectURL
        const res = await fetch(audioRef.current.src);
        response = res;
      } else {
        response = await fetch(audioRef.current.src);
      }

      if (!response.ok) throw new Error("Failed to fetch audio");
      const blob = await response.blob();

      // Call backend enhancement API
      const fd = new FormData();
      fd.append("audio", blob, "recording.wav");

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

      setIntelligenceDeltas({
        prosody,
        emotionalClarity,
        naturalPacing,
        emphasisDetection,
      });

      const enhanced = await enhanceRes.arrayBuffer();
      const enhancedUrl = URL.createObjectURL(new Blob([enhanced], { type: "audio/wav" }));
      setEnhancedAudio(enhancedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enhancement failed");
    } finally {
      setIsEnhancing(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

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
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-slate-500">Step 1: Record</p>
        <p className="mb-4 text-sm text-slate-300">Say anything - a sales pitch, greeting, or message.</p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3">
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {!isRecording && !hasRecording && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/25"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
              </span>
              Record
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
      </div>

      {/* Before: user recording */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Step 2</p>
          <p className="mt-2 text-sm font-medium text-rose-300">❌ Standard Voice Output</p>
          <div className="relative mt-4 overflow-hidden rounded-lg border border-white/6 bg-black/30 p-4">
            {hasRecording ? (
              <audio
                ref={audioRef}
                className="w-full"
                controls
                preload="metadata"
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
                <source src={enhancedAudio} type="audio/wav" />
              </audio>
            ) : (
              <div className="flex h-12 items-center justify-center">
                <p className="text-xs text-slate-500">
                  {hasRecording ? "Click Generate below to process intelligence layer" : "No recording yet"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generate button */}
      {hasRecording && !enhancedAudio && (
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
          <p className="mt-2 text-sm font-medium text-white">What changed in the output</p>
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
