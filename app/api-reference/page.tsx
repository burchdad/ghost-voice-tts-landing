import type { Metadata } from "next";
import { InformationPage } from "@/components/information-page";

export const metadata: Metadata = {
  title: "Ghost Voice Intelligence API",
  description: "API reference for Ghost Voice Intelligence.",
};

const sections = [
  {
    title: "Authentication",
    body:
      "Ghost Voice Intelligence uses bearer-token authentication for control plane access. Requests are scoped per environment and can be paired with provider policies, latency constraints, and audit settings.",
    code: "Authorization: Bearer gv_live_xxxxxxxxx\nContent-Type: application/json",
  },
  {
    title: "Synthesis Request",
    body:
      "Applications submit text along with behavior goals. Ghost evaluates prosody controls, emotional state, session memory, and provider availability before executing synthesis.",
    code:
      "POST /v1/speech/synthesize\n{\n  \"text\": \"Thanks for calling Ghost AI Solutions.\",\n  \"mode\": \"realtime\",\n  \"voice_seed\": \"sales-demo-01\",\n  \"emotion\": {\n    \"primary\": \"confident\",\n    \"secondary\": \"warm\",\n    \"intensity\": 0.72\n  },\n  \"prosody\": {\n    \"pace\": 0.88,\n    \"emphasis\": \"strategic\",\n    \"pause_strategy\": \"conversational\"\n  },\n  \"session_id\": \"session_2391\"\n}",
  },
  {
    title: "Response Model",
    body:
      "Responses include the selected provider path, timing metadata, quality signals, and pointers for streaming or stitched audio retrieval.",
    bullets: [
      "provider: resolved provider and region path",
      "trace_id: observability correlation id",
      "latency_ms: orchestration and provider latency",
      "quality_score: evaluation loop output",
      "audio_url or stream token: delivery handle for playback",
    ],
  },
  {
    title: "Enterprise Integration Surface",
    body:
      "Beyond synthesis, the control plane can expose session adaptation, provider routing policies, event hooks, and quality scoring data for enterprise pipelines.",
    bullets: [
      "Session continuity endpoints for persistent voice behavior",
      "Routing policies for preferred vendors and failover",
      "Evaluation hooks for post-call or post-session scoring",
      "Metrics export for latency, quality, and provider health",
    ],
  },
];

export default function ApiReferencePage() {
  return (
    <InformationPage
      aside={
        <>
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Primary Endpoints</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">POST /v1/speech/synthesize</div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">POST /v1/sessions/:id/adapt</div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">GET /v1/metrics/voices</div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">GET /v1/providers/health</div>
            </div>
          </div>
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Implementation Notes</p>
            <div className="mt-4 space-y-3 text-sm text-slate-300">
              <p>Realtime mode is optimized for conversational latency.</p>
              <p>Balanced mode prioritizes consistent quality across sessions.</p>
              <p>High quality mode is intended for premium output and post-processed delivery.</p>
            </div>
          </div>
        </>
      }
      description="A practical API overview for engineering teams integrating Ghost into AI voice stacks, routing layers, or enterprise voice products."
      eyebrow="API"
      sections={sections}
      title="Ghost Voice Intelligence API Reference"
    />
  );
}
