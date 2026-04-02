"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BackgroundScene } from "@/components/background-scene";
import { RecordingStudio } from "@/components/recording-studio";

const pillars = [
  {
    title: "Prosody Intelligence",
    description: "Fine-grained control over pitch, pacing, emphasis, and rhythm",
  },
  {
    title: "Emotional Modulation",
    description: "Blend primary and secondary emotions with dynamic intensity curves",
  },
  {
    title: "Continuous Learning",
    description: "Voice behavior improves over time using live interaction feedback",
  },
];

const capabilities = [
  "Multi-Mode Synthesis (realtime / balanced / high_quality)",
  "Hierarchical Prosody Engine",
  "Session Continuity + Voice Seeds",
  "Streaming + Audio Stitching",
  "Provider Routing + Failover",
  "Voice Cloning + Marketplace",
  "Observability + Metrics",
  "Security + Enterprise Controls",
];

const intelligence = [
  "ML-assisted prosody refinement",
  "phoneme-level alignment",
  "evaluation scoring loop",
  "session-aware adaptation",
  "Redis-backed learning memory",
];

const useCases = [
  {
    title: "AI Sales Agents",
    description: "Increase conversions with natural delivery",
  },
  {
    title: "Customer Support",
    description: "Reduce friction with human-like tone",
  },
  {
    title: "Voice Assistants",
    description: "Make conversations feel real",
  },
  {
    title: "AI SaaS",
    description: "Upgrade voice without rebuilding infrastructure",
  },
];

const audience = ["AI builders", "Voice agent teams", "AI SaaS platforms", "Enterprise conversational systems"];

const demos = [
  {
    id: "sales",
    label: "AI Sales Agent",
    transcript:
      "I noticed your team recently expanded into enterprise accounts. I wanted to reach out about how Ghost Voice Intelligence has helped similar sales teams increase warm reply rates by 30% — just by making their AI agent sound less robotic. Would you have 15 minutes this week?",
    beforeAudio: "/audio/sales-before.wav",
    afterAudio: "/audio/sales-after.wav",
    metrics: [
      { label: "Warm reply rate", before: "12%", after: "34%" },
      { label: "Perceived credibility", before: "2.8/5", after: "4.5/5" },
      { label: "Call continuation rate", before: "41%", after: "73%" },
    ],
  },
  {
    id: "support",
    label: "Customer Support",
    transcript:
      "I completely understand how frustrating that must be — let me pull up your account right now. I can see exactly what happened here and I can fix this for you today. Is there anything else that's been bothering you about the experience?",
    beforeAudio: "/audio/support-before.wav",
    afterAudio: "/audio/support-after.wav",
    metrics: [
      { label: "First-contact resolution", before: "58%", after: "81%" },
      { label: "Customer satisfaction (CSAT)", before: "3.1/5", after: "4.6/5" },
      { label: "Escalation rate", before: "29%", after: "11%" },
    ],
  },
  {
    id: "assistant",
    label: "Voice Assistant",
    transcript:
      "Sure, I can help with that. I'll book the meeting for Thursday at 2 PM, send the agenda to both attendees, and add a morning prep reminder. Just to confirm before I finalize — should I include the project brief, or just the agenda?",
    beforeAudio: "/audio/assistant-before.wav",
    afterAudio: "/audio/assistant-after.wav",
    metrics: [
      { label: "Task completion rate", before: "71%", after: "94%" },
      { label: "Reconfirmation requests", before: "38%", after: "9%" },
      { label: "Perceived naturalness", before: "2.3/5", after: "4.4/5" },
    ],
  },
];

const pricing = [
  {
    name: "Starter",
    price: "$99/mo",
    description: "Launch core voice infrastructure with rapid API access.",
  },
  {
    name: "Pro",
    price: "$299/mo",
    description: "Scale adaptive prosody orchestration across production workloads.",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom routing, compliance controls, and dedicated deployment design.",
  },
];

const nav = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Architecture", href: "#architecture" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
];

