"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { BackgroundScene } from "@/components/background-scene";

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

export function LandingPage() {
  return (
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
          <a href="#final-cta" className="button-secondary hidden sm:inline-flex">
            Book a Demo
          </a>
        </div>
      </header>

      <section className="shell relative py-8 sm:py-12 lg:py-16">
        <div className="panel noise relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
          <BackgroundScene />
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <span className="eyebrow">Voice infrastructure for adaptive AI systems</span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: "easeOut" }}
                className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl"
              >
                The Intelligence Layer Behind Human-Like AI Voice
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.08, ease: "easeOut" }}
                className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg"
              >
                Ghost Voice Intelligence transforms how machines speak — controlling prosody,
                emotion, timing, and continuous learning across every interaction.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.16, ease: "easeOut" }}
                className="mt-8 flex flex-col gap-4 sm:flex-row"
              >
                <a href="#final-cta" className="button-primary">
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
        copy="Most voice systems still optimize for text rendering, not expressive delivery. The result is robotic speech that breaks immersion and erodes trust in live interactions."
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel p-6 sm:p-8">
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
        title="Hear the shift from robotic output to controlled expression"
        copy="Use the same content, then route delivery through the Ghost Voice Intelligence layer to shape timing, emphasis, energy, and emotional contour."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Waveform />
          <Waveform expressive />
        </div>
      </Section>

      <Section
        id="pricing"
        eyebrow="Pricing"
        title="Simple entry points for fast deployment"
        copy="Usage-based scaling available."
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
              <a href="#final-cta" className="button-secondary mt-8 w-full">
                {tier.name === "Enterprise" ? "Talk to Sales" : "Get Started"}
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
            <a href="mailto:demo@ghostaisolutions.com" className="button-primary mt-8">
              Book a Demo
            </a>
          </div>
        </motion.div>
      </section>

      <footer className="shell pb-8 pt-4">
        <div className="flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Ghost AI Solutions</p>
          <div className="flex flex-wrap gap-5">
            <a href="#" className="transition hover:text-white">
              Docs
            </a>
            <a href="#architecture" className="transition hover:text-white">
              API
            </a>
            <a href="mailto:contact@ghostaisolutions.com" className="transition hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
