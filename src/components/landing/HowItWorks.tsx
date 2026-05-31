import { motion, useScroll, useTransform } from "framer-motion";
import { Brain, Zap, Rocket } from "lucide-react";
import { useRef } from "react";

const STEPS = [
  { icon: Brain, title: "Design", desc: "Drag & drop agents onto an infinite canvas. Compose with natural-language nodes.", border: "border-primary/30", text: "text-primary", bg: "bg-primary/10" },
  { icon: Zap, title: "Connect", desc: "Link agents into pipelines. Branch on conditions, fan out, retry on failure.", border: "border-secondary/40", text: "text-secondary", bg: "bg-secondary/10" },
  { icon: Rocket, title: "Deploy", desc: "Run instantly. Monitor live logs, traces, and per-agent telemetry in real-time.", border: "border-accent/30", text: "text-accent", bg: "bg-accent/10" },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const pathLength = useTransform(scrollYProgress, [0.2, 0.7], [0, 1]);

  return (
    <section ref={ref} className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader eyebrow="Workflow" title="From idea to autonomous in three steps" />

        <div className="relative mt-20">
          {/* Connecting line */}
          <svg className="pointer-events-none absolute left-0 right-0 top-12 hidden h-2 w-full md:block" preserveAspectRatio="none" viewBox="0 0 100 1">
            <motion.line x1="10" x2="90" y1="0.5" y2="0.5" stroke="url(#stepGrad)" strokeWidth="0.4" strokeLinecap="round" style={{ pathLength }} />
            <defs>
              <linearGradient id="stepGrad" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="50%" stopColor="var(--color-secondary)" />
                <stop offset="100%" stopColor="var(--color-accent)" />
              </linearGradient>
            </defs>
          </svg>

          <div className="relative grid gap-12 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }} transition={{ delay: i * 0.18, duration: 0.7, ease: "easeOut" }}
                className="relative text-center"
              >
                <div className={`relative z-10 mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border ${s.border} bg-surface shadow-[var(--shadow-glow)]`}>
                  <s.icon className={`h-12 w-12 ${s.text}`} strokeWidth={1.5} />
                  <div className={`absolute inset-0 rounded-2xl ${s.bg} blur-xl`} />
                </div>
                <div className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">Step 0{i + 1}</div>
                <h3 className="mt-3 font-display text-2xl font-semibold">{s.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }}
      className="mx-auto max-w-3xl text-center"
    >
      {eyebrow && <div className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-primary">/ {eyebrow}</div>}
      <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </motion.div>
  );
}