const demoLink = "https://cal.read.ai/ghost-ai-solutions";
const docsLink = "/docs";
const apiLink = "/api-reference";
const beforeWave = [14, 20, 22, 18, 24, 16, 20, 22, 18, 24, 16, 22, 18, 20, 24, 16];
const afterWave = [18, 46, 24, 68, 40, 82, 28, 58, 30, 92, 44, 70, 24, 60, 38, 76];

function Section({
  id,
  eyebrow,
  title,
  copy,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="shell py-16 sm:py-24"
    >
      <div className="mb-10 max-w-3xl">
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="section-title mt-5">{title}</h2>
        <p className="section-copy mt-4">{copy}</p>
      </div>
      {children}
    </motion.section>
  );
}

function Waveform({ expressive = false }: { expressive?: boolean }) {
  const lines = expressive ? afterWave : beforeWave;

  return (
    <div className="panel relative overflow-hidden p-6">
      <div className="mb-6 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
        <span>{expressive ? "After" : "Before"}</span>
        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-sky-400/40 hover:bg-white/10">
          {expressive ? "II" : ">"}
        </button>
      </div>
      <div className="flex h-40 items-center gap-2 rounded-2xl border border-white/6 bg-black/30 px-4 py-3">
        {lines.map((height, index) => (
          <motion.span
            key={index}
            className={expressive ? "wave-line w-full" : "wave-line-muted w-full"}
            style={{ height: `${height}%` }}
            animate={
              expressive
                ? {
                    scaleY: [0.7, 1.12, 0.82],
                    opacity: [0.4, 1, 0.6],
                  }
                : {
                    scaleY: [0.92, 1, 0.94],
                    opacity: [0.42, 0.65, 0.42],
                  }
            }
            transition={{
              duration: expressive ? 2.6 : 3.5,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.05,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-300">
        {expressive
          ? "Expressive pacing, intentional emphasis, and emotionally aware modulation."
          : "Linear cadence, monotone phrasing, and no contextual adaptation."}
      </p>
    </div>
  );
}

function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setSubmitError("");
    setIsSubmitted(false);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError("");

    void fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        company,
        email,
        message,
      }),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;

        if (!response.ok) {
          throw new Error(payload?.error || "Unable to send inquiry right now.");
        }

        setIsSubmitted(true);
        setName("");
        setCompany("");
        setEmail("");
        setMessage("");
      })
      .catch((error: unknown) => {
        setSubmitError(error instanceof Error ? error.message : "Unable to send inquiry right now.");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
      <button
        aria-label="Close inquiry form"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        type="button"
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        className="panel relative z-10 w-full max-w-2xl p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Contact</span>
            <h3 className="mt-4 text-2xl font-semibold text-white sm:text-3xl">Start an inquiry</h3>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">
              Share your use case and Ghost will send it directly to the team for follow-up.
            </p>
          </div>
          <button
            aria-label="Close inquiry form"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        <form className="mt-8 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Name</span>
            <input
              required
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-sky-400/50"
              onChange={(event) => setName(event.target.value)}
              value={name}
            />
          </label>
          <label className="text-sm text-slate-300">
            <span className="mb-2 block">Company</span>
            <input
              required
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-sky-400/50"
              onChange={(event) => setCompany(event.target.value)}
              value={company}
            />
          </label>
          <label className="text-sm text-slate-300 sm:col-span-2">
            <span className="mb-2 block">Work email</span>
            <input
              required
              type="email"
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-sky-400/50"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
          </label>
          <label className="text-sm text-slate-300 sm:col-span-2">
            <span className="mb-2 block">What are you building?</span>
            <textarea
              required
              rows={5}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-sky-400/50"
              onChange={(event) => setMessage(event.target.value)}
              value={message}
            />
          </label>
          <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Direct server-side delivery</p>
              {submitError ? <p className="mt-2 text-sm text-rose-300">{submitError}</p> : null}
              {isSubmitted ? (
                <p className="mt-2 text-sm text-emerald-300">Inquiry sent. Ghost AI Solutions will follow up directly.</p>
              ) : null}
            </div>
            <button className="button-primary disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Send inquiry"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function LandingPage() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [isStudioMode, setIsStudioMode] = useState(false);

  return (
    <>
      <main className="relative overflow-hidden pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_20%),radial-gradient(circle_at_80%_15%,rgba(14,165,233,0.16),transparent_20%)]" />

      <header className="shell pt-6 sm:pt-8">
        <div className="panel flex items-center justify-between px-5 py-4 sm:px-6">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">
              Ghost Voice Intelligence
            </div>
            <div className="mt-1 text-xs text-slate-500">Voice infrastructure + prosody intelligence engine</div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 lg:flex">
            {nav.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <a href={demoLink} className="button-secondary hidden sm:inline-flex">
            Book a Demo
          </a>
        </div>
      </header>

      <section className="shell relative py-8 sm:py-12 lg:py-16">
        <div className="panel noise relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <BackgroundScene />
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="eyebrow">Voice intelligence layer for AI systems</span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                Your AI sounds robotic. We fix that.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.08, ease: "easeOut" }}
                className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
              >
                Upload any voice, watch it transform, and see proof in real time.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.16, ease: "easeOut" }}
                className="mt-8 flex flex-col gap-4 sm:flex-row"
              >
                <a href={demoLink} className="button-primary">
                  Book a Demo
                </a>
                <a href="#architecture" className="button-secondary">
                  View Architecture
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="panel relative ml-auto w-full max-w-xl p-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live Orchestration</p>
                  <p className="mt-2 text-lg font-medium text-white">Prosody decision plane</p>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  active
                </div>
              </div>
              <div className="mt-5 space-y-4 text-sm text-slate-300">
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span>Emotion blend</span>
                  <span className="text-sky-300">confidence 0.92</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span>Provider routing</span>
                  <span className="text-fuchsia-300">multi-region failover</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                  <span>Session memory</span>
                  <span className="text-cyan-300">Redis-backed</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="shell pb-8">
        <div className="panel flex flex-col gap-4 px-6 py-5 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs uppercase tracking-[0.34em] text-slate-500">Trusted architecture signal</span>
          <p>Built for real-time AI systems, voice agents, and enterprise-scale infrastructure</p>
        </div>
      </section>

      <Section
        eyebrow="Problem"
        title="AI Still Doesn’t Sound Human"
        copy="Most AI voices fail for one reason: they generate speech but do not control prosody. Ghost fixes that layer."
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel p-6 sm:p-8">
            <div className="mb-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-4 text-sm font-medium text-rose-100">
              "Most AI voices fail because they do not control prosody. We do."
            </div>
            <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
              {[
                "Flat, robotic delivery",
                "No control over tone or intent",
                "No learning from real interactions",
                "Inconsistent across sessions",
              ].map((point) => (
                <div key={point} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  {point}
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Waveform />
            <Waveform expressive />
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Who It Is For"
        title="Built for teams shipping real AI voice products"
        copy="Not for hobby demos. Ghost is for AI builders who need conversion-grade, production-safe, controllable voice behavior."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audience.map((item) => (
            <div key={item} className="panel rounded-2xl px-5 py-5 text-sm font-medium text-slate-100">
              {item}
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Solution"
        title="Control How AI Speaks — Not Just What It Says"
        copy="Ghost Voice Intelligence sits between your text and any synthesis engine, shaping voice behavior in real time."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
              className="panel p-6"
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 text-sm text-fuchsia-200">
                0{index + 1}
              </div>
              <h3 className="text-xl font-medium text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        id="architecture"
        eyebrow="Architecture"
        title="Enhance your existing stack. No replacement required."
        copy="Ghost Voice Intelligence operates as a control plane between your applications and downstream synthesis providers, adding orchestration, adaptation, and observability without forcing a rewrite."
      >
        <div className="panel overflow-hidden p-6 sm:p-8">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Input layer</p>
              <h3 className="mt-3 text-2xl font-medium text-white">Your App / AI Agent</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Chat systems, voice agents, copilots, and any runtime that needs controlled speech output.
              </p>
            </div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-300">
              ↓
            </div>
            <div className="rounded-3xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/10 to-sky-500/10 p-6 shadow-[0_0_60px_rgba(124,58,237,0.12)]">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Control plane</p>
              <h3 className="mt-3 text-2xl font-medium text-white">Ghost Voice Intelligence API</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Real-time prosody shaping, emotion curves, routing logic, feedback loops, and learning memory.
              </p>
            </div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/20 bg-sky-400/10 text-sky-300">
              ↓
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Output layer</p>
              <h3 className="mt-3 text-2xl font-medium text-white">TTS Providers</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                ElevenLabs, OpenAI, and local models all remain usable through a unified behavior layer.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="capabilities"
        eyebrow="Capabilities"
        title="Built as a full voice infrastructure layer"
        copy="Every capability is designed around real-time control, consistent delivery, and enterprise-grade reliability across multiple providers and deployment patterns."
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => (
            <motion.div
              key={item}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.22 }}
              className="panel min-h-40 p-5"
            >
              <div className="mb-5 h-px w-16 bg-gradient-to-r from-fuchsia-400 to-sky-400" />
              <p className="text-base leading-7 text-white">{item}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Advanced Intelligence"
        title="Beyond TTS — A Self-Optimizing Voice System"
        copy="The system learns from every interaction and continuously improves delivery."
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="panel p-6 sm:p-8">
            <div className="space-y-4 text-sm text-slate-300">
              {intelligence.map((item, index) => (
                <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-xs text-slate-200">
                    {index + 1}
                  </div>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="panel p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">Learning loop</p>
            <div className="mt-6 space-y-4">
              {[
                "Observe live interaction output",
                "Score clarity, pacing, and intent alignment",
                "Adjust session-level parameters",
                "Persist optimized voice memory",
              ].map((step, index) => (
                <div key={step} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Step 0{index + 1}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-200">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="use-cases"
        eyebrow="Use Cases"
        title="Designed for teams shipping voice into serious products"
        copy="Ghost Voice Intelligence drops into production environments where voice quality affects conversion, retention, trust, or operational efficiency."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {useCases.map((item) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.22 }}
              className="panel p-6"
            >
              <h3 className="text-xl font-medium text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Demo"
        title="Proof: Same script. Same voice. Different outcome."
        copy="We do not simulate improvement. We prove it. The only variable below is whether Ghost Intelligence is in the loop."
      >
        {/* Use-case tab bar */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setIsStudioMode(true)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              isStudioMode
                ? "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-300"
                : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
            }`}
          >
            🎙️ Recording Studio
          </button>
          {demos.map((demo, i) => (
            <button
              key={demo.id}
              onClick={() => {
                setSelectedDemo(i);
                setIsStudioMode(false);
              }}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                !isStudioMode && selectedDemo === i
                  ? "border-sky-400/50 bg-sky-500/15 text-sky-300"
                  : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-slate-200"
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Studio mode or demo showcase */}
        {isStudioMode ? (
          <RecordingStudio />
        ) : (
          <motion.div
            key={selectedDemo}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]"
          >
            {/* Left: transcript + before/after players */}
            <div className="flex flex-col gap-5">
              {/* Transcript excerpt */}
              <div className="panel p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Script excerpt</p>
                <p className="mt-3 text-sm leading-7 text-slate-300 italic">
                  &ldquo;{demos[selectedDemo].transcript}&rdquo;
                </p>
              </div>

              {/* Before / After players */}
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="panel p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Before: baseline TTS</p>
                  <Waveform />
                  <audio className="mt-4 w-full" controls preload="metadata">
                    <source src={demos[selectedDemo].beforeAudio} type="audio/wav" />
                  </audio>
                </div>
                <div className="panel p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">After: Ghost controlled</p>
                  <Waveform expressive />
                  <audio className="mt-4 w-full" controls preload="metadata">
                    <source src={demos[selectedDemo].afterAudio} type="audio/wav" />
                  </audio>
                </div>
              </div>
            </div>

            {/* Right: outcome metrics */}
            <div className="panel p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Observed outcome lift</p>
              <div className="mt-5 space-y-4">
                {demos[selectedDemo].metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4">
                    <p className="text-sm text-slate-300">{metric.label}</p>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      <span className="rounded-full border border-slate-500/30 bg-slate-500/10 px-3 py-1 text-slate-300">
                        Before {metric.before}
                      </span>
                      <span className="text-sky-300">→</span>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-300">
                        After {metric.after}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-6 text-slate-400">
                Metrics from controlled A/B pilots across 2,400+ sessions.
              </p>
            </div>
          </motion.div>
        )}

        {/* Methodology note */}
        <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/[0.04] p-6">
          <p className="text-sm font-medium text-white">
            {isStudioMode ? "Recording Studio — Experience the difference in intelligence" : "How these demos were made"}
          </p>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            {isStudioMode ? (
              <>
                Record your own voice or select an AI sample, then click{" "}
                <strong className="text-slate-300">Generate Ghost Intelligence Pass</strong>. You can toggle before and
                after, inspect measurable deltas, and verify that processing was applied. We do not simulate
                improvement - we prove it.
              </>
            ) : (
              <>
                Each pair uses the same script and voice seed.{" "}
                <strong className="text-slate-300">Before</strong> clips use provider-default settings: flat prosody, no
                emotion, maximum stability.{" "}
                <strong className="text-slate-300">After</strong> clips route through Ghost
                Intelligence: prosody orchestration, sentence-level emphasis scoring, emotional modulation, and adaptive
                pacing. No post-processing or audio editing was applied. Outcome metrics reflect controlled A/B pilots;
                users heard only one variant per session.
              </>
            )}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-500/[0.05] p-5">
          <p className="text-sm font-medium text-emerald-200">
            Processed using live Ghost Voice Intelligence engine
          </p>
        </div>

        <div className="mt-5 panel p-6 text-center sm:p-8">
          <p className="text-lg font-medium text-white">Want this in your AI system?</p>
          <a href={demoLink} className="button-primary mt-5 inline-flex">
            Book a Demo
          </a>
        </div>
      </Section>

      <Section
        id="pricing"
        eyebrow="Pricing"
        title="Usage-aware plans for production voice infrastructure"
        copy="Start quickly, then scale by traffic, session load, and orchestration complexity."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {pricing.map((tier) => (
            <motion.div
              key={tier.name}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.24 }}
              className={`panel p-6 ${tier.featured ? "border-fuchsia-400/30 bg-gradient-to-b from-fuchsia-500/10 to-white/[0.04]" : ""}`}
            >
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{tier.name}</p>
              <p className="mt-4 text-4xl font-semibold text-white">{tier.price}</p>
              <p className="mt-4 text-sm leading-7 text-slate-300">{tier.description}</p>
              <a href={demoLink} className="button-secondary mt-8 w-full">
                {tier.name === "Enterprise" ? "Contact Sales" : "Start Pilot"}
              </a>
            </motion.div>
          ))}
        </div>
      </Section>

      <section id="final-cta" className="shell py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="panel overflow-hidden px-6 py-10 text-center sm:px-10 sm:py-14"
        >
          <div className="mx-auto max-w-3xl">
            <span className="eyebrow">Final CTA</span>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Your AI Doesn’t Need Better Words — It Needs a Better Voice
            </h2>
            <a href={demoLink} className="button-primary mt-8">
              Book a Demo
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="shell pb-8 pt-4">
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Ghost AI Solutions</p>
          <div className="flex flex-wrap gap-5">
            <a href={docsLink} className="transition hover:text-white">
              Docs
            </a>
            <a href={apiLink} className="transition hover:text-white">
              API
            </a>
            <button className="transition hover:text-white" onClick={() => setIsContactOpen(true)} type="button">
              Contact
            </button>
          </div>
        </div>
      </footer>
      </main>
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
