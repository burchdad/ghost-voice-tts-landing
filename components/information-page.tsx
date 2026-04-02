import Link from "next/link";
import type { ReactNode } from "react";

export type InfoSection = {
  title: string;
  body: string;
  bullets?: string[];
  code?: string;
};

export function InformationPage({
  eyebrow,
  title,
  description,
  sections,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
  aside: ReactNode;
}) {
  return (
    <main className="shell py-8 sm:py-10 lg:py-14">
      <div className="panel overflow-hidden px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button-secondary" href="/">
              Back to Landing Page
            </Link>
            <a className="button-primary" href="https://cal.read.ai/ghost-ai-solutions">
              Book a Demo
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            {sections.map((section) => (
              <section key={section.title} className="panel bg-black/20 p-6 sm:p-7">
                <h2 className="text-2xl font-medium text-white">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{section.body}</p>
                {section.bullets ? (
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                    {section.bullets.map((item) => (
                      <li key={item} className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {section.code ? (
                  <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-6 text-sky-200">
                    <code>{section.code}</code>
                  </pre>
                ) : null}
              </section>
            ))}
          </div>
          <aside className="space-y-6">{aside}</aside>
        </div>
      </div>
    </main>
  );
}
