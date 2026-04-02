import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";

export const metadata: Metadata = {
  title: "Ghost Voice Intelligence Docs",
  description: "Product documentation for Ghost Voice Intelligence.",
};

const sections = [
  {
    title: "Platform Overview",
    body:
      "Ghost Voice Intelligence is a voice control plane that sits between generated text and downstream synthesis providers. It governs pacing, emotional contour, emphasis, provider selection, and session continuity in real time.",
    bullets: [
      "Runs above existing providers instead of replacing them",
      "Maintains session-aware delivery and voice continuity",
      "Applies learning signals from live interaction outcomes",
    ],
  },
  {
    title: "Core Concepts",
    body:
      "The platform is organized around behavior modeling instead of raw synthesis alone. Applications submit text, metadata, and voice objectives; Ghost resolves the delivery plan and dispatches to the best-fit provider path.",
    bullets: [
      "Prosody profile: pacing, rhythm, pause strategy, emphasis weighting",
      "Emotion blend: primary and secondary affect with intensity curves",
      "Session memory: continuity anchors and learned adaptation state",
      "Execution mode: realtime, balanced, or high_quality synthesis",
    ],
  },
  {
    title: "Operational Model",
    body:
      "Production teams typically integrate Ghost in front of customer-facing AI voice systems where trust, conversion, and conversational realism matter. The service can be introduced incrementally at the orchestration layer without a full stack rewrite.",
    bullets: [
      "Low-latency provider routing with fallback behavior",
      "Observability hooks for scoring, latency, and output quality",
      "Policy and security controls for enterprise environments",
    ],
  },
];

export default function DocsPage() {
  return (
    <InformationPage
      aside={
        <>
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Quickstart</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">1. Connect your app or agent runtime.</div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">2. Define voice goals, persona, and mode.</div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">3. Route synthesis through Ghost for orchestration.</div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">4. Review scoring and adaptation over time.</div>
            </div>
          </div>
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Recommended Uses</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>AI sales agents and outbound voice workflows</p>
              <p>Customer support and escalation handoff systems</p>
              <p>Voice copilots and embedded assistant experiences</p>
              <p>Enterprise AI products requiring consistent branded delivery</p>
            </div>
          </div>
        </>
      }
      description="Technical documentation for teams evaluating Ghost as the intelligence layer behind adaptive AI voice delivery."
      eyebrow="Docs"
      sections={sections}
      title="Ghost Voice Intelligence Documentation"
    />
  );
}
